import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { OfficialQuestion } from '@/core/types';
import { shuffleArray } from '@/core/utils/shuffle';
import { loadRules, loadQuestions } from '@/lib/dataService';
import { AnsweredEntry, ExamFailReason } from '../types';
import { testModeRegistry } from '../modes/testModeRegistry';
import { useSessionTimer } from './useSessionTimer';

function getQuestionRuleIds(question: OfficialQuestion): string[] {
  return question.rule_ids && question.rule_ids.length > 0
    ? question.rule_ids
    : [`sec_${question.section}`];
}

/**
 * Хук управління станом і життєвим циклом активної тестової сесії.
 * Ізолює всю бізнес-логіку проходження тесту та модальних вікон від UI-розмітки плеєра.
 */
export function useTestSession() {
  const navigate = useNavigate();
  const {
    user,
    activeTest,
    startTestSession,
    clearActiveTest,
    recordAttempt,
    completeTestSession,
    reportQuestionError,
  } = useAppStore();

  const { data: rules } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: loadRules,
  });

  const { data: allQuestions = [] } = useQuery({
    queryKey: ['official-questions'],
    queryFn: loadQuestions,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [manualShowExplain, setManualShowExplain] = useState(false);
  const [answeredHistory, setAnsweredHistory] = useState<
    Record<number, AnsweredEntry>
  >({});

  const [isFinished, setIsFinished] = useState(false);
  const [failReason, setFailReason] = useState<ExamFailReason>(null);
  const [expandedMistakeId, setExpandedMistakeId] = useState<string | null>(
    null
  );

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmHintOpen, setConfirmHintOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Неправильна відповідь');
  const [reportCommentText, setReportCommentText] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const elapsedSecondsRef = useRef(0);

  const strategy = activeTest
    ? testModeRegistry.getStrategy(activeTest.mode)
    : null;
  const isStrictExam =
    activeTest?.isStrictExam ?? strategy?.rules.isStrictExam ?? false;
  const maxAllowedMistakes = strategy?.rules.maxAllowedMistakes ?? 2;

  const handleFinishExam = useCallback(
    (
      reason: ExamFailReason = null,
      overrideHistory?: Record<number, AnsweredEntry>
    ) => {
      if (!activeTest) return;

      const finalHistory = overrideHistory ?? answeredHistory;
      const entries = Object.values(finalHistory);
      const finalCorrect = entries.filter((a) => a.isCorrect).length;
      const finalWrongIds = entries
        .filter((a) => !a.isCorrect)
        .map((a) => a.question.id);

      const passed = activeTest.isStrictExam
        ? reason === null && finalWrongIds.length <= maxAllowedMistakes
        : finalCorrect >= Math.ceil(activeTest.questions.length * 0.8);

      setFailReason(reason);
      setIsFinished(true);
      if (finalWrongIds.length > 0) {
        setExpandedMistakeId(finalWrongIds[0]);
      }

      const ruleResults: {
        ruleId: string;
        section: string;
        isCorrect: boolean;
      }[] = [];

      entries.forEach((a) => {
        getQuestionRuleIds(a.question).forEach((rId) => {
          ruleResults.push({
            ruleId: String(rId),
            section: String(a.question.section),
            isCorrect: a.isCorrect,
          });
        });
      });

      completeTestSession({
        mode: activeTest.mode,
        title: activeTest.title,
        category: activeTest.targetCategory,
        score: finalCorrect,
        total: activeTest.questions.length,
        isPassed: passed,
        durationSeconds: elapsedSecondsRef.current,
        wrongQuestionIds: finalWrongIds,
        ruleResults,
      });
    },
    [activeTest, answeredHistory, completeTestSession, maxAllowedMistakes]
  );

  const { elapsedSeconds, remainingSeconds, resetTimer, formatTime } =
    useSessionTimer({
      isStrictExam,
      timeLimitSeconds:
        activeTest?.timeLimitSeconds ??
        strategy?.rules.timeLimitSeconds ??
        1200,
      isFinished,
      onTimeout: () => handleFinishExam('timeout'),
    });

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!activeTest) {
      navigate('/');
      return;
    }
    setCurrentIndex(0);
    setSelectedOption(null);
    setUsedHint(false);
    setManualShowExplain(false);
    setAnsweredHistory({});
    setIsFinished(false);
    setFailReason(null);
    setExpandedMistakeId(null);
    resetTimer(activeTest.timeLimitSeconds ?? 1200);
  }, [activeTest?.id, navigate, resetTimer]);

  const questions = activeTest?.questions ?? [];
  const safeIndex =
    currentIndex >= 0 && currentIndex < questions.length ? currentIndex : 0;
  const currentQ = questions[safeIndex] || questions[0];

  const recordQuestionAttempt = (
    question: OfficialQuestion,
    isCorrect: boolean
  ) => {
    getQuestionRuleIds(question).forEach((rId, rIdx) => {
      recordAttempt(
        rId,
        String(question.section),
        isCorrect,
        rIdx === 0 ? question.id : undefined
      );
    });
  };

  const handleSelectOption = (idx: number) => {
    if (!currentQ || selectedOption !== null || isFinished) return;
    setSelectedOption(idx);

    const isCorrect = !usedHint && idx === currentQ.answer_index;
    recordQuestionAttempt(currentQ, isCorrect);

    const nextHistory: Record<number, AnsweredEntry> = {
      ...answeredHistory,
      [currentIndex]: {
        question: currentQ,
        selectedOption: idx,
        isCorrect,
        usedHint,
      },
    };
    setAnsweredHistory(nextHistory);

    const nextMistakes = Object.values(nextHistory).filter(
      (a) => !a.isCorrect
    ).length;

    if (isStrictExam && nextMistakes > maxAllowedMistakes) {
      toast.error(`Допущено ${nextMistakes}-тю помилку! Іспит перервано.`);
      setTimeout(() => {
        handleFinishExam('mistakes', nextHistory);
      }, 650);
    }
  };

  const handleConfirmHint = () => {
    if (!currentQ) return;
    setConfirmHintOpen(false);
    setUsedHint(true);
    setSelectedOption(currentQ.answer_index);
    setManualShowExplain(true);

    recordQuestionAttempt(currentQ, false);

    const nextHistory: Record<number, AnsweredEntry> = {
      ...answeredHistory,
      [currentIndex]: {
        question: currentQ,
        selectedOption: currentQ.answer_index,
        isCorrect: false,
        usedHint: true,
      },
    };
    setAnsweredHistory(nextHistory);
    toast.warning('Відповідь зараховано як неправильну через підказку');
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setUsedHint(false);
      setManualShowExplain(false);
    } else {
      handleFinishExam(null);
    }
  };

  const handleRepeatTest = async () => {
    if (!activeTest) return;
    if (activeTest.mode === 'exam') {
      const examConfig = await testModeRegistry.buildSession('exam', {
        questions: allQuestions,
        targetCategory: activeTest.targetCategory,
        selectedCategories: user.selectedCategories,
      });
      startTestSession(examConfig);
    } else {
      startTestSession({
        ...activeTest,
        id: `test_${Date.now()}`,
        questions: shuffleArray(activeTest.questions),
      });
    }
  };

  const handleReviewMistakes = () => {
    if (!activeTest) return;
    const answeredList = Object.values(answeredHistory);
    const mistakeQuestions = answeredList
      .filter((a) => !a.isCorrect && Boolean(a.question))
      .map((e) => e.question)
      .filter((q): q is OfficialQuestion => Boolean(q && q.id));

    if (mistakeQuestions.length === 0) return;

    startTestSession({
      id: `mistakes_${Date.now()}`,
      mode: 'mistakes',
      title: 'Робота над помилками (поточний тест)',
      subtitle: `Розбір ${mistakeQuestions.length} допущених помилок`,
      targetCategory: activeTest.targetCategory,
      questions: mistakeQuestions,
      isStrictExam: false,
    });
  };

  const handleSubmitQuestionReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQ) return;
    reportQuestionError(currentQ.id, reportReason, reportCommentText.trim());
    setReportModalOpen(false);
    setReportCommentText('');
    toast.success('Звіт про помилку в завданні надіслано модераторам!');
  };

  const handleExitClick = () => {
    if (isFinished) {
      navigate('/');
    } else {
      setConfirmExitOpen(true);
    }
  };

  const handleConfirmExit = () => {
    setConfirmExitOpen(false);
    clearActiveTest();
    navigate('/');
  };

  const handleGoHome = () => {
    clearActiveTest();
    navigate('/');
  };

  const handleToggleMistake = (qId: string) => {
    setExpandedMistakeId((prev) => (prev === qId ? null : qId));
  };

  const shouldShowExplanation =
    Boolean(currentQ) &&
    !isStrictExam &&
    selectedOption !== null &&
    (selectedOption === currentQ?.answer_index ||
      user.settings.autoExplainOnError ||
      manualShowExplain ||
      usedHint);

  return {
    activeTest,
    rules,
    questions,
    currentQ,
    currentIndex,
    selectedOption,
    isStrictExam,
    isFinished,
    failReason,
    answeredHistory,
    answeredList: Object.values(answeredHistory),
    expandedMistakeId,
    shouldShowExplanation,
    elapsedSeconds,
    remainingSeconds,
    confirmExitOpen,
    confirmHintOpen,
    reportModalOpen,
    reportReason,
    reportCommentText,
    zoomedImage,
    formatTime,
    setConfirmExitOpen,
    setConfirmHintOpen,
    setReportModalOpen,
    setReportReason,
    setReportCommentText,
    setZoomedImage,
    setManualShowExplain,
    handleSelectOption,
    handleConfirmHint,
    handleNextQuestion,
    handleRepeatTest,
    handleReviewMistakes,
    handleSubmitQuestionReport,
    handleExitClick,
    handleConfirmExit,
    handleGoHome,
    handleToggleMistake,
  };
}
