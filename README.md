# AirSense – Smart Air Quality Monitoring Platform

> **Team 13 – Phase 1 Prototype**  
> A cloud-ready, real-time environmental IoT telemetry platform designed for continuous multi-pollutant monitoring, national air quality index computation, geographic hotspot mapping, automated threshold alerting, and data auditing.

---

## 1. Project Overview

**AirSense** provides municipal authorities, environmental researchers, and citizens with actionable real-time insights into urban air pollution. 

In **Phase 1**, the platform delivers a production-grade frontend interface and an autonomous, simulated multi-station sensor engine. The engine emulates physical IoT nodes deployed across urban and industrial corridors (Bangalore, Mysore, Chennai) without requiring physical hardware (ESP32, Arduino, Raspberry Pi) or cloud database accounts at this stage.

Phase 2 will seamlessly bind this frontend to Azure IoT Hub and serverless Azure Functions via the pre-architected client abstraction layer in `src/services/api.ts`.

---

## 2. Key Features

- **Real-Time Sensor Simulator**:
  - 5 regional stations: `Bangalore-01` (Electronic City), `Bangalore-02` (Whitefield), `Bangalore-03` (BTM Layout), `Mysore-01` (Hebbal), `Chennai-01` (Guindy).
  - 5-second realistic gradual walk (Gaussian drift) across PM2.5, PM10, CO, CO2, NO2, Temperature, and Humidity.
  - Autonomous and manual pollution spikes to trigger incident workflows.
  - Autonomous heartbeat watchdog and offline simulation.
- **CPCB / Indian NAQI Standard Calculation**:
  - Multi-pollutant sub-index breakpoint interpolation for PM2.5, PM10, CO, and NO2.
  - Categorization into *Good* (0–50), *Moderate* (51–100), *Poor* (101–200), *Very Poor* (201–300), and *Severe* (300+).
  - Identification of the dominant driver pollutant and associated health impact advisories.
- **Geospatial Fleet Heat Map (Leaflet + OpenStreetMap)**:
  - Interactive map with dynamic pulsing color-coded markers (Green, Yellow, Orange, Red, Dark Red).
  - Marker popups displaying real-time telemetry, offline flags, and quick links to diagnostics.
- **Live Monitoring Console**:
  - Multi-view layout (Interactive Table, Grid Cards, Geospatial Map).
  - Filterable by station status (Online, Offline) and AQI severity levels.
  - Sortable metric columns.
- **Historical Analytics & Trajectory Modeling (Recharts)**:
  - Time-series curves for AQI, fine particulate (PM2.5), coarse dust (PM10), and toxic gases (CO, NO2).
  - Time filters: 1 hour, 6 hours, 24 hours, 7 days.
  - Cross-station benchmark comparison bar charts.
- **Intelligent Alert Watchdog**:
  - Real-time comparison against safety thresholds.
  - Severity tiers: Low, Moderate, High, Critical.
  - Interactive status workflow: *Active* → *Acknowledged* → *Resolved*.
- **Compliance Reports & CSV Export**:
  - Key statistical indicators (Average AQI, Max AQI Spike, Cleanest Node, Dominant Pollutant, Alert Counts, PM2.5 averages).
  - Direct one-click client-side CSV download formatted for regulatory auditing.
- **Customizable Simulation Settings**:
  - Live toggle between Demo Mode and Standby.
  - Configurable polling intervals (2s to 15s).
  - Customizable alert thresholds and notification preferences.

---

## 3. Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Mapping**: Leaflet + OpenStreetMap (with Dark Matter tile set)
- **Icons**: Lucide React
- **Animations & Layout**: Modern dark environmental dashboard UI

---

## 4. Folder Structure

