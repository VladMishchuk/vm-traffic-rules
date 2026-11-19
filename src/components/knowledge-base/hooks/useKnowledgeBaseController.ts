import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  loadRules,
  loadQuestions,
  matchesCategories,
} from '@/lib/dataService';
import { shuffleArray } from '@/core/utils/shuffle';
import { useAppStore } from '@/store/useAppStore';

import { KnowledgeTab } from '../types';
import {
  resolveArticleMeta,
  buildSignCategories,
} from '../utils/resolveArticleMeta';

export function useKnowledgeBaseController() {
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

  const currentArticleMeta = useMemo(
    () =>
      resolveArticleMeta(
        rules,
        activeTab,
        selectedSectionNum,
        selectedSignCategory
      ),
    [rules, activeTab, selectedSectionNum, selectedSignCategory]
  );

  const isCurrentArticleRead = user.readArticleIds.includes(
    currentArticleMeta.id
  );

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

  const handleStartPractice = () => {
    const targetSec = currentArticleMeta.testSection;
    const catQuestions = questions.filter((q) =>
      matchesCategories(q.categories, user.selectedCategories)
    );

    const pool = catQuestions.filter((q) => {
      const qSec = String(q.section);
      if (targetSec === '8') return qSec === '8.1' || qSec === '8.2';
      if (targetSec === '16') return qSec === '16.1' || qSec === '16.2';
      if (activeTab === 'signs' && selectedSignCategory === 2) {
        return qSec === '8.2' || qSec === '33';
      }
      return qSec === targetSec || qSec.startsWith(`${targetSec}.`);
    });

    const sample = shuffleArray(pool).slice(0, 8);
    if (sample.length === 0) {
      toast.error('Не вдалося завантажити тест');
      return;
    }

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

  const signCategories = useMemo(() => buildSignCategories(rules), [rules]);

  const activeSectionObj = useMemo(() => {
    if (!rules) return null;
    return (
      rules.sections.find((s) => s.number === selectedSectionNum) ||
      rules.sections[0]
    );
  }, [rules, selectedSectionNum]);

  return {
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
  };
}
