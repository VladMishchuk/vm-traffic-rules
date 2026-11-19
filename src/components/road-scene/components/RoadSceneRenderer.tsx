import React from 'react';
import { RoadSceneRendererProps } from '../types';
import { useRoadScene } from '../hooks/useRoadScene';

import { SceneToolbar } from './SceneToolbar';
import { SceneLegendFooter } from './SceneLegendFooter';
import { RoadEnvironmentLayer } from './layers/RoadEnvironmentLayer';
import { IntersectionRoadsLayer } from './layers/IntersectionRoadsLayer';
import { RoadMarkingsLayer } from './layers/RoadMarkingsLayer';
import { TrajectoriesLayer } from './layers/TrajectoriesLayer';
import { TrafficRegulatorLayer } from './layers/TrafficRegulatorLayer';
import { VehiclesLayer } from './layers/VehiclesLayer';
import { TrafficLightsLayer } from './layers/TrafficLightsLayer';
import { TrafficSignsLayer } from './layers/TrafficSignsLayer';

export const RoadSceneRenderer: React.FC<RoadSceneRendererProps> = ({
  scene,
  rules,
  compact = false,
}) => {
  const {
    showTrajectories,
    isNight,
    hasHorizRoad,
    hasNorthRoad,
    allPlacedSigns,
    selectedSign,
    setSelectedSign,
    toggleTrajectories,
    toggleNight,
  } = useRoadScene(scene, rules);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm">
      {!compact && (
        <SceneToolbar
          template={scene.template}
          showTrajectories={showTrajectories}
          isNight={isNight}
          onToggleTrajectories={toggleTrajectories}
          onToggleNight={toggleNight}
        />
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

          <RoadEnvironmentLayer isNight={isNight} />

          <IntersectionRoadsLayer
            scene={scene}
            isNight={isNight}
            hasNorthRoad={hasNorthRoad}
            hasHorizRoad={hasHorizRoad}
          />

          <RoadMarkingsLayer
            scene={scene}
            hasNorthRoad={hasNorthRoad}
            hasHorizRoad={hasHorizRoad}
          />

          {showTrajectories && (
            <TrajectoriesLayer
              actors={scene.actors}
              template={scene.template}
            />
          )}

          <TrafficRegulatorLayer regulator={scene.regulator} />

          <VehiclesLayer
            actors={scene.actors}
            template={scene.template}
            isNight={isNight}
          />

          <TrafficLightsLayer approaches={scene.approaches} />

          <TrafficSignsLayer
            signs={allPlacedSigns}
            onSelectSign={setSelectedSign}
          />
        </svg>
      </div>

      <SceneLegendFooter
        compact={compact}
        actors={scene.actors}
        placedSigns={allPlacedSigns}
        selectedSign={selectedSign}
        onSelectSign={setSelectedSign}
      />
    </div>
  );
};

export default RoadSceneRenderer;
