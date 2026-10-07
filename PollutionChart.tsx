import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HistoricalReading } from '../types/airQuality';

interface PollutionChartProps {
  data: HistoricalReading[];
  selectedPollutants?: string[]; // e.g. ['pm25', 'pm10']
  title?: string;
  subtitle?: string;
}

export const PollutionChart: React.FC<PollutionChartProps> = ({
  data,
  selectedPollutants = ['pm25', 'pm10', 'no2'],
  title = 'Multi-Pollutant Telemetry Curves',
  subtitle = 'Continuous sensor telemetry trends across particulate & chemical channels',
}) => {
  const pollutantConfigs: Record<
    string,
    { key: keyof HistoricalReading; name: string; color: string; unit: string }
  > = {
    pm25: { key: 'pm25', name: 'PM2.5', color: '#06b6d4', unit: 'µg/m³' },
    pm10: { key: 'pm10', name: 'PM10', color: '#818cf8', unit: 'µg/m³' },
    co: { key: 'co', name: 'CO', color: '#f59e0b', unit: 'mg/m³' },
    no2: { key: 'no2', name: 'NO2', color: '#10b981', unit: 'µg/m³' },
    co2: { key: 'co2', name: 'CO2', color: '#ec4899', unit: 'ppm' },
    temperature: { key: 'temperature', name: 'Temp', color: '#f97316', unit: '°C' },
    humidity: { key: 'humidity', name: 'Humidity', color: '#38bdf8', unit: '%' },
  };

  const activeConfigs = selectedPollutants
    .map(p => pollutantConfigs[p])
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as HistoricalReading;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs min-w-[150px]">
                      <div className="text-slate-400 font-medium mb-1.5">{item.timeLabel}</div>
                      <div className="space-y-1">
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex justify-between items-center gap-3">
                            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-mono font-bold text-white">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />

            {activeConfigs.map(cfg => (
              <Line
                key={cfg.name}
                type="monotone"
                dataKey={cfg.key}
                name={cfg.name}
                stroke={cfg.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
