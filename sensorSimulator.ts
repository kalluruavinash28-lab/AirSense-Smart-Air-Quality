import { AirQualityReading, Station, HistoricalReading } from '../types/airQuality';
import { calculateAQI } from './aqiService';

export interface StationConfig {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  sensorModel: string;
  basePm25: number;
  basePm10: number;
  baseCo: number;
  baseCo2: number;
  baseNo2: number;
  baseTemp: number;
  baseHumidity: number;
}

export const INITIAL_STATION_CONFIGS: StationConfig[] = [
  {
    stationId: 'Bangalore-01',
    stationName: 'Electronic City Tech Hub',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.8452,
    longitude: 77.6602,
    sensorModel: 'AirSense Dual-Laser v2.4 (PMS5003 + MQ-135)',
    basePm25: 48,
    basePm10: 82,
    baseCo: 1.4,
    baseCo2: 440,
    baseNo2: 46,
    baseTemp: 27.4,
    baseHumidity: 58,
  },
  {
    stationId: 'Bangalore-02',
    stationName: 'Whitefield Commercial Zone',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9698,
    longitude: 77.7500,
    sensorModel: 'AirSense Dual-Laser v2.4 (PMS5003 + NDIR)',
    basePm25: 64,
    basePm10: 112,
    baseCo: 2.1,
    baseCo2: 520,
    baseNo2: 68,
    baseTemp: 28.1,
    baseHumidity: 54,
  },
  {
    stationId: 'Bangalore-03',
    stationName: 'BTM Layout Transit Corridor',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9166,
    longitude: 77.6101,
    sensorModel: 'AirSense Ultra Optical (OPC-N3 + MiCS-6814)',
    basePm25: 52,
    basePm10: 95,
    baseCo: 1.8,
    baseCo2: 490,
    baseNo2: 58,
    baseTemp: 26.8,
    baseHumidity: 62,
  },
  {
    stationId: 'Mysore-01',
    stationName: 'Hebbal Clean Tech Park',
    city: 'Mysore',
    state: 'Karnataka',
    latitude: 12.3656,
    longitude: 76.6041,
    sensorModel: 'AirSense Eco Node (SPS30 + SGP30)',
    basePm25: 22,
    basePm10: 42,
    baseCo: 0.8,
    baseCo2: 405,
    baseNo2: 24,
    baseTemp: 25.6,
    baseHumidity: 65,
  },
  {
    stationId: 'Chennai-01',
    stationName: 'Guindy Industrial Estate',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0067,
    longitude: 80.2025,
    sensorModel: 'AirSense Marine Ruggedized (PMS7003 + BME680)',
    basePm25: 78,
    basePm10: 135,
    baseCo: 2.6,
    baseCo2: 560,
    baseNo2: 84,
    baseTemp: 32.2,
    baseHumidity: 78,
  },
];

// In-memory simulator state
interface SimulatorInternalState {
  currentReadings: Map<string, AirQualityReading>;
  historicalReadings: Map<string, HistoricalReading[]>;
  spikeStationId: string | null;
  spikeCounter: number;
  spikeIntensity: number;
  forcedOfflineStationId: string | null;
}

const state: SimulatorInternalState = {
  currentReadings: new Map(),
  historicalReadings: new Map(),
  spikeStationId: null,
  spikeCounter: 0,
  spikeIntensity: 0,
  forcedOfflineStationId: null,
};

/**
 * Generates initial seed history (last 24 hours of 1-hour/15-min intervals)
 */
function generateHistoricalSeed(config: StationConfig): HistoricalReading[] {
  const history: HistoricalReading[] = [];
  const now = Date.now();
  const points = 36; // 36 intervals (covers up to 24+ hours realistically)
  const intervalMs = 40 * 60 * 1000; // 40 mins interval

  for (let i = points; i >= 0; i--) {
    const timestampMs = now - i * intervalMs;
    const date = new Date(timestampMs);
    const hour = date.getHours();

    // Diurnal traffic curve: traffic peaks at 9 AM and 7 PM
    const diurnalFactor = 1 + 0.3 * Math.sin(((hour - 4) / 24) * Math.PI * 2);
    const noise = (Math.random() - 0.5) * 6;

    const pm25 = Math.max(10, Math.round((config.basePm25 * diurnalFactor + noise) * 10) / 10);
    const pm10 = Math.max(20, Math.round((config.basePm10 * diurnalFactor + noise * 1.5) * 10) / 10);
    const co = Math.max(0.3, Math.round((config.baseCo * diurnalFactor + (Math.random() - 0.5) * 0.2) * 10) / 10);
    const co2 = Math.max(380, Math.round(config.baseCo2 * diurnalFactor + (Math.random() - 0.5) * 20));
    const no2 = Math.max(12, Math.round((config.baseNo2 * diurnalFactor + noise) * 10) / 10);
    const temp = Math.round((config.baseTemp + Math.sin((hour / 24) * Math.PI * 2) * 3) * 10) / 10;
    const hum = Math.round((config.baseHumidity - Math.sin((hour / 24) * Math.PI * 2) * 8) * 10) / 10;

    const aqiRes = calculateAQI(pm25, pm10, co, no2);

    history.push({
      timestamp: date.toISOString(),
      timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      aqi: aqiRes.aqi,
      pm25,
      pm10,
      co,
      co2,
      no2,
      temperature: temp,
      humidity: hum,
    });
  }

  return history;
}

