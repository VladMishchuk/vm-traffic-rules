import {
  RoadSceneConfig,
  ApproachDirection,
  RulesDatabase,
} from '@/core/types';

export interface RoadSceneRendererProps {
  scene: RoadSceneConfig;
  rules?: RulesDatabase | null;
  compact?: boolean;
}

export interface ActorCoords {
  x: number;
  y: number;
  rotation: number; // degrees: 0 = NORTH, 90 = EAST, 180 = SOUTH, 270 = WEST
  trajectoryPath: string;
}

export interface PlacedSign {
  approach: ApproachDirection;
  number: string;
  name: string;
  description: string;
  imagePath: string;
  x: number;
  y: number;
}
