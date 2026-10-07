import React from 'react';
import {
  LayoutDashboard,
  Radio,
  MapPin,
  LineChart,
  Bell,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Wind,
  Award,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'live-monitoring'
  | 'stations'
  | 'analytics'
  | 'alerts'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Radio },
    { id: 'stations', label: 'Stations', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertsCount },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 lg:static ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Wind className="h-6 w-6 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold tracking-tight text-white text-base">
                  AirSense
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  Smart Monitoring
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Team 13 Platform Badge */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Award className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold tracking-wide">Team 13</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-snug">
              Phase 1 • Clean Air Telemetry & Regional IoT Simulation
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as NavTab);
                  onCloseMobile();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}

                {/* Badge if alerts */}
                {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold ${
                      isCollapsed
                        ? 'absolute top-1.5 right-1.5 h-3 min-w-3 p-0 bg-rose-500 text-transparent'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {!isCollapsed && item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-2.5">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col text-[11px]">
                <span className="font-semibold text-slate-300">Engine Online</span>
                <span className="text-[10px] text-slate-500">Autonomous Sensor Loop</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
