import React from 'react';
import { SceneActor, RoadSceneConfig } from '@/core/types';
import { computeActorPlacement, getActorColor } from '../../utils/roadGeometry';

interface VehiclesLayerProps {
  actors: SceneActor[];
  template: RoadSceneConfig['template'];
  isNight: boolean;
}

export const VehiclesLayer: React.FC<VehiclesLayerProps> = ({
  actors,
  template,
  isNight,
}) => {
  return (
    <>
      {actors.map((actor) => {
        const { x, y, rotation } = computeActorPlacement(actor, template);
        const colors = getActorColor(actor.type);
        const isLongVehicle =
          actor.type === 'truck' ||
          actor.type === 'bus' ||
          actor.type === 'tram' ||
          actor.type === 'trolleybus' ||
          actor.type === 'car_with_trailer';
        const isMoto =
          actor.type === 'motorcycle' ||
          actor.type === 'moped' ||
          actor.type === 'cyclist';
        const isEmergency =
          actor.type === 'emergency_ambulance' ||
          actor.type === 'emergency_police';

        const w = isMoto ? 16 : 26;
        const h = isLongVehicle ? 64 : isMoto ? 34 : 46;

        return (
          <g key={actor.id} transform={`translate(${x}, ${y})`}>
            <g transform={`rotate(${rotation})`}>
              {/* Night Headlight Beams */}
              {isNight && (
                <polygon
                  points={`-${w / 2 - 2},-${h / 2} -${w + 14},-${
                    h / 2 + 75
                  } ${w + 14},-${h / 2 + 75} ${w / 2 - 2},-${h / 2}`}
                  fill="url(#headlight-beam)"
                />
              )}

              {/* Vehicle Body */}
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={isMoto ? 6 : 7}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2.5"
              />

              {/* Windshield & Roof */}
              {!isMoto && (
                <rect
                  x={-w / 2 + 3}
                  y={-h / 2 + 8}
                  width={w - 6}
                  height={h - 20}
                  rx="4"
                  fill={colors.roof}
                  opacity="0.85"
                />
              )}

              {/* Tram Pantograph */}
              {actor.type === 'tram' && (
                <path
                  d="M -6 -6 L 0 -14 L 6 -6 L 0 2 Z"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
              )}

              {/* Emergency Flashing Beacons (Blue + Red) */}
              {isEmergency && (
                <g>
                  <circle cx="-5" cy="0" r="4.5" fill="#2563eb">
                    <animate
                      attributeName="opacity"
                      values="1;0.2;1"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="5" cy="0" r="4.5" fill="#dc2626">
                    <animate
                      attributeName="opacity"
                      values="0.2;1;0.2"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}

              {/* Front Headlights */}
              <circle
                cx={-w / 2 + 4}
                cy={-h / 2 + 2}
                r="2.5"
                fill="#fef08a"
              />
              <circle
                cx={w / 2 - 4}
                cy={-h / 2 + 2}
                r="2.5"
                fill="#fef08a"
              />

              {/* Blinking Left Turn Signal */}
              {actor.turnSignal === 'left' && (
                <>
                  <circle
                    cx={-w / 2 - 2}
                    cy={-h / 2 + 4}
                    r="4.5"
                    fill="#f59e0b"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.15;1"
                      dur="0.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={-w / 2 - 2}
                    cy={h / 2 - 4}
                    r="4"
                    fill="#f59e0b"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.15;1"
                      dur="0.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}

              {/* Blinking Right Turn Signal */}
              {actor.turnSignal === 'right' && (
                <>
                  <circle
                    cx={w / 2 + 2}
                    cy={-h / 2 + 4}
                    r="4.5"
                    fill="#f59e0b"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.15;1"
                      dur="0.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={w / 2 + 2}
                    cy={h / 2 - 4}
                    r="4"
                    fill="#f59e0b"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.15;1"
                      dur="0.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </g>

            {/* Upright Actor Callout Label */}
            <g transform="translate(0, 34)">
              <rect
                x="-48"
                y="-10"
                width="96"
                height="19"
                rx="6"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={colors.arrow}
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="10"
                fontWeight="bold"
              >
                {actor.label.length > 16
                  ? actor.label.slice(0, 15) + '…'
                  : actor.label}
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
};
