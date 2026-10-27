import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Navigation,
  Info,
} from 'lucide-react';
import { ApproachDirection } from '@/core/types';
import { RoadSceneRendererProps, PlacedSign } from '../types';
import { APPROACH_LABELS, getActorColor } from '../utils/roadGeometry';
import { resolveSignImagePath } from '../utils/signResolver';

import { RoadEnvironmentLayer } from './layers/RoadEnvironmentLayer';
import { IntersectionRoadsLayer } from './layers/IntersectionRoadsLayer';
import { RoadMarkingsLayer } from './layers/RoadMarkingsLayer';
import { TrajectoriesLayer } from './layers/TrajectoriesLayer';
import { TrafficRegulatorLayer } from './layers/TrafficRegulatorLayer';
import { VehiclesLayer } from './layers/VehiclesLayer';
import { TrafficLightsLayer } from './layers/TrafficLightsLayer';
import { TrafficSignsLayer } from './layers/TrafficSignsLayer';

const APPROACH_LIST: ApproachDirection[] = ['SOUTH', 'NORTH', 'WEST', 'EAST'];

export const RoadSceneRenderer: React.FC<RoadSceneRendererProps> = ({
  scene,
  rules,
  compact = false,
}) => {
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [nightOverride, setNightOverride] = useState<boolean | null>(null);
  const [selectedSign, setSelectedSign] = useState<PlacedSign | null>(null);

  const isNight =
    nightOverride !== null
      ? nightOverride
      : scene.environment?.timeOfDay === 'night';

  const hasHorizRoad =
    scene.template === 'cross_intersection' ||
    scene.template === 't_intersection' ||
    scene.template === 'roundabout' ||
    scene.template === 'rail_crossing';

  const hasNorthRoad = scene.template !== 't_intersection';

  // Collect placed signs deterministically
  const allPlacedSigns = useMemo(() => {
    const signs: PlacedSign[] = [];
    APPROACH_LIST.forEach((dir) => {
      const app = scene.approaches[dir];
      if (!app?.signs?.length) return;

      app.signs.forEach((code, idx) => {
        const resolved = resolveSignImagePath(code, rules);
        let sx = 535;
        let sy = 435 + idx * 46;
        if (dir === 'SOUTH') {
          sx = 535 + idx * 46;
          sy = 435;
        } else if (dir === 'NORTH') {
          sx = 265 - idx * 46;
          sy = 165;
        } else if (dir === 'WEST') {
          sx = 250;
          sy = 435 + idx * 44;
        } else if (dir === 'EAST') {
          sx = 550;
          sy = 165 - idx * 44;
        }

        signs.push({
          approach: dir,
          ...resolved,
          x: sx,
          y: sy,
        });
      });
    });
    return signs;
  }, [scene.approaches, rules]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm">
      {/* Top Toolbar */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300 font-bold border border-violet-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Динамічна 2D-сцена ПДР</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              •{' '}
              {scene.template === 'cross_intersection'
                ? 'Перехрестя чотирьох доріг'
                : scene.template === 't_intersection'
                ? 'Т-подібне перехрестя'
                : scene.template === 'roundabout'
                ? 'Перехрестя з круговим рухом'
                : scene.template === 'rail_crossing'
                ? 'Залізничний переїзд'
                : scene.template === 'pedestrian_crossing'
                ? 'Пішохідний перехід'
                : 'Пряма ділянка дороги'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTrajectories((v) => !v)}
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
              onClick={() => setNightOverride(isNight ? false : true)}
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
      )}

      {/* Main SVG Viewport */}
      <div className="relative w-full aspect-[4/3] max-h-[430px] flex items-center justify-center bg-white dark:bg-slate-950">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="traj-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>

            <linearGradient id="headlight-beam" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Layer 1: Background & Environment */}
          <RoadEnvironmentLayer isNight={isNight} />

          {/* Layer 2: Asphalt Roads & Tracks */}
          <IntersectionRoadsLayer
            scene={scene}
            isNight={isNight}
            hasNorthRoad={hasNorthRoad}
            hasHorizRoad={hasHorizRoad}
          />

          {/* Layer 3: Markings & Islands */}
          <RoadMarkingsLayer
            scene={scene}
            hasNorthRoad={hasNorthRoad}
            hasHorizRoad={hasHorizRoad}
          />

          {/* Layer 4: Trajectories */}
          {showTrajectories && (
            <TrajectoriesLayer
              actors={scene.actors}
              template={scene.template}
            />
          )}

          {/* Layer 5: Traffic Regulator */}
          <TrafficRegulatorLayer regulator={scene.regulator} />

          {/* Layer 6: Vehicles & Actors */}
          <VehiclesLayer
            actors={scene.actors}
            template={scene.template}
            isNight={isNight}
          />

          {/* Layer 7: Traffic Lights */}
          <TrafficLightsLayer approaches={scene.approaches} />

          {/* Layer 8: Signs & Compass */}
          <TrafficSignsLayer
            signs={allPlacedSigns}
            onSelectSign={setSelectedSign}
          />
        </svg>
      </div>

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
            onClick={() => setSelectedSign(null)}
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
            {scene.actors.map((actor) => {
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

          {allPlacedSigns.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Знаки (натисніть):
              </span>
              {allPlacedSigns.map((s, idx) => (
                <button
                  key={`${s.number}_${idx}`}
                  type="button"
                  onClick={() => setSelectedSign(s)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-500/15 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold transition cursor-pointer"
                >
                  <span>{s.number}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadSceneRenderer;
