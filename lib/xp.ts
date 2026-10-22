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
