import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Send,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

interface TargetDiscussionThreadProps {
  targetId: string;
  targetLabel?: string;
  compact?: boolean;
  defaultOpen?: boolean;
}

export default function TargetDiscussionThread({
  targetId,
  targetLabel,
  compact = false,
  defaultOpen = false,
}: TargetDiscussionThreadProps) {
  const {
    user,
    commentsTable,
    followedUserIds,
    addComment,
    voteComment,
    reportComment,
    openUserProfileModal,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [newCommentText, setNewCommentText] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const comments = commentsTable.filter(
    (c) => c.targetId === targetId && !c.isReported
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error('Введіть текст коментаря');
      return;
    }
    addComment(targetId, newCommentText.trim());
    setNewCommentText('');
    toast.success('Коментар опубліковано');
  };

  return (
    <div className={compact ? 'pt-2' : ''}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-xl font-semibold transition cursor-pointer ${
          compact
            ? `px-2.5 py-1 text-xs border ${
                isOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`
            : `px-3.5 py-2 text-xs sm:text-sm border ${
                isOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`
        }`}
      >
        <MessageSquare className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Коментарі ({comments.length})</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div
          className={`mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${
            compact ? 'p-4 space-y-3' : 'p-5 space-y-4 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {targetLabel
                  ? `Обговорення: ${targetLabel}`
                  : 'Обговорення та підказки спільноти'}{' '}
                ({comments.length})
              </span>
            </h4>
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Напишіть коментар або власний лайфхак..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Надіслати</span>
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 py-2 text-center">
              До цього елемента ще немає коментарів. Будьте першим!
            </p>
          ) : (
            <div className="space-y-2.5">
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
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openUserProfileModal(c.authorUid)}
                          className="inline-flex items-center gap-2 group cursor-pointer text-left"
                          title="Натисніть, щоб переглянути профіль користувача та підписатися"
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
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          >
                            ★ {b}
                          </span>
                        ))}
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === c.id ? null : c.id)
                          }
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === c.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-20">
                            <button
                              type="button"
                              onClick={() => {
                                openUserProfileModal(c.authorUid);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
                            >
                              Переглянути профіль автора
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                reportComment(targetId, c.id);
                                setOpenMenuId(null);
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
                        onClick={() => voteComment(targetId, c.id, 1)}
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
                        onClick={() => voteComment(targetId, c.id, -1)}
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
}
