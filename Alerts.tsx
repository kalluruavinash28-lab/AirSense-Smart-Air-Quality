import React, { useState } from 'react';
import { Alert, AlertStatus } from '../types/airQuality';
import { AlertCard } from '../components/AlertCard';
import {
  Bell,
  CheckCheck,
  Filter,
  ShieldAlert,
  Zap,
  Search,
} from 'lucide-react';

interface AlertsProps {
  alerts: Alert[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
  onResolveAll: () => void;
  onInspectStation: (stationId: string) => void;
  onTriggerSpike: () => void;
}

export const Alerts: React.FC<AlertsProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onAcknowledgeAll,
  onResolveAll,
  onInspectStation,
  onTriggerSpike,
}) => {
  const [filter, setFilter] = useState<'all' | AlertStatus | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCount = alerts.filter(a => a.status === 'Active').length;
  const ackCount = alerts.filter(a => a.status === 'Acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.pollutant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'critical') return alert.severity === 'critical';
    return alert.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Autonomous Risk Detection Engine
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Environmental Incident Alerts
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time threshold breaches, rapid sensor drift alerts, and telemetry watchdog events.
          </p>
        </div>

        {/* Global Alert Action Buttons */}
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Ack All ({activeCount})
            </button>
          )}

          {activeCount + ackCount > 0 && (
            <button
              onClick={onResolveAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Resolve All
            </button>
          )}

          <button
            onClick={onTriggerSpike}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            title="Inject simulated spike to test alerting system"
          >
            <Zap className="h-4 w-4" />
            Test Spike
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('Active')}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-sm transition-all ${
            filter === 'Active'
              ? 'border-rose-500/50 bg-rose-950/30 ring-1 ring-rose-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold uppercase tracking-wider">
            <span>Active Incidents</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">{activeCount}</div>
          <p className="mt-1 text-[11px] text-slate-400">Exceeding national health limit guidelines</p>
        </div>

        <div
          onClick={() => setFilter('Acknowledged')}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-sm transition-all ${
            filter === 'Acknowledged'
              ? 'border-amber-500/50 bg-amber-950/30 ring-1 ring-amber-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <span>Acknowledged</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">{ackCount}</div>
          <p className="mt-1 text-[11px] text-slate-400">Reviewed by environmental operations lead</p>
        </div>

        <div
          onClick={() => setFilter('Resolved')}
          className={`cursor-pointer rounded-xl border p-4 backdrop-blur-sm transition-all ${
            filter === 'Resolved'
              ? 'border-emerald-500/50 bg-emerald-950/30 ring-1 ring-emerald-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <span>Resolved</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">{resolvedCount}</div>
          <p className="mt-1 text-[11px] text-slate-400">Pollution subsided or mitigation applied</p>
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
            placeholder="Search pollutant, station, ID..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {(
            [
              { id: 'all', label: 'All Alerts' },
              { id: 'Active', label: 'Active' },
              { id: 'Acknowledged', label: 'Acknowledged' },
              { id: 'Resolved', label: 'Resolved' },
              { id: 'critical', label: 'Critical Severity' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">No alerts match current filter criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Test Spike&quot; above to simulate an emergency pollution surge.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledgeAlert}
              onResolve={onResolveAlert}
              onInspectStation={onInspectStation}
            />
          ))
        )}
      </div>
    </div>
  );
};
