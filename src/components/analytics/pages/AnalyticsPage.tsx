import { BarChart3 } from 'lucide-react';
import { SummaryKPICards } from '../components/SummaryKPICards';
import { MasteryBarChart } from '../components/MasteryBarChart';
import { AnalyticsFilterTabs } from '../components/AnalyticsFilterTabs';
import { SectionsMatrixTab } from '../components/SectionsMatrixTab';
import { SpacedQueueTab } from '../components/SpacedQueueTab';
import { MistakesBankTab } from '../components/MistakesBankTab';
import { useAnalyticsController } from '../hooks/useAnalyticsController';

export default function AnalyticsPage() {
  const {
    user,
    rules,
    activeTab,
    statusFilter,
    expandedSection,
    sectionAnalytics,
    filteredSections,
    masteredCount,
    learningCount,
    weakCount,
    dueRules,
    scheduledRules,
    wrongQuestionsList,
    chartData,
    setActiveTab,
    setStatusFilter,
    handleToggleExpandSection,
    handleTrainSection,
    handleStartMistakesReview,
    handleStartDueReview,
    handleRemoveWrongQuestion,
  } = useAnalyticsController();

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
      <AnalyticsFilterTabs
        activeTab={activeTab}
        statusFilter={statusFilter}
        sectionsCount={sectionAnalytics.length}
        dueRulesCount={dueRules.length}
        wrongQuestionsCount={wrongQuestionsList.length}
        onSelectTab={setActiveTab}
        onSelectStatusFilter={setStatusFilter}
      />

      {/* TAB 1: Sections Matrix */}
      {activeTab === 'sections' && (
        <SectionsMatrixTab
          sections={filteredSections}
          expandedSection={expandedSection}
          rules={rules}
          onToggleExpand={handleToggleExpandSection}
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
          onRemoveWrongQuestion={handleRemoveWrongQuestion}
        />
      )}
    </div>
  );
}
