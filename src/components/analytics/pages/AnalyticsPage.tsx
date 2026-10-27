import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, BookOpen, CalendarClock, ShieldAlert, Filter } from 'lucide-react';
import { toast } from 'sonner';

import {
  loadQuestions,
  loadRules,
  matchesCategories,
} from '@/lib/dataService';
import {
  buildSectionAnalytics,
  isRuleDueForReview,
} from '../algorithms/leitnerEngine';
import { useAppStore } from '@/store/useAppStore';

import { SummaryKPICards } from '../components/SummaryKPICards';
import { MasteryBarChart } from '../components/MasteryBarChart';
import { SectionsMatrixTab } from '../components/SectionsMatrixTab';
import { SpacedQueueTab } from '../components/SpacedQueueTab';
import { MistakesBankTab } from '../components/MistakesBankTab';

type AnalyticsTab = 'sections' | 'spaced_queue' | 'mistakes_bank';
type StatusFilter = 'all' | 'attempted' | 'weak' | 'learning' | 'mastered';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const {
    user,
    masteryMap,
    startTestSession,
    removeWrongQuestion,
  } = useAppStore();

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
      buildSectionAnalytics(
        questions,
        masteryMap,
        user.selectedCategories
      ),
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

  const handleTrainSection = (secKey: string, title: string) => {
    const pool = questions.filter(
      (q) =>
        String(q.section) === secKey &&
        matchesCategories(q.categories, user.selectedCategories)
    );
    const sample = [...pool].sort(() => Math.random() - 0.5).slice(0, 15);
    if (sample.length === 0) return;

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
      toast.info('Банк помилок порожній!');
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
      toast.info('Немає правил для термінового повторення сьогодні!');
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

    const questionsToUse =
      matchingQuestions.length > 0
        ? matchingQuestions.sort(() => Math.random() - 0.5).slice(0, 20)
        : wrongQuestionsList.slice(0, 20);

    if (questionsToUse.length === 0) {
      toast.info('Не знайдено питань для обраних категорій!');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header & Categories Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Формувальне оцінювання та інтервальне повторення</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Аналітика успішності по темах і правилах ПДР
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Оцінка засвоєння базується на останніх 5 відповідях по кожному правилу
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Категорії з налаштувань:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {user.selectedCategories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              >
                Категорія {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <SummaryKPICards
        masteredCount={masteredCount}
        learningCount={learningCount}
        weakCount={weakCount}
        dueRulesCount={dueRules.length}
        wrongQuestionsCount={wrongQuestionsList.length}
      />

      {/* Recharts Bar Chart */}
      <MasteryBarChart chartData={chartData} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Матриця тем ПДР ({sectionAnalytics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spaced_queue')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'spaced_queue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Інтервальне повторення ({dueRules.length} сьогодні)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mistakes_bank')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'mistakes_bank'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Банк помилок ({wrongQuestionsList.length})</span>
          </button>
        </div>

        {activeTab === 'sections' && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {[
              { id: 'all', label: 'Всі' },
              { id: 'attempted', label: 'З активністю' },
              { id: 'weak', label: 'Проблемні' },
              { id: 'learning', label: 'В процесі' },
              { id: 'mastered', label: 'Засвоєні' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as StatusFilter)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: Sections Matrix */}
      {activeTab === 'sections' && (
        <SectionsMatrixTab
          sections={filteredSections}
          expandedSection={expandedSection}
          rules={rules}
          onToggleExpand={(sec) =>
            setExpandedSection(expandedSection === sec ? null : sec)
          }
          onTrainSection={handleTrainSection}
        />
      )}

      {/* TAB 2: Spaced Practice Queue */}
      {activeTab === 'spaced_queue' && (
        <SpacedQueueTab
          dueRules={dueRules}
          scheduledRules={scheduledRules}
          rules={rules}
          onStartDueReview={handleStartDueReview}
        />
      )}

      {/* TAB 3: Mistakes Bank */}
      {activeTab === 'mistakes_bank' && (
        <MistakesBankTab
          wrongQuestionsList={wrongQuestionsList}
          rules={rules}
          onStartMistakesReview={handleStartMistakesReview}
          onRemoveWrongQuestion={(qId) => {
            removeWrongQuestion(qId);
            toast.info('Питання прибрано з банку помилок');
          }}
        />
      )}
    </div>
  );
}
