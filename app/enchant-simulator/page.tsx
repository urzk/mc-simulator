import type { Metadata } from "next";
import Link from "next/link";
import EnchantSimulator from "./enchant-simulator";

export const metadata: Metadata = {
  title: "エンチャントシミュレーター",
  description: "エンチャントテーブルで付与されうるエンチャントの組み合わせを、出現確率ごとに一覧表示します。",
};

export default function EnchantSimulatorPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#1a1824]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
        <header className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← トップへ
          </Link>
          <h1 className="font-pixel text-3xl text-[#d4b3ff] [text-shadow:3px_3px_0_#000]">
            エンチャントシミュレーター
          </h1>
          <p className="text-sm text-zinc-400">
            エンチャントテーブルで付与されうるエンチャントの組み合わせを、出現確率の高い順に一覧表示します。
          </p>
        </header>

        <EnchantSimulator />

        <footer className="text-xs leading-relaxed text-zinc-500">
          <ul className="list-disc pl-5">
            <li>Java Edition のエンチャントテーブルの仕組みに基づいて計算しています（統合版とは一部異なります）。</li>
            <li>エンチャントレベルは、エンチャントテーブルの各スロットに表示される必要レベルの数字です。</li>
            <li>本の場合、複数のエンチャントが選ばれると最後にそのうち 1 つがランダムに取り除かれます。</li>
          </ul>
          <p className="mt-2">
            参考:{" "}
            <a
              href="https://ja.minecraft.wiki/w/%E3%82%A8%E3%83%B3%E3%83%81%E3%83%A3%E3%83%B3%E3%83%88%E3%81%AE%E4%BB%95%E7%B5%84%E3%81%BF"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-300"
            >
              エンチャントの仕組み（Minecraft Wiki）
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
