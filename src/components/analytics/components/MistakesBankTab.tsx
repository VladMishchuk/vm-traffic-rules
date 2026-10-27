import React from 'react';
import { Play, CheckCircle2, Trash2 } from 'lucide-react';
import { OfficialQuestion, RulesDatabase } from '@/core/types';
import { formatRuleIdLabel } from '@/lib/dataService';

interface MistakesBankTabProps {
  wrongQuestionsList: OfficialQuestion[];
  rules?: RulesDatabase | null;
  onStartMistakesReview: () => void;
  onRemoveWrongQuestion: (questionId: string) => void;
}

export const MistakesBankTab: React.FC<MistakesBankTabProps> = ({
  wrongQuestionsList,
  rules,
  onStartMistakesReview,
  onRemoveWrongQuestion,
}) => {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg">
            Банк помилок ({wrongQuestionsList.length})
          </h3>
          <p className="text-xs text-slate-500">
            Питання автоматично видаляються з банку після правильної відповіді без підказки
          </p>
        </div>
        {wrongQuestionsList.length > 0 && (
          <button
            type="button"
            onClick={onStartMistakesReview}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Відпрацювати всі помилки ({wrongQuestionsList.length})</span>
          </button>
        )}
      </div>

      {wrongQuestionsList.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="font-bold text-base">
            У вас немає невідпрацьованих помилок!
          </p>
          <p className="text-xs text-slate-400">
            Усі питання, де раніше були помилки, успішно закриті.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wrongQuestionsList.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-rose-500">
                    Розділ {q.section}: {q.section_title} •{' '}
                    {q.rule_ids
                      ?.map((r) => formatRuleIdLabel(r, rules))
                      .join(', ')}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base mt-0.5">
                    {q.question}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveWrongQuestion(q.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                  title="Прибрати з банку помилок"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                <span className="font-bold">Правильна відповідь: </span>
                {q.options[q.answer_index]}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {q.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
