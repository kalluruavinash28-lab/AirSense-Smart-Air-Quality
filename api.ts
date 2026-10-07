/**
 * AirSense Cloud API Client (Phase 1 Placeholder Architecture)
 * 
 * Note for Team 13 Architecture Evaluation:
 * In Phase 1, the frontend application consumes the local simulated sensor engine
 * (src/services/sensorSimulator.ts). This file provides the standardized asynchronous contract
 * ready to swap directly with Azure Functions / IoT Hub HTTP triggers in Phase 2.
 */

import { AirQualityReading, Alert, HistoricalReading, Station } from '../types/airQuality';
import { getStationHistory, INITIAL_STATION_CONFIGS } from './sensorSimulator';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  source: 'simulated-local' | 'cloud-azure-iot';
}

/**
 * Fetch list of registered monitoring stations
 */
export async function getStations(): Promise<ApiResponse<Station[]>> {
  // Phase 1: Resolves via local simulator definitions
  return {
    success: true,
    data: INITIAL_STATION_CONFIGS.map(c => ({
      stationId: c.stationId,
      stationName: c.stationName,
      city: c.city,
      state: c.state,
      latitude: c.latitude,
      longitude: c.longitude,
      installationDate: '2025-11-15',
      sensorModel: c.sensorModel,
      status: 'online',
      currentReading: {
        stationId: c.stationId,
        stationName: c.stationName,
        city: c.city,
        latitude: c.latitude,
        longitude: c.longitude,
        timestamp: new Date().toISOString(),
        pm25: c.basePm25,
        pm10: c.basePm10,
        co: c.baseCo,
        co2: c.baseCo2,
        no2: c.baseNo2,
        temperature: c.baseTemp,
        humidity: c.baseHumidity,
        aqi: 75,
        category: 'Moderate',
        status: 'online',
        dominantPollutant: 'PM2.5',
      },
    })),
    timestamp: new Date().toISOString(),
    source: 'simulated-local',
  };
}

/**
 * Fetch latest readings across all deployed monitoring stations
 */
export async function getLatestReadings(): Promise<ApiResponse<AirQualityReading[]>> {
  return {
    success: true,
    data: [],
    timestamp: new Date().toISOString(),
    source: 'simulated-local',
  };
}

/**
 * Fetch historical time series for a station or aggregated fleet
 */
export async function getHistoricalReadings(
  stationId: string,
  timeframe: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<ApiResponse<HistoricalReading[]>> {
  const history = getStationHistory(stationId);
  return {
    success: true,
    data: history,
    timestamp: new Date().toISOString(),
    source: 'simulated-local',
  };
}

/**
 * Fetch recent threshold alerts
 */
export async function getAlerts(): Promise<ApiResponse<Alert[]>> {
  return {
    success: true,
    data: [],
    timestamp: new Date().toISOString(),
    source: 'simulated-local',
  };
}
