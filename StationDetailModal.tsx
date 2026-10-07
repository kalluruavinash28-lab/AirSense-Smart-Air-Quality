import React from 'react';
import { Station, AirQualityReading, Alert } from '../types/airQuality';
import { StatusBadge } from './StatusBadge';
import { calculateAQI } from '../services/aqiService';
import { getStationHistory } from '../services/sensorSimulator';
import { AQIChart } from './AQIChart';
import { PollutionChart } from './PollutionChart';
import {
  X,
  MapPin,
  Cpu,
  Activity,
  Zap,
  Radio,
  Clock,
  Thermometer,
  Droplets,
  AlertTriangle,
} from 'lucide-react';

interface StationDetailModalProps {
  station: Station | null;
  currentReading: AirQualityReading | null;
  alerts: Alert[];
  onClose: () => void;
  onTriggerSpike: (stationId: string) => void;
  onToggleOffline: (stationId: string) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  currentReading,
  alerts,
  onClose,
  onTriggerSpike,
  onToggleOffline,
}) => {
  if (!station || !currentReading) return null;

  const aqiRes = calculateAQI(
    currentReading.pm25,
    currentReading.pm10,
    currentReading.co,
    currentReading.no2
  );
  const isOffline = currentReading.status === 'offline';
  const history = getStationHistory(station.stationId);
  const stationAlerts = alerts.filter(a => a.stationId === station.stationId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                {station.stationId}
              </span>
              <StatusBadge type="station" value={currentReading.status} size="sm" />
              <StatusBadge type="aqi" value={currentReading.category} size="sm" />
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-white">{station.stationName}</h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {station.city}, {station.state} ({station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-slate-400" />
                {station.sensorModel}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Bar for Demo / Diagnostics */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Hardware Heartbeat: Active (5s telemetry cycle)</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[11px] text-slate-400">
              Last packet: {new Date(currentReading.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerSpike(station.stationId)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              Simulate Pollution Spike
            </button>
            <button
              onClick={() => onToggleOffline(station.stationId)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                isOffline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              {isOffline ? 'Restore Online' : 'Force Offline'}
            </button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              AQI Index
            </span>
            <span
              className="text-2xl font-black font-mono mt-1 block"
              style={{ color: isOffline ? '#64748b' : aqiRes.color.hex }}
            >
              {isOffline ? '--' : currentReading.aqi}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Dominant: {currentReading.dominantPollutant || 'PM2.5'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              PM2.5 Fine
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
              {isOffline ? '--' : currentReading.pm25}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">µg/m³ (CPCB Limit: 60)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              PM10 Coarse
            </span>
            <span className="text-2xl font-black font-mono text-indigo-400 mt-1 block">
              {isOffline ? '--' : currentReading.pm10}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">µg/m³ (CPCB Limit: 100)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              CO Level
            </span>
            <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
              {isOffline ? '--' : currentReading.co}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">mg/m³ (Limit: 2.0)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              NO2 Level
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              {isOffline ? '--' : currentReading.no2}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">µg/m³ (Limit: 80)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              CO2 Level
            </span>
            <span className="text-2xl font-black font-mono text-pink-400 mt-1 block">
              {isOffline ? '--' : currentReading.co2}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">ppm (Ambient: ~420)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-orange-400" /> Temperature
            </span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              {isOffline ? '--' : currentReading.temperature}°C
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Ambient weather</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Droplets className="h-3 w-3 text-cyan-400" /> Humidity
            </span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              {isOffline ? '--' : currentReading.humidity}%
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Relative Humidity</span>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-5 space-y-4">
          <AQIChart data={history} title={`${station.stationName} – AQI Trajectory`} />
          <PollutionChart data={history} title={`${station.stationName} – Chemical & Particulate Trends`} />
        </div>

        {/* Station-specific Alerts */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Station Alert History ({stationAlerts.length})
          </h4>
          {stationAlerts.length === 0 ? (
            <p className="text-xs text-slate-500">No recent alerts recorded for this station node.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {stationAlerts.map(a => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={a.severity} size="sm" />
                    <span className="font-semibold text-white">{a.pollutant}:</span>
                    <span className="text-slate-300">{a.message}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">{a.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
