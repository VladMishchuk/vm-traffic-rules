import React from 'react';
import { Play } from 'lucide-react';

interface FloatingPracticeBarProps {
  title: string;
  onStartPractice: () => void;
}

export const FloatingPracticeBar: React.FC<FloatingPracticeBarProps> = ({
  title,
  onStartPractice,
}) => {
  return (
    <div className="sticky bottom-4 z-30 rounded-2xl border border-blue-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl px-5 py-3.5 flex items-center justify-between gap-4">
      <div className="truncate">
        <span className="text-xs text-slate-400 block">
          Швидка практика за темою:
        </span>
        <span className="text-xs sm:text-sm font-bold truncate block">
          {title}
        </span>
      </div>
      <button
        type="button"
        onClick={onStartPractice}
        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Закріпити знання</span>
      </button>
    </div>
  );
};
