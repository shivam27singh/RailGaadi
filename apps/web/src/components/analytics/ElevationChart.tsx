import React, { useState } from 'react';
import { Mountain, TrendingUp } from 'lucide-react';
import { ElevationData } from '@railgaddi/types';
import { Card } from '../ui/Card';

interface ElevationChartProps {
  elevation: ElevationData | undefined;
  currentDistanceKm: number;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({
  elevation,
  currentDistanceKm
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ distance: number; elevation: number; station?: string } | null>(null);

  if (!elevation || !elevation.available || !elevation.points || elevation.points.length === 0) {
    return (
      <Card className="p-6 text-center border-white/10">
        <Mountain className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-300 font-medium">Elevation profile unavailable for this route</p>
        <p className="text-xs text-slate-500 mt-0.5">Topographical data could not be computed</p>
      </Card>
    );
  }

  const { points, highestElevationMeters, highestPointLocation, currentElevationMeters } = elevation;
  const maxDistance = points[points.length - 1].distanceKm || 1000;
  const maxElevation = Math.max(...points.map((p) => p.elevationMeters), 500);

  // SVG dimensions
  const width = 680;
  const height = 180;
  const paddingX = 30;
  const paddingY = 25;

  // Map coords
  const getX = (dist: number) => paddingX + ((dist / maxDistance) * (width - paddingX * 2));
  const getY = (ele: number) => height - paddingY - ((ele / (maxElevation * 1.15)) * (height - paddingY * 2));

  // Build SVG Path
  const linePoints = points.map((p) => `${getX(p.distanceKm)},${getY(p.elevationMeters)}`);
  const pathD = `M ${linePoints.join(' L ')}`;
  const areaD = `M ${getX(points[0].distanceKm)},${height - paddingY} L ${linePoints.join(' L ')} L ${getX(points[points.length - 1].distanceKm)},${height - paddingY} Z`;

  // Current train position X
  const trainX = Math.min(width - paddingX, Math.max(paddingX, getX(currentDistanceKm)));

  return (
    <Card className="p-4 sm:p-6 mb-4 border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Route Topography & Elevation</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Highest altitude: <span className="text-cyan-300 font-bold font-mono">{highestElevationMeters}m</span> ({highestPointLocation})
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Profile</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Train ({currentElevationMeters}m)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 select-none overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="elevationAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="elevationLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const y = getY(maxElevation * ratio);
              const val = Math.round(maxElevation * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-500 font-mono"
                  >
                    {val}m
                  </text>
                </g>
              );
            })}

            {/* Elevation Shaded Area */}
            <path d={areaD} fill="url(#elevationAreaGrad)" />

            {/* Elevation Contour Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#elevationLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Elevation Data Points */}
            {points.map((p, i) => {
              const cx = getX(p.distanceKm);
              const cy = getY(p.elevationMeters);
              return (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    className="fill-cyan-400 stroke-slate-900 stroke-2 hover:r-5 transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ distance: p.distanceKm, elevation: p.elevationMeters, station: p.stationName })}
                  />
                  {p.stationName && (
                    <text
                      x={cx}
                      y={height - 6}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-400 font-medium"
                    >
                      {p.stationName}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Train Position Line */}
            <line
              x1={trainX}
              y1={paddingY}
              x2={trainX}
              y2={height - paddingY}
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle
              cx={trainX}
              cy={getY(currentElevationMeters)}
              r="6"
              className="fill-amber-400 stroke-white stroke-2 shadow-glow-amber animate-pulse"
            />

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <g>
                <rect
                  x={getX(hoveredPoint.distance) - 50}
                  y={getY(hoveredPoint.elevation) - 36}
                  width="100"
                  height="26"
                  rx="6"
                  className="fill-slate-900/95 stroke-white/20 stroke-1"
                />
                <text
                  x={getX(hoveredPoint.distance)}
                  y={getY(hoveredPoint.elevation) - 20}
                  textAnchor="middle"
                  className="text-[10px] fill-white font-bold"
                >
                  {hoveredPoint.station ? `${hoveredPoint.station}: ` : ''}{hoveredPoint.elevation}m ({hoveredPoint.distance}km)
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </Card>
  );
};
