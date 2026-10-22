"use client";

import { useState } from "react";
import NumberInput from "@/app/components/number-input";
import {
  levelFromTotalXp,
  totalXp,
  totalXpForLevel,
  tradeXpStats,
  VILLAGER_LEVEL_UP_BONUS_XP,
  xpToNextLevel,
} from "@/lib/xp";

const MAX_LEVEL = 21863; // これ以上は累計経験値が int の上限を超える
const MAX_TRADES = 100000;
const BOTTLE_AVG_XP = 7; // エンチャントの瓶 1 本あたりの平均 (3〜11)

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 1 });
}

/** 「12*6」のような積の式を評価する。不完全な項 (「12*」の末尾など) は無視する */
function evalProduct(text: string) {
  const factors = text
    .split(/[*×xX]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  return factors.length === 0 ? 0 : factors.reduce((a, b) => a * b, 1);
}

type LevelState = { level: number; percent: number };

function LevelInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LevelState;
  onChange: (v: LevelState) => void;
}) {
  const next = xpToNextLevel(value.level);
  const points = (value.percent / 100) * next;

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/30 p-4">
      <legend className="px-1 font-pixel text-sm text-lime-300">{label}</legend>
      <label className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-sm text-zinc-400">レベル</span>
        <NumberInput
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_LEVEL}
          value={value.level}
          parse={(t) => clamp(Math.floor(Number(t)), 0, MAX_LEVEL)}
          onChange={(level) => onChange({ ...value, level })}
          className="w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-lg tabular-nums outline-none focus:border-lime-400"
        />
      </label>
      <label className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-sm text-zinc-400">バー</span>
        <input
          type="range"
          min={0}
          max={99}
          value={value.percent}
          onChange={(e) => onChange({ ...value, percent: e.target.valueAsNumber })}
          className="w-full min-w-0 accent-lime-400"
        />
        <span className="relative shrink-0">
          <NumberInput
            type="number"
            inputMode="decimal"
            min={0}
            max={99.9}
            step="any"
            value={value.percent}
            parse={(t) => clamp(Number(t), 0, 99.9)}
            onChange={(percent) => onChange({ ...value, percent })}
            className="w-20 rounded-md border border-white/15 bg-zinc-900 py-2 pl-3 pr-6 text-right tabular-nums outline-none focus:border-lime-400"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            %
          </span>
        </span>
      </label>
      <XpBar level={value.level} percent={value.percent} />
      <p className="text-right text-xs text-zinc-500 tabular-nums">
        バー内 {fmt(points)} / {fmt(next)} ・ 累計 {fmt(totalXp(value.level, value.percent / 100))}
      </p>
    </fieldset>
  );
}

