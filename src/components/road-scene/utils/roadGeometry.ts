import { SceneActor, RoadSceneConfig, ApproachDirection } from '@/core/types';
import { ActorCoords } from '../types';

export const APPROACH_LABELS: Record<ApproachDirection, string> = {
  SOUTH: 'Південь (знизу)',
  NORTH: 'Північ (зверху)',
  WEST: 'Захід (зліва)',
  EAST: 'Схід (справа)',
};

/**
 * Обчислює координати (x, y, rotation) та траєкторію Безьє актора на полотні 800x600.
 */
export function computeActorPlacement(
  actor: SceneActor,
  template: RoadSceneConfig['template']
): ActorCoords {
  const laneOffset = actor.lane === 2 ? 28 : 62;
  const distFromCenter =
    actor.position === 'in_intersection'
      ? 68
      : actor.position === 'at_stop_line'
      ? 155
      : 225;

  let x = 400;
  let y = 300;
  let rotation = 0;

  if (actor.approach === 'SOUTH') {
    x = 400 + laneOffset;
    y = 300 + distFromCenter;
    rotation = 0; // Facing North (up)
  } else if (actor.approach === 'NORTH') {
    x = 400 - laneOffset;
    y = 300 - distFromCenter;
    rotation = 180; // Facing South (down)
  } else if (actor.approach === 'EAST') {
    x = 400 + distFromCenter;
    y = 300 - laneOffset;
    rotation = 270; // Facing West (left)
  } else if (actor.approach === 'WEST') {
    x = 400 - distFromCenter;
    y = 300 + laneOffset;
    rotation = 90; // Facing East (right)
  }

  // Compute intended trajectory curve
  let trajectoryPath = '';
  const traj = (actor.intendedTrajectory || '').toLowerCase();
  const isLeft =
    actor.turnSignal === 'left' &&
    !traj.includes('прямо') &&
    !traj.includes('straight');
  const isRight =
    actor.turnSignal === 'right' &&
    !traj.includes('кільц') &&
    !traj.includes('straight');
  const isUTurn = traj.includes('розворот') || traj.includes('u_turn');

  if (template === 'roundabout') {
    if (actor.approach === 'SOUTH') {
      trajectoryPath = `M ${x} ${y - 24} Q ${x + 15} 365, 485 300 Q 485 215, 400 215`;
    } else if (actor.approach === 'WEST') {
      trajectoryPath = `M ${x + 24} ${y} Q 335 ${y + 10}, 400 385 Q 485 385, 485 300`;
    } else if (actor.approach === 'EAST') {
      trajectoryPath = `M ${x - 24} ${y} Q 465 ${y - 10}, 400 215 Q 315 215, 315 300`;
    } else {
      trajectoryPath = `M ${x} ${y + 24} Q ${x - 15} 235, 315 300 Q 315 385, 400 385`;
    }
  } else if (actor.approach === 'SOUTH') {
    if (isUTurn) {
      trajectoryPath = `M ${x} ${y - 25} C ${x} 280, 365 280, 365 440`;
    } else if (isLeft) {
      trajectoryPath = `M ${x} ${y - 25} Q ${x} 265, 235 265`;
    } else if (isRight) {
      trajectoryPath = `M ${x} ${y - 25} Q ${x} 345, 565 345`;
    } else {
      trajectoryPath = `M ${x} ${y - 25} L ${x} 135`;
    }
  } else if (actor.approach === 'NORTH') {
    if (isLeft) {
      trajectoryPath = `M ${x} ${y + 25} Q ${x} 335, 565 335`;
    } else if (isRight) {
      trajectoryPath = `M ${x} ${y + 25} Q ${x} 255, 235 255`;
    } else {
      trajectoryPath = `M ${x} ${y + 25} L ${x} 465`;
    }
  } else if (actor.approach === 'WEST') {
    if (isLeft) {
      trajectoryPath = `M ${x + 25} ${y} Q 435 ${y}, 435 135`;
    } else if (isRight) {
      trajectoryPath = `M ${x + 25} ${y} Q 355 ${y}, 355 465`;
    } else {
      trajectoryPath = `M ${x + 25} ${y} L 565 ${y}`;
    }
  } else if (actor.approach === 'EAST') {
    if (isLeft) {
      trajectoryPath = `M ${x - 25} ${y} Q 365 ${y}, 365 465`;
    } else if (isRight) {
      trajectoryPath = `M ${x - 25} ${y} Q 445 ${y}, 445 135`;
    } else {
      trajectoryPath = `M ${x - 25} ${y} L 235 ${y}`;
    }
  }

  return { x, y, rotation, trajectoryPath };
}

export function getActorColor(type: SceneActor['type']): {
  fill: string;
  stroke: string;
  roof: string;
  arrow: string;
} {
  switch (type) {
    case 'car_red':
      return { fill: '#ef4444', stroke: '#991b1b', roof: '#fca5a5', arrow: '#f87171' };
    case 'car_blue':
      return { fill: '#3b82f6', stroke: '#1d4ed8', roof: '#93c5fd', arrow: '#60a5fa' };
    case 'car_white':
      return { fill: '#f8fafc', stroke: '#475569', roof: '#cbd5e1', arrow: '#e2e8f0' };
    case 'truck':
    case 'car_with_trailer':
      return { fill: '#f59e0b', stroke: '#b45309', roof: '#fde68a', arrow: '#fbbf24' };
    case 'bus':
    case 'trolleybus':
      return { fill: '#10b981', stroke: '#047857', roof: '#6ee7b7', arrow: '#34d399' };
    case 'tram':
      return { fill: '#ec4899', stroke: '#9d174d', roof: '#f9a8d4', arrow: '#f472b6' };
    case 'motorcycle':
    case 'moped':
    case 'cyclist':
      return { fill: '#8b5cf6', stroke: '#5b21b6', roof: '#ddd6fe', arrow: '#a78bfa' };
    case 'emergency_ambulance':
    case 'emergency_police':
      return { fill: '#ffffff', stroke: '#2563eb', roof: '#bfdbfe', arrow: '#38bdf8' };
    default:
      return { fill: '#38bdf8', stroke: '#0284c7', roof: '#bae6fd', arrow: '#38bdf8' };
  }
}
