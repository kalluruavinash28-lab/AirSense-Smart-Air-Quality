import { AirQualityReading, Alert, Station } from '../types/airQuality';

export interface ReportSummary {
  averageAqi: number;
  maximumAqi: number;
  minimumAqi: number;
  maxStationName: string;
  minStationName: string;
  mostPollutedStation: string;
  mostCommonPollutant: string;
  totalAlertsCount: number;
  activeAlertsCount: number;
  averagePm25: number;
  averagePm10: number;
  averageCo: number;
  averageNo2: number;
  averageTemp: number;
  averageHumidity: number;
  onlineStationsCount: number;
  totalStationsCount: number;
  generatedAt: string;
}

export function generateReportSummary(
  stations: Station[],
  readings: AirQualityReading[],
  alerts: Alert[]
): ReportSummary {
  if (readings.length === 0) {
    return {
      averageAqi: 0,
      maximumAqi: 0,
      minimumAqi: 0,
      maxStationName: 'N/A',
      minStationName: 'N/A',
      mostPollutedStation: 'N/A',
      mostCommonPollutant: 'PM2.5',
      totalAlertsCount: 0,
      activeAlertsCount: 0,
      averagePm25: 0,
      averagePm10: 0,
      averageCo: 0,
      averageNo2: 0,
      averageTemp: 0,
      averageHumidity: 0,
      onlineStationsCount: 0,
      totalStationsCount: 0,
      generatedAt: new Date().toLocaleString(),
    };
  }

  const validReadings = readings.filter(r => r.status === 'online');
  const targetReadings = validReadings.length > 0 ? validReadings : readings;

  let sumAqi = 0;
  let maxAqi = -Infinity;
  let minAqi = Infinity;
  let maxStation = targetReadings[0]?.stationName || '';
  let minStation = targetReadings[0]?.stationName || '';

  let sumPm25 = 0;
  let sumPm10 = 0;
  let sumCo = 0;
  let sumNo2 = 0;
  let sumTemp = 0;
  let sumHum = 0;

  const pollutantFrequency: Record<string, number> = {};

  for (const r of targetReadings) {
    sumAqi += r.aqi;
    sumPm25 += r.pm25;
    sumPm10 += r.pm10;
    sumCo += r.co;
    sumNo2 += r.no2;
    sumTemp += r.temperature;
    sumHum += r.humidity;

    if (r.aqi > maxAqi) {
      maxAqi = r.aqi;
      maxStation = `${r.stationName} (${r.city})`;
    }
    if (r.aqi < minAqi) {
      minAqi = r.aqi;
      minStation = `${r.stationName} (${r.city})`;
    }

    const dominant = r.dominantPollutant || 'PM2.5';
    pollutantFrequency[dominant] = (pollutantFrequency[dominant] || 0) + 1;
  }

  let mostCommonPollutant = 'PM2.5';
  let highestFreq = 0;
  for (const [pol, count] of Object.entries(pollutantFrequency)) {
    if (count > highestFreq) {
      highestFreq = count;
      mostCommonPollutant = pol;
    }
  }

  const n = targetReadings.length;
  const onlineCount = readings.filter(r => r.status === 'online').length;
  const activeAlerts = alerts.filter(a => a.status === 'Active').length;

  return {
    averageAqi: Math.round(sumAqi / n),
    maximumAqi: maxAqi === -Infinity ? 0 : maxAqi,
    minimumAqi: minAqi === Infinity ? 0 : minAqi,
    maxStationName: maxStation,
    minStationName: minStation,
    mostPollutedStation: maxStation,
    mostCommonPollutant,
    totalAlertsCount: alerts.length,
    activeAlertsCount: activeAlerts,
    averagePm25: Math.round((sumPm25 / n) * 10) / 10,
    averagePm10: Math.round((sumPm10 / n) * 10) / 10,
    averageCo: Math.round((sumCo / n) * 10) / 10,
    averageNo2: Math.round((sumNo2 / n) * 10) / 10,
    averageTemp: Math.round((sumTemp / n) * 10) / 10,
    averageHumidity: Math.round((sumHum / n) * 10) / 10,
    onlineStationsCount: onlineCount,
    totalStationsCount: stations.length,
    generatedAt: new Date().toLocaleString(),
  };
}

/**
 * Downloads a structured CSV export containing simulated sensor telemetry and alerts
 */
export function downloadCSVReport(
  readings: AirQualityReading[],
  alerts: Alert[],
  summary: ReportSummary
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `AirSense_Report_${timestamp}.csv`;

  const rows: string[] = [];

  // Metadata headers
  rows.push('# AirSense – Smart Air Quality Monitoring Platform');
  rows.push(`# Report Generated: ${summary.generatedAt}`);
  rows.push(`# Platform: Phase 1 Team 13 Prototype (Simulated Sensor Engine)`);
  rows.push(`# Network Summary: Active Stations: ${summary.onlineStationsCount}/${summary.totalStationsCount}, Average AQI: ${summary.averageAqi}, Highest Polluted: ${summary.mostPollutedStation}`);
  rows.push('');

  // Section 1: Latest Sensor Readings
  rows.push('--- SENSOR STATION TELEMETRY ---');
  rows.push('Station ID,Station Name,City,Latitude,Longitude,Timestamp,AQI,Category,PM2.5 (ug/m3),PM10 (ug/m3),CO (mg/m3),CO2 (ppm),NO2 (ug/m3),Temperature (C),Humidity (%),Dominant Pollutant,Status');

  for (const r of readings) {
    const values = [
      `"${r.stationId}"`,
      `"${r.stationName}"`,
      `"${r.city}"`,
      r.latitude,
      r.longitude,
      `"${r.timestamp}"`,
      r.aqi,
      `"${r.category}"`,
      r.pm25,
      r.pm10,
      r.co,
      r.co2,
      r.no2,
      r.temperature,
      r.humidity,
      `"${r.dominantPollutant || 'PM2.5'}"`,
      `"${r.status}"`,
    ];
    rows.push(values.join(','));
  }

  rows.push('');
  // Section 2: Alerts Log
  rows.push('--- RECENT SYSTEM ALERTS ---');
  rows.push('Alert ID,Station ID,Station Name,City,Pollutant,Current Value,Threshold,Unit,Severity,Timestamp,Status,Message');

  for (const a of alerts) {
    const alertValues = [
      `"${a.id}"`,
      `"${a.stationId}"`,
      `"${a.stationName}"`,
      `"${a.city}"`,
      `"${a.pollutant}"`,
      a.currentValue,
      a.threshold,
      `"${a.unit}"`,
      `"${a.severity}"`,
      `"${a.timestamp}"`,
      `"${a.status}"`,
      `"${a.message.replace(/"/g, '""')}"`,
    ];
    rows.push(alertValues.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
