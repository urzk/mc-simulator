import type { Metadata } from "next";
import Link from "next/link";
import JobXpCalculator, { JobLevelTable } from "./job-xp-calculator";

export const metadata: Metadata = {
  title: "Job経験値計算機",
  description:
    "できたてサーバー（猫）の Jobs プラグインで、目標の Job レベルまでに必要な Job 経験値や、行動回数・収入を計算します。",
};

export default function JobXpCalculatorPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#141d20]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
        <header className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← トップへ
          </Link>
          <h1 className="font-pixel text-3xl text-[#55ffff] [text-shadow:3px_3px_0_#000]">Job経験値計算機</h1>
          <p className="text-sm text-zinc-400">
            できたてサーバー（猫）の Jobs プラグインで、現在の Job レベルとバーの貯まり具合から、目標の Job
            レベルまでに必要な Job 経験値を計算します。
          </p>
        </header>

        <JobXpCalculator />
        <JobLevelTable />

        <footer className="text-xs leading-relaxed text-zinc-500">
          <ul className="list-disc pl-5">
            <li>Job 経験値は Jobs プラグインの Job レベルに関わる経験値で、Minecraft の経験値とは別物です。</li>
            <li>Job レベル L から L+1 に上がるのに必要な Job 経験値は L³ です（例: Lv40→41 は 64,000）。</li>
            <li>Job レベルは 1 から始まり、最大は 100 です。Lv100 に到達するとバーは増えなくなります。</li>
            <li>経験値は小数第 2 位まで扱います。</li>
          </ul>
        </footer>
      </main>
    </div>
  );
}