/**
 * Initialize simulation state
 */
export function initializeSimulator(): { stations: Station[]; readings: AirQualityReading[] } {
  state.currentReadings.clear();
  state.historicalReadings.clear();

  const stations: Station[] = [];
  const readings: AirQualityReading[] = [];

  for (const config of INITIAL_STATION_CONFIGS) {
    const history = generateHistoricalSeed(config);
    state.historicalReadings.set(config.stationId, history);

    const latest = history[history.length - 1];
    const aqiRes = calculateAQI(latest.pm25, latest.pm10, latest.co, latest.no2);

    const reading: AirQualityReading = {
      stationId: config.stationId,
      stationName: config.stationName,
      city: config.city,
      latitude: config.latitude,
      longitude: config.longitude,
      timestamp: new Date().toISOString(),
      pm25: latest.pm25,
      pm10: latest.pm10,
      co: latest.co,
      co2: latest.co2,
      no2: latest.no2,
      temperature: latest.temperature,
      humidity: latest.humidity,
      aqi: aqiRes.aqi,
      category: aqiRes.category,
      status: 'online',
      dominantPollutant: aqiRes.dominantPollutant,
    };

    state.currentReadings.set(config.stationId, reading);
    readings.push(reading);

    stations.push({
      stationId: config.stationId,
      stationName: config.stationName,
      city: config.city,
      state: config.state,
      latitude: config.latitude,
      longitude: config.longitude,
      installationDate: '2025-11-15',
      sensorModel: config.sensorModel,
      status: 'online',
      currentReading: reading,
    });
  }

  return { stations, readings };
}

/**
 * Step the simulation by one interval (every 5 seconds)
 * Implements gradual random walk with realistic boundaries and occasional demo events
 */
export function stepSimulation(allowSpikes = true, allowOfflineSim = true): AirQualityReading[] {
  const updatedReadings: AirQualityReading[] = [];
  const nowIso = new Date().toISOString();
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Handle automatic occasional demo events
  // 1. Spikes: 3% chance if no spike active
  if (allowSpikes && !state.spikeStationId && Math.random() < 0.04) {
    const randomStation = INITIAL_STATION_CONFIGS[Math.floor(Math.random() * INITIAL_STATION_CONFIGS.length)];
    state.spikeStationId = randomStation.stationId;
    state.spikeCounter = 5; // spike lasts 5 cycles (25s)
    state.spikeIntensity = 1.6 + Math.random() * 0.8; // 60% to 140% spike
  }

  // 2. Offline: 2% chance if none offline
  if (allowOfflineSim && !state.forcedOfflineStationId && Math.random() < 0.02) {
    const candidates = ['Bangalore-03', 'Mysore-01'];
    state.forcedOfflineStationId = candidates[Math.floor(Math.random() * candidates.length)];
  } else if (state.forcedOfflineStationId && Math.random() < 0.08) {
    // 8% chance to restore offline station
    state.forcedOfflineStationId = null;
  }

  for (const config of INITIAL_STATION_CONFIGS) {
    const current = state.currentReadings.get(config.stationId);
    if (!current) continue;

    const isOffline = state.forcedOfflineStationId === config.stationId;

    if (isOffline) {
      const offlineReading: AirQualityReading = {
        ...current,
        status: 'offline',
        timestamp: nowIso,
      };
      state.currentReadings.set(config.stationId, offlineReading);
      updatedReadings.push(offlineReading);
      continue;
    }

    // Check if this station is currently having an active spike
    let multiplier = 1.0;
    if (state.spikeStationId === config.stationId && state.spikeCounter > 0) {
      multiplier = state.spikeIntensity;
      state.spikeCounter--;
      if (state.spikeCounter <= 0) {
        state.spikeStationId = null;
      }
    }

    // Gradual walk: delta ±1 to 3% for particulates, smaller for gases
    // Example: PM2.5: 42 -> 44 -> 46 -> 45 -> 48
    const driftPm25 = (Math.random() - 0.48) * 2.5;
    const targetPm25 = (config.basePm25 * multiplier);
    // Move slightly towards target + drift
    const pullFactor = 0.15;
    let newPm25 = current.pm25 + driftPm25 + (targetPm25 - current.pm25) * pullFactor;
    newPm25 = Math.max(8, Math.min(350, Math.round(newPm25 * 10) / 10));

    const driftPm10 = (Math.random() - 0.48) * 4.0;
    const targetPm10 = (config.basePm10 * multiplier);
    let newPm10 = current.pm10 + driftPm10 + (targetPm10 - current.pm10) * pullFactor;
    newPm10 = Math.max(15, Math.min(500, Math.round(newPm10 * 10) / 10));

    const driftCo = (Math.random() - 0.5) * 0.1;
    const targetCo = config.baseCo * (multiplier > 1.2 ? 1.5 : 1.0);
    let newCo = current.co + driftCo + (targetCo - current.co) * 0.1;
    newCo = Math.max(0.1, Math.min(25, Math.round(newCo * 10) / 10));

    const driftCo2 = (Math.random() - 0.5) * 6;
    let newCo2 = current.co2 + driftCo2;
    newCo2 = Math.max(370, Math.min(1800, Math.round(newCo2)));

    const driftNo2 = (Math.random() - 0.48) * 2.0;
    const targetNo2 = config.baseNo2 * multiplier;
    let newNo2 = current.no2 + driftNo2 + (targetNo2 - current.no2) * pullFactor;
    newNo2 = Math.max(8, Math.min(300, Math.round(newNo2 * 10) / 10));

    const driftTemp = (Math.random() - 0.5) * 0.1;
    let newTemp = Math.round((current.temperature + driftTemp) * 10) / 10;
    newTemp = Math.max(16, Math.min(45, newTemp));

    const driftHumidity = (Math.random() - 0.5) * 0.3;
    let newHumidity = Math.round((current.humidity + driftHumidity) * 10) / 10;
    newHumidity = Math.max(25, Math.min(95, newHumidity));

    // Recalculate AQI
    const aqiRes = calculateAQI(newPm25, newPm10, newCo, newNo2);

    const updated: AirQualityReading = {
      stationId: config.stationId,
      stationName: config.stationName,
      city: config.city,
      latitude: config.latitude,
      longitude: config.longitude,
      timestamp: nowIso,
      pm25: newPm25,
      pm10: newPm10,
      co: newCo,
      co2: newCo2,
      no2: newNo2,
      temperature: newTemp,
      humidity: newHumidity,
      aqi: aqiRes.aqi,
      category: aqiRes.category,
      status: 'online',
      dominantPollutant: aqiRes.dominantPollutant,
    };

    state.currentReadings.set(config.stationId, updated);
    updatedReadings.push(updated);

    // Append to historical window (keep last 50 points)
    const history = state.historicalReadings.get(config.stationId) || [];
    history.push({
      timestamp: nowIso,
      timeLabel,
      aqi: updated.aqi,
      pm25: updated.pm25,
      pm10: updated.pm10,
      co: updated.co,
      co2: updated.co2,
      no2: updated.no2,
      temperature: updated.temperature,
      humidity: updated.humidity,
    });
    if (history.length > 60) {
      history.shift();
    }
    state.historicalReadings.set(config.stationId, history);
  }

  return updatedReadings;
}

