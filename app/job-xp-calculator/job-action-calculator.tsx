"use client";

import { useState } from "react";
import NumberInput from "@/app/components/number-input";
import { JOBS as RAW_JOBS, type Job, type JobTarget } from "@/lib/job-actions";
import {
  baseXpCentiFromIncome,
  jobBonusPercent,
  jobIncomePerAction,
  jobServerRate,
  jobTotalXpCenti,
  jobXpPerActionMicro,
  MAX_JOB_COUNT,
  NO_JOB_BONUS,
  planJobActions,
  XP_MICRO,
  type JobBonus,
  type JobServer,
} from "@/lib/jobs";

/**
 * 対象の並び順のグループ。Weaponsmith のクラフトだけは
 * 「鍛冶型以外」→「鍛冶型（ネザライト強化）」→「その他の鍛冶型」の順にする
 */
function targetGroup(jobId: string, actionId: string, targetId: string) {
  if (jobId !== "Weaponsmith" || actionId !== "Craft") return 0;
  if (targetId === "netherite_upgrade_smithing_template") return 1;
  return targetId.endsWith("_smithing_template") ? 2 : 0;
}

/** 行動と対象の選択肢は、原則どちらも ID の ABC 順に並べる */
const JOBS: Job[] = RAW_JOBS.map((j) => ({
  ...j,
  actions: [...j.actions]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((a) => ({
      ...a,
      targets: [...a.targets].sort(
        (x, y) => targetGroup(j.id, a.id, x[0]) - targetGroup(j.id, a.id, y[0]) || x[0].localeCompare(y[0]),
      ),
    })),
}));

const SERVERS: { id: JobServer; label: string }[] = [
  { id: "survival", label: "サバイバルサーバー" },
  { id: "resource", label: "資源サーバー" },
];

const SERVER_ONLY_NOTE: Record<JobServer, string> = {
  survival: "資源サーバーのみ",
  resource: "サバイバルサーバーのみ",
};

/** 倍率 (1/100 単位) を「×0.6」形式で表示する */
function rateLabel(percent: number) {
  return `×${(percent / 100).toLocaleString("ja-JP", { minimumFractionDigits: 1 })}`;
}

const BONUS_OPTIONS: { key: keyof JobBonus; label: string; note: string }[] = [
  { key: "saturday", label: "職業ボーナス（土曜）", note: "×1.2" },
  { key: "vote", label: "職業ボーナス（投票ポイント）", note: "×1.5" },
];

const ACTION_LABELS: Record<string, string> = {
  Brew: "醸造",
  Place: "設置",
  Craft: "クラフト",
  Smelt: "精錬",
  Break: "破壊",
  Enchant: "エンチャント",
  Tame: "飼いならし",
  Breed: "繁殖",
  Shear: "毛刈り",
  Milk: "搾乳",
  Kill: "討伐",
  Collect: "収穫",
  Eat: "食事",
};

const MAX_BASE_CENTI = 1_000_000; // 基礎収入・基礎経験値の入力上限 (10,000)

function fixed(n: number, digits: number) {
  return n.toLocaleString("ja-JP", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function yen(n: number, digits = 2) {
  return `${n < 0 ? "-" : ""}¥${fixed(Math.abs(n), digits)}`;
}

function centiLabel(centi: number) {
  return (centi / 100).toLocaleString("ja-JP", { maximumFractionDigits: 2 });
}

function yenCenti(centi: number) {
  return `${centi < 0 ? "-" : ""}¥${centiLabel(Math.abs(centi))}`;
}

function parseCenti(text: string) {
  const n = Math.round(Number(text) * 100);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, -MAX_BASE_CENTI), MAX_BASE_CENTI) / 100;
}

function targetLabel([, name, incomeCenti, xpCenti]: JobTarget) {
  return `${name}（${yenCenti(incomeCenti)} / ${centiLabel(xpCenti)} xp）`;
}

function matches(target: JobTarget, query: string) {
  const q = query.trim().toLowerCase();
  return q === "" || target[1].toLowerCase().includes(q) || target[0].toLowerCase().includes(q);
}

const selectClass =
  "w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400";
const inputClass =
  "w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-right tabular-nums outline-none focus:border-cyan-400";

type Selection = { jobId: string; actionId: string; targetId: string };

function findJob(id: string): Job {
  return JOBS.find((j) => j.id === id) ?? JOBS[0];
}

