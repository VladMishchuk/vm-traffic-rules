import React from 'react';
import { Play, ChevronDown, ChevronUp, Trophy, BrainCircuit, ShieldAlert } from 'lucide-react';
import { SectionAnalyticsItem, MasteryStatus } from '../algorithms/leitnerEngine';
import { RulesDatabase } from '@/core/types';
import { formatRuleIdLabel } from '@/lib/dataService';

interface SectionsMatrixTabProps {
  sections: SectionAnalyticsItem[];
  expandedSection: string | null;
  rules?: RulesDatabase | null;
  onToggleExpand: (section: string) => void;
  onTrainSection: (section: string, title: string) => void;
}

export const SectionsMatrixTab: React.FC<SectionsMatrixTabProps> = ({
  sections,
  expandedSection,
  rules,
  onToggleExpand,
  onTrainSection,
}) => {
  const statusBadge = (status: MasteryStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Trophy className="w-3 h-3" />
            Засвоєно (Золото)
          </span>
        );
      case 'learning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <BrainCircuit className="w-3 h-3" />
            На закріпленні
          </span>
        );
      case 'weak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-3 h-3" />
            Проблемна тема
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
            Нова тема
          </span>
        );
    }
  };

  if (sections.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
        <p className="text-sm text-slate-500">
          За обраним фільтром ще немає тем. Спробуйте пройти тест або іспит для збору аналітики успішності.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {sections.map((sec) => {
        const isExpanded = expandedSection === sec.section;
        const barColor =
          sec.status === 'mastered'
            ? 'bg-emerald-500'
            : sec.status === 'learning'
            ? 'bg-amber-500'
            : sec.status === 'weak'
            ? 'bg-rose-500'
            : 'bg-slate-300 dark:bg-slate-700';

        return (
          <div
            key={sec.section}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    Розділ {sec.section}
                  </span>
                  {statusBadge(sec.status)}
                  <span className="text-xs text-slate-400">
                    Питань у базі: {sec.totalQuestionsInBank}
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base">
                  {sec.title}
                </h3>
              </div>

              {/* Last 5 Attempts Dots + Mastery Progress Bar */}
              <div className="flex flex-wrap items-center gap-5">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">
                    Останні 5 відповідей:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const attempt = sec.recentAttempts[slotIdx];
                      return (
                        <span
                          key={slotIdx}
                          title={
                            attempt === undefined
                              ? 'Ще немає спроби'
                              : attempt
                              ? 'Правильна відповідь'
                              : 'Помилка'
                          }
                          className={`w-3.5 h-3.5 rounded-full ${
                            attempt === undefined
                              ? 'bg-slate-200 dark:bg-slate-800'
                              : attempt
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="w-36 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Засвоєння:</span>
                    <span className="font-extrabold">{sec.masteryScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${barColor}`}
                      style={{
                        width: `${
                          sec.totalAttempts > 0 && sec.masteryScore <= 0
                            ? 1
                            : sec.masteryScore
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold">
                    {sec.correctAttempts}/{sec.totalAttempts} вир.
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Точність {sec.accuracyPercent}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onTrainSection(sec.section, sec.title)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Тренувати</span>
                  </button>

                  {sec.rules.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onToggleExpand(sec.section)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                      title="Детальніше по правилах"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Rule-level Spaced Practice Breakdown */}
            {isExpanded && sec.rules.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sec.rules.map((r) => (
                  <div
                    key={r.itemId}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {formatRuleIdLabel(r.itemId, rules)}
                      </span>
                      <span className="text-xs font-extrabold">
                        {Math.round(r.masteryScore * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Інтервал повторення: {r.intervalDays} дн.</span>
                      <span>
                        Спроб: {r.correctAttempts}/{r.totalAttempts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};
