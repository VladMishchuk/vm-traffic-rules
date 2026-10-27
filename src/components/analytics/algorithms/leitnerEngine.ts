import {
  DriverCategoryCode,
  OfficialQuestion,
  RuleMasteryRecord,
} from '@/core/types';
import { matchesCategories } from '@/lib/dataService';
import { injectDynamic2dScenariosIntoAdaptiveSession } from '@/lib/ai-generator';
import { shuffleArray } from '@/core/utils/shuffle';

export type MasteryStatus = 'mastered' | 'learning' | 'weak' | 'untested';

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
  recentAttempts: boolean[]; // aggregated last 5 attempts in this section
  dueForReviewCount: number;
  rules: RuleMasteryRecord[];
}

/**
 * Determines pedagogical mastery status from score (0..1) and attempts count.
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

/**
 * Checks whether a RuleMasteryRecord is due for Spaced Practice review today.
 */
export function isRuleDueForReview(record: RuleMasteryRecord): boolean {
  if (record.totalAttempts === 0) return false;
  if (record.intervalDays === 0 || record.masteryScore < 0.6) return true;
  const now = Date.now();
  const next = new Date(record.nextReviewAt).getTime();
  return now >= next;
}

/**
 * Aggregates rule-level mastery records into the 63 exam sections
 * filtered by the user's selected driver categories.
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

  // Fallback: ensure any section with attempted rules in masteryMap appears
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
 * Builds an adaptive 20-question session using Spaced Practice:
 * - 70% (14 questions): Weak rules/sections (M_r < 0.75) or recent mistakes
 * - 30% (6 questions): Spaced repetition of learned topics due for review
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

  // Tier 1 (highest automatic priority): direct mistakes & rules with intervalDays === 0
  const tier1Urgent = shuffleArray(
    catQuestions.filter(
      (q) =>
        wrongSet.has(q.id) || q.rule_ids?.some((r) => urgentRuleIds.has(r))
    )
  );
  const tier1Ids = new Set(tier1Urgent.map((q) => q.id));

  // Tier 2: other weak or due-for-review rules/sections
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

  // Priority 2 for spaced review pool: questions from learnedSections
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

  return injectDynamic2dScenariosIntoAdaptiveSession(
    combined,
    masteryMap,
    selectedCategories,
    totalCount
  );
}
