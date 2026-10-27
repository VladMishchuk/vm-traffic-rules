import React from 'react';
import { PlacedSign } from '../../types';

interface TrafficSignsLayerProps {
  signs: PlacedSign[];
  onSelectSign: (sign: PlacedSign) => void;
}

export const TrafficSignsLayer: React.FC<TrafficSignsLayerProps> = ({
  signs,
  onSelectSign,
}) => {
  return (
    <>
      {signs.map((sign, idx) => (
        <g
          key={`sign_${sign.approach}_${sign.number}_${idx}`}
          transform={`translate(${sign.x}, ${sign.y})`}
          onClick={() => onSelectSign(sign)}
          className="cursor-pointer"
        >
          <rect
            x="-22"
            y="-22"
            width="44"
            height="44"
            rx="8"
            fill="#ffffff"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <image
            href={sign.imagePath}
            x="-19"
            y="-19"
            width="38"
            height="38"
            preserveAspectRatio="xMidYMid meet"
          />
          <rect
            x="-18"
            y="16"
            width="36"
            height="13"
            rx="4"
            fill="#0f172a"
          />
          <text
            x="0"
            y="25.5"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="8.5"
            fontWeight="bold"
          >
            {sign.number}
          </text>
        </g>
      ))}

      {/* Compass Indicator (North / Пн) */}
      <g transform="translate(752, 46)">
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="#0f172a"
          fillOpacity="0.8"
          stroke="#475569"
          strokeWidth="1.5"
        />
        <polygon points="0,-14 -5,4 0,0 5,4" fill="#ef4444" />
        <text
          x="0"
          y="15"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8"
          fontWeight="bold"
        >
          Пн
        </text>
      </g>
    </>
  );
};
