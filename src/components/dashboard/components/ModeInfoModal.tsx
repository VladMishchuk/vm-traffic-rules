import React from 'react';
import { Info, X, CheckCircle2 } from 'lucide-react';

export interface ModeInfoModalData {
  title: string;
  badge: string;
  description: string;
  details: string[];
}

interface ModeInfoModalProps {
  data: ModeInfoModalData | null;
  onClose: () => void;
}

export const ModeInfoModal: React.FC<ModeInfoModalProps> = ({
  data,
  onClose,
}) => {
  if (!data) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1.5">
              <Info className="w-3.5 h-3.5" />
              {data.badge}
            </span>
            <h3 className="font-extrabold text-lg">{data.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {data.description}
        </p>

        {data.details.length > 0 && (
          <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {data.details.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
