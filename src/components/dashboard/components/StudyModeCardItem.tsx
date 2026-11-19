import React from 'react';
import { Info } from 'lucide-react';

interface StudyModeCardItemProps {
  cardClassName: string;
  iconBoxClassName: string;
  icon: React.ReactNode;
  badge: React.ReactNode;
  infoButtonClassName: string;
  onOpenInfo: () => void;
  title: string;
  children?: React.ReactNode;
  actionButton: React.ReactNode;
}

export const StudyModeCardItem: React.FC<StudyModeCardItemProps> = ({
  cardClassName,
  iconBoxClassName,
  icon,
  badge,
  infoButtonClassName,
  onOpenInfo,
  title,
  children,
  actionButton,
}) => {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition ${cardClassName}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBoxClassName}`}
          >
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {badge}
            <button
              type="button"
              onClick={onOpenInfo}
              className={`w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center transition cursor-pointer ${infoButtonClassName}`}
              title="Детальний опис режиму"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold pt-1">{title}</h3>
        {children}
      </div>

      {actionButton}
    </div>
  );
};
