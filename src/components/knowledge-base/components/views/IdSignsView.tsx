import React from 'react';
import { IdSignItem } from '@/core/types';
import TargetDiscussionThread from '@/components/discussion/TargetDiscussionThread';

interface IdSignsViewProps {
  idSigns: IdSignItem[];
}

export const IdSignsView: React.FC<IdSignsViewProps> = ({ idSigns }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {idSigns.map((ids) => (
        <div
          key={ids.id}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex gap-4 items-start"
        >
          {ids.image_path && (
            <div className="w-20 h-20 rounded-xl bg-white p-2 border border-slate-200 flex items-center justify-center shrink-0">
              <img
                src={ids.image_path}
                alt={ids.name}
                className="max-h-full object-contain"
              />
            </div>
          )}
          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Пункт {ids.rule_ref} ({ids.letter})
            </span>
            <h4 className="font-bold text-sm">{ids.name}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {ids.description}
            </p>
            <TargetDiscussionThread
              targetId={ids.id}
              targetLabel={`Розпізнавальний знак: ${ids.name}`}
              compact
            />
          </div>
        </div>
      ))}
    </div>
  );
};
