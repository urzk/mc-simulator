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

// ---- サーバーごとの違い ----
// Jobs プラグインが入っているのはサバイバルサーバーと資源サーバーだけ。
// Miner は資源サーバーでのみ、Builder はサバイバルサーバーでのみ有効。
// Hunter はサバイバルサーバーでは収入が資源サーバーの 60%、経験値が 50% になる。
// 基礎収入・基礎経験値の一覧は資源サーバーの値。

export type JobServer = "survival" | "resource";

/** サーバーによる補正。収入・経験値とも 1/100 単位の整数 */
export type JobServerRate = { incomePercent: number; xpPercent: number };

export const FULL_SERVER_RATE: JobServerRate = { incomePercent: 100, xpPercent: 100 };

/** その Job のサーバーでの補正を返す。そのサーバーで無効な Job なら null */
export function jobServerRate(jobId: string, server: JobServer): JobServerRate | null {
  if (jobId === "Miner" && server === "survival") return null;
  if (jobId === "Builder" && server === "resource") return null;
  if (jobId === "Hunter" && server === "survival") return { incomePercent: 60, xpPercent: 50 };
  return FULL_SERVER_RATE;
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
  rate: JobServerRate = FULL_SERVER_RATE,
): number {
  return (
    (baseIncomeCenti / 100) *
    (1 + ((level - 1) / 100) * (multiJobPercent(jobCount) / 100)) *
    (jobBonusPercent(bonus) / 100) *
    (rate.incomePercent / 100)
  );
}

/** 経験値を誤差なく扱うための単位 (0.000001 xp) */
export const XP_MICRO = 1_000_000;

/** 基礎経験値 (0.01 単位) から、1 回あたりの経験値を 0.000001 単位の整数で求める */
export function jobXpPerActionMicro(
  baseXpCenti: number,
  jobCount: number,
  rate: JobServerRate = FULL_SERVER_RATE,
): number {
  return baseXpCenti * multiJobPercent(jobCount) * rate.xpPercent;
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
  rate: JobServerRate = FULL_SERVER_RATE,
): ActionPlan | null {
  const step = jobXpPerActionMicro(baseXpCenti, jobCount, rate); // 0.000001 単位
  if (step <= 0) return null;

  const start = jobTotalXpCenti(current.level, current.xpCenti) * (XP_MICRO / 100);
  const goal = targetTotalCenti * (XP_MICRO / 100);
  const count = Math.max(0, ceilDiv(goal - start, step));

  // 累計経験値が T 未満の状態で行う行動の回数
  const actionsBelow = (t: number) => Math.min(count, Math.max(0, ceilDiv(t - start, step)));

  const byLevel: ActionPlan["byLevel"] = [];
  let totalIncome = 0;
  for (let level = current.level; level < JOB_MAX_LEVEL; level++) {
    const done = actionsBelow(jobTotalXpForLevel(level) * XP_MICRO);
    const n = actionsBelow(jobTotalXpForLevel(level + 1) * XP_MICRO) - done;
    if (n > 0) {
      const income = n * jobIncomePerAction(baseIncomeCenti, level, jobCount, bonus, rate);
      byLevel.push({ level, count: n, income });
      totalIncome += income;
    }
    if (done + n >= count) break;
  }
  return { count, totalIncome, byLevel };
}
