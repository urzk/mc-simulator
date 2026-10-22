import type { Metadata } from "next";
import Link from "next/link";
import XpCalculator, { LevelTable } from "./xp-calculator";

export const metadata: Metadata = {
  title: "経験値計算機",
  description: "現在のレベルとバーの進捗から、目標レベルまでに必要な経験値を計算します。",
};

export default function XpCalculatorPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← トップへ
        </Link>
        <h1 className="font-pixel text-3xl text-[#80ff20] [text-shadow:3px_3px_0_#000]">
          経験値計算機
        </h1>
        <p className="text-sm text-zinc-400">
          現在のレベルとバーの貯まり具合から、目標レベルまでに必要な経験値を計算します。
        </p>
      </header>

      <XpCalculator />
      <LevelTable />

      <footer className="text-xs leading-relaxed text-zinc-500">
        Java Edition 1.8 以降 / 統合版の公式に基づいて計算しています。
        <br />
        Lv0〜15: 次まで 2L+7 ／ Lv16〜30: 5L−38 ／ Lv31〜: 9L−158（
        <a
          href="https://ja.minecraft.wiki/w/%E7%B5%8C%E9%A8%93%E5%80%A4"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-300"
        >
          Minecraft Wiki
        </a>
        ）
      </footer>
    </main>
  );
}
