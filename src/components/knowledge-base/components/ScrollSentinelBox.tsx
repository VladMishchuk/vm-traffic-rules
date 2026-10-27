import React, { forwardRef } from 'react';
import { Award, Play } from 'lucide-react';

interface ScrollSentinelBoxProps {
  isCurrentArticleRead: boolean;
  onStartPractice: () => void;
}

export const ScrollSentinelBox = forwardRef<HTMLDivElement, ScrollSentinelBoxProps>(
  ({ isCurrentArticleRead, onStartPractice }, ref) => {
    return (
      <div
        ref={ref}
        className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {isCurrentArticleRead
                ? 'Розділ опрацьовано! Нагорода «Теоретик» активна'
                : 'Ви дочитали розділ до кінця!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Зафіксуйте знання коротким тестом із 8 офіційних питань за цією темою (Retrieval Practice).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartPractice}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Закріпити знання</span>
        </button>
      </div>
    );
  }
);

ScrollSentinelBox.displayName = 'ScrollSentinelBox';
