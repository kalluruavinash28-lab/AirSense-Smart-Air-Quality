import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AirQualityReading, Station } from '../types/airQuality';
import { calculateAQI } from '../services/aqiService';
import { Info, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface AirQualityMapProps {
  stations: Station[];
  readings: AirQualityReading[];
  selectedStationId?: string | null;
  onSelectStation?: (stationId: string) => void;
}

export const AirQualityMap: React.FC<AirQualityMapProps> = ({
  stations,
  readings,
  selectedStationId,
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around South India (Bangalore / Mysore / Chennai region)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 78.4],
      zoom: 7,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
    });

    // High performance CartoDB Dark Matter / Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when readings or stations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    const readingMap = new Map<string, AirQualityReading>();
    readings.forEach(r => readingMap.set(r.stationId, r));

    stations.forEach(station => {
      const reading = readingMap.get(station.stationId) || station.currentReading;
      const aqiRes = calculateAQI(reading.pm25, reading.pm10, reading.co, reading.no2);
      const isOffline = reading.status === 'offline';

      const hexColor = isOffline ? '#64748b' : aqiRes.color.hex;
      const isSelected = selectedStationId === station.stationId;

      // Custom pulsing HTML Pin Marker
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;">
          <div style="position: absolute; width: ${isSelected ? '42px' : '32px'}; height: ${isSelected ? '42px' : '32px'}; border-radius: 9999px; background-color: ${hexColor}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9999px; background-color: #0f172a; border: 2.5px solid ${hexColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: ${hexColor}; line-height: 1;">${isOffline ? 'OFF' : reading.aqi}</span>
          </div>
          <div style="position: absolute; bottom: -2px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${hexColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-aqi-marker',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 40],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupContent = `
        <div style="min-width: 220px; font-family: inherit; padding: 6px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 8px;">
            <div>
              <div style="font-weight: 700; font-size: 14px; color: #f8fafc;">${station.stationName}</div>
              <div style="font-size: 11px; color: #94a3b8;">${station.city}, ${station.state}</div>
            </div>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${isOffline ? '#334155' : hexColor + '25'}; color: ${isOffline ? '#94a3b8' : hexColor}; border: 1px solid ${isOffline ? '#475569' : hexColor + '50'};">
              ${isOffline ? 'OFFLINE' : aqiRes.category}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 8px;">
            <div style="background: #1e293b; padding: 6px 8px; border-radius: 6px;">
              <span style="color: #94a3b8; display: block; font-size: 10px;">AQI Index</span>
              <strong style="color: ${hexColor}; font-size: 16px; font-family: monospace;">${isOffline ? 'N/A' : reading.aqi}</strong>
            </div>
            <div style="background: #1e293b; padding: 6px 8px; border-radius: 6px;">
              <span style="color: #94a3b8; display: block; font-size: 10px;">PM2.5 Level</span>
              <strong style="color: #f8fafc; font-size: 14px; font-family: monospace;">${reading.pm25} <span style="font-size: 9px; color: #94a3b8;">µg/m³</span></strong>
            </div>
            <div style="background: #1e293b; padding: 6px 8px; border-radius: 6px;">
              <span style="color: #94a3b8; display: block; font-size: 10px;">PM10 Level</span>
              <strong style="color: #f8fafc; font-size: 14px; font-family: monospace;">${reading.pm10} <span style="font-size: 9px; color: #94a3b8;">µg/m³</span></strong>
            </div>
            <div style="background: #1e293b; padding: 6px 8px; border-radius: 6px;">
              <span style="color: #94a3b8; display: block; font-size: 10px;">Status</span>
              <strong style="color: ${isOffline ? '#f43f5e' : '#34d399'}; font-size: 12px;">${isOffline ? 'Offline' : 'Online'}</strong>
            </div>
          </div>

          <div style="font-size: 10px; color: #64748b; margin-top: 6px; padding-top: 6px; border-top: 1px solid #1e293b; display: flex; justify-content: space-between;">
            <span>Last Telemetry:</span>
            <span>${new Date(reading.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectStation) {
          onSelectStation(station.stationId);
        }
      });

      markersRef.current.set(station.stationId, marker);
    });
  }, [stations, readings, selectedStationId, onSelectStation]);

  // Pan to selected station if changed
  useEffect(() => {
    if (!selectedStationId || !mapInstanceRef.current) return;
    const station = stations.find(s => s.stationId === selectedStationId);
    if (station) {
      mapInstanceRef.current.setView([station.latitude, station.longitude], 12, { animate: true });
      const marker = markersRef.current.get(selectedStationId);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedStationId, stations]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([12.9716, 78.4], 7, { animate: true });
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Notice Banner */}
      <div className="absolute top-4 left-4 z-10 max-w-md rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 shadow-lg pointer-events-auto">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Geospatial Sensor Fleet Map
            </h4>
            <p className="mt-0.5 text-xs text-slate-300">
              Karnataka & Tamil Nadu environmental nodes. Locations and telemetry are simulated locally for Demo Mode.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Station Filter Bar (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-auto">
        {stations.map(st => {
          const reading = readings.find(r => r.stationId === st.stationId);
          const aqi = reading?.aqi ?? 50;
          const aqiRes = calculateAQI(reading?.pm25 ?? 30, reading?.pm10 ?? 50, reading?.co ?? 1, reading?.no2 ?? 30);
          const isSelected = selectedStationId === st.stationId;

          return (
            <button
              key={st.stationId}
              onClick={() => {
                if (onSelectStation) onSelectStation(st.stationId);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([st.latitude, st.longitude], 11, { animate: true });
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/85 text-slate-300 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: reading?.status === 'offline' ? '#64748b' : aqiRes.color.hex }}
              />
              <span>{st.stationName.split(' ')[0]}</span>
              <span className="font-mono text-[11px] opacity-80">{reading?.status === 'offline' ? 'OFF' : aqi}</span>
            </button>
          );
        })}
      </div>

      {/* Legend & Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
        {/* Zoom & Reset Controls */}
        <div className="flex flex-col rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 overflow-hidden shadow-lg">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-b border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-b border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Center Regional View"
          >
            <Compass className="h-4 w-4" />
          </button>
        </div>

        {/* CPCB AQI Color Legend */}
        <div className="rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 shadow-lg text-[11px] space-y-1.5 min-w-[140px]">
          <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
            AQI Index Scale
          </span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>0-50 Good</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>51-100 Moderate</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>101-200 Poor</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>201-300 Very Poor</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-900" />
            <span>300+ Severe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
