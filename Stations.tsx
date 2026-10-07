import React, { useState } from 'react';
import { Station, AirQualityReading, Alert } from '../types/airQuality';
import { StationCard } from '../components/StationCard';
import { calculateAQI } from '../services/aqiService';
import {
  MapPin,
  Search,
  Plus,
  Cpu,
  ShieldCheck,
  Radio,
  Zap,
} from 'lucide-react';

interface StationsProps {
  stations: Station[];
  readings: AirQualityReading[];
  alerts: Alert[];
  onSelectStation: (stationId: string) => void;
  onTriggerSpike: (stationId: string) => void;
  onToggleOffline: (stationId: string) => void;
}

export const Stations: React.FC<StationsProps> = ({
  stations,
  readings,
  alerts,
  onSelectStation,
  onTriggerSpike,
  onToggleOffline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const readingMap = new Map<string, AirQualityReading>();
  readings.forEach(r => readingMap.set(r.stationId, r));

  const cities = ['all', ...Array.from(new Set(stations.map(s => s.city)))];

  const filteredStations = stations.filter(station => {
    const matchesSearch =
      station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.stationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.sensorModel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'all' || station.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  const onlineCount = readings.filter(r => r.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Hardware Fleet Infrastructure
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Monitoring Stations Fleet
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {stations.length} Registered IoT Sensor Nodes across Southern India • {onlineCount} active nodes streaming telemetry.
          </p>
        </div>

        {/* Fleet KPI Pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px]">FLEET UPTIME</span>
              <span className="font-mono font-bold text-white">
                {Math.round((onlineCount / stations.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search station ID, name or sensor..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> City:
          </span>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedCity === city
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Stations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStations.map(station => {
          const reading = readingMap.get(station.stationId) || station.currentReading;
          return (
            <StationCard
              key={station.stationId}
              station={station}
              reading={reading}
              onViewDetails={onSelectStation}
            />
          );
        })}
      </div>
    </div>
  );
};
