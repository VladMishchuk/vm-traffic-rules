import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { OfficialQuestion } from '@/core/types';
import { AnsweredEntry, ExamFailReason } from '@/components/testing/types';
import { testModeRegistry } from '../modes/testModeRegistry';
import { useSessionTimer } from './useSessionTimer';

/**
 * Хук управління станом і життєвим циклом активної тестової сесії.
 * Ізолює всю бізнес-логіку проходження тесту від UI-компонента плеєра.
 */
export function useTestSession(allQuestions: OfficialQuestion[]) {
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
  const [inspectedRuleId, setInspectedRuleId] = useState<string | null>(null);

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
        const rIds =
          a.question.rule_ids && a.question.rule_ids.length > 0
            ? a.question.rule_ids
            : [`sec_${a.question.section}`];
        rIds.forEach((rId) => {
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
        durationSeconds: 0,
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

  const handleSelectOption = (idx: number) => {
    if (!currentQ || selectedOption !== null || isFinished) return;
    setSelectedOption(idx);

    const isCorrect = !usedHint && idx === currentQ.answer_index;
    const ruleList =
      currentQ.rule_ids && currentQ.rule_ids.length > 0
        ? currentQ.rule_ids
        : [`sec_${currentQ.section}`];

    ruleList.forEach((rId, rIdx) => {
      recordAttempt(
        rId,
        String(currentQ.section),
        isCorrect,
        rIdx === 0 ? currentQ.id : undefined
      );
    });

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
      toast.error(
        `Допущено ${nextMistakes}-тю помилку! Іспит перервано.`
      );
      setTimeout(() => {
        handleFinishExam('mistakes', nextHistory);
      }, 650);
    }
  };

  const handleConfirmHint = () => {
    if (!currentQ) return;
    setUsedHint(true);
    setSelectedOption(currentQ.answer_index);
    setManualShowExplain(true);

    const ruleList =
      currentQ.rule_ids && currentQ.rule_ids.length > 0
        ? currentQ.rule_ids
        : [`sec_${currentQ.section}`];

    ruleList.forEach((rId, rIdx) => {
      recordAttempt(
        rId,
        String(currentQ.section),
        false,
        rIdx === 0 ? currentQ.id : undefined
      );
    });

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
      setInspectedRuleId(null);
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
        questions: [...activeTest.questions].sort(() => Math.random() - 0.5),
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
    inspectedRuleId,
    shouldShowExplanation,
    elapsedSeconds,
    remainingSeconds,
    formatTime,
    setExpandedMistakeId,
    setInspectedRuleId,
    setManualShowExplain,
    handleSelectOption,
    handleConfirmHint,
    handleNextQuestion,
    handleRepeatTest,
    handleReviewMistakes,
    clearActiveTest,
    reportQuestionError,
  };
}