```
├── index.html                   # HTML entry point with Leaflet styles & meta tags
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies and build scripts
├── src/
│   ├── App.tsx                  # Master application orchestrator & telemetry loop
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Tailwind CSS v4 directives & map styling
│   ├── types/
│   │   └── airQuality.ts        # TypeScript schemas (Station, Reading, Alert, etc.)
│   ├── services/
│   │   ├── aqiService.ts        # Indian NAQI computation & breakpoint interpolation
│   │   ├── sensorSimulator.ts   # Real-time gradual-walk sensor engine
│   │   ├── alertService.ts      # Automated threshold evaluator & incident manager
│   │   ├── reportService.ts     # KPI aggregator & RFC-compliant CSV generator
│   │   └── api.ts               # Cloud-ready API facade for Phase 2 Azure IoT integration
│   ├── components/
│   │   ├── Sidebar.tsx          # Collapsible responsive navigation bar
│   │   ├── Header.tsx           # Demo mode badge, live clock, alerts popover, test buttons
│   │   ├── StatCard.tsx         # Reusable KPI summary card with trend indicator
│   │   ├── AQICard.tsx          # Hero AQI dial, health advisory & sub-indices
│   │   ├── StatusBadge.tsx      # Color-coded pill component
│   │   ├── AirQualityMap.tsx    # Leaflet OpenStreetMap interactive GIS view
│   │   ├── StationTable.tsx     # Filterable, sortable telemetry data table
│   │   ├── StationCard.tsx      # Grid card view with telemetry snapshot
│   │   ├── AlertCard.tsx        # Incident card with Acknowledge/Resolve actions
│   │   ├── AQIChart.tsx         # Recharts AQI area trajectory chart
│   │   ├── PollutionChart.tsx   # Recharts multi-pollutant line chart
│   │   └── StationDetailModal.tsx # Full hardware specs, live gauges, and diagnostics
│   └── pages/
│       ├── Dashboard.tsx        # Main executive dashboard
│       ├── LiveMonitoring.tsx   # Real-time telemetry monitoring console
│       ├── Stations.tsx         # Sensor node fleet manager
│       ├── Analytics.tsx        # Historical trends & cross-station comparisons
│       ├── Alerts.tsx           # Incident management center
│       ├── Reports.tsx          # Audit summary & CSV report export
│       └── Settings.tsx         # Telemetry cadence & threshold configurations
└── tsconfig.json
```

---

## 5. How the Sensor Simulator Works

The engine (`src/services/sensorSimulator.ts`) runs an autonomous simulation loop updating every 5 seconds without physical hardware:

1. **Station Baselines**: Each station is seeded with geographic coordinates, an environmental profile (e.g. industrial vs. residential), and baseline values for PM2.5, PM10, CO, CO2, NO2, Temperature, and Humidity.
2. **Realistic Gradual Walk**: Rather than jumping discontinuously, values follow a constrained Brownian walk with gentle mean-reversion toward baseline targets:
   $$\text{Value}_{t+1} = \text{Value}_t + \Delta_{\text{drift}} + (\text{Baseline} - \text{Value}_t) \times \kappa$$
   *Example*: PM2.5 progresses smoothly: $42 \rightarrow 44 \rightarrow 46 \rightarrow 45 \rightarrow 48$.
3. **Pollution Spikes**: Periodically (or on manual click of "Test Spike"), a station enters a spike state simulating an industrial emissions event or localized rush hour, causing readings to surge over safety limits and trigger alerts.
4. **Offline Watchdog**: Stations can simulate occasional telemetry heartbeat drops to test network resilience and notify operators.

---

## 6. How AQI is Calculated

AirSense implements the **Indian National Air Quality Index (NAQI)** standard codified by the Central Pollution Control Board (CPCB):

1. **Sub-Index Interpolation**: For each pollutant $C$, the sub-index $I$ is calculated using piecewise linear interpolation across standard concentration breakpoints $[B_{lo}, B_{hi}]$ and index ranges $[I_{lo}, I_{hi}]$:
   $$I = \left[ \frac{I_{hi} - I_{lo}}{B_{hi} - B_{lo}} \right] \times (C - B_{lo}) + I_{lo}$$
2. **Composite AQI**: The overall AQI is governed by the highest sub-index among the monitored parameters:
   $$\text{AQI} = \max(I_{\text{PM2.5}}, I_{\text{PM10}}, I_{\text{CO}}, I_{\text{NO2}})$$
3. **Dominant Pollutant & Category**: The pollutant with the maximum sub-index is designated as the dominant pollutant. The final score is matched to the categories:
   - **Good** (0–50): Minimal impact
   - **Moderate** (51–100): Minor breathing discomfort to sensitive people
   - **Poor** (101–200): Discomfort to people with lungs, asthma, and heart diseases
   - **Very Poor** (201–300): Respiratory illness on prolonged exposure
   - **Severe** (301–500): Serious health impacts on healthy population

---

## 7. How to Run the Project

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Launch

```bash
# 1. Install all dependencies
npm install

# 2. Start the local Vite development server
npm run dev
```

The application will be running on `http://localhost:3000`.

To build for production:

```bash
npm run build
```
