import React from 'react';
import { Navigation, Info } from 'lucide-react';
import { SceneActor } from '@/core/types';
import { PlacedSign } from '../types';
import { APPROACH_LABELS, getActorColor } from '../utils/roadGeometry';

interface SceneLegendFooterProps {
  compact: boolean;
  actors: SceneActor[];
  placedSigns: PlacedSign[];
  selectedSign: PlacedSign | null;
  onSelectSign: (sign: PlacedSign | null) => void;
}

export const SceneLegendFooter: React.FC<SceneLegendFooterProps> = ({
  compact,
  actors,
  placedSigns,
  selectedSign,
  onSelectSign,
}) => {
  return (
    <>
      {/* Selected Sign Inspector Popup */}
      {selectedSign && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950/90 border-t border-blue-200 dark:border-blue-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={selectedSign.imagePath}
              alt={selectedSign.name}
              className="w-11 h-11 object-contain bg-white rounded-lg p-1 border border-slate-200 dark:border-transparent shrink-0"
            />
            <div>
              <div className="font-bold text-blue-700 dark:text-blue-300">
                Знак {selectedSign.number} «{selectedSign.name}» (
                {APPROACH_LABELS[selectedSign.approach]})
              </div>
              <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                {selectedSign.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectSign(null)}
            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            Закрити
          </button>
        </div>
      )}

      {/* Bottom Interactive Legend */}
      {!compact && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Учасники:
            </span>
            {actors.map((actor) => {
              const c = getActorColor(actor.type);
              return (
                <span
                  key={actor.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300 dark:border-transparent"
                    style={{ backgroundColor: c.fill }}
                  />
                  <span className="font-semibold">{actor.label}</span>
                  {actor.turnSignal !== 'none' && (
                    <span className="text-amber-600 dark:text-amber-400">
                      ({actor.turnSignal === 'left' ? 'лівий' : 'правий'} сигнал)
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {placedSigns.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Знаки (натисніть):
              </span>
              {placedSigns.map((s, idx) => (
                <button
                  key={`${s.number}_${idx}`}
                  type="button"
                  onClick={() => onSelectSign(s)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-500/15 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold transition cursor-pointer"
                >
                  <span>{s.number}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
