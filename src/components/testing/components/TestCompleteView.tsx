import React from 'react';
import {
  Trophy,
  AlertTriangle,
  Home,
  RotateCcw,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react';
import { AnsweredEntry, ExamFailReason } from '../types';
import { RulesDatabase } from '@/core/types';
import RoadSceneRenderer from '@/components/road-scene';
import { formatRuleIdLabel } from '@/lib/dataService';

interface TestCompleteViewProps {
  isStrictExam: boolean;
  failReason: ExamFailReason;
  answeredList: AnsweredEntry[];
  elapsedSeconds: number;
  formattedTime: string;
  rules?: RulesDatabase | null;
  expandedMistakeId: string | null;
  onToggleMistake: (questionId: string) => void;
  onGoHome: () => void;
  onRepeatTest: () => void;
  onReviewMistakes: () => void;
}

export const TestCompleteView: React.FC<TestCompleteViewProps> = ({
  isStrictExam,
  failReason,
  answeredList,
  formattedTime,
  rules,
  expandedMistakeId,
  onToggleMistake,
  onGoHome,
  onRepeatTest,
  onReviewMistakes,
}) => {
  const correctCount = answeredList.filter((a) => a.isCorrect).length;
  const wrongEntries = answeredList.filter(
    (a) => !a.isCorrect && Boolean(a.question)
  );
  const mistakesCount = wrongEntries.length;

  const isFailed = isStrictExam && (failReason !== null || mistakesCount > 2);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-8">
      <div className="text-center space-y-3">
        <div
          className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center ${
            isFailed
              ? 'bg-rose-500/10 text-rose-500'
              : 'bg-emerald-500/10 text-emerald-500'
          }`}
        >
          {isFailed ? (
            <AlertTriangle className="w-10 h-10" />
          ) : (
            <Trophy className="w-10 h-10" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold">
          {isStrictExam
            ? failReason === 'mistakes' || mistakesCount > 2
              ? 'Іспит не складено (допущено 3 помилки)'
              : failReason === 'timeout'
              ? 'Іспит не складено (час вичерпано)'
              : 'Іспит успішно складено!'
            : 'Тест завершено!'}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {isFailed
            ? 'За правилами Сервісного центру МВС допускається максимум 2 помилки. Розберіть проблемні питання та перемістіть їх у пріоритет адаптивного тесту.'
            : 'Результати проходження збережено в адаптивній аналітиці знань.'}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {correctCount}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Правильних відповідей
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {mistakesCount}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Допущено помилок</div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {Math.round(
              (correctCount / Math.max(1, answeredList.length)) * 100
            )}
            %
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Точність</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center">
          <div className="text-2xl font-extrabold">{formattedTime}</div>
          <div className="text-xs text-slate-500 mt-0.5">Витрачено часу</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>На головну</span>
        </button>

        <button
          type="button"
          onClick={onRepeatTest}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Повторити тест</span>
        </button>

        {wrongEntries.length > 0 && (
          <button
            type="button"
            onClick={onReviewMistakes}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Розібрати помилки ({wrongEntries.length})</span>
          </button>
        )}
      </div>

      {/* Expandable List of Mistakes */}
      {wrongEntries.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg">
            Детальний розбір допущених помилок ({wrongEntries.length})
          </h3>
          <div className="space-y-2.5">
            {wrongEntries.map((entry) => {
              const q = entry.question;
              const isOpen = expandedMistakeId === q.id;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/5 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => onToggleMistake(q.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <span className="font-semibold text-sm truncate">
                        {q.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-rose-500/20 space-y-3 text-xs sm:text-sm">
                      {q.sceneConfig && (
                        <RoadSceneRenderer
                          scene={q.sceneConfig}
                          rules={rules}
                          compact
                        />
                      )}
                      {q.image_path && (
                        <img
                          src={q.image_path}
                          alt={q.question}
                          className="max-h-52 rounded-xl border border-slate-200 dark:border-slate-800"
                        />
                      )}
                      <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
                        <span className="font-bold">Ваш вибір: </span>
                        {entry.usedHint
                          ? 'Використано підказку'
                          : q.options[entry.selectedOption]}
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <span className="font-bold">Правильна відповідь: </span>
                        {q.options[q.answer_index]}
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10 text-slate-700 dark:text-slate-200">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                          Пояснення (
                          {q.rule_ids
                            ?.map((r) => formatRuleIdLabel(r, rules))
                            .join(', ')}
                          ):
                        </span>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
