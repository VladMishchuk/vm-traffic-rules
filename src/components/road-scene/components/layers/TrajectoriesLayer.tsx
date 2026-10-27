import React from 'react';
import { SceneActor, RoadSceneConfig } from '@/core/types';
import { computeActorPlacement, getActorColor } from '../../utils/roadGeometry';

interface TrajectoriesLayerProps {
  actors: SceneActor[];
  template: RoadSceneConfig['template'];
}

export const TrajectoriesLayer: React.FC<TrajectoriesLayerProps> = ({
  actors,
  template,
}) => {
  return (
    <>
      {actors.map((actor) => {
        const { trajectoryPath } = computeActorPlacement(actor, template);
        const colors = getActorColor(actor.type);
        if (!trajectoryPath) return null;

        return (
          <path
            key={`traj_${actor.id}`}
            d={trajectoryPath}
            fill="none"
            stroke={colors.arrow}
            strokeWidth="4"
            strokeDasharray="10 7"
            markerEnd="url(#traj-arrow)"
            opacity="0.9"
          />
        );
      })}
    </>
  );
};
