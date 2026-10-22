"use client";

import { useEffect, useMemo, useState } from "react";
import NumberInput from "@/app/components/number-input";
import {
  ENCHANTMENTS,
  ITEM_TYPES,
  type EnchantmentId,
  type EnchantmentInstance,
  type EnchantResult,
} from "@/lib/enchant";
import type { EnchantRequest } from "./enchant.worker";

const MAX_LEVEL = 30;
const PAGE_SIZE = 100;
const ROMAN = ["I", "II", "III", "IV", "V"];

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function formatPercent(p: number) {
  const v = p * 100;
  if (v >= 0.01) return `${v.toFixed(2)}%`;
  if (v >= 1e-6) return `${v.toPrecision(3)}%`;
  return "< 0.000001%";
}

function enchantLabel({ id, level }: EnchantmentInstance) {
  const { name, costs } = ENCHANTMENTS[id];
  return costs.length === 1 ? name : `${name} ${ROMAN[level - 1]}`;
}

function useEnchantResult(request: EnchantRequest) {
  const key = `${request.itemId}:${request.enchantability}:${request.level}`;
  const [state, setState] = useState<{ key: string; result: EnchantResult } | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("./enchant.worker.ts", import.meta.url));
    worker.onmessage = (e: MessageEvent<EnchantResult>) => {
      setState({ key, result: e.data });
      worker.terminate();
    };
    worker.postMessage(request);
    // 入力が変わったら計算中のものは打ち切る
    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- request の中身は key で表される
  }, [key]);

  return { result: state?.result, loading: state?.key !== key };
}

const selectClass =
  "w-full min-w-0 rounded-md border border-white/15 bg-zinc-900 px-3 py-2 outline-none focus:border-violet-400";

