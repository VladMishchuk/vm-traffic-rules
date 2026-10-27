import React from 'react';
import { RoadSceneConfig } from '@/core/types';

interface IntersectionRoadsLayerProps {
  scene: RoadSceneConfig;
  isNight: boolean;
  hasNorthRoad: boolean;
  hasHorizRoad: boolean;
}

export const IntersectionRoadsLayer: React.FC<IntersectionRoadsLayerProps> = ({
  scene,
  isNight,
  hasNorthRoad,
  hasHorizRoad,
}) => {
  return (
    <>
      {/* Vertical Road (South to North) */}
      <rect
        x="296"
        y={hasNorthRoad ? 0 : 196}
        width="208"
        height={hasNorthRoad ? 600 : 404}
        fill={isNight ? '#334155' : '#64748b'}
      />
      <rect
        x="308"
        y={hasNorthRoad ? 0 : 208}
        width="184"
        height={hasNorthRoad ? 600 : 392}
        fill={isNight ? '#1e293b' : '#334155'}
      />

      {/* Horizontal Road (West to East) */}
      {hasHorizRoad && scene.template !== 'rail_crossing' && (
        <>
          <rect
            x="0"
            y="196"
            width="800"
            height="208"
            fill={isNight ? '#334155' : '#64748b'}
          />
          <rect
            x="0"
            y="208"
            width="800"
            height="184"
            fill={isNight ? '#1e293b' : '#334155'}
          />
          {/* Intersection center box */}
          <rect
            x="308"
            y="208"
            width="184"
            height="184"
            fill={isNight ? '#1e293b' : '#334155'}
          />
        </>
      )}

      {/* Railway Crossing Tracks */}
      {scene.template === 'rail_crossing' && (
        <g>
          <rect x="0" y="255" width="800" height="90" fill="#475569" />
          {Array.from({ length: 26 }).map((_, i) => (
            <rect
              key={i}
              x={i * 32 + 6}
              y="262"
              width="12"
              height="76"
              fill="#78350f"
            />
          ))}
          <line
            x1="0"
            y1="276"
            x2="800"
            y2="276"
            stroke="#cbd5e1"
            strokeWidth="5"
          />
          <line
            x1="0"
            y1="324"
            x2="800"
            y2="324"
            stroke="#cbd5e1"
            strokeWidth="5"
          />
        </g>
      )}

      {/* Tram Tracks */}
      {scene.environment?.hasTramTracks?.includes('WEST_EAST') && (
        <g opacity="0.85">
          <line
            x1="0"
            y1="286"
            x2="800"
            y2="286"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="12 4"
          />
          <line
            x1="0"
            y1="314"
            x2="800"
            y2="314"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="12 4"
          />
        </g>
      )}
      {scene.environment?.hasTramTracks?.includes('SOUTH_NORTH') && (
        <g opacity="0.85">
          <line
            x1="386"
            y1="0"
            x2="386"
            y2="600"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="12 4"
          />
          <line
            x1="414"
            y1="0"
            x2="414"
            y2="600"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="12 4"
          />
        </g>
      )}
    </>
  );
};
