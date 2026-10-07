import { Alert, AirQualityReading, AlertSeverity, AlertStatus } from '../types/airQuality';

export interface AlertThresholds {
  pm25: number;      // e.g. 60 µg/m³
  pm10: number;      // e.g. 100 µg/m³
  co: number;        // e.g. 4.0 mg/m³
  no2: number;       // e.g. 80 µg/m³
  aqi: number;       // e.g. 150
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  pm25: 60,
  pm10: 100,
  co: 3.0,
  no2: 80,
  aqi: 150,
};

let alertCounter = 1000;

export function evaluateReadingForAlerts(
  reading: AirQualityReading,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
  existingAlerts: Alert[] = []
): Alert[] {
  const newAlerts: Alert[] = [];
  const now = new Date(reading.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Check if station just went offline
  if (reading.status === 'offline') {
    const offlineAlertExists = existingAlerts.some(
      a => a.stationId === reading.stationId && a.pollutant === 'STATUS' && a.status === 'Active'
    );
    if (!offlineAlertExists) {
      alertCounter++;
      newAlerts.push({
        id: `ALT-${alertCounter}`,
        stationId: reading.stationId,
        stationName: reading.stationName,
        city: reading.city,
        pollutant: 'Telemetry Status',
        currentValue: 0,
        threshold: 0,
        unit: 'state',
        severity: 'high',
        timestamp: now,
        status: 'Active',
        message: `Station ${reading.stationName} (${reading.city}) reported heartbeat timeout / went offline.`,
      });
    }
    return newAlerts;
  }

  // Helper to check deduplication (don't spawn another active alert if one already exists for this station+pollutant within the last 2 minutes)
  const hasActiveAlert = (pollutant: string) =>
    existingAlerts.some(
      a => a.stationId === reading.stationId && a.pollutant === pollutant && a.status === 'Active'
    );

  // PM2.5 evaluation
  if (reading.pm25 > thresholds.pm25 && !hasActiveAlert('PM2.5')) {
    let sev: AlertSeverity = 'moderate';
    if (reading.pm25 > 120) sev = 'critical';
    else if (reading.pm25 > 90) sev = 'high';

    alertCounter++;
    newAlerts.push({
      id: `ALT-${alertCounter}`,
      stationId: reading.stationId,
      stationName: reading.stationName,
      city: reading.city,
      pollutant: 'PM2.5',
      currentValue: reading.pm25,
      threshold: thresholds.pm25,
      unit: 'µg/m³',
      severity: sev,
      timestamp: now,
      status: 'Active',
      message: `PM2.5 concentration spiked to ${reading.pm25} µg/m³, exceeding safety threshold of ${thresholds.pm25} µg/m³.`,
    });
  }

  // PM10 evaluation
  if (reading.pm10 > thresholds.pm10 && !hasActiveAlert('PM10')) {
    let sev: AlertSeverity = 'moderate';
    if (reading.pm10 > 250) sev = 'critical';
    else if (reading.pm10 > 150) sev = 'high';

    alertCounter++;
    newAlerts.push({
      id: `ALT-${alertCounter}`,
      stationId: reading.stationId,
      stationName: reading.stationName,
      city: reading.city,
      pollutant: 'PM10',
      currentValue: reading.pm10,
      threshold: thresholds.pm10,
      unit: 'µg/m³',
      severity: sev,
      timestamp: now,
      status: 'Active',
      message: `Coarse particulate PM10 recorded at ${reading.pm10} µg/m³, above limit of ${thresholds.pm10} µg/m³.`,
    });
  }

  // CO evaluation
  if (reading.co > thresholds.co && !hasActiveAlert('CO')) {
    alertCounter++;
    newAlerts.push({
      id: `ALT-${alertCounter}`,
      stationId: reading.stationId,
      stationName: reading.stationName,
      city: reading.city,
      pollutant: 'CO',
      currentValue: reading.co,
      threshold: thresholds.co,
      unit: 'mg/m³',
      severity: reading.co > 8 ? 'critical' : 'high',
      timestamp: now,
      status: 'Active',
      message: `Carbon Monoxide (CO) concentration reached ${reading.co} mg/m³, exceeding threshold of ${thresholds.co} mg/m³.`,
    });
  }

  // NO2 evaluation
  if (reading.no2 > thresholds.no2 && !hasActiveAlert('NO2')) {
    alertCounter++;
    newAlerts.push({
      id: `ALT-${alertCounter}`,
      stationId: reading.stationId,
      stationName: reading.stationName,
      city: reading.city,
      pollutant: 'NO2',
      currentValue: reading.no2,
      threshold: thresholds.no2,
      unit: 'µg/m³',
      severity: reading.no2 > 180 ? 'critical' : 'moderate',
      timestamp: now,
      status: 'Active',
      message: `Nitrogen Dioxide (NO2) reached ${reading.no2} µg/m³, exceeding alert threshold of ${thresholds.no2} µg/m³.`,
    });
  }

  // Severe AQI threshold alert
  if (reading.aqi >= thresholds.aqi && !hasActiveAlert('AQI')) {
    alertCounter++;
    newAlerts.push({
      id: `ALT-${alertCounter}`,
      stationId: reading.stationId,
      stationName: reading.stationName,
      city: reading.city,
      pollutant: 'AQI',
      currentValue: reading.aqi,
      threshold: thresholds.aqi,
      unit: 'Index',
      severity: reading.aqi > 300 ? 'critical' : reading.aqi > 200 ? 'high' : 'moderate',
      timestamp: now,
      status: 'Active',
      message: `Overall Air Quality Index degraded to ${reading.aqi} (${reading.category}), requiring health mitigation measures.`,
    });
  }

  return newAlerts;
}

export function acknowledgeAlert(alerts: Alert[], alertId: string): Alert[] {
  return alerts.map(a => (a.id === alertId ? { ...a, status: 'Acknowledged' as AlertStatus } : a));
}

export function resolveAlert(alerts: Alert[], alertId: string): Alert[] {
  return alerts.map(a => (a.id === alertId ? { ...a, status: 'Resolved' as AlertStatus } : a));
}

export function getInitialSeedAlerts(): Alert[] {
  return [
    {
      id: 'ALT-1001',
      stationId: 'Bangalore-01',
      stationName: 'Electronic City Phase 1',
      city: 'Bangalore',
      pollutant: 'PM2.5',
      currentValue: 78.4,
      threshold: 60,
      unit: 'µg/m³',
      severity: 'moderate',
      timestamp: '10 minutes ago',
      status: 'Active',
      message: 'PM2.5 concentration elevated to 78.4 µg/m³ during peak industrial shift transition.',
    },
    {
      id: 'ALT-1002',
      stationId: 'Chennai-01',
      stationName: 'Guindy Industrial Estate',
      city: 'Chennai',
      pollutant: 'NO2',
      currentValue: 94.2,
      threshold: 80,
      unit: 'µg/m³',
      severity: 'high',
      timestamp: '25 minutes ago',
      status: 'Acknowledged',
      message: 'NO2 emission alert at vehicular transit corridor crossing 94.2 µg/m³.',
    },
    {
      id: 'ALT-1003',
      stationId: 'Bangalore-02',
      stationName: 'Whitefield IT Corridor',
      city: 'Bangalore',
      pollutant: 'PM10',
      currentValue: 135.0,
      threshold: 100,
      unit: 'µg/m³',
      severity: 'moderate',
      timestamp: '1 hour ago',
      status: 'Resolved',
      message: 'Particulate matter PM10 normalized after localized construction dust suppression.',
    },
  ];
}
