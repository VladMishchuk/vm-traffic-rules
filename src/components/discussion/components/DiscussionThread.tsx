import React from 'react';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useDiscussionThread } from '../hooks/useDiscussionThread';
import { CommentItem } from './CommentItem';

export interface DiscussionThreadProps {
  targetId: string;
  targetLabel?: string;
  compact?: boolean;
  defaultOpen?: boolean;
  variant?: 'collapsible' | 'card';
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  targetId,
  targetLabel,
  compact = false,
  defaultOpen = false,
  variant = 'collapsible',
}) => {
  const {
    user,
    comments,
    followedUserIds,
    isOpen,
    newCommentText,
    openMenuId,
    setNewCommentText,
    toggleOpen,
    toggleMenu,
    closeMenu,
    handleSend,
    voteComment,
    reportComment,
    openUserProfileModal,
  } = useDiscussionThread(targetId, defaultOpen);

  const renderCommentsList = () => {
    if (comments.length === 0) {
      return (
        <p className="text-xs sm:text-sm text-slate-400 py-2.5 text-center">
          До цього елемента ще немає коментарів. Залиште першу підказку для інших учнів!
        </p>
      );
    }

    return (
      <div className="space-y-2.5">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            targetId={targetId}
            currentUserId={user.uid}
            isFollowed={followedUserIds.includes(c.authorUid)}
            isMenuOpen={openMenuId === c.id}
            onToggleMenu={() => toggleMenu(c.id)}
            onCloseMenu={closeMenu}
            onOpenUserProfile={openUserProfileModal}
            onReportComment={reportComment}
            onVoteComment={voteComment}
          />
        ))}
      </div>
    );
  };

  if (variant === 'card') {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <button
          type="button"
          onClick={toggleOpen}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-base">
              {targetLabel || 'Обговорення питання'} ({comments.length})
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
            {renderCommentsList()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? 'pt-2' : ''}>
      <button
        type="button"
        onClick={toggleOpen}
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

          {renderCommentsList()}
        </div>
      )}
    </div>
  );
};

export default DiscussionThread;
