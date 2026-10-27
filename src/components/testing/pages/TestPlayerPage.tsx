import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAppStore } from '@/store/useAppStore';
import { loadRules, loadQuestions } from '@/lib/dataService';
import { generateOfficialExamTicket } from '../services/ticketGenerator';
import { OfficialQuestion } from '@/core/types';
import { AnsweredEntry, ExamFailReason } from '../types';
import { useTestTimer } from '../hooks/useTestTimer';

import { TestProgressBar } from '../components/TestProgressBar';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionDiscussion } from '../components/QuestionDiscussion';
import { TestCompleteView } from '../components/TestCompleteView';
import {
  ConfirmHintModal,
  ReportMistakeModal,
  ConfirmExitModal,
  ImageLightboxModal,
} from '../components/TestModals';

export default function TestPlayerPage() {
  const navigate = useNavigate();
  const {
    user,
    activeTest,
    startTestSession,
    clearActiveTest,
    recordAttempt,
    completeTestSession,
    commentsTable,
    followedUserIds,
    openUserProfileModal,
    addComment,
    voteComment,
    reportComment,
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
  const [answeredHistory, setAnsweredHistory] = useState<Record<number, AnsweredEntry>>({});

  // End-of-test state
  const [isFinished, setIsFinished] = useState(false);
  const [failReason, setFailReason] = useState<ExamFailReason>(null);
  const [expandedMistakeId, setExpandedMistakeId] = useState<string | null>(null);

  // Dialogs state
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmHintOpen, setConfirmHintOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Неправильна відповідь');
  const [reportCommentText, setReportCommentText] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [inspectedRuleId, setInspectedRuleId] = useState<string | null>(null);

  // Finish exam handler
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
        ? reason === null && finalWrongIds.length <= 2
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
    [activeTest, answeredHistory, completeTestSession]
  );

  // Timer hook
  const { elapsedSeconds, remainingSeconds, resetTimer, formatTime } =
    useTestTimer({
      isStrictExam: activeTest?.isStrictExam ?? false,
      timeLimitSeconds: activeTest?.timeLimitSeconds ?? 1200,
      isFinished,
      onTimeout: () => handleFinishExam('timeout'),
    });

  // Reset when activeTest changes
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

  if (!activeTest || !Array.isArray(activeTest.questions) || activeTest.questions.length === 0) {
    return null;
  }

  const questions = activeTest.questions;
  const safeIndex = currentIndex >= 0 && currentIndex < questions.length ? currentIndex : 0;
  const currentQ = questions[safeIndex] || questions[0];
  const isStrictExam = activeTest.isStrictExam;

  if (!currentQ) return null;

  const answeredList = Object.values(answeredHistory);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || isFinished) return;
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

    // 3rd mistake immediately fails the official exam
    if (isStrictExam && nextMistakes >= 3) {
      toast.error('Допущено 3-тю помилку! Іспит перервано.');
      setTimeout(() => {
        handleFinishExam('mistakes', nextHistory);
      }, 650);
    }
  };

  const handleConfirmHint = () => {
    setConfirmHintOpen(false);
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

  const handleSubmitQuestionReport = (e: React.FormEvent) => {
    e.preventDefault();
    reportQuestionError(currentQ.id, reportReason, reportCommentText.trim());
    setReportModalOpen(false);
    setReportCommentText('');
    toast.success('Звіт про помилку в завданні надіслано модераторам!');
  };

  const handleRepeatTest = () => {
    const newQuestions =
      activeTest.mode === 'exam'
        ? generateOfficialExamTicket(allQuestions, activeTest.targetCategory)
        : [...activeTest.questions].sort(() => Math.random() - 0.5);

    startTestSession({
      ...activeTest,
      id: `test_${Date.now()}`,
      questions: newQuestions,
    });
  };

  const handleReviewMistakes = () => {
    const wrongEntries = answeredList.filter(
      (a) => !a.isCorrect && Boolean(a.question)
    );
    const mistakeQuestions = wrongEntries
      .map((e) => e.question)
      .filter((q): q is OfficialQuestion => Boolean(q && q.id));

    if (mistakeQuestions.length === 0) return;

    setCurrentIndex(0);
    setSelectedOption(null);
    setUsedHint(false);
    setManualShowExplain(false);
    setAnsweredHistory({});
    setIsFinished(false);
    setFailReason(null);
    setExpandedMistakeId(null);

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
    (selectedOption === currentQ.answer_index ||
      user.settings.autoExplainOnError ||
      manualShowExplain ||
      usedHint);

  const currentComments = currentQ
    ? commentsTable.filter((c) => c.targetId === currentQ.id && !c.isReported)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Progress & Timer Bar */}
      <TestProgressBar
        title={activeTest.title}
        subtitle={activeTest.subtitle}
        currentIndex={currentIndex}
        questions={questions}
        isStrictExam={isStrictExam}
        remainingSeconds={remainingSeconds}
        formattedTime={formatTime(remainingSeconds)}
        answeredHistory={answeredHistory}
        onExitClick={() => (isFinished ? navigate('/') : setConfirmExitOpen(true))}
      />

      {/* Main Display: TestCompleteView OR Active Question */}
      {isFinished ? (
        <TestCompleteView
          isStrictExam={isStrictExam}
          failReason={failReason}
          answeredList={answeredList}
          elapsedSeconds={elapsedSeconds}
          formattedTime={formatTime(elapsedSeconds)}
          rules={rules}
          expandedMistakeId={expandedMistakeId}
          onToggleMistake={(qId) =>
            setExpandedMistakeId(expandedMistakeId === qId ? null : qId)
          }
          onGoHome={() => {
            clearActiveTest();
            navigate('/');
          }}
          onRepeatTest={handleRepeatTest}
          onReviewMistakes={handleReviewMistakes}
        />
      ) : (
        <div className="space-y-6">
          <QuestionCard
            question={currentQ}
            rules={rules}
            selectedOption={selectedOption}
            isStrictExam={isStrictExam}
            shouldShowExplanation={shouldShowExplanation}
            inspectedRuleId={inspectedRuleId}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onSelectOption={handleSelectOption}
            onZoomImage={(src) => setZoomedImage(src)}
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenHintModal={() => setConfirmHintOpen(true)}
            onManualShowExplain={() => setManualShowExplain(true)}
            onToggleInspectRule={(rId) =>
              setInspectedRuleId(inspectedRuleId === rId ? null : rId)
            }
            onCloseInspectRule={() => setInspectedRuleId(null)}
            onNextQuestion={handleNextQuestion}
          />

          {!isStrictExam && (
            <QuestionDiscussion
              questionId={currentQ.id}
              comments={currentComments}
              user={user}
              followedUserIds={followedUserIds}
              onAddComment={addComment}
              onVoteComment={voteComment}
              onReportComment={reportComment}
              onOpenUserProfile={openUserProfileModal}
            />
          )}
        </div>
      )}

      {/* Modals & Popups */}
      <ConfirmHintModal
        isOpen={confirmHintOpen}
        onClose={() => setConfirmHintOpen(false)}
        onConfirm={handleConfirmHint}
      />

      <ReportMistakeModal
        isOpen={reportModalOpen}
        reason={reportReason}
        comment={reportCommentText}
        onClose={() => setReportModalOpen(false)}
        onChangeReason={setReportReason}
        onChangeComment={setReportCommentText}
        onSubmit={handleSubmitQuestionReport}
      />

      <ConfirmExitModal
        isOpen={confirmExitOpen}
        onClose={() => setConfirmExitOpen(false)}
        onConfirm={() => {
          setConfirmExitOpen(false);
          clearActiveTest();
          navigate('/');
        }}
      />

      <ImageLightboxModal
        imageSrc={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
}
