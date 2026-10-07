import { AQICategory, AlertSeverity } from '../types/airQuality';

export interface AQIResult {
  aqi: number;
  category: AQICategory;
  severity: AlertSeverity;
  dominantPollutant: string;
  subIndices: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
  };
  healthAdvisory: string;
  color: {
    bg: string;
    text: string;
    border: string;
    dot: string;
    hex: string;
  };
}

/**
 * Breakpoint interpolation helper:
 * I = [(I_hi - I_lo) / (B_hi - B_lo)] * (C - B_lo) + I_lo
 */
function linearInterpolate(c: number, bLo: number, bHi: number, iLo: number, iHi: number): number {
  if (bHi === bLo) return iLo;
  const clamped = Math.max(bLo, Math.min(bHi, c));
  return Math.round(((iHi - iLo) / (bHi - bLo)) * (clamped - bLo) + iLo);
}

/**
 * Calculates sub-index for PM2.5 (µg/m³) based on Indian NAQI standards
 */
export function calculatePM25SubIndex(pm25: number): number {
  if (pm25 <= 30) return linearInterpolate(pm25, 0, 30, 0, 50);
  if (pm25 <= 60) return linearInterpolate(pm25, 30.1, 60, 51, 100);
  if (pm25 <= 90) return linearInterpolate(pm25, 60.1, 90, 101, 200);
  if (pm25 <= 120) return linearInterpolate(pm25, 90.1, 120, 201, 300);
  if (pm25 <= 250) return linearInterpolate(pm25, 120.1, 250, 301, 400);
  return linearInterpolate(pm25, 250.1, 500, 401, 500);
}

/**
 * Calculates sub-index for PM10 (µg/m³)
 */
export function calculatePM10SubIndex(pm10: number): number {
  if (pm10 <= 50) return linearInterpolate(pm10, 0, 50, 0, 50);
  if (pm10 <= 100) return linearInterpolate(pm10, 50.1, 100, 51, 100);
  if (pm10 <= 250) return linearInterpolate(pm10, 100.1, 250, 101, 200);
  if (pm10 <= 350) return linearInterpolate(pm10, 250.1, 350, 201, 300);
  if (pm10 <= 430) return linearInterpolate(pm10, 350.1, 430, 301, 400);
  return linearInterpolate(pm10, 430.1, 600, 401, 500);
}

/**
 * Calculates sub-index for CO (mg/m³)
 */
export function calculateCOSubIndex(co: number): number {
  if (co <= 1.0) return linearInterpolate(co, 0, 1.0, 0, 50);
  if (co <= 2.0) return linearInterpolate(co, 1.01, 2.0, 51, 100);
  if (co <= 10.0) return linearInterpolate(co, 2.01, 10.0, 101, 200);
  if (co <= 17.0) return linearInterpolate(co, 10.01, 17.0, 201, 300);
  if (co <= 34.0) return linearInterpolate(co, 17.01, 34.0, 301, 400);
  return linearInterpolate(co, 34.01, 50.0, 401, 500);
}

/**
 * Calculates sub-index for NO2 (µg/m³)
 */
export function calculateNO2SubIndex(no2: number): number {
  if (no2 <= 40) return linearInterpolate(no2, 0, 40, 0, 50);
  if (no2 <= 80) return linearInterpolate(no2, 40.1, 80, 51, 100);
  if (no2 <= 180) return linearInterpolate(no2, 80.1, 180, 101, 200);
  if (no2 <= 280) return linearInterpolate(no2, 180.1, 280, 201, 300);
  if (no2 <= 400) return linearInterpolate(no2, 280.1, 400, 301, 400);
  return linearInterpolate(no2, 400.1, 600, 401, 500);
}

/**
 * Master AQI Calculation from multiple environmental sensor readings
 */
export function calculateAQI(pm25: number, pm10: number, co: number, no2: number): AQIResult {
  const iPm25 = calculatePM25SubIndex(pm25);
  const iPm10 = calculatePM10SubIndex(pm10);
  const iCo = calculateCOSubIndex(co);
  const iNo2 = calculateNO2SubIndex(no2);

  // Maximum sub-index determines AQI and dominant pollutant
  const subIndices = { pm25: iPm25, pm10: iPm10, co: iCo, no2: iNo2 };
  let aqi = Math.max(iPm25, iPm10, iCo, iNo2);

  let dominantPollutant = 'PM2.5';
  let maxVal = iPm25;

  if (iPm10 > maxVal) {
    maxVal = iPm10;
    dominantPollutant = 'PM10';
  }
  if (iCo > maxVal) {
    maxVal = iCo;
    dominantPollutant = 'CO';
  }
  if (iNo2 > maxVal) {
    maxVal = iNo2;
    dominantPollutant = 'NO2';
  }

  // Determine Category, Severity, Advisory, and Color themes
  let category: AQICategory = 'Good';
  let severity: AlertSeverity = 'low';
  let healthAdvisory = 'Air quality is satisfactory. Air pollution poses little or no risk.';
  let color = {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    dot: 'bg-emerald-500',
    hex: '#10b981', // Emerald
  };

  if (aqi > 300) {
    category = 'Severe';
    severity = 'critical';
    healthAdvisory = 'Health emergency! Entire population is at risk of serious health impacts. Avoid all outdoor activities.';
    color = {
      bg: 'bg-rose-950/40 text-rose-300 border-rose-600/30',
      text: 'text-rose-400',
      border: 'border-rose-600',
      dot: 'bg-rose-600',
      hex: '#991b1b', // Dark Red / Maroon
    };
  } else if (aqi > 200) {
    category = 'Very Poor';
    severity = 'high';
    healthAdvisory = 'Health alert: Risk of health effects for everyone. Children, elderly and asthmatics must stay indoors.';
    color = {
      bg: 'bg-red-500/10 text-red-400 border-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500',
      dot: 'bg-red-500',
      hex: '#ef4444', // Red
    };
  } else if (aqi > 100) {
    category = 'Poor';
    severity = 'moderate';
    healthAdvisory = 'Breathing discomfort to most people on prolonged exposure. Sensitive groups should wear N95 masks.';
    color = {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500',
      dot: 'bg-amber-500',
      hex: '#f59e0b', // Orange / Amber
    };
  } else if (aqi > 50) {
    category = 'Moderate';
    severity = 'low';
    healthAdvisory = 'Acceptable air quality. Minor breathing discomfort to sensitive individuals.';
    color = {
      bg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500',
      dot: 'bg-yellow-400',
      hex: '#eab308', // Yellow
    };
  }

  return {
    aqi,
    category,
    severity,
    dominantPollutant,
    subIndices,
    healthAdvisory,
    color,
  };
}

export function getCategoryBadgeStyles(category: AQICategory) {
  switch (category) {
    case 'Good':
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        hex: '#10b981',
      };
    case 'Moderate':
      return {
        badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
        dot: 'bg-yellow-400',
        hex: '#eab308',
      };
    case 'Poor':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        hex: '#f59e0b',
      };
    case 'Very Poor':
      return {
        badge: 'bg-red-500/15 text-red-400 border-red-500/30',
        dot: 'bg-red-400',
        hex: '#ef4444',
      };
    case 'Severe':
      return {
        badge: 'bg-rose-950/60 text-rose-300 border-rose-600/40',
        dot: 'bg-rose-500',
        hex: '#991b1b',
      };
  }
}
