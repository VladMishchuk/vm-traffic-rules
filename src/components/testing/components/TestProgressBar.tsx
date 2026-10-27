import React from 'react';
import { X } from 'lucide-react';
import { TestTimer } from './TestTimer';
import { AnsweredEntry } from '../types';
import { OfficialQuestion } from '@/core/types';

interface TestProgressBarProps {
  title: string;
  subtitle?: string;
  currentIndex: number;
  questions: OfficialQuestion[];
  isStrictExam: boolean;
  remainingSeconds: number;
  formattedTime: string;
  answeredHistory: Record<number, AnsweredEntry>;
  onExitClick: () => void;
  onSelectIndex?: (index: number) => void;
}

export const TestProgressBar: React.FC<TestProgressBarProps> = ({
  title,
  subtitle,
  currentIndex,
  questions,
  isStrictExam,
  remainingSeconds,
  formattedTime,
  answeredHistory,
  onExitClick,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitClick}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
            title="Вийти з тесту"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-snug">{title}</h1>
            {subtitle && (
              <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            Питання {currentIndex + 1} / {questions.length}
          </span>

          {isStrictExam && (
            <TestTimer
              remainingSeconds={remainingSeconds}
              formattedTime={formattedTime}
            />
          )}
        </div>
      </div>

      {/* Linear Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / Math.max(1, questions.length)) * 100}%`,
            }}
          />
        </div>

        {/* Question Step Pills */}
        <div className="flex flex-wrap gap-1">
          {questions.map((q, idx) => {
            const entry = answeredHistory[idx];
            const isCurrent = idx === currentIndex;
            let pillClass =
              'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent';
            if (entry) {
              pillClass = entry.isCorrect
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-rose-500 text-white border-rose-500';
            } else if (isCurrent) {
              pillClass =
                'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/30';
            }
            return (
              <div
                key={q.id || idx}
                className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center border transition ${pillClass}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
