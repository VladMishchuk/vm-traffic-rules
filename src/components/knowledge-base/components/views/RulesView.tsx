import React from 'react';
import { RuleSection } from '@/core/types';
import TargetDiscussionThread from '@/components/discussion/TargetDiscussionThread';

interface RulesViewProps {
  section: RuleSection | null;
  searchQuery: string;
}

export const RulesView: React.FC<RulesViewProps> = ({
  section,
  searchQuery,
}) => {
  if (!section) return null;

  const qNorm = searchQuery.trim().toLowerCase();
  const items = section.items.filter(
    (it) =>
      !qNorm ||
      it.text.toLowerCase().includes(qNorm) ||
      it.number.includes(qNorm)
  );

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          id={item.id}
          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold">
              Пункт {item.number}
            </span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {item.text}
          </p>
          {item.sub_items && item.sub_items.length > 0 && (
            <ul className="space-y-2 pl-3 border-l-2 border-blue-500/40 pt-1">
              {item.sub_items.map((sub, i) => (
                <li
                  key={i}
                  className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">
                    {sub.letter})
                  </span>
                  {sub.text}
                </li>
              ))}
            </ul>
          )}
          <TargetDiscussionThread
            targetId={item.id}
            targetLabel={`Пункт ${item.number} ПДР`}
            compact
          />
        </div>
      ))}
    </div>
  );
};
