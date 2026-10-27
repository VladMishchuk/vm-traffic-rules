import React from 'react';
import { RoadSceneConfig, ApproachDirection } from '@/core/types';

interface TrafficLightsLayerProps {
  approaches: RoadSceneConfig['approaches'];
}

const APPROACH_LIST: ApproachDirection[] = ['SOUTH', 'NORTH', 'WEST', 'EAST'];

const TL_COORDS: Record<ApproachDirection, { x: number; y: number }> = {
  SOUTH: { x: 515, y: 392 },
  NORTH: { x: 285, y: 208 },
  WEST: { x: 292, y: 405 },
  EAST: { x: 508, y: 195 },
};

export const TrafficLightsLayer: React.FC<TrafficLightsLayerProps> = ({
  approaches,
}) => {
  return (
    <>
      {APPROACH_LIST.map((dir) => {
        const tl = approaches[dir]?.trafficLight;
        if (!tl) return null;

        const pos = TL_COORDS[dir];

        return (
          <g key={`tl_${dir}`} transform={`translate(${pos.x}, ${pos.y})`}>
            <rect
              x="-12"
              y="-30"
              width="24"
              height="60"
              rx="6"
              fill="#0f172a"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            {/* Red */}
            <circle
              cx="0"
              cy="-18"
              r="6.5"
              fill={tl.state === 'red' ? '#ef4444' : '#334155'}
            />
            {/* Yellow */}
            <circle
              cx="0"
              cy="0"
              r="6.5"
              fill={
                tl.state === 'yellow' || tl.state === 'yellow_blinking'
                  ? '#facc15'
                  : '#334155'
              }
            >
              {tl.state === 'yellow_blinking' && (
                <animate
                  attributeName="opacity"
                  values="1;0.15;1"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            {/* Green */}
            <circle
              cx="0"
              cy="18"
              r="6.5"
              fill={tl.state === 'green' ? '#22c55e' : '#334155'}
            />

            {/* Extra Arrow Section */}
            {tl.extraArrow && tl.extraArrow !== 'none' && (
              <g
                transform={`translate(${
                  tl.extraArrow === 'right' ? 18 : -18
                }, 18)`}
              >
                <rect
                  x="-9"
                  y="-9"
                  width="18"
                  height="18"
                  rx="4"
                  fill="#0f172a"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#22c55e"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {tl.extraArrow === 'right' ? '→' : '←'}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
};
