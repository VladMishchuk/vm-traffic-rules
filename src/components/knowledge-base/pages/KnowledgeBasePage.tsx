import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import {
  loadRules,
  loadQuestions,
  matchesCategories,
} from '@/lib/dataService';
import { useAppStore } from '@/store/useAppStore';

import { KnowledgeTab, ArticleMeta } from '../types';
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

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { user, markArticleRead, startTestSession } = useAppStore();

  const [activeTab, setActiveTab] = useState<KnowledgeTab>('rules');
  const [selectedSectionNum, setSelectedSectionNum] = useState<number>(1);
  const [selectedSignCategory, setSelectedSignCategory] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');

  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: loadRules,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['official-questions'],
    queryFn: loadQuestions,
  });

  // Current article metadata for read-tracking
  const currentArticleMeta: ArticleMeta = useMemo(() => {
    if (!rules) return { id: 'sec_1', title: 'Розділ 1 ПДР', testSection: '1' };
    if (activeTab === 'rules') {
      const sec =
        rules.sections.find((s) => s.number === selectedSectionNum) ||
        rules.sections[0];
      return {
        id: sec.id,
        title: `Розділ ${sec.number}. ${sec.title}`,
        testSection: String(sec.number),
      };
    }
    if (activeTab === 'signs') {
      const signCat = rules.signs.find(
        (s) => s.category_id === selectedSignCategory
      );
      return {
        id: `signs_cat_${selectedSignCategory}`,
        title: `Дорожні знаки: ${signCat?.category_name || 'Група ' + selectedSignCategory}`,
        testSection: '33',
      };
    }
    if (activeTab === 'markings') {
      return {
        id: 'markings_all',
        title: 'Дорожня розмітка (Розділ 34 ПДР)',
        testSection: '34',
      };
    }
    if (activeTab === 'traffic_lights') {
      return {
        id: 'traffic_lights_all',
        title: 'Світлофори та сигнали регулювання (Розділ 8 ПДР)',
        testSection: '8.1',
      };
    }
    if (activeTab === 'id_signs') {
      return {
        id: 'id_signs_all',
        title: 'Розпізнавальні знаки ТЗ (Розділ 30 ПДР)',
        testSection: '30',
      };
    }
    if (activeTab === 'glossary') {
      return {
        id: 'glossary_all',
        title: 'Терміни та поняття ПДР (п. 1.10)',
        testSection: '1',
      };
    }
    return {
      id: 'driver_categories_all',
      title: 'Категорії транспортних засобів (п. 2.13)',
      testSection: '2',
    };
  }, [rules, activeTab, selectedSectionNum, selectedSignCategory]);

  const isCurrentArticleRead = user.readArticleIds.includes(
    currentArticleMeta.id
  );

  // IntersectionObserver to detect reading completion
  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el || loadingRules) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isCurrentArticleRead) {
          const res = markArticleRead(
            currentArticleMeta.id,
            currentArticleMeta.title
          );
          if (res.unlockedBadge) {
            toast.success(
              `Ви отримали нову нагороду «${res.unlockedBadge.title}» за вивчення теорії!`
            );
          } else if (res.newlyRead) {
            toast.success(
              `Розділ «${currentArticleMeta.title}» зараховано як прочитаний!`
            );
          }
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentArticleMeta, isCurrentArticleRead, loadingRules, markArticleRead]);

  // Launch retrieval practice test
  const handleStartPractice = () => {
    const targetSec = currentArticleMeta.testSection;
    const catQuestions = questions.filter((q) =>
      matchesCategories(q.categories, user.selectedCategories)
    );

    let pool = catQuestions.filter((q) => {
      const qSec = String(q.section);
      if (targetSec === '8') return qSec === '8.1' || qSec === '8.2';
      if (targetSec === '16') return qSec === '16.1' || qSec === '16.2';
      if (activeTab === 'signs' && selectedSignCategory === 2) {
        return qSec === '8.2' || qSec === '33';
      }
      return qSec === targetSec || qSec.startsWith(`${targetSec}.`);
    });

    if (pool.length === 0) {
      pool = catQuestions;
    }

    const sample = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
    startTestSession({
      id: `kb_practice_${Date.now()}`,
      mode: 'knowledge_check',
      title: `Закріплення знань: ${currentArticleMeta.title}`,
      subtitle: `${sample.length} питань за щойно прочитаним матеріалом`,
      targetCategory: user.selectedCategories[0] || 'B',
      questions: sample,
      isStrictExam: false,
    });
    navigate('/test');
  };

  const signCategories = useMemo(() => {
    if (!rules) return [];
    const map = new Map<number, { id: number; name: string; count: number }>();
    for (const s of rules.signs) {
      const existing = map.get(s.category_id);
      if (existing) existing.count += 1;
      else
        map.set(s.category_id, {
          id: s.category_id,
          name: s.category_name,
          count: 1,
        });
    }
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [rules]);

  const activeSectionObj = useMemo(() => {
    if (!rules) return null;
    return (
      rules.sections.find((s) => s.number === selectedSectionNum) ||
      rules.sections[0]
    );
  }, [rules, selectedSectionNum]);

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
