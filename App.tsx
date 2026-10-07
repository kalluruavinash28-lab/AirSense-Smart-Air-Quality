import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AirQualityReading,
  Station,
  Alert,
  DashboardStatistics,
  HistoricalReading,
  SimulatorSettings,
} from './types/airQuality';
import {
  initializeSimulator,
  stepSimulation,
  triggerManualSpike,
  toggleManualOffline,
  getAggregatedHistory,
} from './services/sensorSimulator';
import {
  DEFAULT_THRESHOLDS,
  evaluateReadingForAlerts,
  acknowledgeAlert,
  resolveAlert,
  getInitialSeedAlerts,
} from './services/alertService';
import { calculateAQI } from './services/aqiService';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { StationDetailModal } from './components/StationDetailModal';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Stations } from './pages/Stations';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
const API_BASE_URL =
  'https://airsense-api-2026-afe5d4f5ewgzgxaf.centralindia-01.azurewebsites.net';
export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Station & Readings State
  const [stations, setStations] = useState<Station[]>([]);
  const [readings, setReadings] = useState<AirQualityReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<HistoricalReading[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Toast Banner for critical events
  const [latestToast, setLatestToast] = useState<{ id: string; message: string; type: 'alert' | 'info' } | null>(null);

  // Settings State (Kept in application state, no localStorage needed)
  const [settings, setSettings] = useState<SimulatorSettings>({
    demoMode: true,
    updateIntervalSeconds: 5,
    allowSpikes: true,
    allowOfflineSim: true,
    thresholdPm25: DEFAULT_THRESHOLDS.pm25,
    thresholdPm10: DEFAULT_THRESHOLDS.pm10,
    thresholdCo: DEFAULT_THRESHOLDS.co,
    thresholdNo2: DEFAULT_THRESHOLDS.no2,
    thresholdAqi: DEFAULT_THRESHOLDS.aqi,
    theme: 'dark',
    soundAlerts: false,
  });

  // Calculate live Dashboard Statistics
  const computeStats = useCallback(
    (currentReadings: AirQualityReading[], currentAlerts: Alert[]): DashboardStatistics => {
      const activeReadings = currentReadings.filter(r => r.status === 'online');
      const target = activeReadings.length > 0 ? activeReadings : currentReadings;

      const sumAqi = target.reduce((acc, r) => acc + r.aqi, 0);
      const avgAqi = target.length > 0 ? Math.round(sumAqi / target.length) : 0;

      const sumPm25 = target.reduce((acc, r) => acc + r.pm25, 0);
      const sumPm10 = target.reduce((acc, r) => acc + r.pm10, 0);
      const sumCo = target.reduce((acc, r) => acc + r.co, 0);
      const sumCo2 = target.reduce((acc, r) => acc + r.co2, 0);
      const sumNo2 = target.reduce((acc, r) => acc + r.no2, 0);
      const sumTemp = target.reduce((acc, r) => acc + r.temperature, 0);
      const sumHum = target.reduce((acc, r) => acc + r.humidity, 0);

      const n = target.length || 1;
      const compositeRes = calculateAQI(sumPm25 / n, sumPm10 / n, sumCo / n, sumNo2 / n);

      const activeStations = currentReadings.filter(r => r.status === 'online').length;
      const activeAlertsCount = currentAlerts.filter(a => a.status === 'Active').length;

      return {
        currentAqi: avgAqi,
        aqiCategory: compositeRes.category,
        averageAqi: avgAqi,
        activeStationsCount: activeStations,
        totalStationsCount: currentReadings.length,
        activeAlertsCount,
        avgPm25: Math.round((sumPm25 / n) * 10) / 10,
        avgPm10: Math.round((sumPm10 / n) * 10) / 10,
        avgCo: Math.round((sumCo / n) * 10) / 10,
        avgCo2: Math.round(sumCo2 / n),
        avgNo2: Math.round((sumNo2 / n) * 10) / 10,
        avgTemp: Math.round((sumTemp / n) * 10) / 10,
        avgHumidity: Math.round((sumHum / n) * 10) / 10,
        dominantPollutant: compositeRes.dominantPollutant,
        aqiTrendPercent: 8, // Realistic trend indicator
      };
    },
    []
  );

  // Initialize simulator data on mount
useEffect(() => {
  const init = initializeSimulator();

  // Keep simulator readings for Demo Mode
  setReadings(init.readings);
  setAlerts(getInitialSeedAlerts());
  setHistory(getAggregatedHistory());

  // Load real stations from Azure API
  const loadStations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const apiStations = await response.json();

      const mappedStations = apiStations.map((station: any) => ({
        ...station,
        stationId: String(station.stationId),
      }));

      setStations(mappedStations);

      console.log('Azure stations loaded:', mappedStations);
    } catch (error) {
      console.error('Failed to load Azure stations:', error);

      // Fallback to simulator stations
      setStations(init.stations);
    }
  };

  loadStations();
}, []);

  // Real-time Sensor Simulator Loop (every 5 seconds or settings.updateIntervalSeconds)
  useEffect(() => {
    if (!settings.demoMode) return;

    const intervalMs = settings.updateIntervalSeconds * 1000;
    const timer = setInterval(() => {
      // Step simulation
      const newReadings = stepSimulation(settings.allowSpikes, settings.allowOfflineSim);
      setReadings(newReadings);

      // Update stations state
      setStations(prev =>
        prev.map(st => {
          const updated = newReadings.find(r => r.stationId === st.stationId);
          return updated ? { ...st, status: updated.status, currentReading: updated } : st;
        })
      );

      // Update aggregated fleet history for charts
      setHistory(getAggregatedHistory());

      // Evaluate new readings against threshold limits to generate alerts
      setAlerts(prevAlerts => {
        let spawned: Alert[] = [];
        const thresholds = {
          pm25: settings.thresholdPm25,
          pm10: settings.thresholdPm10,
          co: settings.thresholdCo,
          no2: settings.thresholdNo2,
          aqi: settings.thresholdAqi,
        };

        for (const r of newReadings) {
          const generated = evaluateReadingForAlerts(r, thresholds, prevAlerts);
          if (generated.length > 0) {
            spawned = [...spawned, ...generated];
          }
        }

        if (spawned.length > 0) {
          // Trigger toast for the first spawned alert
          const first = spawned[0];
          setLatestToast({
            id: first.id,
            message: `${first.pollutant} breach at ${first.stationName} (${first.currentValue} ${first.unit})`,
            type: 'alert',
          });
          return [...spawned, ...prevAlerts];
        }
        return prevAlerts;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings]);

  // Alert Handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => acknowledgeAlert(prev, id));
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => resolveAlert(prev, id));
  };

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => (a.status === 'Active' ? { ...a, status: 'Acknowledged' } : a)));
  };

  const handleResolveAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, status: 'Resolved' })));
  };

  // Quick Demo Interactive Actions
  const handleTriggerSpike = (stationId?: string) => {
    const target = triggerManualSpike(stationId);
    setLatestToast({
      id: String(Date.now()),
      message: `Simulated pollution spike injected into ${target}. Telemetry surge in progress!`,
      type: 'info',
    });
  };

  const handleToggleOffline = (stationId?: string) => {
    const res = toggleManualOffline(stationId);
    setLatestToast({
      id: String(Date.now()),
      message: `Station ${res.stationId} toggled to ${res.status.toUpperCase()} mode.`,
      type: 'info',
    });
  };

  const stats = computeStats(readings, alerts);

  // Selected station for deep dive modal
  const activeModalStation = stations.find(s => s.stationId === selectedStationId) || null;
  const activeModalReading = readings.find(r => r.stationId === selectedStationId) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Floating Toast Notification */}
      {latestToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-300 max-w-md">
          {latestToast.type === 'alert' ? (
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 animate-bounce" />
          ) : (
            <CheckCircle className="h-5 w-5 text-cyan-400 shrink-0" />
          )}
          <div className="text-xs">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px]">
              {latestToast.type === 'alert' ? 'Telemetry Incident Triggered' : 'Simulation Engine Event'}
            </span>
            <p className="text-slate-300 mt-0.5">{latestToast.message}</p>
          </div>
          <button
            onClick={() => setLatestToast(null)}
            className="text-slate-400 hover:text-white p-1 ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeAlertsCount={stats.activeAlertsCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header
            onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
            demoMode={settings.demoMode}
            onToggleDemoMode={() =>
              setSettings(s => ({ ...s, demoMode: !s.demoMode }))
            }
            activeAlerts={alerts.filter(a => a.status === 'Active')}
            onTriggerSpike={() => handleTriggerSpike()}
            onToggleOffline={() => handleToggleOffline()}
            onSelectTab={setCurrentTab}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                stations={stations}
                readings={readings}
                alerts={alerts}
                stats={stats}
                history={history}
                onSelectStation={id => setSelectedStationId(id)}
                onSelectTab={setCurrentTab}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
              />
            )}

            {currentTab === 'live-monitoring' && (
              <LiveMonitoring
                stations={stations}
                readings={readings}
                onSelectStation={id => setSelectedStationId(id)}
                selectedStationId={selectedStationId}
              />
            )}

            {currentTab === 'stations' && (
              <Stations
                stations={stations}
                readings={readings}
                alerts={alerts}
                onSelectStation={id => setSelectedStationId(id)}
                onTriggerSpike={id => handleTriggerSpike(id)}
                onToggleOffline={id => handleToggleOffline(id)}
              />
            )}

            {currentTab === 'analytics' && (
              <Analytics
                stations={stations}
                readings={readings}
                onSelectStation={id => setSelectedStationId(id)}
              />
            )}

            {currentTab === 'alerts' && (
              <Alerts
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
                onAcknowledgeAll={handleAcknowledgeAll}
                onResolveAll={handleResolveAll}
                onInspectStation={id => setSelectedStationId(id)}
                onTriggerSpike={() => handleTriggerSpike()}
              />
            )}

            {currentTab === 'reports' && (
              <Reports stations={stations} readings={readings} alerts={alerts} />
            )}

            {currentTab === 'settings' && (
              <Settings
                settings={settings}
                onUpdateSettings={newS => setSettings(s => ({ ...s, ...newS }))}
                onResetDefaults={() =>
                  setSettings({
                    demoMode: true,
                    updateIntervalSeconds: 5,
                    allowSpikes: true,
                    allowOfflineSim: true,
                    thresholdPm25: DEFAULT_THRESHOLDS.pm25,
                    thresholdPm10: DEFAULT_THRESHOLDS.pm10,
                    thresholdCo: DEFAULT_THRESHOLDS.co,
                    thresholdNo2: DEFAULT_THRESHOLDS.no2,
                    thresholdAqi: DEFAULT_THRESHOLDS.aqi,
                    theme: 'dark',
                    soundAlerts: false,
                  })
                }
                onTriggerSpike={() => handleTriggerSpike()}
                onToggleOffline={() => handleToggleOffline()}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>
                AirSense – Smart Air Quality Monitoring Platform • Team 13 Phase 1 Prototype
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Demo Mode: Simulated Environmental IoT Telemetry Engine Active
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Station Diagnostics Modal */}
      {selectedStationId && (
        <StationDetailModal
          station={activeModalStation}
          currentReading={activeModalReading}
          alerts={alerts}
          onClose={() => setSelectedStationId(null)}
          onTriggerSpike={id => handleTriggerSpike(id)}
          onToggleOffline={id => handleToggleOffline(id)}
        />
      )}
    </div>
  );
}
