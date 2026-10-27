import React from 'react';
import { GlossaryItem } from '@/core/types';
import TargetDiscussionThread from '@/components/discussion/TargetDiscussionThread';

interface GlossaryViewProps {
  glossary: GlossaryItem[];
  searchQuery: string;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  glossary,
  searchQuery,
}) => {
  const qNorm = searchQuery.trim().toLowerCase();

  const filteredGlossary = glossary.filter(
    (g) =>
      !qNorm ||
      g.term.toLowerCase().includes(qNorm) ||
      g.definition.toLowerCase().includes(qNorm)
  );

  return (
    <div className="space-y-3">
      {filteredGlossary.map((g) => (
        <div
          key={g.id}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1"
        >
          <h4 className="font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400 capitalize">
            {g.term}
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {g.definition}
          </p>
          <TargetDiscussionThread
            targetId={g.id}
            targetLabel={`Термін «${g.term}»`}
            compact
          />
        </div>
      ))}
    </div>
  );
};
