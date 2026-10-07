export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
export type StationStatus = 'online' | 'offline';
export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface AirQualityReading {
  stationId: string;
  stationName: string;
  city: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  pm25: number;      // µg/m³
  pm10: number;      // µg/m³
  co: number;        // mg/m³
  co2: number;       // ppm
  no2: number;       // µg/m³
  temperature: number; // °C
  humidity: number;    // %
  aqi: number;
  category: AQICategory;
  status: StationStatus;
  dominantPollutant?: string;
}

export interface Station {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  installationDate: string;
  sensorModel: string;
  status: StationStatus;
  currentReading: AirQualityReading;
}

export interface HistoricalReading {
  timestamp: string;
  timeLabel: string;
  aqi: number;
  pm25: number;
  pm10: number;
  co: number;
  co2: number;
  no2: number;
  temperature: number;
  humidity: number;
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  city: string;
  pollutant: string;
  currentValue: number;
  threshold: number;
  unit: string;
  severity: AlertSeverity;
  timestamp: string;
  status: AlertStatus;
  message: string;
}

export interface DashboardStatistics {
  currentAqi: number;
  aqiCategory: AQICategory;
  averageAqi: number;
  activeStationsCount: number;
  totalStationsCount: number;
  activeAlertsCount: number;
  avgPm25: number;
  avgPm10: number;
  avgCo: number;
  avgCo2: number;
  avgNo2: number;
  avgTemp: number;
  avgHumidity: number;
  dominantPollutant: string;
  aqiTrendPercent: number; // e.g. +8% from previous hour
}

export interface SimulatorSettings {
  demoMode: boolean;
  updateIntervalSeconds: number; // default 5s
  allowSpikes: boolean;
  allowOfflineSim: boolean;
  thresholdPm25: number;
  thresholdPm10: number;
  thresholdCo: number;
  thresholdNo2: number;
  thresholdAqi: number;
  theme: 'dark' | 'light' | 'system';
  soundAlerts: boolean;
}
