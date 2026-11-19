import { RuleMasteryRecord } from '@/core/types';
import { computeWeightedMasteryScore } from './masteryScore';

/**
 * Оновлює запис засвоєння правила (M_r) за останніми 5 спробами
 * та розраховує наступний інтервал повторення в днях (метод Лейтнера / крива Еббінгауза).
 */
export function computeSpacedMastery(
  prev: RuleMasteryRecord | undefined,
  itemId: string,
  section: string,
  isCorrect: boolean
): RuleMasteryRecord {
  const prevAttempts = prev?.recentAttempts ?? [];
  const recentAttempts = [...prevAttempts, isCorrect].slice(-5);
  const masteryScore = computeWeightedMasteryScore(recentAttempts);

  let intervalDays = prev?.intervalDays ?? 0;
  if (!isCorrect) {
    intervalDays = 0;
  } else {
    intervalDays =
      intervalDays === 0 ? 1 : Math.ceil(intervalDays * (1.5 + masteryScore));
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    itemId,
    section,
    recentAttempts,
    masteryScore,
    intervalDays,
    nextReviewAt: nextDate.toISOString(),
    totalAttempts: (prev?.totalAttempts ?? 0) + 1,
    correctAttempts: (prev?.correctAttempts ?? 0) + (isCorrect ? 1 : 0),
  };
}

/**
 * Перевіряє, чи настав час для інтервального повторення правила сьогодні.
 */
export function isRuleDueForReview(record: RuleMasteryRecord): boolean {
  if (record.totalAttempts === 0) return false;
  if (record.intervalDays === 0 || record.masteryScore < 0.6) return true;
  const now = Date.now();
  const next = new Date(record.nextReviewAt).getTime();
  return now >= next;
}
