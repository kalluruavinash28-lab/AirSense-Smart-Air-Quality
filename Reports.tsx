import React, { useState } from 'react';
import { AirQualityReading, Alert, Station } from '../types/airQuality';
import { generateReportSummary, downloadCSVReport } from '../services/reportService';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Wind,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

interface ReportsProps {
  stations: Station[];
  readings: AirQualityReading[];
  alerts: Alert[];
}

export const Reports: React.FC<ReportsProps> = ({ stations, readings, alerts }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const summary = generateReportSummary(stations, readings, alerts);

  const handleDownload = () => {
    downloadCSVReport(readings, alerts, summary);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Compliance & Environmental Auditing
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Air Quality Reports & Data Export
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Automated compliance summaries, CPCB standard benchmarking, and raw telemetry export.
          </p>
        </div>

        {/* Download CSV Report Button (Section 12 requirement) */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>CSV Exported Successfully!</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download CSV Report</span>
            </>
          )}
        </button>
      </div>

      {/* Required Report Metrics Cards Grid (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Average AQI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Fleet Average AQI
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">
            {summary.averageAqi}
          </div>
          <span className="text-xs text-cyan-400 mt-1 block">CPCB Standard (0-500 Scale)</span>
        </div>

        {/* 2. Maximum AQI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Maximum AQI Spike
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-rose-400">
            {summary.maximumAqi}
          </div>
          <span className="text-xs text-slate-400 mt-1 block truncate">
            {summary.maxStationName}
          </span>
        </div>

        {/* 3. Minimum AQI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Minimum AQI (Cleanest)
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-emerald-400">
            {summary.minimumAqi}
          </div>
          <span className="text-xs text-slate-400 mt-1 block truncate">
            {summary.minStationName}
          </span>
        </div>

        {/* 4. Average PM2.5 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Average PM2.5 Level
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-cyan-400">
            {summary.averagePm25} <span className="text-xs font-normal text-slate-400">µg/m³</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Annual limit: 40 µg/m³</span>
        </div>

        {/* 5. Most Polluted Station */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm sm:col-span-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Most Polluted Station
          </span>
          <div className="mt-2 text-lg font-bold text-amber-300">
            {summary.mostPollutedStation}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Priority remediation hotspot identified across current telemetry window.
          </span>
        </div>

        {/* 6. Most Common Dominant Pollutant */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Most Common Pollutant
          </span>
          <div className="mt-2 font-mono text-2xl font-black text-indigo-400">
            {summary.mostCommonPollutant}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Primary driver of AQI score</span>
        </div>

        {/* 7. Number of Alerts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Incident Alerts
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">
            {summary.totalAlertsCount}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.activeAlertsCount} active • {summary.totalAlertsCount - summary.activeAlertsCount} acknowledged/resolved
          </span>
        </div>
      </div>

      {/* Station Telemetry Audit Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              Regional Telemetry Audit Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Snapshot of active measurements exported in the CSV report document.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Generated: {summary.generatedAt}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Node ID</th>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">AQI</th>
                <th className="py-2.5 px-3">PM2.5</th>
                <th className="py-2.5 px-3">PM10</th>
                <th className="py-2.5 px-3">CO</th>
                <th className="py-2.5 px-3">NO2</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {readings.map(r => (
                <tr key={r.stationId} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-cyan-400 font-bold">{r.stationId}</td>
                  <td className="py-2 px-3 font-sans font-medium text-white">{r.stationName}</td>
                  <td className="py-2 px-3 font-sans">{r.city}</td>
                  <td className="py-2 px-3 font-bold text-white">{r.status === 'offline' ? '--' : r.aqi}</td>
                  <td className="py-2 px-3">{r.status === 'offline' ? '--' : `${r.pm25} µg/m³`}</td>
                  <td className="py-2 px-3">{r.status === 'offline' ? '--' : `${r.pm10} µg/m³`}</td>
                  <td className="py-2 px-3">{r.status === 'offline' ? '--' : `${r.co} mg/m³`}</td>
                  <td className="py-2 px-3">{r.status === 'offline' ? '--' : `${r.no2} µg/m³`}</td>
                  <td className="py-2 px-3">
                    <span className={r.status === 'online' ? 'text-emerald-400' : 'text-rose-400'}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
