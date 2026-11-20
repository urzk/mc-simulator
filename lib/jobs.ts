// できたてサーバー（猫）の Jobs プラグインにおける Job 経験値の公式
// Job 経験値は Minecraft の経験値とは別物で、Job のレベルにだけ関わる。
// 小数第 2 位まで扱うため、内部では 0.01 単位の整数 (centi) で計算する。

export const JOB_MIN_LEVEL = 1;
export const JOB_MAX_LEVEL = 100;

/** レベル `level` から次のレベルに上がるのに必要な Job 経験値 (= level³) */
export function jobXpToNextLevel(level: number): number {
  return level ** 3;
}

/** レベル 1 からレベル `level` (バー 0%) に到達するまでの累計 Job 経験値 (= Σ_{k=1}^{level-1} k³) */
export function jobTotalXpForLevel(level: number): number {
  const n = level - 1;
  return ((n * (n + 1)) / 2) ** 2;
}

/** 0.01 単位に丸める */
export function toCenti(xp: number): number {
  return Math.round(xp * 100);
}

/** レベルとバー内の経験値 (0.01 単位) から累計経験値 (0.01 単位) を求める */
export function jobTotalXpCenti(level: number, xpCenti: number): number {
  return jobTotalXpForLevel(level) * 100 + xpCenti;
}
