import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnswerOptionsListProps {
  options: string[];
  selectedOption: number | null;
  correctIndex: number;
  disabled?: boolean;
  onSelectOption: (index: number) => void;
}

export const AnswerOptionsList: React.FC<AnswerOptionsListProps> = ({
  options,
  selectedOption,
  correctIndex,
  disabled = false,
  onSelectOption,
}) => {
  const showResult = selectedOption !== null;

  // Keyboard shortcut listener (keys 1 to 5)
  useEffect(() => {
    if (disabled || showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        e.preventDefault();
        onSelectOption(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, showResult, options.length, onSelectOption]);

  return (
    <div className="space-y-3">
      {options.map((opt, idx) => {
        const isSelected = selectedOption === idx;
        const isCorrect = idx === correctIndex;

        let btnClass =
          'border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40';

        if (showResult) {
          if (isCorrect) {
            btnClass =
              'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-semibold';
          } else if (isSelected) {
            btnClass =
              'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200';
          } else {
            btnClass = 'border-slate-200 dark:border-slate-800 opacity-60';
          }
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectOption(idx)}
            disabled={showResult || disabled}
            className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer ${btnClass}`}
          >
            <span className="w-7 h-7 rounded-xl border border-current flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span className="text-sm sm:text-base flex-1 leading-relaxed">
              {opt}
            </span>
            {showResult && isCorrect && (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {showResult && isSelected && !isCorrect && (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
