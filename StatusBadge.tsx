import React from 'react';
import { AQICategory, StationStatus, AlertSeverity, AlertStatus } from '../types/airQuality';
import { getCategoryBadgeStyles } from '../services/aqiService';

interface StatusBadgeProps {
  type: 'aqi' | 'station' | 'severity' | 'alertStatus';
  value: AQICategory | StationStatus | AlertSeverity | AlertStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  size = 'md',
  showDot = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  if (type === 'aqi') {
    const category = value as AQICategory;
    const styles = getCategoryBadgeStyles(category);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${styles.badge} ${sizeClasses}`}
      >
        {showDot && (
          <span
            className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`}
            style={{ backgroundColor: styles.hex }}
          />
        )}
        {category}
      </span>
    );
  }

  if (type === 'station') {
    const status = value as StationStatus;
    const isOnline = status === 'online';
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeClasses} ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}
      >
        {showDot && (
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
        )}
        {isOnline ? 'Online' : 'Offline'}
      </span>
    );
  }

  if (type === 'severity') {
    const sev = value as AlertSeverity;
    const config = {
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      moderate: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
    }[sev] || 'bg-slate-700/30 text-slate-300 border-slate-600/30';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border capitalize ${sizeClasses} ${config}`}>
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {sev}
      </span>
    );
  }

  if (type === 'alertStatus') {
    const status = value as AlertStatus;
    const config = {
      Active: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      Acknowledged: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      Resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    }[status] || 'bg-slate-800 text-slate-300 border-slate-700';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${config}`}>
        {showDot && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'Active' ? 'bg-rose-400 animate-ping' : status === 'Acknowledged' ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
        )}
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
      {value}
    </span>
  );
};
