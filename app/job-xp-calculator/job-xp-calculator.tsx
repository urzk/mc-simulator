"use client";

import { useState } from "react";
import NumberInput from "@/app/components/number-input";
import JobActionCalculator from "./job-action-calculator";
import {
  JOB_MAX_LEVEL,
  JOB_MIN_LEVEL,
  jobTotalXpCenti,
  jobTotalXpForLevel,
  jobXpToNextLevel,
  toCenti,
} from "@/lib/jobs";

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** 0.01 単位の値を「1,234.56」形式で表示する */
function fmtCenti(centi: number) {
  return (centi / 100).toLocaleString("ja-JP", { maximumFractionDigits: 2 });
}

/** 0.01 単位の値を桁区切りなしで表示する（バー上の表示用） */
function plainCenti(centi: number) {
  return String(centi / 100);
}

/** `xpCenti` は入力された値。レベルに対して大きすぎる場合は表示・計算時に丸める */
type JobState = { level: number; xpCenti: number };

/** バー内の経験値の上限 (0.01 単位)。Lv100 ではバーが増えないので 0 */
function maxBarCenti(level: number) {
  return level >= JOB_MAX_LEVEL ? 0 : jobXpToNextLevel(level) * 100 - 1;
}

function effectiveXpCenti(state: JobState) {
  return Math.min(state.xpCenti, maxBarCenti(state.level));
}

function LevelInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: JobState;
  onChange: (v: JobState) => void;
}) {
  const isMax = value.level >= JOB_MAX_LEVEL;
  const nextCenti = jobXpToNextLevel(value.level) * 100;
  const xpCenti = effectiveXpCenti(value);
  const percent = isMax ? 0 : Math.round((xpCenti / nextCenti) * 10000) / 100;
  const setPercent = (p: number) => onChange({ ...value, xpCenti: Math.min(Math.round((p / 100) * nextCenti), maxBarCenti(value.level)) });

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/30 p-4">
      <legend className="px-1 font-pixel text-sm text-cyan-300">{label}</legend>
      <label className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-sm text-zinc-400">レベル</span>
        <NumberInput
          type="number"
          inputMode="numeric"
          min={JOB_MIN_LEVEL}
          max={JOB_MAX_LEVEL}
          value={value.level}
          parse={(t) => clamp(Math.floor(Number(t)), JOB_MIN_LEVEL, JOB_MAX_LEVEL)}
          onChange={(level) => onChange({ ...value, level })}
          className="w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-lg tabular-nums outline-none focus:border-cyan-400"
        />
      </label>
      <label className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-sm text-zinc-400">バー</span>
        <input
          type="range"
          min={0}
          max={99}
          disabled={isMax}
          value={Math.min(percent, 99)}
          onChange={(e) => setPercent(e.target.valueAsNumber)}
          className="w-full min-w-0 accent-cyan-400 disabled:opacity-40"
        />
        <span className="relative shrink-0">
          <NumberInput
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            disabled={isMax}
            aria-label="バー内の経験値"
            value={xpCenti / 100}
            parse={(t) => clamp(toCenti(Number(t)), 0, maxBarCenti(value.level)) / 100}
            onChange={(xp) => onChange({ ...value, xpCenti: toCenti(xp) })}
            className="w-32 rounded-md border border-white/15 bg-zinc-900 py-2 pl-3 pr-8 text-right tabular-nums outline-none focus:border-cyan-400 disabled:opacity-40"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            xp
          </span>
        </span>
      </label>
      <p className="-mt-2 text-right text-sm text-zinc-400 tabular-nums">
        {isMax ? "MAX" : `${percent.toLocaleString("ja-JP", { maximumFractionDigits: 2 })}%`}
      </p>
      <JobXpBar level={value.level} xpCenti={xpCenti} />
      <p className="text-right text-xs text-zinc-500 tabular-nums">
        累計 {fmtCenti(jobTotalXpCenti(value.level, xpCenti))}
      </p>
    </fieldset>
  );
}

