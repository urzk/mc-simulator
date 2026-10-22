// Java Edition のエンチャントテーブルによるエンチャントの選定
// https://ja.minecraft.wiki/w/エンチャントの仕組み
// https://minecraft.wiki/w/Enchanting_table_mechanics

export type EnchantmentId =
  | "protection"
  | "fire_protection"
  | "feather_falling"
  | "blast_protection"
  | "projectile_protection"
  | "respiration"
  | "aqua_affinity"
  | "thorns"
  | "depth_strider"
  | "sharpness"
  | "smite"
  | "bane_of_arthropods"
  | "knockback"
  | "fire_aspect"
  | "looting"
  | "sweeping_edge"
  | "lunge"
  | "efficiency"
  | "silk_touch"
  | "fortune"
  | "power"
  | "punch"
  | "flame"
  | "infinity"
  | "luck_of_the_sea"
  | "lure"
  | "loyalty"
  | "impaling"
  | "riptide"
  | "channeling"
  | "multishot"
  | "quick_charge"
  | "piercing"
  | "density"
  | "breach"
  | "unbreaking";

type Enchantment = {
  name: string;
  weight: number;
  /** 強度 I, II, ... ごとの補正済みエンチャントレベルの範囲 [最小, 最大] */
  costs: [number, number][];
  /** 互いに競合するエンチャントのグループ */
  group?: string;
};

export const ENCHANTMENTS: Record<EnchantmentId, Enchantment> = {
  protection: { name: "ダメージ軽減", weight: 10, group: "protection", costs: [[1, 12], [12, 23], [23, 34], [34, 45]] },
  fire_protection: { name: "火炎耐性", weight: 5, group: "protection", costs: [[10, 18], [18, 26], [26, 34], [34, 42]] },
  feather_falling: { name: "落下耐性", weight: 5, costs: [[5, 11], [11, 17], [17, 23], [23, 29]] },
  blast_protection: { name: "爆発耐性", weight: 2, group: "protection", costs: [[5, 13], [13, 21], [21, 29], [29, 37]] },
  projectile_protection: { name: "飛び道具耐性", weight: 5, group: "protection", costs: [[3, 9], [9, 15], [15, 21], [21, 27]] },
  respiration: { name: "水中呼吸", weight: 2, costs: [[10, 40], [20, 50], [30, 60]] },
  aqua_affinity: { name: "水中採掘", weight: 2, costs: [[1, 41]] },
  thorns: { name: "棘の鎧", weight: 1, costs: [[10, 60], [30, 80], [50, 100]] },
  depth_strider: { name: "水中歩行", weight: 2, costs: [[10, 25], [20, 35], [30, 45]] },
  sharpness: { name: "ダメージ増加", weight: 10, group: "damage", costs: [[1, 21], [12, 32], [23, 43], [34, 54], [45, 65]] },
  smite: { name: "アンデッド特効", weight: 5, group: "damage", costs: [[5, 25], [13, 33], [21, 41], [29, 49], [37, 57]] },
  bane_of_arthropods: { name: "虫特効", weight: 5, group: "damage", costs: [[5, 25], [13, 33], [21, 41], [29, 49], [37, 57]] },
  knockback: { name: "ノックバック", weight: 5, costs: [[5, 55], [25, 75]] },
  fire_aspect: { name: "火属性", weight: 2, costs: [[10, 60], [30, 80]] },
  looting: { name: "ドロップ増加", weight: 2, costs: [[15, 65], [24, 74], [33, 83]] },
  sweeping_edge: { name: "範囲ダメージ増加", weight: 2, costs: [[5, 20], [14, 29], [23, 38]] },
  lunge: { name: "突進", weight: 5, costs: [[5, 25], [13, 33], [21, 41]] },
  efficiency: { name: "効率強化", weight: 10, costs: [[1, 51], [11, 61], [21, 71], [31, 81], [41, 91]] },
  silk_touch: { name: "シルクタッチ", weight: 1, group: "mining", costs: [[15, 65]] },
  fortune: { name: "幸運", weight: 2, group: "mining", costs: [[15, 65], [24, 74], [33, 83]] },
  power: { name: "射撃ダメージ増加", weight: 10, costs: [[1, 16], [11, 26], [21, 36], [31, 46], [41, 56]] },
  punch: { name: "パンチ", weight: 2, costs: [[12, 37], [32, 57]] },
  flame: { name: "フレイム", weight: 2, costs: [[20, 50]] },
  infinity: { name: "無限", weight: 1, costs: [[20, 50]] },
  luck_of_the_sea: { name: "宝釣り", weight: 2, costs: [[15, 65], [24, 74], [33, 83]] },
  lure: { name: "入れ食い", weight: 2, costs: [[15, 65], [24, 74], [33, 83]] },
  loyalty: { name: "忠誠", weight: 5, costs: [[12, 50], [19, 50], [26, 50]] },
  impaling: { name: "水生特効", weight: 2, group: "damage", costs: [[1, 21], [9, 29], [17, 37], [25, 45], [33, 53]] },
  riptide: { name: "激流", weight: 2, costs: [[17, 50], [24, 50], [31, 50]] },
  channeling: { name: "召雷", weight: 1, costs: [[25, 50]] },
  multishot: { name: "拡散", weight: 2, group: "crossbow", costs: [[20, 50]] },
  quick_charge: { name: "高速装填", weight: 5, costs: [[12, 50], [32, 50], [52, 50]] },
  piercing: { name: "貫通", weight: 10, group: "crossbow", costs: [[1, 50], [11, 50], [21, 50], [31, 50]] },
  density: { name: "重撃", weight: 5, group: "damage", costs: [[5, 25], [13, 33], [21, 41], [29, 49], [37, 57]] },
  breach: { name: "防具貫通", weight: 2, group: "damage", costs: [[15, 65], [24, 74], [33, 83], [42, 92]] },
  unbreaking: { name: "耐久力", weight: 5, costs: [[5, 55], [13, 63], [21, 71]] },
};