/**
 * Manually trigger a pollution spike on a specific station (for demo presentations)
 */
export function triggerManualSpike(stationId?: string): string {
  const targetId = stationId || INITIAL_STATION_CONFIGS[0].stationId;
  state.spikeStationId = targetId;
  state.spikeCounter = 6; // 30s
  state.spikeIntensity = 2.4; // 140% spike to trigger Severe alert
  return targetId;
}

/**
 * Manually toggle offline status for a station (for demo presentations)
 */
export function toggleManualOffline(stationId?: string): { stationId: string; status: 'offline' | 'online' } {
  const targetId = stationId || 'Bangalore-02';
  if (state.forcedOfflineStationId === targetId) {
    state.forcedOfflineStationId = null;
    return { stationId: targetId, status: 'online' };
  } else {
    state.forcedOfflineStationId = targetId;
    return { stationId: targetId, status: 'offline' };
  }
}

/**
 * Get station historical data
 */
export function getStationHistory(stationId: string): HistoricalReading[] {
  return state.historicalReadings.get(stationId) || [];
}

/**
 * Get aggregated multi-station timeline
 */
export function getAggregatedHistory(): HistoricalReading[] {
  const first = INITIAL_STATION_CONFIGS[0].stationId;
  const history0 = state.historicalReadings.get(first) || [];

  return history0.map((item, idx) => {
    let sumAqi = 0;
    let sumPm25 = 0;
    let sumPm10 = 0;
    let sumCo = 0;
    let sumNo2 = 0;
    let count = 0;

    for (const config of INITIAL_STATION_CONFIGS) {
      const h = state.historicalReadings.get(config.stationId);
      if (h && h[idx]) {
        sumAqi += h[idx].aqi;
        sumPm25 += h[idx].pm25;
        sumPm10 += h[idx].pm10;
        sumCo += h[idx].co;
        sumNo2 += h[idx].no2;
        count++;
      }
    }

    return {
      timestamp: item.timestamp,
      timeLabel: item.timeLabel,
      aqi: count > 0 ? Math.round(sumAqi / count) : item.aqi,
      pm25: count > 0 ? Math.round((sumPm25 / count) * 10) / 10 : item.pm25,
      pm10: count > 0 ? Math.round((sumPm10 / count) * 10) / 10 : item.pm10,
      co: count > 0 ? Math.round((sumCo / count) * 10) / 10 : item.co,
      co2: item.co2,
      no2: count > 0 ? Math.round((sumNo2 / count) * 10) / 10 : item.no2,
      temperature: item.temperature,
      humidity: item.humidity,
    };
  });
}
