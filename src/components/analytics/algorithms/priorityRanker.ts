import {
  DriverCategoryCode,
  OfficialQuestion,
  RuleMasteryRecord,
} from '@/core/types';
import { matchesCategories } from '@/lib/dataService';
import { shuffleArray } from '@/core/utils/shuffle';
import { getMasteryStatus, MasteryStatus } from './masteryScore';
import { isRuleDueForReview } from './spacedRepetition';

export interface SectionAnalyticsItem {
  section: string;
  title: string;
  categories: DriverCategoryCode[];
  totalQuestionsInBank: number;
  attemptedRulesCount: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  masteryScore: number; // 0..100
  status: MasteryStatus;
  recentAttempts: boolean[]; // останні 5 спроб у цьому розділі
  dueForReviewCount: number;
  rules: RuleMasteryRecord[];
}

/**
 * Агрегує записи засвоєння правил у розрізі тематичних розділів ПДР,
 * відфільтрованих за обраними категоріями водія.
 */
export function buildSectionAnalytics(
  questions: OfficialQuestion[],
  masteryMap: Record<string, RuleMasteryRecord>,
  selectedCategories: DriverCategoryCode[]
): SectionAnalyticsItem[] {
  const sectionQuestionsMap = new Map<
    string,
    { title: string; categories: DriverCategoryCode[]; count: number }
  >();

  for (const q of questions) {
    if (!matchesCategories(q.categories, selectedCategories)) continue;
    const secKey = String(q.section);
    const existing = sectionQuestionsMap.get(secKey);
    if (existing) {
      existing.count += 1;
    } else {
      sectionQuestionsMap.set(secKey, {
        title: q.section_title,
        categories: q.categories,
        count: 1,
      });
    }
  }

  const recordsBySection = new Map<string, RuleMasteryRecord[]>();
  Object.values(masteryMap).forEach((rec) => {
    const list = recordsBySection.get(rec.section) || [];
    list.push(rec);
    recordsBySection.set(rec.section, list);
  });

  const result: SectionAnalyticsItem[] = [];

  for (const [secKey, meta] of sectionQuestionsMap.entries()) {
    const rulesInSec = recordsBySection.get(secKey) || [];
    const totalAttempts = rulesInSec.reduce((s, r) => s + r.totalAttempts, 0);
    const correctAttempts = rulesInSec.reduce(
      (s, r) => s + r.correctAttempts,
      0
    );
    const accuracyPercent =
      totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    const combinedRecent: boolean[] = [];
    rulesInSec.forEach((r) => {
      combinedRecent.push(...r.recentAttempts);
    });
    const recentSlice = combinedRecent.slice(-5);

    const avgMastery =
      rulesInSec.length > 0
        ? rulesInSec.reduce((s, r) => s + r.masteryScore, 0) / rulesInSec.length
        : 0;

    const status = getMasteryStatus(avgMastery, totalAttempts);
    const dueForReviewCount = rulesInSec.filter(isRuleDueForReview).length;

    result.push({
      section: secKey,
      title: meta.title,
      categories: meta.categories,
      totalQuestionsInBank: meta.count,
      attemptedRulesCount: rulesInSec.length,
      totalAttempts,
      correctAttempts,
      accuracyPercent,
      masteryScore: Math.round(avgMastery * 100),
      status,
      recentAttempts: recentSlice,
      dueForReviewCount,
      rules: rulesInSec.sort((a, b) => a.masteryScore - b.masteryScore),
    });
  }

  for (const [secKey, rulesInSec] of recordsBySection.entries()) {
    if (!sectionQuestionsMap.has(secKey)) {
      const totalAttempts = rulesInSec.reduce((s, r) => s + r.totalAttempts, 0);
      const correctAttempts = rulesInSec.reduce(
        (s, r) => s + r.correctAttempts,
        0
      );
      const accuracyPercent =
        totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
      const combinedRecent: boolean[] = [];
      rulesInSec.forEach((r) => {
        combinedRecent.push(...r.recentAttempts);
      });
      const recentSlice = combinedRecent.slice(-5);
      const avgMastery =
        rulesInSec.length > 0
          ? rulesInSec.reduce((s, r) => s + r.masteryScore, 0) / rulesInSec.length
          : 0;
      const status = getMasteryStatus(avgMastery, totalAttempts);
      const dueForReviewCount = rulesInSec.filter(isRuleDueForReview).length;

      result.push({
        section: secKey,
        title: `Розділ ${secKey}`,
        categories: selectedCategories,
        totalQuestionsInBank: rulesInSec.length,
        attemptedRulesCount: rulesInSec.length,
        totalAttempts,
        correctAttempts,
        accuracyPercent,
        masteryScore: Math.round(avgMastery * 100),
        status,
        recentAttempts: recentSlice,
        dueForReviewCount,
        rules: rulesInSec.sort((a, b) => a.masteryScore - b.masteryScore),
      });
    }
  }

  return result.sort(
    (a, b) => parseFloat(a.section) - parseFloat(b.section)
  );
}

