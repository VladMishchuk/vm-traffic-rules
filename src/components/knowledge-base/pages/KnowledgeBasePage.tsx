import { CheckCircle2, ExternalLink } from 'lucide-react';
import { KnowledgeHeaderTabs } from '../components/KnowledgeHeaderTabs';
import { KnowledgeSidebar } from '../components/KnowledgeSidebar';
import { RulesView } from '../components/views/RulesView';
import { SignsView } from '../components/views/SignsView';
import { MarkingsView } from '../components/views/MarkingsView';
import { TrafficLightsView } from '../components/views/TrafficLightsView';
import { IdSignsView } from '../components/views/IdSignsView';
import { GlossaryView } from '../components/views/GlossaryView';
import { ScrollSentinelBox } from '../components/ScrollSentinelBox';
import { FloatingPracticeBar } from '../components/FloatingPracticeBar';
import { useKnowledgeBaseController } from '../hooks/useKnowledgeBaseController';

export default function KnowledgeBasePage() {
  const {
    user,
    rules,
    activeTab,
    selectedSectionNum,
    selectedSignCategory,
    searchQuery,
    bottomSentinelRef,
    currentArticleMeta,
    isCurrentArticleRead,
    signCategories,
    activeSectionObj,
    setActiveTab,
    setSelectedSectionNum,
    setSelectedSignCategory,
    setSearchQuery,
    handleStartPractice,
  } = useKnowledgeBaseController();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Tabs & Search */}
      <KnowledgeHeaderTabs
        activeTab={activeTab}
        readCount={user.readArticleIds.length}
        searchQuery={searchQuery}
        rules={rules}
        onSelectTab={setActiveTab}
        onChangeSearch={setSearchQuery}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Tree Sidebar */}
        <KnowledgeSidebar
          activeTab={activeTab}
          rules={rules}
          selectedSectionNum={selectedSectionNum}
          selectedSignCategory={selectedSignCategory}
          signCategories={signCategories}
          readArticleIds={user.readArticleIds}
          onSelectSectionNum={setSelectedSectionNum}
          onSelectSignCategory={setSelectedSignCategory}
        />

        {/* Right Article Body */}
        <div
          className={`${
            activeTab === 'rules' || activeTab === 'signs'
              ? 'lg:col-span-8'
              : 'lg:col-span-12'
          } space-y-6`}
        >
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Article Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Офіційний довідник ПДР
                  </span>
                  {isCurrentArticleRead && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Вивчено
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                  {currentArticleMeta.title}
                </h2>
              </div>

              {activeTab === 'rules' && activeSectionObj && (
                <a
                  href={activeSectionObj.law_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span>zakon.rada.gov.ua</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* View Switching */}
            {activeTab === 'rules' && (
              <RulesView
                section={activeSectionObj}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'signs' && rules && (
              <SignsView
                signs={rules.signs}
                selectedCategory={selectedSignCategory}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'markings' && rules && (
              <MarkingsView
                markings={rules.markings}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'traffic_lights' && rules && (
              <TrafficLightsView trafficLights={rules.traffic_lights} />
            )}

            {activeTab === 'id_signs' && rules && (
              <IdSignsView idSigns={rules.id_signs} />
            )}

            {activeTab === 'glossary' && rules && (
              <GlossaryView
                glossary={rules.glossary}
                searchQuery={searchQuery}
              />
            )}

            {/* Scroll Sentinel & Reward Callout */}
            <ScrollSentinelBox
              ref={bottomSentinelRef}
              isCurrentArticleRead={isCurrentArticleRead}
              onStartPractice={handleStartPractice}
            />
          </div>

          {/* Sticky Floating CTA Bar at Bottom */}
          <FloatingPracticeBar
            title={currentArticleMeta.title}
            onStartPractice={handleStartPractice}
          />
        </div>
      </div>
    </div>
  );
}
