import Link from "next/link";

const tools = [
  {
    href: "/xp-calculator",
    title: "経験値計算機",
    description: "目標レベルまでに必要な経験値や、村人との取引で上がるレベルを計算します。",
    accent: "text-lime-300 group-hover:text-lime-200",
  },
  {
    href: "/enchant-simulator",
    title: "エンチャントシミュレーター",
    description: "エンチャントテーブルで付与されうるエンチャントの組み合わせを出現確率ごとに一覧表示します。",
    accent: "text-violet-300 group-hover:text-violet-200",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#211812]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
        <header className="flex flex-col gap-2">
          <h1 className="font-pixel text-3xl text-[#f0d3a4] [text-shadow:3px_3px_0_#000]">
            Minecraft シミュレーター
          </h1>
          <p className="text-sm text-stone-300">Minecraft の計算ツール集です。</p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col gap-2 rounded-lg border border-[#a07850]/20 bg-black/30 p-5 transition-colors hover:border-[#d9ae78]/60 hover:bg-[#2c2018]"
              >
                <span className={`font-pixel text-xl ${tool.accent}`}>{tool.title}</span>
                <span className="text-sm text-stone-400">{tool.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
