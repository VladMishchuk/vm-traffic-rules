export type MasteryStatus = 'mastered' | 'learning' | 'weak' | 'untested';

/**
 * Обчислює зважений коефіцієнт засвоєння M_r (від 0.0 до 1.0)
 * на основі останніх N=5 спроб із лінійним зростанням ваги новіших спроб (w = 1..k).
 */
export function computeWeightedMasteryScore(recentAttempts: boolean[]): number {
  const window = recentAttempts.slice(-5);
  if (window.length === 0) return 0;

  let weightedSum = 0;
  let weightTotal = 0;
  window.forEach((isCorrect, idx) => {
    const weight = idx + 1;
    weightTotal += weight;
    if (isCorrect) {
      weightedSum += weight;
    }
  });

  return weightTotal > 0 ? Number((weightedSum / weightTotal).toFixed(2)) : 0;
}

/**
 * Визначає педагогічний статус засвоєння теми/правила за балом (0..1) та кількістю спроб.
 */
export function getMasteryStatus(
  masteryScore: number,
  totalAttempts: number
): MasteryStatus {
  if (totalAttempts === 0) return 'untested';
  if (masteryScore >= 0.85 && totalAttempts >= 2) return 'mastered';
  if (masteryScore >= 0.5) return 'learning';
  return 'weak';
}