export default function EnchantSimulator() {
  const [itemId, setItemId] = useState("sword");
  const [materialName, setMaterialName] = useState("ダイヤモンド");
  const [level, setLevel] = useState(30);
  const [filter, setFilter] = useState<EnchantmentId | "">("");
  const [page, setPage] = useState({ key: "", count: PAGE_SIZE });

  const item = ITEM_TYPES.find((i) => i.id === itemId)!;
  const material = item.materials.find((m) => m.name === materialName) ?? item.materials[0];
  const { result, loading } = useEnchantResult({
    itemId,
    enchantability: material.enchantability,
    level,
  });

  const activeFilter = filter && item.enchantments.includes(filter) ? filter : "";
  const combinations = useMemo(
    () =>
      (result?.combinations ?? []).filter(
        (c) => !activeFilter || c.enchantments.some((e) => e.id === activeFilter),
      ),
    [result, activeFilter],
  );
  const listKey = `${itemId}:${material.name}:${level}:${activeFilter}`;
  const visibleCount = page.key === listKey ? page.count : PAGE_SIZE;
  const maxProbability = combinations[0]?.probability ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="grid gap-4 rounded-lg border border-white/10 bg-black/30 p-4 sm:grid-cols-3">
        <legend className="px-1 font-pixel text-sm text-violet-300">エンチャントする物</legend>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">アイテム</span>
          <select value={itemId} onChange={(e) => setItemId(e.target.value)} className={selectClass}>
            {ITEM_TYPES.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">素材</span>
          <select
            value={material.name}
            onChange={(e) => setMaterialName(e.target.value)}
            disabled={item.materials.length === 1}
            className={`${selectClass} disabled:text-zinc-500`}
          >
            {item.materials.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name || "—"}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">エンチャント適性 {material.enchantability}</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">エンチャントレベル（1〜{MAX_LEVEL}）</span>
          <NumberInput
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_LEVEL}
            value={level}
            parse={(t) => clamp(Math.floor(Number(t)), 1, MAX_LEVEL)}
            onChange={setLevel}
            className={`${selectClass} tabular-nums`}
          />
          <input
            type="range"
            min={1}
            max={MAX_LEVEL}
            value={level}
            onChange={(e) => setLevel(e.target.valueAsNumber)}
            className="accent-violet-400"
          />
        </label>
      </fieldset>

      <section className="flex flex-col gap-4 rounded-lg border-2 border-violet-500/40 bg-violet-950/30 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-300">
              {material.name}
              {item.name} ・ レベル {level} で付与されうる組み合わせ
            </p>
            <p className="font-pixel text-3xl text-[#d4b3ff] tabular-nums [text-shadow:3px_3px_0_#000]">
              {result ? `${result.combinations.length.toLocaleString("ja-JP")} 通り` : "…"}
              {loading && <span className="ml-3 align-middle text-sm text-zinc-400">計算中…</span>}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-zinc-400">絞り込み</span>
            <select
              value={activeFilter}
              onChange={(e) => setFilter(e.target.value as EnchantmentId | "")}
              className={selectClass}
            >
              <option value="">すべて</option>
              {item.enchantments.map((id) => (
                <option key={id} value={id}>
                  {ENCHANTMENTS[id].name}を含む
                </option>
              ))}
            </select>
          </label>
        </div>

        <ol className={`flex flex-col transition-opacity ${loading ? "opacity-50" : ""}`}>
          {combinations.slice(0, visibleCount).map((c, i) => (
            <li
              key={c.enchantments.map((e) => `${e.id}${e.level}`).join(",")}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-1 border-t border-white/5 py-2"
            >
              <span className="text-right text-xs text-zinc-500 tabular-nums">{i + 1}</span>
              <span className="flex flex-wrap gap-1">
                {c.enchantments.length === 0 ? (
                  <span className="text-sm text-zinc-400">（何も付与されない）</span>
                ) : (
                  c.enchantments.map((e) => (
                    <span
                      key={e.id}
                      className={`rounded px-1.5 py-0.5 text-sm ${
                        e.id === activeFilter ? "bg-violet-500/40 text-white" : "bg-white/10 text-zinc-200"
                      }`}
                    >
                      {enchantLabel(e)}
                    </span>
                  ))
                )}
              </span>
              <span className="text-right text-sm text-[#d4b3ff] tabular-nums">{formatPercent(c.probability)}</span>
              <span className="col-start-2 col-end-4 h-1 overflow-hidden rounded-sm bg-zinc-800">
                <span
                  className="block h-full bg-violet-400"
                  style={{ width: `${(c.probability / maxProbability) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ol>

        {combinations.length > visibleCount && (
          <button
            type="button"
            onClick={() => setPage({ key: listKey, count: visibleCount + PAGE_SIZE })}
            className="self-center rounded-md border border-white/15 bg-zinc-900 px-4 py-2 text-sm hover:border-violet-400"
          >
            さらに {Math.min(PAGE_SIZE, combinations.length - visibleCount)} 件表示（残り{" "}
            {(combinations.length - visibleCount).toLocaleString("ja-JP")} 件）
          </button>
        )}

        {result && result.omitted > 0 && (
          <p className="text-xs text-zinc-500">
            確率が極めて低い組み合わせ（合計 {formatPercent(result.omitted)}）は省略しています。
          </p>
        )}
      </section>

      {result && <EnchantmentBreakdown result={result} />}
    </div>
  );
}

/** エンチャント・強度ごとの出現確率 (他のエンチャントとの組み合わせを問わない) */
function EnchantmentBreakdown({ result }: { result: EnchantResult }) {
  const rows = useMemo(() => {
    const byId = new Map<EnchantmentId, number[]>();
    for (const c of result.combinations) {
      for (const e of c.enchantments) {
        const levels = byId.get(e.id) ?? Array<number>(ENCHANTMENTS[e.id].costs.length).fill(0);
        levels[e.level - 1] += c.probability;
        byId.set(e.id, levels);
      }
    }
    return [...byId]
      .map(([id, levels]) => ({ id, levels, total: levels.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [result]);

  return (
    <details className="rounded-lg border border-white/10 bg-black/30" open>
      <summary className="cursor-pointer px-4 py-3 text-sm text-zinc-300">エンチャント別の出現確率</summary>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-right text-sm tabular-nums">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-1 text-left font-normal">エンチャント</th>
              <th className="py-1 font-normal">合計</th>
              {ROMAN.map((r) => (
                <th key={r} className="py-1 font-normal">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="py-1 pr-3 text-left whitespace-nowrap">{ENCHANTMENTS[r.id].name}</td>
                <td className="py-1 pl-3 whitespace-nowrap text-[#d4b3ff]">{formatPercent(r.total)}</td>
                {ROMAN.map((_, i) => (
                  <td key={i} className="py-1 pl-3 whitespace-nowrap text-zinc-400">
                    {r.levels[i] ? formatPercent(r.levels[i]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
