import React from 'react';
import { RoadSign } from '@/core/types';
import TargetDiscussionThread from '@/components/discussion/TargetDiscussionThread';

interface SignsViewProps {
  signs: RoadSign[];
  selectedCategory: number;
  searchQuery: string;
}

export const SignsView: React.FC<SignsViewProps> = ({
  signs,
  selectedCategory,
  searchQuery,
}) => {
  const qNorm = searchQuery.trim().toLowerCase();

  const filteredSigns = signs.filter((s) =>
    qNorm
      ? s.name.toLowerCase().includes(qNorm) ||
        s.number.includes(qNorm) ||
        s.description.toLowerCase().includes(qNorm)
      : s.category_id === selectedCategory
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {filteredSigns.map((sign) => (
        <div
          key={sign.id}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex gap-4 items-start"
        >
          {sign.image_path && (
            <div className="w-20 h-20 rounded-xl bg-white p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <img
                src={sign.image_path}
                alt={sign.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-xs font-bold">
                {sign.number}
              </span>
              <h4 className="font-bold text-sm truncate">{sign.name}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {sign.description}
            </p>
            <TargetDiscussionThread
              targetId={sign.id}
              targetLabel={`Знак ${sign.number} «${sign.name}»`}
              compact
            />
          </div>
        </div>
      ))}
    </div>
  );
};
