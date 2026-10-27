import React from 'react';
import { Flame, CheckCircle2, ThumbsUp, Sparkles, UserPlus, UserCheck } from 'lucide-react';
import { CommunityUserProfile } from '@/core/types';
import { LeaderboardCriterion } from '../types';

interface LeaderboardRowProps {
  item: CommunityUserProfile;
  rank: number;
  isMe: boolean;
  isFollowed: boolean;
  criterion: LeaderboardCriterion;
  onOpenProfile: (uid: string) => void;
  onToggleFollow: (uid: string, name: string, isFollowed: boolean) => void;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  item,
  rank,
  isMe,
  isFollowed,
  criterion,
  onOpenProfile,
  onToggleFollow,
}) => {
  const rankBadgeColor =
    rank === 1
      ? 'bg-amber-400 text-slate-950 font-black'
      : rank === 2
      ? 'bg-slate-300 text-slate-900 font-bold'
      : rank === 3
      ? 'bg-amber-700 text-white font-bold'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold';

  return (
    <div
      className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition ${
        isMe
          ? 'bg-blue-50/70 dark:bg-blue-950/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Left: Rank + Avatar + Name + Categories */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${rankBadgeColor}`}
        >
          {rank}
        </div>

        <button
          type="button"
          onClick={() => onOpenProfile(item.uid)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:scale-105 transition"
        >
          {item.avatarInitials}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenProfile(item.uid)}
              className="font-bold text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition truncate cursor-pointer"
            >
              {item.displayName}
            </button>

            {item.unlockedBadges.includes('peoples_expert') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                Експерт ПДР
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span>Нагород: {item.unlockedBadges.length}</span>
            <span>•</span>
            <span>Точність: {item.accuracyPercent}%</span>
          </div>
        </div>
      </div>

      {/* Right: Primary Metric + Follow / Inspect Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          {criterion === 'streak' && (
            <div className="flex items-center gap-1.5 text-orange-500 font-extrabold text-base sm:text-lg">
              <Flame className="w-5 h-5 fill-orange-500" />
              <span>{item.streakDays} дн.</span>
            </div>
          )}
          {criterion === 'tests' && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold text-base sm:text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span>{item.totalTestsCompleted} тестів</span>
            </div>
          )}
          {criterion === 'likes' && (
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-extrabold text-base sm:text-lg">
              <ThumbsUp className="w-5 h-5" />
              <span>{item.totalLikesReceived} лайків</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400">
            {item.followersCount} підписників • {item.followingCount ?? 0} підписок
          </div>
        </div>

        {!isMe && (
          <button
            type="button"
            onClick={() => onToggleFollow(item.uid, item.displayName, isFollowed)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isFollowed
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-500'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isFollowed ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Відстежується</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Підписатися</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardRow;
