import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  loadQuestions,
  loadRules,
  getAvailableSectionsForCategories,
  generateOfficialExamTicket,
  matchesCategories,
} from '@/lib/dataService';
import { buildAdaptiveSpacedSession } from '@/components/analytics';
import {
  generatePromptQuestionsWithAi,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
} from '@/lib/ai-generator';
import { useAppStore } from '@/store/useAppStore';
import { DriverCategoryCode } from '@/core/types';

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
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(
    () => getStoredGeminiApiKey()
  );
  const [showKeyConfig, setShowKeyConfig] = useState(false);
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
  const categoryQuestions = questions.filter((q) =>
    matchesCategories(q.categories, user.selectedCategories)
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

  const startDiagnosticTest = () => {
    const targetCat = user.selectedCategories[0] || 'B';
    const ticket = generateOfficialExamTicket(questions, targetCat);
    startTestSession({
      id: `diag_${Date.now()}`,
      mode: 'diagnostic',
      title: 'Діагностичний тест ПДР',
      subtitle:
        'Калібрування початкового профілю знань для розблокування адаптивного ШІ',
      targetCategory: targetCat,
      questions: ticket,
      isStrictExam: false,
    });
    navigate('/test');
  };

  const startOfficialExam = () => {
    const ticket = generateOfficialExamTicket(questions, activeExamCat);
    startTestSession({
      id: `exam_${Date.now()}`,
      mode: 'exam',
      title: `Іспит як у СЦ МВС`,
      subtitle: '20 питань • 20 хвилин • Максимум 2 помилки',
      targetCategory: activeExamCat,
      questions: ticket,
      isStrictExam: true,
      timeLimitSeconds: 1200,
    });
    navigate('/test');
  };

  const startTopicTest = () => {
    if (selectedTopics.length === 0) {
      toast.error('Оберіть хоча б одну тему ПДР');
      return;
    }
    const pool = categoryQuestions.filter((q) =>
      selectedTopics.includes(String(q.section))
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
    setTopicPickerOpen(false);
    startTestSession({
      id: `topic_${Date.now()}`,
      mode: 'topic',
      title: 'Тест за обраними темами',
      subtitle: `Обрано розділів: ${selectedTopics.length}`,
      targetCategory: activeExamCat,
      questions: shuffled,
      isStrictExam: false,
    });
    navigate('/test');
  };

  const startMistakesTest = () => {
    if (isColdStart) {
      toast.warning(
        "Щоб система могла підібрати питання персонально для вас, пройдіть один 'Іспит', 'Діагностичний тест' або 'Тест за темами' для збору початкової аналітики."
      );
      return;
    }
    const wrongPool = categoryQuestions.filter((q) =>
      user.wrongQuestionIds.includes(q.id)
    );
    if (wrongPool.length === 0) {
      toast.success(
        'У вас наразі немає невідпрацьованих помилок! Запускаємо контрольний підбір.'
      );
      startDiagnosticTest();
      return;
    }
    startTestSession({
      id: `mistakes_${Date.now()}`,
      mode: 'mistakes',
      title: 'Робота над помилками',
      subtitle: `Відпрацювання складних питань (${wrongPool.slice(0, 20).length} завдань)`,
      targetCategory: activeExamCat,
      questions: wrongPool.slice(0, 20),
      isStrictExam: false,
    });
    navigate('/test');
  };

  const startAiRecommendedTest = () => {
    if (isColdStart) {
      toast.warning(
        "Режим 'Рекомендований ШІ' заблоковано. Пройдіть 'Діагностичний тест' або 'Іспит' для збору початкової аналітики."
      );
      return;
    }
    const finalQuestions = buildAdaptiveSpacedSession(
      questions,
      masteryMap,
      user.wrongQuestionIds,
      user.selectedCategories,
      20
    );

    startTestSession({
      id: `ai_${Date.now()}`,
      mode: 'ai_adaptive',
      title: 'Рекомендований ШІ',
      subtitle: '70% слабкі теми + 30% інтервальне повторення',
      targetCategory: activeExamCat,
      questions: finalQuestions,
      isStrictExam: false,
    });
    navigate('/test');
  };

  const handleGeneratePromptTest = async () => {
    if (!promptText.trim()) {
      toast.error('Опишіть, які ситуації ви хочете потренувати');
      return;
    }
    setStoredGeminiApiKey(geminiApiKeyInput);
    setGeneratingPrompt(true);

    try {
      const { questions: generatedList, source } =
        await generatePromptQuestionsWithAi({
          prompt: promptText.trim(),
          selectedCategories: user.selectedCategories,
          allOfficialQuestions: questions,
          count: 10,
        });

      setGeneratingPrompt(false);
      setPromptModalOpen(false);
      toast.success(
        source === 'gemini_live'
          ? 'Згенеровано нові питання та 2D-сцени через Gemini AI!'
          : 'Згенеровано тест з інтерактивними 2D-сценами перехресть!'
      );
      startTestSession({
        id: `prompt_${Date.now()}`,
        mode: 'prompt',
        title: `ШІ Промпт-тест: «${promptText.slice(0, 42)}»`,
        subtitle: 'Інтерактивні 2D-сцени + цільові питання ПДР',
        targetCategory: activeExamCat,
        questions: generatedList,
        isStrictExam: false,
      });
      setPromptText('');
      navigate('/test');
    } catch {
      setGeneratingPrompt(false);
      toast.error('Не вдалося згенерувати тест. Спробуйте інший запит.');
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
        geminiApiKeyInput={geminiApiKeyInput}
        showKeyConfig={showKeyConfig}
        onClose={() => setPromptModalOpen(false)}
        onChangePrompt={setPromptText}
        onChangeKeyInput={setGeminiApiKeyInput}
        onToggleKeyConfig={() => setShowKeyConfig((v) => !v)}
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
