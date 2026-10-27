import React from 'react';
import { Trophy } from 'lucide-react';

interface CommunityHeaderBannerProps {
  myRank: number;
  followingCount: number;
}

export const CommunityHeaderBanner: React.FC<CommunityHeaderBannerProps> = ({
  myRank,
  followingCount,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Спільнота учнів ПДР України • Рейтинги та Підписки</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Таблиця лідерів та спільнота водіїв
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Змагайтеся в ударному режимі, підписуйтеся на друзів або інструкторів автошкіл та переглядайте відкриті досягнення по усіх категоріях.
        </p>
      </div>

      {/* My Quick Social Metrics */}
      <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[100px]">
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            #{myRank}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Ваше місце
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center min-w-[100px]">
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {followingCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Підписки
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHeaderBanner;