function XpBar({ level, percent }: { level: number; percent: number }) {
  return (
    <div className="relative pt-5">
      <span className="absolute left-1/2 top-0 -translate-x-1/2 font-pixel text-base leading-none text-[#80ff20] [text-shadow:2px_2px_0_#000]">
        {level}
      </span>
      <div className="h-3 overflow-hidden rounded-sm border-2 border-black bg-zinc-800">
        <div className="h-full bg-[#80ff20] transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function XpCalculator() {
  const [current, setCurrent] = useState<LevelState>({ level: 0, percent: 0 });
  const [target, setTarget] = useState<LevelState>({ level: 30, percent: 0 });

  const currentXp = totalXp(current.level, current.percent / 100);
  const targetXp = totalXp(target.level, target.percent / 100);
  const diff = targetXp - currentXp;
  const needed = Math.ceil(diff);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <LevelInput label="現在" value={current} onChange={setCurrent} />
        <LevelInput label="目標" value={target} onChange={setTarget} />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-sm text-zinc-400">目標をセット:</span>
        {[
          { level: 30, note: "エンチャント最大" },
          { level: 39, note: "金床の上限" },
          { level: 50 },
          { level: 100 },
        ].map((p) => (
          <button
            key={p.level}
            type="button"
            onClick={() => setTarget({ level: p.level, percent: 0 })}
            className="rounded-md border border-white/15 bg-zinc-900 px-3 py-1.5 text-sm hover:border-lime-400"
          >
            Lv{p.level}
            {p.note && <span className="ml-1 text-xs text-zinc-500">{p.note}</span>}
          </button>
        ))}
      </div>

      <section className="rounded-lg border-2 border-lime-500/40 bg-lime-950/30 p-5" aria-live="polite">
        {diff > 0 ? (
          <>
            <p className="text-sm text-zinc-300">
              Lv{current.level}（{fmt(current.percent)}%）→ Lv{target.level}
              {target.percent > 0 && `（${fmt(target.percent)}%）`} に必要な経験値
            </p>
            <p className="mt-1 font-pixel text-5xl text-[#80ff20] tabular-nums [text-shadow:3px_3px_0_#000]">
              {needed.toLocaleString("ja-JP")}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-zinc-500">現在の累計</dt>
                <dd className="tabular-nums">{fmt(currentXp)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">目標の累計</dt>
                <dd className="tabular-nums">{fmt(targetXp)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">エンチャントの瓶（目安）</dt>
                <dd className="tabular-nums">約 {Math.ceil(diff / BOTTLE_AVG_XP).toLocaleString("ja-JP")} 本</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-300">目標にはすでに到達しています</p>
            <p className="mt-1 font-pixel text-3xl text-zinc-300 tabular-nums">
              余剰 {fmt(Math.max(0, -diff))} ポイント
            </p>
          </>
        )}
      </section>

      <TradeSimulator current={current} />
    </div>
  );
}

function formatLevel(xp: number) {
  const { level, progress } = levelFromTotalXp(xp);
  return { level, percent: progress * 100, label: `Lv${level}（${fmt(progress * 100)}%）` };
}

function TradeSimulator({ current }: { current: LevelState }) {
  const [trades, setTrades] = useState(10);
  const [levelUps, setLevelUps] = useState(0);

  const startXp = totalXp(current.level, current.percent / 100);
  const effectiveLevelUps = Math.min(levelUps, trades);
  const { mean, sd } = tradeXpStats(trades, effectiveLevelUps);

  const rows = [
    { label: "−2σ", gained: mean - 2 * sd },
    { label: "−1σ", gained: mean - sd },
    { label: "期待値", gained: mean, highlight: true },
    { label: "+1σ", gained: mean + sd },
    { label: "+2σ", gained: mean + 2 * sd },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black/30 p-5">
      <header className="flex flex-col gap-1">
        <h2 className="font-pixel text-xl text-lime-300">村人との取引シミュレーター</h2>
        <p className="text-sm text-zinc-400">
          上の「現在」の状態から、取引を繰り返したときにどこまでレベルが上がるかを期待値と標準偏差（σ）で示します。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm text-zinc-400">取引回数</span>
          <NumberInput
            type="text"
            placeholder="例: 12*6"
            value={trades}
            parse={(t) => clamp(Math.floor(evalProduct(t)), 0, MAX_TRADES)}
            onChange={setTrades}
            className="w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-lg tabular-nums outline-none focus:border-lime-400"
          />
          <span className="shrink-0 text-sm text-zinc-400 tabular-nums">= {trades.toLocaleString("ja-JP")} 回</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm text-zinc-400">うち村人が<br />レベルアップ</span>
          <NumberInput
            type="number"
            inputMode="numeric"
            min={0}
            max={trades}
            value={effectiveLevelUps}
            parse={(t) => clamp(Math.floor(Number(t)), 0, trades)}
            onChange={setLevelUps}
            className="w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-lg tabular-nums outline-none focus:border-lime-400"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-1 text-left font-normal"></th>
              <th className="py-1 text-right font-normal whitespace-nowrap">獲得経験値</th>
              <th className="py-1 pl-4 text-left font-normal">到達レベル</th>
              <th className="w-1/3 py-1 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {(sd > 0 ? rows : rows.filter((r) => r.highlight)).map((r) => {
              const result = formatLevel(startXp + r.gained);
              return (
                <tr
                  key={r.label}
                  className={`border-t border-white/5 ${r.highlight ? "text-[#80ff20]" : "text-zinc-300"}`}
                >
                  <td className="py-2 whitespace-nowrap">{r.label}</td>
                  <td className="py-2 text-right whitespace-nowrap">{fmt(r.gained)}</td>
                  <td className="py-2 pl-4 whitespace-nowrap">{result.label}</td>
                  <td className="min-w-20 py-2 pl-4">
                    <XpBar level={result.level} percent={result.percent} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-zinc-300">
        獲得経験値: {fmt(mean)} ± {fmt(sd)}
        {sd > 0 && (
          <>
            {" "}
            ／ ±1σ に約68%、±2σ に約95% が収まります
          </>
        )}
      </p>

      <ul className="list-disc pl-5 text-xs leading-relaxed text-zinc-500">
        <li>
          取引 1 回あたり 3〜6（各 1/4 の確率）、村人のレベルが上がった取引では +{VILLAGER_LEVEL_UP_BONUS_XP}
          として計算しています。
        </li>
        <li>σ 範囲は取引回数が多いほど正確になる正規近似です。</li>
        <li>修繕の付いた装備を身につけていると、経験値オーブが耐久値の回復に使われます。</li>
      </ul>
    </section>
  );
}

export function LevelTable() {
  const rows = Array.from({ length: 51 }, (_, level) => ({
    level,
    next: xpToNextLevel(level),
    total: totalXpForLevel(level),
  }));

  return (
    <details className="rounded-lg border border-white/10 bg-black/30">
      <summary className="cursor-pointer px-4 py-3 text-sm text-zinc-300">レベル別経験値表（Lv0〜50）</summary>
      <div className="max-h-96 overflow-y-auto px-4 pb-4">
        <table className="w-full text-right text-sm tabular-nums">
          <thead className="sticky top-0 bg-zinc-900 text-zinc-500">
            <tr>
              <th className="py-1 text-left font-normal">レベル</th>
              <th className="py-1 font-normal">次のレベルまで</th>
              <th className="py-1 font-normal">累計</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.level} className="border-t border-white/5">
                <td className="py-1 text-left">{r.level}</td>
                <td className="py-1">{r.next.toLocaleString("ja-JP")}</td>
                <td className="py-1">{r.total.toLocaleString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
