import React, { useState } from 'react';
import { AirQualityReading, Station } from '../types/airQuality';
import { StatusBadge } from './StatusBadge';
import { calculateAQI } from '../services/aqiService';
import { Search, Filter, ChevronRight, Activity, ArrowUpDown } from 'lucide-react';

interface StationTableProps {
  stations: Station[];
  readings: AirQualityReading[];
  onSelectStation: (stationId: string) => void;
  selectedStationId?: string | null;
}

type FilterCategory = 'all' | 'online' | 'offline' | 'Good' | 'Moderate' | 'Poor' | 'critical';

export const StationTable: React.FC<StationTableProps> = ({
  stations,
  readings,
  onSelectStation,
  selectedStationId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [sortField, setSortField] = useState<keyof AirQualityReading>('aqi');
  const [sortAsc, setSortAsc] = useState(false);

  const readingMap = new Map<string, AirQualityReading>();
  readings.forEach(r => readingMap.set(r.stationId, r));

  // Merge station info with current readings
  const rowData = stations.map(station => {
    const reading = readingMap.get(station.stationId) || station.currentReading;
    return {
      station,
      reading,
    };
  });

  // Filter rows
  const filteredRows = rowData.filter(({ station, reading }) => {
    const matchesSearch =
      station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.stationId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'online') return reading.status === 'online';
    if (filter === 'offline') return reading.status === 'offline';
    if (filter === 'Good') return reading.category === 'Good';
    if (filter === 'Moderate') return reading.category === 'Moderate';
    if (filter === 'Poor') return reading.category === 'Poor';
    if (filter === 'critical') return reading.category === 'Very Poor' || reading.category === 'Severe';

    return true;
  });

  // Sort rows
  filteredRows.sort((a, b) => {
    const valA = a.reading[sortField];
    const valB = b.reading[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof AirQualityReading) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search stations, cities or node IDs..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {(
            [
              { id: 'all', label: 'All Stations' },
              { id: 'online', label: 'Online' },
              { id: 'offline', label: 'Offline' },
              { id: 'Good', label: 'Good' },
              { id: 'Moderate', label: 'Moderate' },
              { id: 'Poor', label: 'Poor' },
              { id: 'critical', label: 'Critical' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Station</th>
              <th className="py-3 px-3">City</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('aqi')}
              >
                <div className="flex items-center gap-1">
                  AQI <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('pm25')}
              >
                <div className="flex items-center gap-1">
                  PM2.5 <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('pm10')}
              >
                <div className="flex items-center gap-1">
                  PM10 <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3">CO</th>
              <th className="py-3 px-3">NO2</th>
              <th className="py-3 px-3">Temp</th>
              <th className="py-3 px-3">Humidity</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Last Updated</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-500">
                  No monitoring stations match current filter criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map(({ station, reading }) => {
                const aqiRes = calculateAQI(reading.pm25, reading.pm10, reading.co, reading.no2);
                const isSelected = selectedStationId === station.stationId;
                const isOffline = reading.status === 'offline';

                return (
                  <tr
                    key={station.stationId}
                    onClick={() => onSelectStation(station.stationId)}
                    className={`cursor-pointer transition-colors hover:bg-slate-800/40 ${
                      isSelected ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-cyan-400" />
                        <div>
                          <div>{station.stationName}</div>
                          <div className="font-mono text-[10px] text-slate-500">{station.stationId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">
                      {station.city}
                    </td>
                    <td className="py-3.5 px-3">
                      {isOffline ? (
                        <span className="text-slate-500 font-mono">--</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono font-bold text-sm"
                            style={{ color: aqiRes.color.hex }}
                          >
                            {reading.aqi}
                          </span>
                          <StatusBadge type="aqi" value={reading.category} size="sm" showDot={false} />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-200">
                      {isOffline ? '--' : `${reading.pm25} µg/m³`}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-200">
                      {isOffline ? '--' : `${reading.pm10} µg/m³`}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {isOffline ? '--' : `${reading.co} mg/m³`}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {isOffline ? '--' : `${reading.no2} µg/m³`}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {isOffline ? '--' : `${reading.temperature}°C`}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {isOffline ? '--' : `${reading.humidity}%`}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge type="station" value={reading.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-slate-400 font-mono">
                      {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectStation(station.stationId);
                        }}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Inspect <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
