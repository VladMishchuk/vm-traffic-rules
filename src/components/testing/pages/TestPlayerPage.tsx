import { TestProgressBar } from '../components/TestProgressBar';
import { QuestionCard } from '../components/QuestionCard';
import { TestCompleteView } from '../components/TestCompleteView';
import {
  ConfirmHintModal,
  ReportMistakeModal,
  ConfirmExitModal,
  ImageLightboxModal,
} from '../components/TestModals';
import { DiscussionThread } from '@/components/discussion/TargetDiscussionThread';
import { useTestSession } from '../hooks/useTestSession';

export default function TestPlayerPage() {
  const {
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
    answeredList,
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
  } = useTestSession();

  if (!activeTest || questions.length === 0 || !currentQ) {
    return null;
  }

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
        onExitClick={handleExitClick}
      />

      {isFinished ? (
        <TestCompleteView
          isStrictExam={isStrictExam}
          failReason={failReason}
          answeredList={answeredList}
          formattedTime={formatTime(elapsedSeconds)}
          rules={rules}
          expandedMistakeId={expandedMistakeId}
          onToggleMistake={handleToggleMistake}
          onGoHome={handleGoHome}
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
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onSelectOption={handleSelectOption}
            onZoomImage={setZoomedImage}
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenHintModal={() => setConfirmHintOpen(true)}
            onManualShowExplain={() => setManualShowExplain(true)}
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
        onConfirm={handleConfirmExit}
      />

      <ImageLightboxModal
        imageSrc={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
}
