import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  loadQuestions,
  loadRules,
  getAvailableSectionsForCategories,
} from '@/lib/dataService';
import { testModeRegistry } from '@/modules/testing';
import { useAppStore } from '@/store/useAppStore';
import { DriverCategoryCode, TestMode } from '@/core/types';

import { ColdStartBanner } from '../components/ColdStartBanner';
import { DailyStreakWidget } from '../components/DailyStreakWidget';
import { ExamReadinessWidget } from '../components/ExamReadinessWidget';
import { StudyModeCards } from '../components/StudyModeCards';
import { RecentSessionsList } from '../components/RecentSessionsList';
import { TopicPickerModal } from '../components/TopicPickerModal';
import { PromptTestModal } from '../components/PromptTestModal';
import { ModeInfoModal, ModeInfoModalData } from '../components/ModeInfoModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    masteryMap,
    testHistory,
    startTestSession,
  } = useAppStore();

  const [examTargetCat, setExamTargetCat] = useState<DriverCategoryCode>(
    user.selectedCategories[0] || 'B'
  );
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    user.settings.defaultTopics
  );

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [modeInfoModal, setModeInfoModal] = useState<ModeInfoModalData | null>(null);

  const { data: questions = [], isLoading: loadingQ } = useQuery({
    queryKey: ['official-questions'],
    queryFn: loadQuestions,
  });

  const { data: rules } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: loadRules,
  });

  const availableSections = getAvailableSectionsForCategories(
    questions,
    user.selectedCategories
  );

  const activeExamCat = user.selectedCategories.includes(examTargetCat)
    ? examTargetCat
    : user.selectedCategories[0] || 'B';

  // Cold Start state
  const isColdStart =
    user.totalTestsCompleted === 0 && Object.keys(masteryMap).length === 0;

  // Accuracy metrics
  const masteryRecords = Object.values(masteryMap);
  const totalAttempts = masteryRecords.reduce((s, r) => s + r.totalAttempts, 0);
  const correctAttempts = masteryRecords.reduce(
    (s, r) => s + r.correctAttempts,
    0
  );
  const accuracyPercent =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const pieData =
    totalAttempts > 0
      ? [
          { name: 'Правильно', value: accuracyPercent, color: '#10b981' },
          {
            name: 'Помилки',
            value: Math.max(0, 100 - accuracyPercent),
            color: '#f43f5e',
          },
        ]
      : [{ name: 'Ще немає спроб', value: 100, color: '#64748b' }];

  const launchStrategySession = async (
    mode: TestMode,
    extra?: { selectedTopics?: string[]; promptText?: string }
  ) => {
    const targetCategory =
      mode === 'diagnostic'
        ? user.selectedCategories[0] || 'B'
        : activeExamCat;

    const sessionConfig = await testModeRegistry.buildSession(mode, {
      questions,
      targetCategory,
      selectedCategories: user.selectedCategories,
      masteryMap,
      wrongQuestionIds: user.wrongQuestionIds,
      selectedTopics: extra?.selectedTopics,
      promptText: extra?.promptText,
    });

    if (!sessionConfig.questions || sessionConfig.questions.length === 0) {
      toast.error('Не вдалося завантажити тест');
      return false;
    }

    startTestSession(sessionConfig);
    navigate('/test');
    return true;
  };

  const startDiagnosticTest = () => {
    void launchStrategySession('diagnostic');
  };

  const startOfficialExam = () => {
    void launchStrategySession('exam');
  };

  const startTopicTest = async () => {
    if (selectedTopics.length === 0) {
      toast.error('Оберіть хоча б одну тему ПДР');
      return;
    }
    const ok = await launchStrategySession('topic', { selectedTopics });
    if (ok) {
      setTopicPickerOpen(false);
    }
  };

  const startMistakesTest = () => {
    if (isColdStart) {
      toast.warning(
        "Щоб система могла підібрати питання персонально для вас, пройдіть один 'Іспит', 'Діагностичний тест' або 'Тест за темами' для збору початкової аналітики."
      );
      return;
    }
    void launchStrategySession('mistakes');
  };

  const startAiRecommendedTest = () => {
    if (isColdStart) {
      toast.warning(
        "Режим 'Адаптивний тест' заблоковано. Пройдіть 'Діагностичний тест' або 'Іспит' для збору початкової аналітики."
      );
      return;
    }
    void launchStrategySession('ai_adaptive');
  };

  const handleGeneratePromptTest = async () => {
    if (!promptText.trim()) {
      toast.error('Опишіть, які ситуації ви хочете потренувати');
      return;
    }
    setGeneratingPrompt(true);

    try {
      const ok = await launchStrategySession('prompt', {
        promptText: promptText.trim(),
      });
      setGeneratingPrompt(false);
      if (ok) {
        setPromptModalOpen(false);
        toast.success(
          'Згенеровано нові питання та 2D-сцени через Gemini AI!'
        );
        setPromptText('');
      }
    } catch {
      setGeneratingPrompt(false);
      toast.error('Не вдалося завантажити тест');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Cold Start Onboarding Banner */}
      {isColdStart && (
        <ColdStartBanner
          displayName={user.displayName}
          loadingQ={loadingQ}
          onStartDiagnostic={startDiagnosticTest}
        />
      )}

      {/* Block 1: Statistics & Progress Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DailyStreakWidget streakDays={user.streakDays} />
        <ExamReadinessWidget
          totalTestsCompleted={user.totalTestsCompleted}
          readArticleIdsCount={user.readArticleIds.length}
          unlockedBadgesCount={user.unlockedBadges.length}
          accuracyPercent={accuracyPercent}
          pieData={pieData}
        />
      </section>

      {/* Block 2: 5 Test Launch Modes */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Режими тестування</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Оберіть режим для перевірки знань, тренування за темами або адаптивного навчання з ШІ
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Категорії з налаштувань:
            </span>
            {user.selectedCategories.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              >
                Категорія {c}
              </span>
            ))}
            <Link
              to="/profile"
              className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline ml-1"
            >
              змінити
            </Link>
          </div>
        </div>

        <StudyModeCards
          userSelectedCategories={user.selectedCategories}
          activeExamCat={activeExamCat}
          availableSectionsCount={availableSections.length}
          isColdStart={isColdStart}
          mistakesCount={user.wrongQuestionIds.length}
          rules={rules}
          loadingQ={loadingQ}
          onSetExamTargetCat={setExamTargetCat}
          onStartOfficialExam={startOfficialExam}
          onOpenTopicPicker={() => setTopicPickerOpen(true)}
          onStartAiRecommended={startAiRecommendedTest}
          onStartMistakesTest={startMistakesTest}
          onOpenPromptModal={() => setPromptModalOpen(true)}
          onOpenModeInfo={setModeInfoModal}
        />
      </section>

      {/* Recent Test Sessions History */}
      <RecentSessionsList testHistory={testHistory} />

      {/* Topic Selector Modal */}
      <TopicPickerModal
        isOpen={topicPickerOpen}
        availableSections={availableSections.map((s) => ({
          section: s.section,
          title: s.title,
          questionCount: s.questionCount,
        }))}
        selectedTopics={selectedTopics}
        onClose={() => setTopicPickerOpen(false)}
        onToggleTopic={(sec) =>
          setSelectedTopics((prev) =>
            prev.includes(sec)
              ? prev.filter((s) => s !== sec)
              : [...prev, sec]
          )
        }
        onSelectAll={() =>
          setSelectedTopics(availableSections.map((s) => s.section))
        }
        onSelectBasic={() =>
          setSelectedTopics(['1', '8.1', '16.1', '16.2', '33'])
        }
        onStartTest={startTopicTest}
      />

      {/* Prompt Test Modal */}
      <PromptTestModal
        isOpen={promptModalOpen}
        promptText={promptText}
        generatingPrompt={generatingPrompt}
        onClose={() => setPromptModalOpen(false)}
        onChangePrompt={setPromptText}
        onSubmit={handleGeneratePromptTest}
      />

      {/* Test Mode Info Modal */}
      <ModeInfoModal
        data={modeInfoModal}
        onClose={() => setModeInfoModal(null)}
      />
    </div>
  );
}
