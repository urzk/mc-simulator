import Link from "next/link";

const tools = [
  {
    href: "/xp-calculator",
    title: "経験値計算機",
    description: "目標レベルまでに必要な経験値や、村人との取引で上がるレベルを計算します。",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-pixel text-3xl text-[#80ff20] [text-shadow:3px_3px_0_#000]">
          Minecraft シミュレーター
        </h1>
        <p className="text-sm text-zinc-400">Minecraft の計算ツール集です。</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex h-full flex-col gap-2 rounded-lg border border-white/10 bg-black/30 p-5 transition-colors hover:border-lime-400"
            >
              <span className="font-pixel text-xl text-lime-300">{tool.title}</span>
              <span className="text-sm text-zinc-400">{tool.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
