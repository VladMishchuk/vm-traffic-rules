import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { KnowledgeTab } from '../types';
import { RulesDatabase } from '@/core/types';

interface SignCategoryInfo {
  id: number;
  name: string;
  count: number;
}

interface KnowledgeSidebarProps {
  activeTab: KnowledgeTab;
  rules?: RulesDatabase | null;
  selectedSectionNum: number;
  selectedSignCategory: number;
  signCategories: SignCategoryInfo[];
  readArticleIds: string[];
  onSelectSectionNum: (num: number) => void;
  onSelectSignCategory: (catId: number) => void;
}

export const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = ({
  activeTab,
  rules,
  selectedSectionNum,
  selectedSignCategory,
  signCategories,
  readArticleIds,
  onSelectSectionNum,
  onSelectSignCategory,
}) => {
  if (activeTab !== 'rules' && activeTab !== 'signs') return null;

  return (
    <aside className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm max-h-[75vh] overflow-y-auto space-y-1.5 lg:sticky lg:top-20">
      {activeTab === 'rules' ? (
        <>
          <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Розділи Правил дорожнього руху
          </div>
          {rules?.sections.map((sec) => {
            const isSelected = sec.number === selectedSectionNum;
            const isRead = readArticleIds.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSectionNum(sec.number)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="line-clamp-1">
                  {sec.number}. {sec.title}
                </span>
                {isRead && (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-white' : 'text-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </>
      ) : (
        <>
          <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Групи дорожніх знаків
          </div>
          {signCategories.map((cat) => {
            const isSelected = cat.id === selectedSignCategory;
            const isRead = readArticleIds.includes(`signs_cat_${cat.id}`);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectSignCategory(cat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>
                  {cat.id}. {cat.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                  {isRead && (
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-emerald-500'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </>
      )}
    </aside>
  );
};
