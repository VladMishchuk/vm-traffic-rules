import React from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  UserCheck,
  UserPlus,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { QuestionComment } from '@/core/types';
import { getAvatarInitials } from '@/core/utils/userUtils';

interface CommentItemProps {
  comment: QuestionComment;
  targetId: string;
  currentUserId: string;
  isFollowed: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onOpenUserProfile: (uid: string) => void;
  onReportComment: (targetId: string, commentId: string) => void;
  onVoteComment: (targetId: string, commentId: string, vote: 1 | -1) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment: c,
  targetId,
  currentUserId,
  isFollowed,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onOpenUserProfile,
  onReportComment,
  onVoteComment,
}) => {
  const isMe = c.authorUid === currentUserId;
  const initials = getAvatarInitials(c.authorName, 'УП');

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenUserProfile(c.authorUid)}
            className="inline-flex items-center gap-2 group cursor-pointer text-left"
            title="Натисніть, щоб переглянути профіль користувача"
          >
            <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {initials}
            </span>
            <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 group-hover:underline">
              {c.authorName}
            </span>
            {!isMe && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isFollowed
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {isFollowed ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Відстежується</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Профіль</span>
                  </>
                )}
              </span>
            )}
          </button>

          {c.authorBadges?.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            >
              <Award className="w-3 h-3" />
              {b}
            </span>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-20">
              <button
                type="button"
                onClick={() => {
                  onOpenUserProfile(c.authorUid);
                  onCloseMenu();
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
              >
                Переглянути профіль автора
              </button>
              <button
                type="button"
                onClick={() => {
                  onReportComment(targetId, c.id);
                  onCloseMenu();
                  toast.info(
                    'Коментар приховано та передано модераторам'
                  );
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium cursor-pointer"
              >
                Поскаржитися на спам/образу
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
        {c.text}
      </p>

      <div className="flex items-center gap-3 pt-0.5">
        <button
          type="button"
          onClick={() => onVoteComment(targetId, c.id, 1)}
          className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${
            c.userVote === 1
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{c.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => onVoteComment(targetId, c.id, -1)}
          className={`inline-flex items-center gap-1 text-xs font-semibold cursor-pointer ${
            c.userVote === -1
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>{c.dislikes}</span>
        </button>
      </div>
    </div>
  );
};
