import React from 'react';
import { Alert } from '../types/airQuality';
import { StatusBadge } from './StatusBadge';
import { AlertTriangle, CheckCircle, Clock, MapPin, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onInspectStation?: (stationId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onInspectStation,
}) => {
  const isCritical = alert.severity === 'critical';
  const isHigh = alert.severity === 'high';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4.5 backdrop-blur-sm transition-all duration-200 ${
        alert.status === 'Active'
          ? isCritical
            ? 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-950/20'
            : isHigh
            ? 'border-amber-500/40 bg-amber-950/20'
            : 'border-yellow-500/30 bg-slate-900/90'
          : alert.status === 'Acknowledged'
          ? 'border-slate-700 bg-slate-900/60 opacity-90'
          : 'border-slate-800 bg-slate-950/40 opacity-70'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left header */}
        <div className="flex items-start gap-3">
          <div
            className={`rounded-lg p-2.5 mt-0.5 border ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                : isHigh
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">{alert.id}</span>
              <StatusBadge type="severity" value={alert.severity} size="sm" />
              <StatusBadge type="alertStatus" value={alert.status} size="sm" />
            </div>

            <h4 className="mt-1 text-sm font-bold text-white flex items-center gap-1.5">
              <span>{alert.pollutant} Threshold Exceeded</span>
              <span className="text-slate-400 font-normal">at</span>
              <span className="text-cyan-400">{alert.stationName}</span>
            </h4>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                {alert.city}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3 w-3 text-slate-500" />
                {alert.timestamp}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-start">
          {alert.status === 'Active' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
            >
              <Clock className="h-3.5 w-3.5" />
              Acknowledge
            </button>
          )}

          {alert.status !== 'Resolved' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Resolve
            </button>
          )}

          {onInspectStation && (
            <button
              onClick={() => onInspectStation(alert.stationId)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Inspect Station"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alert body & threshold details */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
        <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

        {alert.pollutant !== 'Telemetry Status' && (
          <div className="mt-3 flex items-center gap-4 text-xs font-mono">
            <div className="rounded-md bg-slate-950/80 border border-slate-800 px-3 py-1.5 flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">CURRENT VALUE:</span>
              <span className="font-bold text-rose-400 text-sm">
                {alert.currentValue} {alert.unit}
              </span>
            </div>

            <div className="rounded-md bg-slate-950/80 border border-slate-800 px-3 py-1.5 flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">SAFETY LIMIT:</span>
              <span className="font-medium text-slate-300 text-sm">
                {alert.threshold} {alert.unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
