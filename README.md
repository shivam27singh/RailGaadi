# RailGaddi 🚆 — Live Train Journey Platform

> **Apple Maps × Linear × Stripe × Arc × Notion**  
> Premium real-time train journey platform for India that transforms railway tracking into an immersive journey experience.

---

## ✨ Features

- **Centric Live Journey Map**: Full-screen Dark Cartographic map powered by MapLibre GL with 3D perspective tilt (50° tilt), glowing completed vs remaining track layers, station popups, and smooth lerp interpolation for train movement.
- **Camera Follow Mode**: Automatically follows the moving train; gracefully pauses when user manually pans or zooms, and displays an animated "Follow Train" pill to resume.
- **Instant Discovery & Command Palette**: Instant train search by number or name (12951 Mumbai Rajdhani, 12301 Howrah Rajdhani, 22436 Vande Bharat, 12002 Bhopal Shatabdi) with debouncing, suggestions, and keyboard navigation.
- **Live Status & Pacing**: Real-time current station, next stop, ETA, running delay (+X min Late / On Time), live speed (km/h), and heading bearing.
- **Auto-Refresh with Tab-Pause**: Periodic live status updates that automatically pause when the tab is hidden and instantly wake up on tab focus.
- **Topography & Elevation Profile**: Interactive SVG route elevation profile plotting altitude changes across the Deccan and Malwa plateaus, with live train altitude marker and highest elevation annotation.
- **Station Timeline**: Comprehensive vertical halts schedule with scheduled vs actual times, halt delays, distance from origin, and platform numbers.
- **Smart Travel Companion**: Real-time weather at current, next, and destination stations, route-level rain forecasting, and geographic highlights (rivers, mountains, bridges, monuments like Taj Mahal, Chambal Viaduct, Narmada Bridge).
- **Shareable Journeys & Favorites**: One-click link sharing with Web Share API and celebration confetti, plus persistent starred trains.

---

## 🏗 Monorepo Architecture

```text
railgaddi/
├── apps/
│   ├── web/                    # React 18 + Vite + TypeScript + TailwindCSS
│   │   ├── src/
│   │   │   ├── components/     # UI, Map, Train, Search, Analytics, Timeline, Weather
│   │   │   ├── hooks/          # useLiveJourney, useTrainSearch, useWeather...
│   │   │   ├── services/       # API client
│   │   │   ├── styles/         # Global glassmorphism & dark tokens
│   │   │   └── App.tsx         # Centralized journey platform layout
│   │
│   └── api/                    # Node.js / Express backend service
│       ├── src/
│       │   ├── routes/         # Trains, Journey, Live, Weather, Elevation, Share
│       │   ├── services/       # Domain business logic
│       │   ├── mock/           # Realistic Indian Railways coordinate & route database
│       │   └── index.ts        # Express server entrypoint
│
└── packages/
    ├── types/                  # Shared TypeScript domain interfaces
    └── utils/                  # Haversine distance, bearing, lerp, and formatters
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode (Single Terminal)
Run both backend and frontend together with a single command:

```bash
npm run dev
```

This concurrently launches:
- **Backend API (`[API]`)**: `http://localhost:3001`
- **Frontend App (`[WEB]`)**: `http://localhost:5173`

Open `http://localhost:5173` in your browser to explore RailGaddi!

---

## 🚄 Seeded Trains for Immediate Exploration

- **12951**: Mumbai Rajdhani Express (New Delhi NDLS → Mumbai Central MMCT)
- **12301**: Howrah Rajdhani Express (Howrah HWH → New Delhi NDLS)
- **22436**: Vande Bharat Express (New Delhi NDLS → Varanasi BSB)
- **12002**: Bhopal Shatabdi Express (New Delhi NDLS → Rani Kamalapati RKMP)
