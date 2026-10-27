import React from 'react';
import { Trophy, BrainCircuit, ShieldAlert, CalendarClock } from 'lucide-react';

interface SummaryKPICardsProps {
  masteredCount: number;
  learningCount: number;
  weakCount: number;
  dueRulesCount: number;
  wrongQuestionsCount: number;
}

export const SummaryKPICards: React.FC<SummaryKPICardsProps> = ({
  masteredCount,
  learningCount,
  weakCount,
  dueRulesCount,
  wrongQuestionsCount,
}) => {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Засвоєно тем (85%+)</span>
          <Trophy className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {masteredCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Збільшений інтервал повторення
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>На закріпленні (50–84%)</span>
          <BrainCircuit className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
          {learningCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Середній інтервал 1–3 дні
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Проблемні теми (&lt;50%)</span>
          <ShieldAlert className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
          {weakCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Пріоритет 70% у тестах ШІ
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>До повторення сьогодні</span>
          <CalendarClock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          {dueRulesCount} правил
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Помилок у банку: {wrongQuestionsCount}
        </div>
      </div>
    </section>
  );
};
