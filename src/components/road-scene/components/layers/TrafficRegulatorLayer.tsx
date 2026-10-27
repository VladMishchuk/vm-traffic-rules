import React from 'react';
import { RoadSceneConfig } from '@/core/types';

interface TrafficRegulatorLayerProps {
  regulator?: RoadSceneConfig['regulator'];
}

export const TrafficRegulatorLayer: React.FC<TrafficRegulatorLayerProps> = ({
  regulator,
}) => {
  if (!regulator?.present) return null;

  const rotation =
    regulator.facing === 'NORTH'
      ? 0
      : regulator.facing === 'EAST'
      ? 90
      : regulator.facing === 'SOUTH'
      ? 180
      : 270;

  return (
    <g transform="translate(400, 300)">
      {/* Safety circle under regulator */}
      <circle
        cx="0"
        cy="0"
        r="24"
        fill="#1e293b"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeDasharray="4 4"
      />
      {/* Rotate according to facing direction */}
      <g transform={`rotate(${rotation})`}>
        {/* Shoulders / High-vis vest */}
        <rect
          x="-14"
          y="-6"
          width="28"
          height="12"
          rx="6"
          fill="#84cc16"
          stroke="#0f172a"
          strokeWidth="2"
        />
        {/* Arms based on pose */}
        {regulator.pose === 'right_arm_forward' && (
          <>
            <line
              x1="12"
              y1="0"
              x2="12"
              y2="-24"
              stroke="#84cc16"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="-24"
              x2="12"
              y2="-38"
              stroke="#f8fafc"
              strokeWidth="3.5"
              strokeDasharray="4 3"
            />
          </>
        )}
        {regulator.pose === 'arms_down' && (
          <>
            <line
              x1="-24"
              y1="0"
              x2="24"
              y2="0"
              stroke="#84cc16"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="24"
              y1="0"
              x2="36"
              y2="0"
              stroke="#f8fafc"
              strokeWidth="3.5"
              strokeDasharray="4 3"
            />
          </>
        )}
        {regulator.pose === 'arm_up' && (
          <circle
            cx="11"
            cy="-4"
            r="6"
            fill="#ef4444"
            stroke="#f8fafc"
            strokeWidth="2"
          />
        )}
        {/* Police Cap / Head */}
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="#1e3a8a"
          stroke="#f8fafc"
          strokeWidth="2"
        />
        {/* Visor showing facing direction */}
        <path d="M -5 -7 Q 0 -13 5 -7" fill="#0f172a" />
      </g>
      <text
        x="0"
        y="37"
        textAnchor="middle"
        fill="#fde047"
        fontSize="11"
        fontWeight="bold"
      >
        Регулювальник
      </text>
    </g>
  );
};
