import React from 'react';
import {
  AirQualityReading,
  Station,
  Alert,
  DashboardStatistics,
  HistoricalReading,
} from '../types/airQuality';
import { StatCard } from '../components/StatCard';
import { AQICard } from '../components/AQICard';
import { AirQualityMap } from '../components/AirQualityMap';
import { AQIChart } from '../components/AQIChart';
import { PollutionChart } from '../components/PollutionChart';
import { AlertCard } from '../components/AlertCard';
import {
  Wind,
  Activity,
  Radio,
  Bell,
  Thermometer,
  Droplets,
  Flame,
  CloudFog,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  stations: Station[];
  readings: AirQualityReading[];
  alerts: Alert[];
  stats: DashboardStatistics;
  history: HistoricalReading[];
  onSelectStation: (stationId: string) => void;
  onSelectTab: (tab: any) => void;
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stations,
  readings,
  alerts,
  stats,
  history,
  onSelectStation,
  onSelectTab,
  onAcknowledgeAlert,
  onResolveAlert,
}) => {
  const activeAlerts = alerts.filter(a => a.status === 'Active');

  // Compute fleet averages for hero AQI
  const validReadings = readings.filter(r => r.status === 'online');
  const targetReadings = validReadings.length > 0 ? validReadings : readings;

  const avgPm25 =
    Math.round(
      (targetReadings.reduce((acc, curr) => acc + curr.pm25, 0) / (targetReadings.length || 1)) *
        10
    ) / 10;
  const avgPm10 =
    Math.round(
      (targetReadings.reduce((acc, curr) => acc + curr.pm10, 0) / (targetReadings.length || 1)) *
        10
    ) / 10;
  const avgCo =
    Math.round(
      (targetReadings.reduce((acc, curr) => acc + curr.co, 0) / (targetReadings.length || 1)) * 10
    ) / 10;
  const avgNo2 =
    Math.round(
      (targetReadings.reduce((acc, curr) => acc + curr.no2, 0) / (targetReadings.length || 1)) *
        10
    ) / 10;

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current AQI"
          value={stats.currentAqi}
          unit="CPCB Index"
          statusText={stats.aqiCategory}
          trendText={`${stats.aqiTrendPercent > 0 ? '↑' : '↓'} ${Math.abs(stats.aqiTrendPercent)}% from previous hour`}
          trendDirection={stats.aqiTrendPercent > 0 ? 'up' : 'down'}
          trendPositiveIsGood={false}
          icon={Wind}
          iconColor="text-cyan-400"
          accentColor="from-cyan-500 to-blue-500"
        />

        <StatCard
          title="Average AQI"
          value={stats.averageAqi}
          unit="Regional Fleet"
          statusText="Across 5 City Nodes"
          trendText="↓ 2.4% day-over-day"
          trendDirection="down"
          trendPositiveIsGood={true}
          icon={Activity}
          iconColor="text-emerald-400"
          accentColor="from-emerald-500 to-teal-500"
        />

        <StatCard
          title="Active Stations"
          value={`${stats.activeStationsCount}/${stats.totalStationsCount}`}
          unit="Nodes"
          statusText={
            stats.activeStationsCount === stats.totalStationsCount
              ? 'All Nodes Online'
              : `${stats.totalStationsCount - stats.activeStationsCount} Node Disconnected`
          }
          trendText="100% Heartbeat uptime target"
          trendDirection="neutral"
          icon={Radio}
          iconColor={stats.activeStationsCount === stats.totalStationsCount ? 'text-emerald-400' : 'text-amber-400'}
          accentColor="from-indigo-500 to-violet-500"
          onClick={() => onSelectTab('stations')}
        />

        <StatCard
          title="Active Alerts"
          value={stats.activeAlertsCount}
          unit="Incidents"
          statusText={
            stats.activeAlertsCount === 0
              ? 'Safe Thresholds'
              : `${stats.activeAlertsCount} Threshold Breaches`
          }
          trendText={stats.activeAlertsCount > 0 ? 'Requires attention' : 'Normal parameters'}
          trendDirection={stats.activeAlertsCount > 0 ? 'up' : 'neutral'}
          trendPositiveIsGood={false}
          icon={Bell}
          iconColor={stats.activeAlertsCount > 0 ? 'text-rose-400' : 'text-slate-400'}
          accentColor="from-rose-500 to-pink-500"
          onClick={() => onSelectTab('alerts')}
        />
      </div>

      {/* Hero AQI Card + Secondary Environmental Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <AQICard
            pm25={avgPm25}
            pm10={avgPm10}
            co={avgCo}
            no2={avgNo2}
            stationName="Regional Fleet Monitoring Index"
            city="Karnataka & Tamil Nadu Corridors"
            lastUpdated={readings[0]?.timestamp ? new Date(readings[0].timestamp).toLocaleTimeString() : undefined}
          />
        </div>

        {/* 6 Secondary Pollutants & Environmental Metrics Grid */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">PM2.5</span>
              <CloudFog className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">{stats.avgPm25}</div>
            <div className="text-[10px] text-slate-400 mt-1">µg/m³ • Fine particulates</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">PM10</span>
              <CloudFog className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">{stats.avgPm10}</div>
            <div className="text-[10px] text-slate-400 mt-1">µg/m³ • Inhalable dust</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">CO</span>
              <Flame className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">{stats.avgCo}</div>
            <div className="text-[10px] text-slate-400 mt-1">mg/m³ • Carbon monoxide</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">NO2</span>
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">{stats.avgNo2}</div>
            <div className="text-[10px] text-slate-400 mt-1">µg/m³ • Vehicular emission</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Temp</span>
              <Thermometer className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">{stats.avgTemp}°C</div>
            <div className="text-[10px] text-slate-400 mt-1">Ambient air temperature</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Humidity</span>
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="font-mono text-xl font-bold text-white">{stats.avgHumidity}%</div>
            <div className="text-[10px] text-slate-400 mt-1">Relative humidity</div>
          </div>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Regional Telemetry & Geographic Fleet Map
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Leaflet GIS map with real-time NAQI pin markers across monitoring nodes.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('live-monitoring')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Open Live Table <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <AirQualityMap
          stations={stations}
          readings={readings}
          onSelectStation={onSelectStation}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AQIChart
          data={history}
          title="Fleet Composite AQI Trajectory"
          subtitle="Real-time multi-station aggregated AQI curve"
        />
        <PollutionChart
          data={history}
          title="Particulate & Gaseous Trends"
          subtitle="Continuous PM2.5, PM10, and NO2 sensor readings"
        />
      </div>

      {/* Active Alerts Preview */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Active Threshold Alerts ({activeAlerts.length})
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('alerts')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Manage All Alerts <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.slice(0, 2).map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledgeAlert}
                onResolve={onResolveAlert}
                onInspectStation={onSelectStation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
