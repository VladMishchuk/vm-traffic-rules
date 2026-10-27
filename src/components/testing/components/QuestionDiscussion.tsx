import React, { useState } from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  UserCheck,
  UserPlus,
  Award,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { QuestionComment, UserProfile } from '@/core/types';
import { toast } from 'sonner';

interface QuestionDiscussionProps {
  questionId: string;
  comments: QuestionComment[];
  user: UserProfile;
  followedUserIds: string[];
  onAddComment: (questionId: string, text: string) => void;
  onVoteComment: (questionId: string, commentId: string, vote: 1 | -1) => void;
  onReportComment: (questionId: string, commentId: string) => void;
  onOpenUserProfile: (uid: string) => void;
}

export const QuestionDiscussion: React.FC<QuestionDiscussionProps> = ({
  questionId,
  comments,
  user,
  followedUserIds,
  onAddComment,
  onVoteComment,
  onReportComment,
  onOpenUserProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error('Введіть текст коментаря');
      return;
    }
    onAddComment(questionId, newCommentText.trim());
    setNewCommentText('');
    toast.success('Коментар опубліковано');
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-base">
            Обговорення питання ({comments.length})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Написати коментар або мнемонічне правило..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Відправити</span>
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-400 py-3 text-center">
              До цього питання ще немає коментарів. Залиште першу підказку для інших учнів!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => {
                const isFollowed = followedUserIds.includes(c.authorUid);
                const isMe = c.authorUid === user.uid;
                const initials = c.authorName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
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
                        {c.authorBadges.map((b) => (
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
                          onClick={() =>
                            setOpenCommentMenuId(
                              openCommentMenuId === c.id ? null : c.id
                            )
                          }
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openCommentMenuId === c.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 z-20">
                            <button
                              type="button"
                              onClick={() => {
                                onOpenUserProfile(c.authorUid);
                                setOpenCommentMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                            >
                              Переглянути профіль автора
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onReportComment(questionId, c.id);
                                setOpenCommentMenuId(null);
                                toast.info('Коментар приховано та передано на модерацію');
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
                            >
                              Поскаржитись
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {c.text}
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => onVoteComment(questionId, c.id, 1)}
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
                        onClick={() => onVoteComment(questionId, c.id, -1)}
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
