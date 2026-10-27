import React from 'react';
import { RuleMasteryRecord, RulesDatabase } from '@/core/types';
import { formatRuleIdLabel } from '@/lib/dataService';

interface SpacedQueueTabProps {
  dueRules: RuleMasteryRecord[];
  scheduledRules: RuleMasteryRecord[];
  rules?: RulesDatabase | null;
  onStartDueReview: () => void;
}

export const SpacedQueueTab: React.FC<SpacedQueueTabProps> = ({
  dueRules,
  scheduledRules,
  rules,
  onStartDueReview,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Due Today */}
      <div className="rounded-3xl border border-rose-500/30 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-rose-600 dark:text-rose-400">
              Потребують повторення сьогодні ({dueRules.length})
            </h3>
            <p className="text-xs text-slate-500">
              Правила з інтервалом I = 0 (після помилки) або де настав час перевірки
            </p>
          </div>
          <button
            type="button"
            onClick={onStartDueReview}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
          >
            Повторити зараз
          </button>
        </div>

        {dueRules.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Немає правил у терміновій черзі повторення.
          </p>
        ) : (
          <div className="space-y-2.5">
            {dueRules.map((r) => (
              <div
                key={r.itemId}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-sm block">
                    {formatRuleIdLabel(r.itemId, rules)} (Розділ {r.section})
                  </span>
                  <span className="text-xs text-slate-500">
                    Рівень засвоєння: {Math.round(r.masteryScore * 100)}% • Спроб: {r.totalAttempts}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  Сьогодні
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Future */}
      <div className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
            У довгостроковій пам’яті ({scheduledRules.length})
          </h3>
          <p className="text-xs text-slate-500">
            Правила з високим коефіцієнтом засвоєння та збільшеним інтервалом повторення
          </p>
        </div>

        {scheduledRules.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Ще немає правил у довгостроковому розкладі.
          </p>
        ) : (
          <div className="space-y-2.5">
            {scheduledRules.map((r) => (
              <div
                key={r.itemId}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-sm block">
                    {formatRuleIdLabel(r.itemId, rules)} (Розділ {r.section})
                  </span>
                  <span className="text-xs text-slate-500">
                    Засвоєння: {Math.round(r.masteryScore * 100)}%
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  Через {r.intervalDays} дн.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
