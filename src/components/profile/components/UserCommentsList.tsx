import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ExternalLink, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionComment, OfficialQuestion, RulesDatabase } from '@/core/types';
import { formatRuleIdLabel } from '@/lib/dataService';
import { useAppStore } from '@/store/useAppStore';

interface UserCommentsListProps {
  comments: QuestionComment[];
  questions: OfficialQuestion[];
  rules: RulesDatabase | undefined;
  onDeleteComment: (commentId: string) => void;
}

export const UserCommentsList: React.FC<UserCommentsListProps> = ({
  comments,
  questions,
  rules,
  onDeleteComment,
}) => {
  const navigate = useNavigate();
  const { user, startTestSession } = useAppStore();
  const [commentFilter, setCommentFilter] = useState<'all' | 'question' | 'knowledge_item'>('all');

  const filteredComments = useMemo(() => {
    if (commentFilter === 'all') return comments;
    return comments.filter((c) => {
      const type =
        c.targetType ||
        (c.targetId.startsWith('q_') ? 'question' : 'knowledge_item');
      return type === commentFilter;
    });
  }, [comments, commentFilter]);

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Мої коментарі та пояснення ({comments.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Усі ваші коментарі, залишені під тестовими питаннями та пунктами Бази знань ПДР
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          {[
            { id: 'all', label: `Усі (${comments.length})` },
            {
              id: 'question',
              label: `До питань (${
                comments.filter(
                  (c) =>
                    (c.targetType ||
                      (c.targetId.startsWith('q_')
                        ? 'question'
                        : 'knowledge_item')) === 'question'
                ).length
              })`,
            },
            {
              id: 'knowledge_item',
              label: `До Бази знань (${
                comments.filter(
                  (c) =>
                    (c.targetType ||
                      (c.targetId.startsWith('q_')
                        ? 'question'
                        : 'knowledge_item')) === 'knowledge_item'
                ).length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setCommentFilter(tab.id as 'all' | 'question' | 'knowledge_item')
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                commentFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredComments.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            У цій категорії ще немає ваших коментарів
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Залишайте корисні пояснення або мнемонічні правила під час проходження тестів чи вивчення Бази знань — вони з’являться тут.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComments.map((c) => {
            const isQuestion =
              (c.targetType ||
                (c.targetId.startsWith('q_')
                  ? 'question'
                  : 'knowledge_item')) === 'question';
            const matchedQuestion = isQuestion
              ? questions.find((q) => q.id === c.targetId)
              : undefined;

            const targetTitle = isQuestion
              ? matchedQuestion
                ? `Питання №${matchedQuestion.number} (Розділ ${matchedQuestion.section}: ${matchedQuestion.section_title})`
                : `Тестове питання (${c.targetId})`
              : `База знань: ${formatRuleIdLabel(c.targetId, rules)}`;

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                        isQuestion
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isQuestion ? 'Питання тесту' : 'Пункт Бази знань'}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                      {targetTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isQuestion && matchedQuestion) {
                          startTestSession({
                            id: `comment_q_${Date.now()}`,
                            mode: 'topic',
                            title: `Перегляд питання до коментаря`,
                            subtitle: targetTitle,
                            targetCategory:
                              user.selectedCategories[0] || 'B',
                            questions: [matchedQuestion],
                            isStrictExam: false,
                          });
                          navigate('/test');
                        } else {
                          navigate('/knowledge');
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 transition cursor-pointer"
                    >
                      <span>Перейти</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onDeleteComment(c.id);
                        toast.info('Ваш коментар видалено');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 transition cursor-pointer"
                      title="Видалити коментар"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Видалити</span>
                    </button>
                  </div>
                </div>

                {matchedQuestion && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
                    «{matchedQuestion.question}»
                  </p>
                )}

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  {c.text}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.likes}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{c.dislikes}</span>
                    </span>
                  </div>
                  <span>
                    {new Date(c.createdAt).toLocaleDateString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default UserCommentsList;
