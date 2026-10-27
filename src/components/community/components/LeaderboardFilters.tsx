import React from 'react';
import { Globe, Users, Flame, CheckCircle2, ThumbsUp, Trophy } from 'lucide-react';
import { LeaderboardCriterion, LeaderboardScope } from '../types';

interface LeaderboardFiltersProps {
  scope: LeaderboardScope;
  setScope: (scope: LeaderboardScope) => void;
  criterion: LeaderboardCriterion;
  setCriterion: (criterion: LeaderboardCriterion) => void;
  globalCount: number;
  followingCount: number;
}

export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  scope,
  setScope,
  criterion,
  setCriterion,
  globalCount,
  followingCount,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Scope Switcher: Global vs Following */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setScope('global')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              scope === 'global'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Глобальний рейтинг ({globalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setScope('following')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              scope === 'following'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Мої підписки ({followingCount})</span>
          </button>
        </div>

        {/* Ranking Criterion Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCriterion('streak')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              criterion === 'streak'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>За ударним режимом (дні)</span>
          </button>

          <button
            type="button"
            onClick={() => setCriterion('tests')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              criterion === 'tests'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>За складеними тестами</span>
          </button>

          <button
            type="button"
            onClick={() => setCriterion('likes')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              criterion === 'likes'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Народні експерти (лайки)</span>
          </button>
        </div>
      </div>

      {/* Unified All-Categories Rating Indicator */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
          <Trophy className="w-3.5 h-3.5" />
          Рейтинг формується по усіх категоріях ПДР України
        </span>
        <span>Оновлення в реальному часі</span>
      </div>
    </div>
  );
};

export default LeaderboardFilters;
