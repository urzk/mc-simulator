// Java Edition 1.8+ / Bedrock Edition の経験値公式
// https://ja.minecraft.wiki/w/経験値

/** レベル `level` から次のレベルに上がるのに必要な経験値 */
export function xpToNextLevel(level: number): number {
  if (level <= 15) return 2 * level + 7;
  if (level <= 30) return 5 * level - 38;
  return 9 * level - 158;
}

/** レベル 0 からレベル `level` (バー 0%) に到達するまでの累計経験値 */
export function totalXpForLevel(level: number): number {
  if (level <= 16) return level * level + 6 * level;
  if (level <= 31) return 2.5 * level * level - 40.5 * level + 360;
  return 4.5 * level * level - 162.5 * level + 2220;
}

/** レベルとバーの進捗 (0〜1) から累計経験値を求める */
export function totalXp(level: number, progress: number): number {
  return totalXpForLevel(level) + progress * xpToNextLevel(level);
}

/** 累計経験値からレベルとバーの進捗 (0〜1) を求める */
export function levelFromTotalXp(xp: number): { level: number; progress: number } {
  let level = 0;
  while (totalXpForLevel(level + 1) <= xp) level++;
  return { level, progress: (xp - totalXpForLevel(level)) / xpToNextLevel(level) };
}

// 村人との取引 1 回でプレイヤーが得る経験値は 3〜6 の一様分布、
// その取引で村人のレベルが上がった場合はさらに +5
// https://ja.minecraft.wiki/w/取引
const TRADE_XP_MEAN = 4.5;
const TRADE_XP_VARIANCE = 1.25; // {3,4,5,6} の一様分布の分散 (4² − 1) / 12
export const VILLAGER_LEVEL_UP_BONUS_XP = 5;

/** `trades` 回の取引 (うち `levelUps` 回で村人がレベルアップ) で得る経験値の期待値と標準偏差 */
export function tradeXpStats(trades: number, levelUps: number): { mean: number; sd: number } {
  return {
    mean: trades * TRADE_XP_MEAN + levelUps * VILLAGER_LEVEL_UP_BONUS_XP,
    sd: Math.sqrt(trades * TRADE_XP_VARIANCE),
  };
}
