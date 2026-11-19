import { Link } from 'react-router-dom';
import { ColdStartBanner } from '../components/ColdStartBanner';
import { DailyStreakWidget } from '../components/DailyStreakWidget';
import { ExamReadinessWidget } from '../components/ExamReadinessWidget';
import { StudyModeCards } from '../components/StudyModeCards';
import { RecentSessionsList } from '../components/RecentSessionsList';
import { TopicPickerModal } from '../components/TopicPickerModal';
import { PromptTestModal } from '../components/PromptTestModal';
import { ModeInfoModal } from '../components/ModeInfoModal';
import { useDashboardController } from '../hooks/useDashboardController';

export default function DashboardPage() {
  const {
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
  } = useDashboardController();

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

      {/* Block 2: Test Launch Modes */}
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
        onToggleTopic={handleToggleTopic}
        onSelectAll={handleSelectAllTopics}
        onSelectBasic={handleSelectBasicTopics}
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
