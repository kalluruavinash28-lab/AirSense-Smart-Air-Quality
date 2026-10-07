import React from 'react';
import { Station, AirQualityReading } from '../types/airQuality';
import { StatusBadge } from './StatusBadge';
import { calculateAQI } from '../services/aqiService';
import { Cpu, ArrowRight, MapPin, Gauge } from 'lucide-react';

interface StationCardProps {
  station: Station;
  reading: AirQualityReading;
  onViewDetails: (stationId: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  reading,
  onViewDetails,
}) => {
  const isOffline = reading.status === 'offline';
  const aqiRes = calculateAQI(reading.pm25, reading.pm10, reading.co, reading.no2);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:shadow-xl">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>{station.city}, {station.state}</span>
            </div>
            <h3 className="mt-1 font-bold text-base text-white">{station.stationName}</h3>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              {station.stationId}
            </span>
          </div>
          <StatusBadge type="station" value={reading.status} size="sm" />
        </div>

        {/* AQI Spotlight */}
        <div className="mt-4 rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                AQI (CPCB)
              </span>
              <span
                className="font-mono text-3xl font-black"
                style={{ color: isOffline ? '#64748b' : aqiRes.color.hex }}
              >
                {isOffline ? '--' : reading.aqi}
              </span>
            </div>
          </div>
          <div>
            {!isOffline ? (
              <StatusBadge type="aqi" value={reading.category} size="md" />
            ) : (
              <span className="text-xs text-slate-500 font-mono">No Signal</span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-800/40 border border-slate-800/80 p-2.5">
            <span className="text-[10px] text-slate-400 block">PM2.5 Level</span>
            <span className="font-mono font-bold text-white text-sm">
              {isOffline ? '--' : `${reading.pm25}`} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
            </span>
          </div>

          <div className="rounded-lg bg-slate-800/40 border border-slate-800/80 p-2.5">
            <span className="text-[10px] text-slate-400 block">PM10 Level</span>
            <span className="font-mono font-bold text-white text-sm">
              {isOffline ? '--' : `${reading.pm10}`} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
            </span>
          </div>

          <div className="rounded-lg bg-slate-800/40 border border-slate-800/80 p-2.5">
            <span className="text-[10px] text-slate-400 block">CO / NO2</span>
            <span className="font-mono font-bold text-white text-sm">
              {isOffline ? '--' : `${reading.co} / ${reading.no2}`}
            </span>
          </div>

          <div className="rounded-lg bg-slate-800/40 border border-slate-800/80 p-2.5">
            <span className="text-[10px] text-slate-400 block">Temp / Humidity</span>
            <span className="font-mono font-bold text-white text-sm">
              {isOffline ? '--' : `${reading.temperature}°C / ${reading.humidity}%`}
            </span>
          </div>
        </div>

        {/* Sensor Specs badge */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Cpu className="h-3 w-3 text-cyan-400 shrink-0" />
          <span className="truncate">{station.sensorModel}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 font-mono">
          {new Date(reading.timestamp).toLocaleTimeString()}
        </span>
        <button
          onClick={() => onViewDetails(station.stationId)}
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold group"
        >
          <span>Station Telemetry</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
