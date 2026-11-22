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

// ---- 行動 1 回あたりの収入と経験値 ----
// Job収入 = 基礎収入 × (1 + レベル係数 × 兼業係数)
// Job経験値 = 基礎経験値 × 兼業係数
// レベル係数 = (レベル − 1) × 0.01、兼業係数 = 1 − (就業中の Job 数 − 1) × 0.05
// 職業ボーナスは収入にだけ掛かる（土曜: ×1.2、投票ポイント: ×1.5、両方: ×1.7）

export const MAX_JOB_COUNT = 3;

export type JobBonus = { saturday: boolean; vote: boolean };

export const NO_JOB_BONUS: JobBonus = { saturday: false, vote: false };

/** 職業ボーナスによる収入の倍率を 1/100 単位の整数で返す */
export function jobBonusPercent(bonus: JobBonus): number {
  return 100 + (bonus.saturday ? 20 : 0) + (bonus.vote ? 50 : 0);
}

/** 兼業係数を 1/100 単位の整数で返す (1 Job: 100, 2 Jobs: 95, 3 Jobs: 90) */
function multiJobPercent(jobCount: number): number {
  return 100 - (jobCount - 1) * 5;
}

/** 基礎収入 (0.01 単位) から、レベル `level` での 1 回あたりの収入を求める */
export function jobIncomePerAction(
  baseIncomeCenti: number,
  level: number,
  jobCount: number,
  bonus: JobBonus = NO_JOB_BONUS,
): number {
  return (
    (baseIncomeCenti / 100) *
    (1 + ((level - 1) / 100) * (multiJobPercent(jobCount) / 100)) *
    (jobBonusPercent(bonus) / 100)
  );
}

/** 基礎経験値 (0.01 単位) から、1 回あたりの経験値を 0.0001 単位の整数で求める */
export function jobXpPerActionMicro(baseXpCenti: number, jobCount: number): number {
  return baseXpCenti * multiJobPercent(jobCount);
}

/** 基礎収入から基礎経験値を求める（小数第 2 位を切り捨てて小数第 1 位までにする）。0.01 単位 */
export function baseXpCentiFromIncome(baseIncomeCenti: number): number {
  return Math.trunc(baseIncomeCenti / 10) * 10;
}

/** 整数 p, q (q > 0) に対して ceil(p / q) を誤差なく求める */
function ceilDiv(p: number, q: number): number {
  let k = Math.floor(p / q);
  while (k * q < p) k++;
  while ((k - 1) * q >= p) k--;
  return k;
}

export type ActionPlan = {
  /** 目標までに必要な行動回数 */
  count: number;
  /** 目標に到達するまでに得られる収入の合計 */
  totalIncome: number;
  /** レベルごとの行動回数と収入 */
  byLevel: { level: number; count: number; income: number }[];
};

/**
 * 現在の状態から、同じ行動を繰り返して目標の累計経験値に到達するまでの回数と収入を求める。
 * 収入は行動したときのレベルで決まるので、途中のレベルアップを考慮して合計する。
 * 経験値が 0 以下の行動では到達できないので null を返す。
 */
export function planJobActions(
  current: { level: number; xpCenti: number },
  targetTotalCenti: number,
  baseIncomeCenti: number,
  baseXpCenti: number,
  jobCount: number,
  bonus: JobBonus = NO_JOB_BONUS,
): ActionPlan | null {
  const step = jobXpPerActionMicro(baseXpCenti, jobCount); // 0.0001 単位
  if (step <= 0) return null;

  const start = jobTotalXpCenti(current.level, current.xpCenti) * 100;
  const goal = targetTotalCenti * 100;
  const count = Math.max(0, ceilDiv(goal - start, step));

  // 累計経験値が T 未満の状態で行う行動の回数
  const actionsBelow = (t: number) => Math.min(count, Math.max(0, ceilDiv(t - start, step)));

  const byLevel: ActionPlan["byLevel"] = [];
  let totalIncome = 0;
  for (let level = current.level; level < JOB_MAX_LEVEL; level++) {
    const done = actionsBelow(jobTotalXpForLevel(level) * 10_000);
    const n = actionsBelow(jobTotalXpForLevel(level + 1) * 10_000) - done;
    if (n > 0) {
      const income = n * jobIncomePerAction(baseIncomeCenti, level, jobCount, bonus);
      byLevel.push({ level, count: n, income });
      totalIncome += income;
    }
    if (done + n >= count) break;
  }
  return { count, totalIncome, byLevel };
}
