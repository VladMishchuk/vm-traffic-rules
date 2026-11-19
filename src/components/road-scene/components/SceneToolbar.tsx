import React from 'react';
import { Eye, EyeOff, Sun, Moon, Sparkles } from 'lucide-react';
import { RoadTemplateType } from '@/core/types';

interface SceneToolbarProps {
  template: RoadTemplateType;
  showTrajectories: boolean;
  isNight: boolean;
  onToggleTrajectories: () => void;
  onToggleNight: () => void;
}

const TEMPLATE_LABELS: Record<RoadTemplateType, string> = {
  cross_intersection: 'Перехрестя чотирьох доріг',
  t_intersection: 'Т-подібне перехрестя',
  roundabout: 'Перехрестя з круговим рухом',
  rail_crossing: 'Залізничний переїзд',
  pedestrian_crossing: 'Пішохідний перехід',
  straight: 'Пряма ділянка дороги',
};

export const SceneToolbar: React.FC<SceneToolbarProps> = ({
  template,
  showTrajectories,
  isNight,
  onToggleTrajectories,
  onToggleNight,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-xs">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300 font-bold border border-violet-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Динамічна 2D-сцена ПДР</span>
        </span>
        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
          • {TEMPLATE_LABELS[template] || 'Пряма ділянка дороги'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTrajectories}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
            showTrajectories
              ? 'bg-blue-600/15 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-500/40'
              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {showTrajectories ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          <span>Траєкторії</span>
        </button>

        <button
          type="button"
          onClick={onToggleNight}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
          title="Перемкнути режим освітлення (День / Ніч)"
        >
          {isNight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>Ніч</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>День</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