function JobXpBar({ level, xpCenti }: { level: number; xpCenti: number }) {
  const isMax = level >= JOB_MAX_LEVEL;
  const next = jobXpToNextLevel(level);
  const percent = isMax ? 0 : (xpCenti / (next * 100)) * 100;
  const text = isMax ? `Lv ${level}: MAX` : `Lv ${level}: ${plainCenti(xpCenti)}/${next} xp`;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-center font-pixel text-sm leading-none whitespace-nowrap text-white tabular-nums [text-shadow:2px_2px_0_#000]">
        {text}
      </span>
      <div className="h-3 overflow-hidden rounded-sm border-2 border-black bg-zinc-800">
        <div className="h-full bg-[#55ffff] transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function JobXpCalculator() {
  const [current, setCurrent] = useState<JobState>({ level: 1, xpCenti: 0 });
  const [target, setTarget] = useState<JobState>({ level: 50, xpCenti: 0 });

  const currentCenti = jobTotalXpCenti(current.level, effectiveXpCenti(current));
  const targetCenti = jobTotalXpCenti(target.level, effectiveXpCenti(target));
  const diffCenti = targetCenti - currentCenti;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <LevelInput label="現在" value={current} onChange={setCurrent} />
        <LevelInput label="目標" value={target} onChange={setTarget} />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-sm text-zinc-400">目標をセット:</span>
        {[
          { level: Math.min(current.level + 1, JOB_MAX_LEVEL), note: "次のレベル" },
          { level: 25 },
          { level: 50 },
          { level: 75 },
          { level: 100, note: "最大" },
        ].map((p) => (
          <button
            key={p.note ?? p.level}
            type="button"
            onClick={() => setTarget({ level: p.level, xpCenti: 0 })}
            className="rounded-md border border-white/15 bg-zinc-900 px-3 py-1.5 text-sm hover:border-cyan-400"
          >
            Lv{p.level}
            {p.note && <span className="ml-1 text-xs text-zinc-500">{p.note}</span>}
          </button>
        ))}
      </div>

      <section className="rounded-lg border-2 border-cyan-500/40 bg-cyan-950/30 p-5" aria-live="polite">
        {diffCenti > 0 ? (
          <>
            <p className="text-sm text-zinc-300">
              Lv{current.level}（{fmtCenti(effectiveXpCenti(current))} xp）→ Lv{target.level}
              {effectiveXpCenti(target) > 0 && `（${fmtCenti(effectiveXpCenti(target))} xp）`} に必要な Job 経験値
            </p>
            <p className="mt-1 font-pixel text-5xl break-all text-[#55ffff] tabular-nums [text-shadow:3px_3px_0_#000]">
              {fmtCenti(diffCenti)}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <dt className="text-zinc-500">現在の累計</dt>
                <dd className="tabular-nums">{fmtCenti(currentCenti)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">目標の累計</dt>
                <dd className="tabular-nums">{fmtCenti(targetCenti)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-300">目標にはすでに到達しています</p>
            <p className="mt-1 font-pixel text-3xl text-zinc-300 tabular-nums">
              余剰 {fmtCenti(Math.max(0, -diffCenti))} xp
            </p>
          </>
        )}
      </section>

      <JobActionCalculator
        current={{ level: current.level, xpCenti: effectiveXpCenti(current) }}
        targetTotalCenti={targetCenti}
        targetLevel={target.level}
      />
    </div>
  );
}

export function JobLevelTable() {
  const rows = Array.from({ length: JOB_MAX_LEVEL }, (_, i) => {
    const level = i + 1;
    return {
      level,
      next: level < JOB_MAX_LEVEL ? jobXpToNextLevel(level) : null,
      total: jobTotalXpForLevel(level),
    };
  });

  return (
    <details className="rounded-lg border border-white/10 bg-black/30">
      <summary className="cursor-pointer px-4 py-3 text-sm text-zinc-300">レベル別 Job 経験値表（Lv1〜100）</summary>
      <div className="max-h-96 overflow-y-auto px-4 pb-4">
        <table className="w-full text-right text-sm tabular-nums">
          <thead className="sticky top-0 bg-zinc-900 text-zinc-500">
            <tr>
              <th className="py-1 text-left font-normal">レベル</th>
              <th className="py-1 font-normal">次のレベルまで</th>
              <th className="py-1 font-normal">累計（Lv1から）</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.level} className="border-t border-white/5">
                <td className="py-1 text-left">{r.level}</td>
                <td className="py-1">{r.next === null ? "MAX" : r.next.toLocaleString("ja-JP")}</td>
                <td className="py-1">{r.total.toLocaleString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
