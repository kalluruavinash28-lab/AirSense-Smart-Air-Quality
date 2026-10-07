import React from 'react';
import { SimulatorSettings } from '../types/airQuality';
import {
  Sliders,
  Bell,
  Gauge,
  Radio,
  RotateCcw,
  ShieldAlert,
  Save,
  Zap,
} from 'lucide-react';

interface SettingsProps {
  settings: SimulatorSettings;
  onUpdateSettings: (newSettings: Partial<SimulatorSettings>) => void;
  onResetDefaults: () => void;
  onTriggerSpike: () => void;
  onToggleOffline: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
  onTriggerSpike,
  onToggleOffline,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Simulation & System Configuration
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Platform Settings & Thresholds
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Configure telemetry polling cadence, environmental safety limits, demo simulator modes, and notification triggers.
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Defaults
        </button>
      </div>

      {/* Section 1: Demo Mode & Simulator Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Radio className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Simulated Sensor Engine
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Active Demo Simulation</span>
              <p className="text-slate-400 mt-0.5">
                Automatically generate continuous drift and telemetry updates every interval without physical hardware.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.demoMode}
                onChange={e => onUpdateSettings({ demoMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Update Interval Slider */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Sensor Telemetry Cadence</span>
                <span className="text-slate-400">Frequency of simulated sensor reading packet generation.</span>
              </div>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {settings.updateIntervalSeconds} seconds
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] text-slate-500">2s (Fast)</span>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={settings.updateIntervalSeconds}
                onChange={e => onUpdateSettings({ updateIntervalSeconds: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">15s (Slow)</span>
            </div>
          </div>

          {/* Random Spikes & Offline toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Autonomous Pollution Spikes</span>
                <span className="text-slate-400 text-[11px]">Occasionally inject sudden pollution surges</span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSpikes}
                onChange={e => onUpdateSettings({ allowSpikes: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Watchdog Offline Simulation</span>
                <span className="text-slate-400 text-[11px]">Simulate occasional network packet drops</span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowOfflineSim}
                onChange={e => onUpdateSettings({ allowOfflineSim: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500"
              />
            </div>
          </div>

          {/* Quick Demo Action Buttons */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-slate-400">Instant Event Triggers for Live Demonstration:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onTriggerSpike}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                Trigger Sudden Spike Now
              </button>
              <button
                onClick={onToggleOffline}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="h-3.5 w-3.5" />
                Toggle Node Offline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Alert Thresholds */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Alert Threshold Limits (CPCB Aligned)
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          When continuous sensor telemetry exceeds these values, the incident response watchdog automatically generates a new alert.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="text-slate-400 uppercase text-[10px] font-bold block">
              PM2.5 Limit (µg/m³)
            </label>
            <input
              type="number"
              value={settings.thresholdPm25}
              onChange={e => onUpdateSettings({ thresholdPm25: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-sm"
            />
            <span className="text-[10px] text-slate-500 block">Default: 60 (Moderate cutoff)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="text-slate-400 uppercase text-[10px] font-bold block">
              PM10 Limit (µg/m³)
            </label>
            <input
              type="number"
              value={settings.thresholdPm10}
              onChange={e => onUpdateSettings({ thresholdPm10: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-sm"
            />
            <span className="text-[10px] text-slate-500 block">Default: 100 (CPCB 24h standard)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="text-slate-400 uppercase text-[10px] font-bold block">
              CO Limit (mg/m³)
            </label>
            <input
              type="number"
              step="0.5"
              value={settings.thresholdCo}
              onChange={e => onUpdateSettings({ thresholdCo: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-sm"
            />
            <span className="text-[10px] text-slate-500 block">Default: 3.0 mg/m³</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="text-slate-400 uppercase text-[10px] font-bold block">
              NO2 Limit (µg/m³)
            </label>
            <input
              type="number"
              value={settings.thresholdNo2}
              onChange={e => onUpdateSettings({ thresholdNo2: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-sm"
            />
            <span className="text-[10px] text-slate-500 block">Default: 80 µg/m³</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 sm:col-span-2">
            <label className="text-slate-400 uppercase text-[10px] font-bold block">
              Composite AQI Alert Cutoff
            </label>
            <input
              type="number"
              value={settings.thresholdAqi}
              onChange={e => onUpdateSettings({ thresholdAqi: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-sm"
            />
            <span className="text-[10px] text-slate-500 block">Default: 150 (Unhealthy trigger)</span>
          </div>
        </div>
      </div>

      {/* Section 3: Preferences */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Bell className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            UI & Notification Preferences
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Theme Appearance</span>
              <span className="text-slate-400 text-[11px]">Dark Environmental Theme (High Contrast)</span>
            </div>
            <select
              value={settings.theme}
              onChange={e => onUpdateSettings({ theme: e.target.value as any })}
              className="bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs"
            >
              <option value="dark">Dark Theme</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Auditory Tone on Alerts</span>
              <span className="text-slate-400 text-[11px]">Chime on critical air quality spikes</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundAlerts}
              onChange={e => onUpdateSettings({ soundAlerts: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
