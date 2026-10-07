import React from 'react';
import { StatusBadge } from './StatusBadge';
import { calculateAQI } from '../services/aqiService';
import { ShieldAlert, Wind, Activity } from 'lucide-react';

interface AQICardProps {
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  stationName?: string;
  city?: string;
  lastUpdated?: string;
}

export const AQICard: React.FC<AQICardProps> = ({
  pm25,
  pm10,
  co,
  no2,
  stationName = 'Fleet Average (5 Stations)',
  city = 'Karnataka / Tamil Nadu',
  lastUpdated,
}) => {
  const result = calculateAQI(pm25, pm10, co, no2);

  // Meter percentage (clamped between 0 and 500)
  const aqiPercentage = Math.min(100, Math.round((result.aqi / 400) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 p-6 shadow-xl backdrop-blur-md">
      {/* Top ambient glow matching AQI color */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{ backgroundColor: result.color.hex }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Composite Air Quality Index
            </span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-white flex items-center gap-2">
            {stationName}
            <span className="text-xs font-normal text-slate-400">• {city}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusBadge type="aqi" value={result.category} size="lg" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Main AQI Display */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center relative">
          <div className="relative flex items-center justify-center">
            {/* SVG circular track */}
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={result.color.hex}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 * (1 - aqiPercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {result.aqi}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                AQI (CPCB)
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Dominant Pollutant:</span>
            <span className="font-semibold text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
              {result.dominantPollutant}
            </span>
          </div>
        </div>

        {/* Health Advisory & Scale */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 rounded-lg p-2 border"
                style={{
                  backgroundColor: `${result.color.hex}15`,
                  borderColor: `${result.color.hex}30`,
                  color: result.color.hex,
                }}
              >
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Health & Advisory Impact
                </p>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {result.healthAdvisory}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-indices Progress Breakdown */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Sub-Index Components</span>
              <span>Sub-Score (Scale 0-500)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">PM2.5: {pm25} µg/m³</span>
                  <span className="font-mono font-semibold text-white">{result.subIndices.pm25}</span>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (result.subIndices.pm25 / 300) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">PM10: {pm10} µg/m³</span>
                  <span className="font-mono font-semibold text-white">{result.subIndices.pm10}</span>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (result.subIndices.pm10 / 300) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">CO: {co} mg/m³</span>
                  <span className="font-mono font-semibold text-white">{result.subIndices.co}</span>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (result.subIndices.co / 300) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">NO2: {no2} µg/m³</span>
                  <span className="font-mono font-semibold text-white">{result.subIndices.no2}</span>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (result.subIndices.no2 / 300) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-slate-400" />
            <span>Telemetry source: Continuous optical laser scattering + electro-chemical cells</span>
          </div>
          <span>Updated: {lastUpdated}</span>
        </div>
      )}
    </div>
  );
};
