import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  loadQuestions,
  loadRules,
  matchesCategories,
} from '@/lib/dataService';
import { shuffleArray } from '@/core/utils/shuffle';
import { useAppStore } from '@/store/useAppStore';
import {
  buildSectionAnalytics,
  isRuleDueForReview,
} from '../algorithms/leitnerEngine';
import {
  AnalyticsTab,
  StatusFilter,
} from '../components/AnalyticsFilterTabs';

export function useAnalyticsController() {
  const navigate = useNavigate();
  const { user, masteryMap, startTestSession, removeWrongQuestion } =
    useAppStore();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('sections');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: questions = [] } = useQuery({
    queryKey: ['official-questions'],
    queryFn: loadQuestions,
  });

  const { data: rules } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: loadRules,
  });

  const sectionAnalytics = useMemo(
    () =>
      buildSectionAnalytics(questions, masteryMap, user.selectedCategories),
    [questions, masteryMap, user.selectedCategories]
  );

  const attemptedSections = useMemo(
    () => sectionAnalytics.filter((s) => s.totalAttempts > 0),
    [sectionAnalytics]
  );

  const masteredCount = sectionAnalytics.filter(
    (s) => s.status === 'mastered'
  ).length;
  const learningCount = sectionAnalytics.filter(
    (s) => s.status === 'learning'
  ).length;
  const weakCount = sectionAnalytics.filter((s) => s.status === 'weak').length;

  const allRuleRecords = Object.values(masteryMap);
  const dueRules = allRuleRecords.filter(isRuleDueForReview);
  const scheduledRules = allRuleRecords.filter(
    (r) => r.totalAttempts > 0 && !isRuleDueForReview(r)
  );

  const wrongQuestionsList = useMemo(() => {
    const wrongSet = new Set(user.wrongQuestionIds);
    return questions.filter(
      (q) =>
        wrongSet.has(q.id) &&
        matchesCategories(q.categories, user.selectedCategories)
    );
  }, [questions, user.wrongQuestionIds, user.selectedCategories]);

  const filteredSections = useMemo(() => {
    if (statusFilter === 'all') return sectionAnalytics;
    if (statusFilter === 'attempted')
      return sectionAnalytics.filter((s) => s.totalAttempts > 0);
    return sectionAnalytics.filter((s) => s.status === statusFilter);
  }, [sectionAnalytics, statusFilter]);

  const chartData = useMemo(
    () =>
      attemptedSections.slice(0, 12).map((s) => ({
        name: `Розд. ${s.section}`,
        fullTitle: s.title,
        mastery: s.masteryScore <= 0 ? 1 : s.masteryScore,
        rawMastery: s.masteryScore,
        status: s.status,
      })),
    [attemptedSections]
  );

  const handleToggleExpandSection = (sec: string) => {
    setExpandedSection((prev) => (prev === sec ? null : sec));
  };

  const handleTrainSection = (secKey: string, title: string) => {
    const pool = questions.filter(
      (q) =>
        String(q.section) === secKey &&
        matchesCategories(q.categories, user.selectedCategories)
    );
    const sample = shuffleArray(pool).slice(0, 15);
    if (sample.length === 0) {
      toast.error('Не вдалося завантажити тест');
      return;
    }

    startTestSession({
      id: `sec_train_${Date.now()}`,
      mode: 'topic',
      title: `Тренування: Розділ ${secKey}. ${title}`,
      subtitle: `${sample.length} питань за обраним розділом ПДР`,
      targetCategory: user.selectedCategories[0] || 'B',
      questions: sample,
      isStrictExam: false,
    });
    navigate('/test');
  };

  const handleStartMistakesReview = () => {
    if (wrongQuestionsList.length === 0) {
      toast.error('Не вдалося завантажити тест');
      return;
    }
    startTestSession({
      id: `mistakes_bank_${Date.now()}`,
      mode: 'mistakes',
      title: 'Робота над помилками з банку',
      subtitle: `Відпрацювання ${wrongQuestionsList.slice(0, 20).length} проблемних питань`,
      targetCategory: user.selectedCategories[0] || 'B',
      questions: wrongQuestionsList.slice(0, 20),
      isStrictExam: false,
    });
    navigate('/test');
  };

  const handleStartDueReview = () => {
    if (dueRules.length === 0) {
      toast.error('Не вдалося завантажити тест');
      return;
    }
    const dueItemIds = new Set(dueRules.map((r) => r.itemId));
    const catQuestions = questions.filter((q) =>
      matchesCategories(q.categories, user.selectedCategories)
    );
    const matchingQuestions = catQuestions.filter(
      (q) =>
        dueItemIds.has(String(q.section)) ||
        q.rule_ids?.some((rid) => dueItemIds.has(rid))
    );

    const questionsToUse = shuffleArray(matchingQuestions).slice(0, 20);

    if (questionsToUse.length === 0) {
      toast.error('Не вдалося завантажити тест');
      return;
    }

    startTestSession({
      id: `due_review_${Date.now()}`,
      mode: 'mistakes',
      title: 'Інтервальне повторення (черга на сьогодні)',
      subtitle: `${questionsToUse.length} питань за правилами, що потребують закріплення`,
      targetCategory: user.selectedCategories[0] || 'B',
      questions: questionsToUse,
      isStrictExam: false,
    });
    navigate('/test');
  };

  const handleRemoveWrongQuestion = (qId: string) => {
    removeWrongQuestion(qId);
    toast.info('Питання прибрано з банку помилок');
  };

  return {
    user,
    rules,
    activeTab,
    statusFilter,
    expandedSection,
    sectionAnalytics,
    filteredSections,
    masteredCount,
    learningCount,
    weakCount,
    dueRules,
    scheduledRules,
    wrongQuestionsList,
    chartData,
    setActiveTab,
    setStatusFilter,
    handleToggleExpandSection,
    handleTrainSection,
    handleStartMistakesReview,
    handleStartDueReview,
    handleRemoveWrongQuestion,
  };
}
