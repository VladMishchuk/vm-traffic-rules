import React from 'react';
import { Users, Flame, BookOpen, MessageSquare } from 'lucide-react';
import { UserProfile } from '@/core/types';

interface ProfileHeaderCardProps {
  user: UserProfile;
  followingCount: number;
  commentsCount: number;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  followingCount,
  commentsCount,
}) => {
  const initials = (user.displayName || 'УП')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-2xl font-extrabold flex items-center justify-center shadow-md shrink-0">
          {initials}
        </div>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold">{user.displayName}</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {user.email}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              {user.followersCount} підписників • {followingCount} підписок
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Стрік: {user.streakDays} дн.
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              Вивчено тем: {user.readArticleIds.length}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
              Моїх коментарів: {commentsCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeaderCard;
