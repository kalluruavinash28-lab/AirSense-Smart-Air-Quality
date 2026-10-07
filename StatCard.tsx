import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  statusText?: string;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendPositiveIsGood?: boolean; // e.g. For pollution, up is bad!
  icon: LucideIcon;
  iconColor?: string;
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  statusText,
  trendText,
  trendDirection = 'neutral',
  trendPositiveIsGood = false,
  icon: Icon,
  iconColor = 'text-cyan-400',
  accentColor = 'from-cyan-500/10 to-transparent',
  onClick,
}) => {
  // Determine if trend is favorable or unfavorable
  let trendColor = 'text-slate-400';
  if (trendDirection === 'up') {
    trendColor = trendPositiveIsGood ? 'text-emerald-400' : 'text-rose-400';
  } else if (trendDirection === 'down') {
    trendColor = trendPositiveIsGood ? 'text-rose-400' : 'text-emerald-400';
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${accentColor}`} />

      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
        <div className={`rounded-lg bg-slate-800/80 p-2 ${iconColor} border border-slate-700/50`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
        {statusText && (
          <span className="font-medium text-slate-300">
            {statusText}
          </span>
        )}

        {trendText && (
          <div className={`flex items-center gap-1 font-medium ${trendColor}`}>
            {trendDirection === 'up' && <TrendingUp className="h-3 w-3" />}
            {trendDirection === 'down' && <TrendingDown className="h-3 w-3" />}
            {trendDirection === 'neutral' && <Minus className="h-3 w-3" />}
            <span>{trendText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
