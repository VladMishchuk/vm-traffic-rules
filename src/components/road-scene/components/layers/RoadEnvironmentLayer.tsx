import React from 'react';

interface RoadEnvironmentLayerProps {
  isNight: boolean;
}

export const RoadEnvironmentLayer: React.FC<RoadEnvironmentLayerProps> = ({
  isNight,
}) => {
  return (
    <>
      {/* 1. Grass / Surroundings Background */}
      <rect
        x="0"
        y="0"
        width="800"
        height="600"
        fill={isNight ? '#0f172a' : '#14532d'}
      />

      {/* Decorative trees/bushes in corners */}
      <g opacity={isNight ? 0.35 : 0.75}>
        <circle cx="110" cy="100" r="36" fill="#166534" />
        <circle cx="150" cy="85" r="26" fill="#15803d" />
        <circle cx="690" cy="100" r="36" fill="#166534" />
        <circle cx="110" cy="500" r="34" fill="#166534" />
        <circle cx="685" cy="500" r="38" fill="#166534" />
      </g>
    </>
  );
};
