import React, { useState } from 'react';
import { AirQualityReading, Station } from '../types/airQuality';
import { StationTable } from '../components/StationTable';
import { AirQualityMap } from '../components/AirQualityMap';
import { StationCard } from '../components/StationCard';
import { Radio, Map as MapIcon, Table, Grid } from 'lucide-react';

interface LiveMonitoringProps {
  stations: Station[];
  readings: AirQualityReading[];
  onSelectStation: (stationId: string) => void;
  selectedStationId?: string | null;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  stations,
  readings,
  onSelectStation,
  selectedStationId,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'map'>('table');

  const readingMap = new Map<string, AirQualityReading>();
  readings.forEach(r => readingMap.set(r.stationId, r));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Continuous Telemetry Stream
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Live Monitoring Console
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time multi-pollutant measurements across all deployed sensor nodes with 5-second cadence.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'table'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'cards'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            Grid Cards
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'map'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Geospatial Map
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' && (
        <StationTable
          stations={stations}
          readings={readings}
          onSelectStation={onSelectStation}
          selectedStationId={selectedStationId}
        />
      )}

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stations.map(station => {
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
      )}

      {viewMode === 'map' && (
        <div className="space-y-4">
          <AirQualityMap
            stations={stations}
            readings={readings}
            selectedStationId={selectedStationId}
            onSelectStation={onSelectStation}
          />
          <div className="text-xs text-slate-500 text-center">
            Click on any station marker to inspect live pollutant levels and launch detailed diagnostics.
          </div>
        </div>
      )}
    </div>
  );
};
