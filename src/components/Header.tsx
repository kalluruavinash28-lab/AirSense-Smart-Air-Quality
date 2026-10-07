import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  ChevronDown,
  User,
  Radio,
  Sliders,
} from 'lucide-react';
import { Alert } from '../types/airQuality';
import { StatusBadge } from './StatusBadge';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  activeAlerts: Alert[];
  onTriggerSpike: () => void;
  onToggleOffline: () => void;
  onSelectTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  demoMode,
  onToggleDemoMode,
  activeAlerts,
  onTriggerSpike,
  onToggleOffline,
  onSelectTab,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/85 px-4 backdrop-blur-md">
      {/* Left side: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <span>AirSense</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-xs font-semibold text-slate-300">Smart Air Quality Monitoring Platform</span>
          </h1>
          <span className="text-[10px] text-slate-400">Environmental Telemetry & Cloud Analytics Network</span>
        </div>
      </div>

      {/* Center: DEMO MODE Indicator & Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition-all shadow-sm ${
            demoMode
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800/60 text-slate-400 border-slate-700'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              demoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className="hidden md:inline uppercase tracking-wider text-[10px]">
            DEMO MODE – SIMULATED SENSOR DATA
          </span>
          <span className="md:hidden uppercase tracking-wider text-[10px]">
            DEMO SIMULATOR
          </span>
          <button
            onClick={onToggleDemoMode}
            className={`ml-1 text-[10px] underline font-medium hover:text-white cursor-pointer`}
          >
            {demoMode ? 'PAUSE' : 'RESUME'}
          </button>
        </div>

        {/* Quick Demo Controls for Evaluators */}
        <div className="hidden xl:flex items-center gap-1.5 border-l border-slate-800 pl-3">
          <button
            onClick={onTriggerSpike}
            className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            title="Inject temporary pollution spike to test dynamic alerts"
          >
            <Zap className="h-3 w-3 text-rose-400" />
            Spike Test
          </button>
          <button
            onClick={onToggleOffline}
            className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Simulate hardware heartbeat timeout / station disconnect"
          >
            <Radio className="h-3 w-3 text-amber-400" />
            Offline Test
          </button>
        </div>
      </div>

      {/* Right side: Clock, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono font-medium">{currentTime}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-400">{currentDate}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Alerts and Notifications"
          >
            <Bell className="h-4 w-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[9px] font-black text-white ring-2 ring-slate-950 animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Real-time Notifications
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {activeAlerts.length} active
                </span>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
                  All monitoring stations operating within normal parameters.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeAlerts.slice(0, 4).map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        onSelectTab('alerts');
                      }}
                      className="cursor-pointer rounded-lg bg-slate-950 p-2.5 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white truncate">{alert.stationName}</span>
                        <StatusBadge type="severity" value={alert.severity} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{alert.message}</p>
                      <span className="font-mono text-[9px] text-slate-500 mt-1 block">
                        {alert.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setNotificationsOpen(false);
                  onSelectTab('alerts');
                }}
                className="mt-3 w-full rounded-lg bg-slate-800 py-1.5 text-center font-semibold text-cyan-400 hover:bg-slate-700 transition-colors text-[11px]"
              >
                View All System Alerts
              </button>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 pl-2.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex flex-col text-left text-xs hidden sm:flex">
              <span className="font-bold text-white text-[11px] leading-tight">Team 13</span>
              <span className="text-[10px] text-cyan-400">AirSense Network</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs">
              <User className="h-4 w-4 text-white" />
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-xs">
              <div className="p-2 border-b border-slate-800">
                <p className="font-bold text-white">Team 13</p>
                <p className="text-[11px] text-slate-400">Smart Cities / Environmental IoT</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onSelectTab('settings');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                  Engine Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onSelectTab('reports');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  Audit & Reports
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
