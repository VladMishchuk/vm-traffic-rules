import React from 'react';
import { RoadSceneConfig } from '@/core/types';

interface RoadMarkingsLayerProps {
  scene: RoadSceneConfig;
  hasNorthRoad: boolean;
  hasHorizRoad: boolean;
}

export const RoadMarkingsLayer: React.FC<RoadMarkingsLayerProps> = ({
  scene,
  hasNorthRoad,
  hasHorizRoad,
}) => {
  return (
    <>
      {/* South Segment Markings */}
      <line
        x1="397"
        y1="400"
        x2="397"
        y2="600"
        stroke="#f8fafc"
        strokeWidth="2.5"
      />
      <line
        x1="403"
        y1="400"
        x2="403"
        y2="600"
        stroke="#f8fafc"
        strokeWidth="2.5"
      />
      <line
        x1="446"
        y1="405"
        x2="446"
        y2="600"
        stroke="#f8fafc"
        strokeWidth="2"
        strokeDasharray="16 14"
      />
      <line
        x1="354"
        y1="405"
        x2="354"
        y2="600"
        stroke="#f8fafc"
        strokeWidth="2"
        strokeDasharray="16 14"
      />
      {scene.template !== 'roundabout' && (
        <line
          x1="403"
          y1="402"
          x2="490"
          y2="402"
          stroke="#f8fafc"
          strokeWidth="6"
        />
      )}

      {/* North Segment Markings */}
      {hasNorthRoad && (
        <>
          <line
            x1="397"
            y1="0"
            x2="397"
            y2="200"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />
          <line
            x1="403"
            y1="0"
            x2="403"
            y2="200"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />
          <line
            x1="354"
            y1="0"
            x2="354"
            y2="195"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="16 14"
          />
          <line
            x1="446"
            y1="0"
            x2="446"
            y2="195"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="16 14"
          />
          {scene.template !== 'roundabout' && (
            <line
              x1="310"
              y1="198"
              x2="397"
              y2="198"
              stroke="#f8fafc"
              strokeWidth="6"
            />
          )}
        </>
      )}

      {/* West & East Segment Markings */}
      {hasHorizRoad && scene.template !== 'rail_crossing' && (
        <>
          {/* West */}
          <line
            x1="0"
            y1="297"
            x2="300"
            y2="297"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />
          <line
            x1="0"
            y1="303"
            x2="300"
            y2="303"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />
          <line
            x1="0"
            y1="346"
            x2="295"
            y2="346"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="16 14"
          />
          <line
            x1="0"
            y1="254"
            x2="295"
            y2="254"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="16 14"
          />
          {scene.template !== 'roundabout' && (
            <line
              x1="298"
              y1="303"
              x2="298"
              y2="390"
              stroke="#f8fafc"
              strokeWidth="6"
            />
          )}

          {/* East */}
          <line
            x1="500"
            y1="297"
            x2="800"
            y2="297"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />
          <line
            x1="500"
            y1="303"
            x2="800"
            y2="303"
            stroke="#f8fafc"
            strokeWidth="2.5"
          />
          <line
            x1="505"
            y1="254"
            x2="800"
            y2="254"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="16 14"
          />
          <line
            x1="505"
            y1="346"
            x2="800"
            y2="346"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="16 14"
          />
          {scene.template !== 'roundabout' && (
            <line
              x1="502"
              y1="210"
              x2="502"
              y2="297"
              stroke="#f8fafc"
              strokeWidth="6"
            />
          )}
        </>
      )}

      {/* Zebra Pedestrian Crossing */}
      {scene.template === 'pedestrian_crossing' && (
        <g>
          {Array.from({ length: 7 }).map((_, idx) => (
            <rect
              key={idx}
              x={316 + idx * 25}
              y="270"
              width="16"
              height="60"
              fill={idx % 2 === 0 ? '#f8fafc' : '#ef4444'}
            />
          ))}
        </g>
      )}

      {/* Roundabout Center Island */}
      {scene.template === 'roundabout' && (
        <g>
          <circle
            cx="400"
            cy="300"
            r="112"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2.5"
            strokeDasharray="14 10"
          />
          <circle
            cx="400"
            cy="300"
            r="52"
            fill="#15803d"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle cx="400" cy="300" r="24" fill="#166534" />
        </g>
      )}
    </>
  );
};
