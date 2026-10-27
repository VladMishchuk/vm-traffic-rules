import React from 'react';
import { Clock } from 'lucide-react';
import { TestSessionRecord } from '@/core/types';

interface RecentSessionsListProps {
  testHistory: TestSessionRecord[];
}

export const RecentSessionsList: React.FC<RecentSessionsListProps> = ({
  testHistory,
}) => {
  if (!testHistory || testHistory.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Останні пройдені тестування
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {testHistory.slice(0, 6).map((h) => (
          <div
            key={h.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    h.isPassed ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {h.isPassed ? 'Складено' : 'Не складено'}
                </span>
              </div>
              <p className="font-semibold text-sm truncate mt-1">{h.title}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold">
                {h.score}/{h.totalQuestions}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
