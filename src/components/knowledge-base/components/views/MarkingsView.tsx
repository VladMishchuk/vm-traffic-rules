import React from 'react';
import { RoadMarking } from '@/core/types';
import TargetDiscussionThread from '@/components/discussion/TargetDiscussionThread';

interface MarkingsViewProps {
  markings: RoadMarking[];
  searchQuery: string;
}

export const MarkingsView: React.FC<MarkingsViewProps> = ({
  markings,
  searchQuery,
}) => {
  const qNorm = searchQuery.trim().toLowerCase();

  const filteredMarkings = markings.filter(
    (m) =>
      !qNorm ||
      m.number.includes(qNorm) ||
      m.name.toLowerCase().includes(qNorm) ||
      m.description.toLowerCase().includes(qNorm)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredMarkings.map((mk) => (
        <div
          key={mk.id}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3"
        >
          {mk.image_path && (
            <div className="h-24 rounded-xl bg-white p-2 border border-slate-200 flex items-center justify-center">
              <img
                src={mk.image_path}
                alt={mk.name}
                className="max-h-full object-contain"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-bold">
              Розмітка {mk.number}
            </span>
            <span className="text-xs text-slate-400">
              {mk.category_name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {mk.description}
          </p>
          <TargetDiscussionThread
            targetId={mk.id}
            targetLabel={`Розмітка ${mk.number}`}
            compact
          />
        </div>
      ))}
    </div>
  );
};
