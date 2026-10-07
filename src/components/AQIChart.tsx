import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { HistoricalReading } from '../types/airQuality';

interface AQIChartProps {
  data: HistoricalReading[];
  title?: string;
  subtitle?: string;
}

export const AQIChart: React.FC<AQIChartProps> = ({
  data,
  title = 'Real-time AQI Trajectory',
  subtitle = 'Continuous historical time series with NAQI category threshold zones',
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Current Curve
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-amber-400/80" /> Poor (100)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-rose-500/80" /> Very Poor (200)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 'dataMax + 40']}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as HistoricalReading;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs">
                      <div className="text-slate-400 mb-1">{item.timeLabel}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">AQI:</span>
                        <span className="font-mono font-bold text-cyan-400 text-sm">{item.aqi}</span>
                      </div>
                      <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                        <div>PM2.5: {item.pm25} µg/m³</div>
                        <div>PM10: {item.pm10} µg/m³</div>
                        <div>CO: {item.co} mg/m³</div>
                        <div>NO2: {item.no2} µg/m³</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={200} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={300} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aqiGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
