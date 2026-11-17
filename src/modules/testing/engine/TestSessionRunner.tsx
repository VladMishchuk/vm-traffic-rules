import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { loadRules, loadQuestions } from '@/lib/dataService';
import { TestProgressBar } from '@/components/testing/components/TestProgressBar';
import { QuestionCard } from '@/components/testing/components/QuestionCard';
import { TestCompleteView } from '@/components/testing/components/TestCompleteView';
import {
  ConfirmHintModal,
  ReportMistakeModal,
  ConfirmExitModal,
  ImageLightboxModal,
} from '@/components/testing/components/TestModals';
import { DiscussionThread } from '@/modules/community/components/DiscussionThread/DiscussionThread';
import { useTestSession } from './useTestSession';

/**
 * Чистий компонент-координатор проходження тесту (`TestSessionRunner`).
 * Використовує хук `useTestSession` та делегує відображення спеціалізованим UI-віджетам.
 */
export default function TestSessionRunner() {
  const navigate = useNavigate();

  const { data: rules } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: loadRules,
  });

  const { data: allQuestions = [] } = useQuery({
    queryKey: ['official-questions'],
    queryFn: loadQuestions,
  });

  const {
    activeTest,
    questions,
    currentQ,
    currentIndex,
    selectedOption,
    isStrictExam,
    isFinished,
    failReason,
    answeredHistory,
    answeredList,
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
  } = useTestSession(allQuestions);

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmHintOpen, setConfirmHintOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Неправильна відповідь');
  const [reportCommentText, setReportCommentText] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!activeTest || questions.length === 0 || !currentQ) {
    return null;
  }

  const handleSubmitQuestionReport = (e: React.FormEvent) => {
    e.preventDefault();
    reportQuestionError(currentQ.id, reportReason, reportCommentText.trim());
    setReportModalOpen(false);
    setReportCommentText('');
    toast.success('Звіт про помилку в завданні надіслано модераторам!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <TestProgressBar
        title={activeTest.title}
        subtitle={activeTest.subtitle}
        currentIndex={currentIndex}
        questions={questions}
        isStrictExam={isStrictExam}
        remainingSeconds={remainingSeconds}
        formattedTime={formatTime(remainingSeconds)}
        answeredHistory={answeredHistory}
        onExitClick={() =>
          isFinished ? navigate('/') : setConfirmExitOpen(true)
        }
      />

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
            <DiscussionThread targetId={currentQ.id} variant="card" />
          )}
        </div>
      )}

      <ConfirmHintModal
        isOpen={confirmHintOpen}
        onClose={() => setConfirmHintOpen(false)}
        onConfirm={() => {
          setConfirmHintOpen(false);
          handleConfirmHint();
        }}
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
