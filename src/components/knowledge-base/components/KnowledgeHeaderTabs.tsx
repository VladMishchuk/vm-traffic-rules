import React from 'react';
import {
  BookOpen,
  Search,
  FileText,
  ShieldAlert,
  Layers,
  TrafficCone,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { KnowledgeTab } from '../types';
import { RulesDatabase } from '@/core/types';

interface KnowledgeHeaderTabsProps {
  activeTab: KnowledgeTab;
  readCount: number;
  searchQuery: string;
  rules?: RulesDatabase | null;
  onSelectTab: (tab: KnowledgeTab) => void;
  onChangeSearch: (query: string) => void;
}

export const KnowledgeHeaderTabs: React.FC<KnowledgeHeaderTabsProps> = ({
  activeTab,
  readCount,
  searchQuery,
  rules,
  onSelectTab,
  onChangeSearch,
}) => {
  const tabsConfig = [
    { id: 'rules' as KnowledgeTab, label: 'Правила ПДР (34 розділи)', icon: FileText },
    {
      id: 'signs' as KnowledgeTab,
      label: `Дорожні знаки (${rules?.signs.length ?? 369})`,
      icon: ShieldAlert,
    },
    {
      id: 'markings' as KnowledgeTab,
      label: `Дорожня розмітка (${rules?.markings.length ?? 66})`,
      icon: Layers,
    },
    {
      id: 'traffic_lights' as KnowledgeTab,
      label: `Світлофори (${rules?.traffic_lights.length ?? 11})`,
      icon: TrafficCone,
    },
    {
      id: 'id_signs' as KnowledgeTab,
      label: `Розпізнавальні знаки (${rules?.id_signs.length ?? 18})`,
      icon: Sparkles,
    },
    {
      id: 'glossary' as KnowledgeTab,
      label: `Терміни (${rules?.glossary.length ?? 93})`,
      icon: HelpCircle,
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            База знань ПДР України
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Офіційна редакція Верховної Ради України (Постанова КМУ № 1306) • Прочитано розділів: {readCount}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Пошук правила, знака або терміна..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Directory Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
