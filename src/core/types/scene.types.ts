import { DriverCategoryCode } from './category.types';

export type RoadTemplateType =
  | 'straight'
  | 'cross_intersection'
  | 't_intersection'
  | 'roundabout'
  | 'rail_crossing'
  | 'pedestrian_crossing';

export type ApproachDirection = 'SOUTH' | 'NORTH' | 'WEST' | 'EAST';

export interface SceneActor {
  id: string;
  type:
    | 'motorcycle'
    | 'moped'
    | 'car_blue'
    | 'car_red'
    | 'car_white'
    | 'truck'
    | 'bus'
    | 'car_with_trailer'
    | 'tram'
    | 'trolleybus'
    | 'emergency_ambulance'
    | 'emergency_police'
    | 'cyclist'
    | 'pedestrian';
  category?: DriverCategoryCode;
  label: string;
  approach: ApproachDirection;
  lane: number;
  position: 'at_stop_line' | 'approaching' | 'in_intersection';
  turnSignal: 'left' | 'right' | 'none';
  intendedTrajectory?: string;
}

export interface RoadSceneConfig {
  template: RoadTemplateType;
  environment?: {
    timeOfDay?: 'day' | 'night';
    hasTramTracks?: ('WEST_EAST' | 'SOUTH_NORTH')[];
  };
  approaches: Partial<
    Record<
      ApproachDirection,
      {
        lanesIn: number;
        lanesOut: number;
        signs?: string[];
        trafficLight?: {
          state: 'green' | 'yellow' | 'red' | 'yellow_blinking';
          extraArrow?: 'left' | 'right' | 'none';
        };
        marking?: string;
      }
    >
  >;
  regulator?: {
    present: boolean;
    position: 'CENTER';
    pose: 'arms_down' | 'right_arm_forward' | 'arm_up';
    facing: ApproachDirection;
  };
  actors: SceneActor[];
}
