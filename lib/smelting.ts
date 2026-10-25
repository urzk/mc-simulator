// 精錬 1 回あたりの経験値 (Java Edition)
// https://minecraft.wiki/w/Smelting
// 浮動小数の誤差を避けるため 1/100 単位の整数で持つ

export type SmeltingRecipe = { id: string; input: string; output: string; xpCenti: number };

export const SMELTING_GROUPS: { label: string; recipes: SmeltingRecipe[] }[] = [
  {
    label: "鉱石",
    recipes: [
      { id: "ancient_debris", input: "古代の残骸", output: "ネザライトの欠片", xpCenti: 200 },
      { id: "gold", input: "金の原石・金鉱石", output: "金インゴット", xpCenti: 100 },
      { id: "diamond", input: "ダイヤモンド鉱石", output: "ダイヤモンド", xpCenti: 100 },
      { id: "emerald", input: "エメラルド鉱石", output: "エメラルド", xpCenti: 100 },
      { id: "iron", input: "鉄の原石・鉄鉱石", output: "鉄インゴット", xpCenti: 70 },
      { id: "copper", input: "銅の原石・銅鉱石", output: "銅インゴット", xpCenti: 70 },
      { id: "redstone", input: "レッドストーン鉱石", output: "レッドストーンダスト", xpCenti: 70 },
      { id: "lapis", input: "ラピスラズリ鉱石", output: "ラピスラズリ", xpCenti: 20 },
      { id: "quartz", input: "ネザークォーツ鉱石", output: "ネザークォーツ", xpCenti: 20 },
      { id: "coal", input: "石炭鉱石", output: "石炭", xpCenti: 10 },
    ],
  },
  {
    label: "食料",
    recipes: [
      { id: "beef", input: "生の牛肉", output: "ステーキ", xpCenti: 35 },
      { id: "porkchop", input: "生の豚肉", output: "焼き豚", xpCenti: 35 },
      { id: "mutton", input: "生の羊肉", output: "焼き羊肉", xpCenti: 35 },
      { id: "chicken", input: "生の鶏肉", output: "焼き鳥", xpCenti: 35 },
      { id: "rabbit", input: "生の兎肉", output: "焼き兎肉", xpCenti: 35 },
      { id: "cod", input: "生鱈", output: "焼き鱈", xpCenti: 35 },
      { id: "salmon", input: "生鮭", output: "焼き鮭", xpCenti: 35 },
      { id: "potato", input: "ジャガイモ", output: "ベイクドポテト", xpCenti: 35 },
      { id: "kelp", input: "コンブ", output: "乾燥した昆布", xpCenti: 10 },
    ],
  },
  {
    label: "ブロック・その他",
    recipes: [
      { id: "cactus", input: "サボテン", output: "緑色の染料", xpCenti: 100 },
      { id: "clay", input: "粘土（ブロック）", output: "テラコッタ", xpCenti: 35 },
      { id: "clay_ball", input: "粘土玉", output: "レンガ", xpCenti: 30 },
      { id: "log", input: "原木・木", output: "木炭", xpCenti: 15 },
      { id: "wet_sponge", input: "濡れたスポンジ", output: "スポンジ", xpCenti: 15 },
      { id: "sand", input: "砂・赤い砂", output: "ガラス", xpCenti: 10 },
      { id: "cobblestone", input: "丸石", output: "石", xpCenti: 10 },
      { id: "stone", input: "石", output: "滑らかな石", xpCenti: 10 },
      { id: "cobbled_deepslate", input: "深層岩の丸石", output: "深層岩", xpCenti: 10 },
      { id: "netherrack", input: "ネザーラック", output: "ネザーレンガ", xpCenti: 10 },
      { id: "chorus_fruit", input: "コーラスフルーツ", output: "焼いたコーラスフルーツ", xpCenti: 10 },
      { id: "sea_pickle", input: "シーピクルス", output: "黄緑色の染料", xpCenti: 10 },
      { id: "gear", input: "鉄・金・銅の道具や防具", output: "各ナゲット", xpCenti: 10 },
      { id: "other", input: "その他（ひび割れ・滑らかな石材など）", output: "", xpCenti: 10 },
    ],
  },
];

/** 各レシピの精錬回数から獲得経験値の期待値を求める */
export function smeltingXp(counts: Record<string, number>): number {
  let centi = 0;
  for (const recipe of SMELTING_GROUPS.flatMap((g) => g.recipes)) {
    centi += (counts[recipe.id] ?? 0) * recipe.xpCenti;
  }
  return centi / 100;
}
