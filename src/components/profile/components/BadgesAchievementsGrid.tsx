import React, { useState } from 'react';
import { Trophy, Award } from 'lucide-react';
import { BadgeDefinition } from '@/core/types';
import { ALL_BADGES } from '@/store/useAppStore';

interface BadgesAchievementsGridProps {
  unlockedBadgeIds: string[];
}

export const BadgesAchievementsGrid: React.FC<BadgesAchievementsGridProps> = ({
  unlockedBadgeIds,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Нагороди та Досягнення ({unlockedBadgeIds.length} / {ALL_BADGES.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Натисніть на будь-яку нагороду, щоб переглянути умову її отримання
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ALL_BADGES.map((badge) => {
          const unlocked = unlockedBadgeIds.includes(badge.id);
          const tierColor =
            badge.tier === 'gold'
              ? 'from-amber-400 to-yellow-600'
              : badge.tier === 'silver'
              ? 'from-slate-300 to-slate-500'
              : badge.tier === 'special'
              ? 'from-violet-500 to-indigo-600'
              : 'from-amber-700 to-orange-600';

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              title={badge.condition}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                unlocked
                  ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/30 opacity-55 grayscale hover:opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierColor} text-white flex items-center justify-center shadow-xs`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {unlocked ? 'Отримано' : 'Заблоковано'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm">{badge.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {badge.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedBadge && (
        <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Умова здобуття нагороди «{selectedBadge.title}»:
            </div>
            <p className="text-xs sm:text-sm font-medium">
              {selectedBadge.condition}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBadge(null)}
            className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
          >
            Закрити
          </button>
        </div>
      )}
    </section>
  );
};

export default BadgesAchievementsGrid;