/**
 * Формує адаптивну сесію з 20 питань на основі інтервального повторення:
 * - 70% (14 питань): слабкі правила/розділи (M_r < 0.75) або активні помилки
 * - 30% (6 питань): інтервальне закріплення вже вивчених тем
 */
export function buildAdaptiveSpacedSession(
  questions: OfficialQuestion[],
  masteryMap: Record<string, RuleMasteryRecord>,
  wrongQuestionIds: string[],
  selectedCategories: DriverCategoryCode[],
  totalCount = 20
): OfficialQuestion[] {
  const catQuestions = questions.filter((q) =>
    matchesCategories(q.categories, selectedCategories)
  );
  if (catQuestions.length === 0) return [];

  const weakCount = Math.round(totalCount * 0.7); // 14
  const reviewCount = totalCount - weakCount; // 6

  const records = Object.values(masteryMap);
  const urgentRuleIds = new Set(
    records
      .filter((r) => r.intervalDays === 0 || r.masteryScore < 0.5)
      .map((r) => r.itemId)
  );
  const weakRuleIds = new Set(
    records
      .filter((r) => r.masteryScore < 0.75 || isRuleDueForReview(r))
      .map((r) => r.itemId)
  );
  const weakSections = new Set(
    records
      .filter((r) => r.masteryScore < 0.75 || isRuleDueForReview(r))
      .map((r) => r.section)
  );
  const learnedSections = new Set(
    records.filter((r) => r.masteryScore >= 0.75).map((r) => r.section)
  );

  const wrongSet = new Set(wrongQuestionIds);

  // Рівень 1 (найвищий пріоритет): прямі помилки та правила з intervalDays === 0
  const tier1Urgent = shuffleArray(
    catQuestions.filter(
      (q) =>
        wrongSet.has(q.id) || q.rule_ids?.some((r) => urgentRuleIds.has(r))
    )
  );
  const tier1Ids = new Set(tier1Urgent.map((q) => q.id));

  // Рівень 2: інші слабкі правила або розділи, де настав час повторення
  const tier2Weak = shuffleArray(
    catQuestions.filter(
      (q) =>
        !tier1Ids.has(q.id) &&
        (q.rule_ids?.some((r) => weakRuleIds.has(r)) ||
          weakSections.has(String(q.section)))
    )
  );

  const weakPool = [...tier1Urgent, ...tier2Weak];
  const weakPoolIds = new Set(weakPool.map((q) => q.id));

  // Пул інтервального повторення вивчених розділів (30%)
  const reviewPool = shuffleArray(
    catQuestions.filter(
      (q) =>
        learnedSections.has(String(q.section)) && !weakPoolIds.has(q.id)
    )
  );

  const pickedWeak = weakPool.slice(0, weakCount);
  const pickedReview = reviewPool.slice(0, reviewCount);

  const combined = [...pickedWeak, ...pickedReview];
  if (combined.length < totalCount) {
    const usedIds = new Set(combined.map((q) => q.id));
    const filler = shuffleArray(
      catQuestions.filter((q) => !usedIds.has(q.id))
    ).slice(0, totalCount - combined.length);
    combined.push(...filler);
  }

  return combined.slice(0, totalCount);
}
