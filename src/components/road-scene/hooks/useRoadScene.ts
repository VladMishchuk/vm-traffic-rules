import { useState, useMemo } from 'react';
import { ApproachDirection, RoadSceneConfig, RulesDatabase } from '@/core/types';
import { PlacedSign } from '../types';
import { resolveSignImagePath } from '../utils/signResolver';

const APPROACH_LIST: ApproachDirection[] = ['SOUTH', 'NORTH', 'WEST', 'EAST'];

export function useRoadScene(
  scene: RoadSceneConfig,
  rules?: RulesDatabase | null
) {
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

  const toggleTrajectories = () => setShowTrajectories((v) => !v);
  const toggleNight = () => setNightOverride(isNight ? false : true);

  return {
    showTrajectories,
    isNight,
    hasHorizRoad,
    hasNorthRoad,
    allPlacedSigns,
    selectedSign,
    setSelectedSign,
    toggleTrajectories,
    toggleNight,
  };
}