export default function JobActionCalculator({
  current,
  targetTotalCenti,
  targetLevel,
}: {
  current: { level: number; xpCenti: number };
  targetTotalCenti: number;
  targetLevel: number;
}) {
  const initialJob = findJob("Miner");
  const initialAction = initialJob.actions.find((a) => a.id === "Break") ?? initialJob.actions[0];
  const initialTarget = initialAction.targets.find((t) => t[0] === "deepslate") ?? initialAction.targets[0];

  const [selection, setSelection] = useState<Selection>({
    jobId: initialJob.id,
    actionId: initialAction.id,
    targetId: initialTarget[0],
  });
  const [query, setQuery] = useState("");
  const [baseIncomeCenti, setBaseIncomeCenti] = useState(initialTarget[2]);
  const [baseXpCenti, setBaseXpCenti] = useState(initialTarget[3]);
  const [jobCount, setJobCount] = useState(1);
  const [bonus, setBonus] = useState<JobBonus>(NO_JOB_BONUS);
  const [server, setServer] = useState<JobServer>("resource");
  const bonusPercent = jobBonusPercent(bonus);

  const job = findJob(selection.jobId);
  const action = job.actions.find((a) => a.id === selection.actionId) ?? job.actions[0];
  const filtered = action.targets.filter((t) => matches(t, query));
  const selectedTarget = action.targets.find((t) => t[0] === selection.targetId);

  const select = (jobId: string, actionId: string, target: JobTarget | undefined) => {
    setSelection({ jobId, actionId, targetId: target?.[0] ?? "" });
    if (target) {
      setBaseIncomeCenti(target[2]);
      setBaseXpCenti(target[3]);
    }
  };

  const onJobChange = (jobId: string) => {
    const j = findJob(jobId);
    const a = j.actions[0];
    setQuery("");
    select(j.id, a.id, a.targets[0]);
  };

  const onActionChange = (actionId: string) => {
    const a = job.actions.find((x) => x.id === actionId) ?? job.actions[0];
    setQuery("");
    select(job.id, a.id, a.targets[0]);
  };

  const onQueryChange = (q: string) => {
    setQuery(q);
    const hits = action.targets.filter((t) => matches(t, q));
    if (hits.length > 0 && !hits.some((t) => t[0] === selection.targetId)) {
      select(job.id, action.id, hits[0]);
    }
  };

  // そのサーバーで無効な Job を選んでいるときは、収入も経験値も得られない
  const serverRate = jobServerRate(job.id, server);
  const unavailable = serverRate === null;
  const rate = serverRate ?? { incomePercent: 0, xpPercent: 0 };
  const reduced = !unavailable && (rate.incomePercent !== 100 || rate.xpPercent !== 100);
  const unavailableMessage = `${job.id} は${SERVERS.find((x) => x.id === server)?.label}では無効です（${SERVER_ONLY_NOTE[server]}）`;
  const incomeNow = jobIncomePerAction(baseIncomeCenti, current.level, jobCount, bonus, rate);
  const xpNow = jobXpPerActionMicro(baseXpCenti, jobCount, rate) / XP_MICRO;
  const plan = planJobActions(current, targetTotalCenti, baseIncomeCenti, baseXpCenti, jobCount, bonus, rate);
  const reached = targetTotalCenti <= jobTotalXpCenti(current.level, current.xpCenti);

  // フィルタで選択中の対象が消えても、セレクトの表示が崩れないよう先頭に残す
  const options = selectedTarget && !filtered.includes(selectedTarget) ? [selectedTarget, ...filtered] : filtered;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black/30 p-5">
      <header className="flex flex-col gap-1">
        <h2 className="font-pixel text-xl text-cyan-300">行動回数・収入計算機</h2>
        <p className="text-sm text-zinc-400">
          上の「現在」から「目標」まで、同じ行動（ブロックの破壊やクラフトなど）を何回繰り返せば到達できるか、その間にどれだけ収入が得られるかを計算します。
        </p>
      </header>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">サーバー</span>
        <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label="サーバー">
          {SERVERS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={server === s.id}
              onClick={() => setServer(s.id)}
              className={`rounded-md border px-2 py-2 text-sm ${
                server === s.id
                  ? "border-cyan-400 bg-cyan-950/60 text-cyan-200"
                  : "border-white/15 bg-zinc-900 hover:border-cyan-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">Job</span>
          <select value={job.id} onChange={(e) => onJobChange(e.target.value)} className={selectClass}>
            {JOBS.map((j) => (
              <option key={j.id} value={j.id}>
                {j.id}（{j.description}）{jobServerRate(j.id, server) === null && ` ※${SERVER_ONLY_NOTE[server]}`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">行動</span>
          <select
            value={action.id}
            onChange={(e) => onActionChange(e.target.value)}
            disabled={job.actions.length === 1 || unavailable}
            className={`${selectClass} disabled:opacity-60`}
          >
            {job.actions.map((a) => (
              <option key={a.id} value={a.id}>
                {ACTION_LABELS[a.id] ?? a.id}（{a.id}）
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">
          対象 <span className="text-xs text-zinc-500">（{action.targets.length} 件）</span>
        </span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            placeholder="名前・IDで絞り込み"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="対象を絞り込み"
            className="w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400 sm:w-48 sm:shrink-0"
          />
          <select
            value={selectedTarget ? selectedTarget[0] : ""}
            onChange={(e) => select(job.id, action.id, action.targets.find((t) => t[0] === e.target.value))}
            aria-label="対象"
            className={selectClass}
          >
            {!selectedTarget && <option value="">（手入力）</option>}
            {options.map((t) => (
              <option key={t[0]} value={t[0]}>
                {targetLabel(t)}
              </option>
            ))}
          </select>
        </div>
        {query && filtered.length === 0 && <p className="text-xs text-zinc-500">一致する対象がありません</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">基礎収入</span>
          <NumberInput
            type="number"
            inputMode="decimal"
            step={0.01}
            value={baseIncomeCenti / 100}
            parse={parseCenti}
            onChange={(v) => {
              const centi = Math.round(v * 100);
              setBaseIncomeCenti(centi);
              setBaseXpCenti(baseXpCentiFromIncome(centi));
              setSelection((s) => ({ ...s, targetId: "" }));
            }}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">基礎経験値</span>
          <NumberInput
            type="number"
            inputMode="decimal"
            step={0.01}
            value={baseXpCenti / 100}
            parse={parseCenti}
            onChange={(v) => {
              setBaseXpCenti(Math.round(v * 100));
              setSelection((s) => ({ ...s, targetId: "" }));
            }}
            className={inputClass}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">就業中のJob数</span>
          <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="就業中のJob数">
            {Array.from({ length: MAX_JOB_COUNT }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={jobCount === n}
                onClick={() => setJobCount(n)}
                className={`rounded-md border px-2 py-2 text-sm tabular-nums ${
                  jobCount === n
                    ? "border-cyan-400 bg-cyan-950/60 text-cyan-200"
                    : "border-white/15 bg-zinc-900 hover:border-cyan-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">
          職業ボーナス
          <span className="ml-2 text-xs text-zinc-500 tabular-nums">
            収入 ×{(bonusPercent / 100).toLocaleString("ja-JP", { minimumFractionDigits: 1 })}（経験値は変わりません）
          </span>
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {BONUS_OPTIONS.map((o) => (
            <label
              key={o.key}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                bonus[o.key]
                  ? "border-cyan-400 bg-cyan-950/60 text-cyan-200"
                  : "border-white/15 bg-zinc-900 hover:border-cyan-400"
              }`}
            >
              <input
                type="checkbox"
                checked={bonus[o.key]}
                onChange={(e) => setBonus((b) => ({ ...b, [o.key]: e.target.checked }))}
                className="accent-cyan-400"
              />
              <span className="flex-1">{o.label}</span>
              <span className="text-xs text-zinc-500 tabular-nums">{o.note}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-black/20 p-4">
        <p className="text-sm text-zinc-400">
          Lv{current.level} での 1 回あたり
          {bonusPercent > 100 && (
            <span className="ml-2 text-xs text-cyan-300 tabular-nums">職業ボーナス適用 {rateLabel(bonusPercent)}</span>
          )}
          {reduced && (
            <span className="ml-2 text-xs text-amber-300 tabular-nums">
              サバイバル補正 収入 {rateLabel(rate.incomePercent)}・経験値 {rateLabel(rate.xpPercent)}
            </span>
          )}
        </p>
        {unavailable ? (
          <p className="mt-1 text-sm text-amber-300">{unavailableMessage}</p>
        ) : (
          <dl className="mt-1 grid grid-cols-2 gap-x-4 text-lg tabular-nums">
            <div>
              <dt className="text-xs text-zinc-500">収入</dt>
              <dd>{yen(incomeNow)}</dd>
              <dd className="text-xs text-zinc-500">
                {incomeNow < 0 ? "-" : ""}¥
                {Math.abs(incomeNow).toLocaleString("ja-JP", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">経験値</dt>
              <dd>{fixed(xpNow, 2)} xp</dd>
              <dd className="text-xs text-zinc-500">
                {xpNow.toLocaleString("ja-JP", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} xp
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="rounded-lg border-2 border-cyan-500/40 bg-cyan-950/30 p-5" aria-live="polite">
        {unavailable ? (
          <p className="text-sm text-zinc-300">{unavailableMessage}。この Job では目標に到達できません</p>
        ) : reached ? (
          <p className="text-sm text-zinc-300">目標にはすでに到達しています</p>
        ) : plan === null ? (
          <p className="text-sm text-zinc-300">この行動では Job 経験値が増えないため、目標に到達できません</p>
        ) : (
          <>
            <p className="text-sm text-zinc-300">Lv{targetLevel} の目標までに必要な行動回数</p>
            <p className="mt-1 font-pixel text-5xl break-all text-[#55ffff] tabular-nums [text-shadow:3px_3px_0_#000]">
              {plan.count.toLocaleString("ja-JP")}
              <span className="ml-2 text-2xl">回</span>
            </p>
            <p className="mt-4 text-sm text-zinc-300">到達までの収入の合計</p>
            <p className="font-pixel text-3xl break-all text-zinc-100 tabular-nums [text-shadow:2px_2px_0_#000]">
              {yen(plan.totalIncome)}
            </p>

            {plan.byLevel.length > 1 && (
              <details className="mt-4 rounded-md border border-white/10 bg-black/20">
                <summary className="cursor-pointer px-3 py-2 text-sm text-zinc-300">
                  レベル別の内訳（{plan.byLevel.length} レベル分）
                </summary>
                <div className="max-h-72 overflow-y-auto px-3 pb-3">
                  <table className="w-full text-right text-sm tabular-nums">
                    <thead className="sticky top-0 bg-zinc-900 text-zinc-500">
                      <tr>
                        <th className="py-1 text-left font-normal">レベル</th>
                        <th className="py-1 font-normal">1回あたり</th>
                        <th className="py-1 font-normal">回数</th>
                        <th className="py-1 font-normal">収入</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.byLevel.map((r) => (
                        <tr key={r.level} className="border-t border-white/5">
                          <td className="py-1 text-left">Lv{r.level}</td>
                          <td className="py-1">{yen(jobIncomePerAction(baseIncomeCenti, r.level, jobCount, bonus, rate))}</td>
                          <td className="py-1">{r.count.toLocaleString("ja-JP")}</td>
                          <td className="py-1">{yen(r.income)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </>
        )}
      </div>

      <ul className="list-disc pl-5 text-xs leading-relaxed text-zinc-500">
        <li>収入 = 基礎収入 × (1 + レベル係数 × 兼業係数)、経験値 = 基礎経験値 × 兼業係数 で計算しています。</li>
        <li>
          レベル係数 = (レベル − 1) × 0.01、兼業係数 = 1 − (就業中の Job 数 − 1) × 0.05（1 Job: 1、2 Jobs: 0.95、3 Jobs:
          0.9）です。
        </li>
        <li>収入は行動したときのレベルで決まるため、途中のレベルアップを反映して合計しています。</li>
        <li>
          基礎収入を書き換えると、基礎経験値は基礎収入の小数第 2 位を切り捨てた値になります（Gourmet
          は収入がなく、経験値だけが設定されています）。
        </li>
        <li>
          職業ボーナスは収入にだけ掛かり、土曜で ×1.2、投票ポイントで ×1.5、両方で ×1.7 になります。経験値は変わりません。
        </li>
        <li>
          Jobs プラグインが入っているのはサバイバルサーバーと資源サーバーだけです。Miner は資源サーバーでのみ、Builder
          はサバイバルサーバーでのみ有効です。Hunter はサバイバルサーバーでは収入が資源サーバーの 60%、経験値が 50%
          になります。それ以外の Job は両サーバーで同じです。
        </li>
        <li>
          Farmer のムーシュルームの搾乳は、調整のため現在は収入・経験値とも一時的に削除されているので、一覧から除いています（スプレッドシートには残っています）。
        </li>
        <li>収入上限・端数処理は考慮していません。</li>
        <li>
          基礎収入の一覧は{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1NsyXRFSwXFQJ6CPhhMoiNMYliZ9AURTpLzBTq5S1gpI/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-300"
          >
            公開スプレッドシート
          </a>{" "}
          の値（2026年11月時点・資源サーバー）です。
        </li>
      </ul>
    </section>
  );
}
