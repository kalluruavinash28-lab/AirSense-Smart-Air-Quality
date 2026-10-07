import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Station, AirQualityReading, HistoricalReading } from '../types/airQuality';
import { getStationHistory, getAggregatedHistory } from '../services/sensorSimulator';
import { LineChart as LineChartIcon, BarChart3, Filter, Clock, MapPin } from 'lucide-react';

interface AnalyticsProps {
  stations: Station[];
  readings: AirQualityReading[];
  onSelectStation: (stationId: string) => void;
}

type Timeframe = '1h' | '6h' | '24h' | '7d';
type PollutantOption = 'aqi' | 'pm25' | 'pm10' | 'co' | 'no2' | 'all';

export const Analytics: React.FC<AnalyticsProps> = ({
  stations,
  readings,
  onSelectStation,
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantOption>('aqi');
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');

  // Retrieve data based on station filter
  const rawHistory: HistoricalReading[] =
    selectedStation === 'all'
      ? getAggregatedHistory()
      : getStationHistory(selectedStation);

  // Filter timeframe points
  const pointsToTake = {
    '1h': 8,
    '6h': 16,
    '24h': 36,
    '7d': 50,
  }[timeframe];

  const history = rawHistory.slice(-pointsToTake);

  // Multi-station comparison dataset
  const comparisonData = stations.map(station => {
    const reading = readings.find(r => r.stationId === station.stationId) || station.currentReading;
    return {
      name: station.stationName.split(' ')[0],
      fullName: station.stationName,
      city: station.city,
      aqi: reading.status === 'offline' ? 0 : reading.aqi,
      pm25: reading.status === 'offline' ? 0 : reading.pm25,
      pm10: reading.status === 'offline' ? 0 : reading.pm10,
      no2: reading.status === 'offline' ? 0 : reading.no2,
      co: reading.status === 'offline' ? 0 : reading.co,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Historical Diagnostics & Modeling
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Environmental Analytics
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Multi-temporal regression, pollutant trajectory comparisons, and station cross-correlation.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Station Select */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Monitoring Node
          </label>
          <select
            value={selectedStation}
            onChange={e => setSelectedStation(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Stations (Aggregated Fleet)</option>
            {stations.map(st => (
              <option key={st.stationId} value={st.stationId}>
                {st.stationName} ({st.city})
              </option>
            ))}
          </select>
        </div>

        {/* Pollutant Filter */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-cyan-400" /> Pollutant Channel
          </label>
          <select
            value={selectedPollutant}
            onChange={e => setSelectedPollutant(e.target.value as PollutantOption)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="aqi">AQI (Composite Index)</option>
            <option value="pm25">PM2.5 (Fine Particulates)</option>
            <option value="pm10">PM10 (Coarse Inhalables)</option>
            <option value="co">CO (Carbon Monoxide)</option>
            <option value="no2">NO2 (Nitrogen Dioxide)</option>
            <option value="all">All Channels (Combined)</option>
          </select>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-cyan-400" /> Time Window
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { id: '1h', label: '1 Hour' },
                { id: '6h', label: '6 Hours' },
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
              ] as const
            ).map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === t.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Filtered Time Series Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {selectedPollutant === 'aqi'
                ? 'AQI Trajectory & Standard NAQI Danger Zones'
                : selectedPollutant === 'all'
                ? 'Multi-Channel Environmental Telemetry Overlay'
                : `${selectedPollutant.toUpperCase()} Concentration Curve`}
            </h3>
            <p className="text-xs text-slate-400">
              Sensor readings for {selectedStation === 'all' ? 'Fleet Average' : selectedStation} over the last {timeframe}
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedPollutant === 'aqi' ? (
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsAqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 'dataMax + 30']} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as HistoricalReading;
                      return (
                        <div className="rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs">
                          <div className="text-slate-400 mb-1">{item.timeLabel}</div>
                          <div className="font-mono font-bold text-cyan-400 text-sm">AQI: {item.aqi}</div>
                          <div className="text-[10px] text-slate-400 mt-1">PM2.5: {item.pm25} µg/m³</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Good', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Moderate', fill: '#eab308', fontSize: 10 }} />
                <ReferenceLine y={200} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Poor', fill: '#f97316', fontSize: 10 }} />
                <ReferenceLine y={300} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Very Poor', fill: '#ef4444', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#analyticsAqiGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            ) : (
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />

                {(selectedPollutant === 'pm25' || selectedPollutant === 'all') && (
                  <Line type="monotone" dataKey="pm25" name="PM2.5 (µg/m³)" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                )}
                {(selectedPollutant === 'pm10' || selectedPollutant === 'all') && (
                  <Line type="monotone" dataKey="pm10" name="PM10 (µg/m³)" stroke="#818cf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                )}
                {(selectedPollutant === 'co' || selectedPollutant === 'all') && (
                  <Line type="monotone" dataKey="co" name="CO (mg/m³)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                )}
                {(selectedPollutant === 'no2' || selectedPollutant === 'all') && (
                  <Line type="monotone" dataKey="no2" name="NO2 (µg/m³)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Station Comparison Chart (Section 8 requirement: Station comparison) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Cross-Station Pollution Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Comparative benchmark of current AQI and particulate concentrations across all 5 regional stations
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs">
                        <div className="font-bold text-white">{item.fullName}</div>
                        <div className="text-slate-400 mb-1 text-[11px]">{item.city}</div>
                        <div className="space-y-0.5 mt-1 font-mono">
                          <div className="text-cyan-400">AQI: {item.aqi}</div>
                          <div className="text-slate-300">PM2.5: {item.pm25} µg/m³</div>
                          <div className="text-slate-300">PM10: {item.pm10} µg/m³</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
              <Bar dataKey="aqi" name="AQI Index" fill="#06b6d4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="pm25" name="PM2.5 (µg/m³)" fill="#818cf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="pm10" name="PM10 (µg/m³)" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
