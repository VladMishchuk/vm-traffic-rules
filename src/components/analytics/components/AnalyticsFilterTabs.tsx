import React from 'react';
import { BookOpen, CalendarClock, ShieldAlert, Filter } from 'lucide-react';

export type AnalyticsTab = 'sections' | 'spaced_queue' | 'mistakes_bank';
export type StatusFilter = 'all' | 'attempted' | 'weak' | 'learning' | 'mastered';

interface AnalyticsFilterTabsProps {
  activeTab: AnalyticsTab;
  statusFilter: StatusFilter;
  sectionsCount: number;
  dueRulesCount: number;
  wrongQuestionsCount: number;
  onSelectTab: (tab: AnalyticsTab) => void;
  onSelectStatusFilter: (filter: StatusFilter) => void;
}

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Всі' },
  { id: 'attempted', label: 'З активністю' },
  { id: 'weak', label: 'Проблемні' },
  { id: 'learning', label: 'В процесі' },
  { id: 'mastered', label: 'Засвоєні' },
];

export const AnalyticsFilterTabs: React.FC<AnalyticsFilterTabsProps> = ({
  activeTab,
  statusFilter,
  sectionsCount,
  dueRulesCount,
  wrongQuestionsCount,
  onSelectTab,
  onSelectStatusFilter,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectTab('sections')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Матриця тем ПДР ({sectionsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('spaced_queue')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'spaced_queue'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Інтервальне повторення ({dueRulesCount} сьогодні)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('mistakes_bank')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'mistakes_bank'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Банк помилок ({wrongQuestionsCount})</span>
        </button>
      </div>

      {activeTab === 'sections' && (
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