/** グループ以外で競合する組み合わせ */
const EXTRA_CONFLICTS: [EnchantmentId, EnchantmentId][] = [
  ["riptide", "loyalty"],
  ["riptide", "channeling"],
];

function conflicts(a: EnchantmentId, b: EnchantmentId) {
  if (a === b) return true;
  const ga = ENCHANTMENTS[a].group;
  if (ga && ga === ENCHANTMENTS[b].group) return true;
  return EXTRA_CONFLICTS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export type Material = { name: string; enchantability: number };

const ARMOR_MATERIALS: Material[] = [
  { name: "革", enchantability: 15 },
  { name: "チェーン", enchantability: 12 },
  { name: "銅", enchantability: 8 },
  { name: "鉄", enchantability: 9 },
  { name: "金", enchantability: 25 },
  { name: "ダイヤモンド", enchantability: 10 },
  { name: "ネザライト", enchantability: 15 },
];

const TOOL_MATERIALS: Material[] = [
  { name: "木", enchantability: 15 },
  { name: "石", enchantability: 5 },
  { name: "銅", enchantability: 13 },
  { name: "鉄", enchantability: 14 },
  { name: "金", enchantability: 22 },
  { name: "ダイヤモンド", enchantability: 10 },
  { name: "ネザライト", enchantability: 15 },
];

const PROTECTIONS: EnchantmentId[] = ["protection", "fire_protection", "blast_protection", "projectile_protection"];
const MINING: EnchantmentId[] = ["efficiency", "unbreaking", "fortune", "silk_touch"];

export type ItemType = {
  id: string;
  name: string;
  materials: Material[];
  enchantments: EnchantmentId[];
};

export const ITEM_TYPES: ItemType[] = [
  {
    id: "helmet",
    name: "ヘルメット",
    materials: [...ARMOR_MATERIALS, { name: "カメの甲羅", enchantability: 9 }],
    enchantments: [...PROTECTIONS, "respiration", "aqua_affinity", "unbreaking"],
  },
  { id: "chestplate", name: "チェストプレート", materials: ARMOR_MATERIALS, enchantments: [...PROTECTIONS, "thorns", "unbreaking"] },
  { id: "leggings", name: "レギンス", materials: ARMOR_MATERIALS, enchantments: [...PROTECTIONS, "unbreaking"] },
  {
    id: "boots",
    name: "ブーツ",
    materials: ARMOR_MATERIALS,
    enchantments: [...PROTECTIONS, "feather_falling", "depth_strider", "unbreaking"],
  },
  {
    id: "sword",
    name: "剣",
    materials: TOOL_MATERIALS,
    enchantments: ["sharpness", "smite", "bane_of_arthropods", "knockback", "fire_aspect", "looting", "sweeping_edge", "unbreaking"],
  },
  {
    id: "spear",
    name: "槍",
    materials: TOOL_MATERIALS,
    enchantments: ["sharpness", "smite", "bane_of_arthropods", "knockback", "fire_aspect", "looting", "lunge", "unbreaking"],
  },
  { id: "pickaxe", name: "ツルハシ", materials: TOOL_MATERIALS, enchantments: MINING },
  { id: "axe", name: "斧", materials: TOOL_MATERIALS, enchantments: MINING },
  { id: "shovel", name: "シャベル", materials: TOOL_MATERIALS, enchantments: MINING },
  { id: "hoe", name: "クワ", materials: TOOL_MATERIALS, enchantments: MINING },
  {
    id: "bow",
    name: "弓",
    materials: [{ name: "", enchantability: 1 }],
    enchantments: ["power", "punch", "flame", "infinity", "unbreaking"],
  },
  {
    id: "crossbow",
    name: "クロスボウ",
    materials: [{ name: "", enchantability: 1 }],
    enchantments: ["multishot", "quick_charge", "piercing", "unbreaking"],
  },
  {
    id: "trident",
    name: "トライデント",
    materials: [{ name: "", enchantability: 1 }],
    enchantments: ["loyalty", "impaling", "riptide", "channeling", "unbreaking"],
  },
  {
    id: "fishing_rod",
    name: "釣竿",
    materials: [{ name: "", enchantability: 1 }],
    enchantments: ["luck_of_the_sea", "lure", "unbreaking"],
  },
  {
    id: "mace",
    name: "メイス",
    materials: [{ name: "", enchantability: 15 }],
    enchantments: ["density", "breach", "unbreaking"],
  },
  {
    id: "book",
    name: "本",
    materials: [{ name: "", enchantability: 1 }],
    enchantments: Object.keys(ENCHANTMENTS) as EnchantmentId[],
  },
];

/** 0.85〜1.15 の三角分布に従う補正倍率 1 + (U₁ + U₂ − 1) × 0.15 の (U₁ + U₂ − 1) の累積分布関数 */
function triangularCdf(t: number) {
  if (t <= -1) return 0;
  if (t <= 0) return (t + 1) ** 2 / 2;
  if (t < 1) return 1 - (1 - t) ** 2 / 2;
  return 1;
}

/** エンチャントレベル (必要レベル) から補正済みエンチャントレベルの確率分布を求める */
export function modifiedLevelDistribution(level: number, enchantability: number): Map<number, number> {
  const q = Math.floor(enchantability / 4);
  const dist = new Map<number, number>();
  for (let r1 = 0; r1 <= q; r1++) {
    for (let r2 = 0; r2 <= q; r2++) {
      const k = level + 1 + r1 + r2;
      const pk = 1 / (q + 1) ** 2;
      // round(k × b) = m となるのは (m − 0.5) / k ≤ b < (m + 0.5) / k のとき
      for (let m = Math.floor(k * 0.85); m <= Math.ceil(k * 1.15); m++) {
        const p =
          triangularCdf(((m + 0.5) / k - 1) / 0.15) - triangularCdf(((m - 0.5) / k - 1) / 0.15);
        if (p <= 0) continue;
        const key = Math.max(1, m);
        dist.set(key, (dist.get(key) ?? 0) + pk * p);
      }
    }
  }
  return dist;
}

export type EnchantmentInstance = { id: EnchantmentId; level: number };
export type Combination = { enchantments: EnchantmentInstance[]; probability: number };

/** これより確率の小さい分岐は打ち切り、「その他」としてまとめる */
const PRUNE_THRESHOLD = 1e-8;

export type EnchantResult = {
  /** 確率の高い順。何も付与されない場合は enchantments が空の組み合わせとして含まれる */
  combinations: Combination[];
  /** 確率が極めて低いため列挙を打ち切った組み合わせの確率の合計 */
  omitted: number;
};

/** エンチャントテーブルで付与されうるエンチャントの組み合わせと、その確率を求める */
export function enchantCombinations(item: ItemType, enchantability: number, level: number): EnchantResult {
  const isBook = item.id === "book";
  const results = new Map<string, Combination>();
  let omitted = 0;

  const add = (instances: EnchantmentInstance[], p: number) => {
    // instances は item.enchantments の順に並んでいる
    const key = instances.map((e) => `${e.id}:${e.level}`).join(",");
    const entry = results.get(key);
    if (entry) entry.probability += p;
    else results.set(key, { enchantments: instances.map(({ id, level }) => ({ id, level })), probability: p });
  };

  for (const [modified, pModified] of modifiedLevelDistribution(level, enchantability)) {
    // 補正済みレベルが範囲に入る最も高い強度を候補にする
    const candidates: (EnchantmentInstance & { weight: number })[] = [];
    for (const id of item.enchantments) {
      const { costs, weight } = ENCHANTMENTS[id];
      for (let lv = costs.length; lv >= 1; lv--) {
        const [min, max] = costs[lv - 1];
        if (min <= modified && modified <= max) {
          candidates.push({ id, level: lv, weight });
          break;
        }
      }
    }
    if (candidates.length === 0) {
      add([], pModified);
      continue;
    }

    const n = candidates.length;
    // 候補の集合は 2^i の和 (n ≤ 37 なので Number で正確に表せる)、
    // 競合で除外された候補は下位・上位 32 ビットに分けたビットマスクで持つ
    const pow2 = candidates.map((_, i) => 2 ** i);
    const conflictLo = new Int32Array(n);
    const conflictHi = new Int32Array(n);
    candidates.forEach((a, i) =>
      candidates.forEach((b, j) => {
        if (!conflicts(a.id, b.id)) return;
        if (j < 32) conflictLo[i] |= 1 << j;
        else conflictHi[i] |= 1 << (j - 32);
      }),
    );
    const isBlocked = (lo: number, hi: number, i: number) =>
      i < 32 ? (lo >>> i) & 1 : (hi >>> (i - 32)) & 1;

    const finals = new Map<number, number>();
    const addFinal = (mask: number, p: number) => finals.set(mask, (finals.get(mask) ?? 0) + p);

    // 状態: 選ばれた候補の集合 → (確率, 競合により除外された候補)
    type State = { p: number; lo: number; hi: number };
    let layer = new Map<number, State>([[0, { p: pModified, lo: 0, hi: 0 }]]);
    let rollLevel = modified;
    const remaining: number[] = [];

    for (let picked = 0; layer.size > 0; picked++) {
      const next = new Map<number, State>();
      // 1 個目は必ず選ばれ、2 個目以降は (補正済みレベル + 1) / 50 の確率で続行
      const cont = picked === 0 ? 1 : Math.min(1, (rollLevel + 1) / 50);
      if (picked >= 1) rollLevel = Math.floor(rollLevel / 2);

      for (const [mask, { p, lo, hi }] of layer) {
        remaining.length = 0;
        let totalWeight = 0;
        for (let i = 0; i < n; i++) {
          if (isBlocked(lo, hi, i)) continue;
          remaining.push(i);
          totalWeight += candidates[i].weight;
        }
        if (remaining.length === 0) {
          addFinal(mask, p);
          continue;
        }
        if (cont < 1) addFinal(mask, p * (1 - cont));
        if (p * cont < PRUNE_THRESHOLD) {
          omitted += p * cont;
          continue;
        }

        const scale = (p * cont) / totalWeight;
        for (const i of remaining) {
          const nextMask = mask + pow2[i];
          const np = scale * candidates[i].weight;
          const entry = next.get(nextMask);
          if (entry) entry.p += np;
          else next.set(nextMask, { p: np, lo: lo | conflictLo[i], hi: hi | conflictHi[i] });
        }
      }
      layer = next;
    }

    const membersOf = (mask: number) => {
      const members: number[] = [];
      const lo = mask % 2 ** 32;
      const hi = Math.floor(mask / 2 ** 32);
      for (let i = 0; i < n; i++) if (i < 32 ? (lo / pow2[i]) % 2 >= 1 : (hi >>> (i - 32)) & 1) members.push(i);
      return members;
    };

    // 本の場合、複数選ばれていたらランダムに 1 つ取り除かれる
    const outcomes = isBook ? new Map<number, number>() : finals;
    if (isBook) {
      for (const [mask, p] of finals) {
        const members = membersOf(mask);
        if (members.length <= 1) {
          outcomes.set(mask, (outcomes.get(mask) ?? 0) + p);
          continue;
        }
        for (const i of members) {
          outcomes.set(mask - pow2[i], (outcomes.get(mask - pow2[i]) ?? 0) + p / members.length);
        }
      }
    }
    for (const [mask, p] of outcomes) {
      add(membersOf(mask).map((i) => candidates[i]), p);
    }
  }

  return {
    combinations: [...results.values()].sort((a, b) => b.probability - a.probability),
    omitted,
  };
}
