import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  loadQuestions,
  loadRules,
  getAvailableSectionsForCategories,
} from '@/lib/dataService';
import { testModeRegistry } from '@/components/testing';
import { useAppStore } from '@/store/useAppStore';
import { DriverCategoryCode, TestMode } from '@/core/types';
import { calculateMasteryAccuracy } from '@/core/utils/userUtils';
import { ModeInfoModalData } from '../components/ModeInfoModal';

export function useDashboardController() {
  const navigate = useNavigate();
  const { user, masteryMap, testHistory, startTestSession } = useAppStore();

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
  const [modeInfoModal, setModeInfoModal] = useState<ModeInfoModalData | null>(
    null
  );

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

  const isColdStart =
    user.totalTestsCompleted === 0 && Object.keys(masteryMap).length === 0;

  const { totalAttempts, accuracyPercent } =
    calculateMasteryAccuracy(masteryMap);

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
        toast.success('Згенеровано нові питання та 2D-сцени через Gemini AI!');
        setPromptText('');
      }
    } catch {
      setGeneratingPrompt(false);
      toast.error('Не вдалося завантажити тест');
    }
  };

  const handleToggleTopic = (sec: string) => {
    setSelectedTopics((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  const handleSelectAllTopics = () => {
    setSelectedTopics(availableSections.map((s) => s.section));
  };

  const handleSelectBasicTopics = () => {
    setSelectedTopics(['1', '8.1', '16.1', '16.2', '33']);
  };

  return {
    user,
    testHistory,
    rules,
    loadingQ,
    availableSections,
    activeExamCat,
    isColdStart,
    accuracyPercent,
    pieData,
    topicPickerOpen,
    selectedTopics,
    promptModalOpen,
    promptText,
    generatingPrompt,
    modeInfoModal,
    setExamTargetCat,
    setTopicPickerOpen,
    setPromptModalOpen,
    setPromptText,
    setModeInfoModal,
    startDiagnosticTest,
    startOfficialExam,
    startTopicTest,
    startMistakesTest,
    startAiRecommendedTest,
    handleGeneratePromptTest,
    handleToggleTopic,
    handleSelectAllTopics,
    handleSelectBasicTopics,
  };
}
