# 🌍 GeoQuest Pro — Vector Atlas & Geography Arcade

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://github.com/pmndrs/zustand)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Offline First](https://img.shields.io/badge/Storage-100%25_Offline_Local-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

> An interactive vector world map, educational cartographic atlas, and high-octane geography gaming platform built with React 19, TypeScript, Tailwind CSS, and Zustand. 100% client-side and offline-ready.

---

## 🌟 Overview

**GeoQuest Pro** blends rapid-fire geography trivia, demographic head-to-head battles, and topological border puzzles with an in-depth reference learning hub. Anchored by a GPU-accelerated interactive vector map engine, it features intuitive touch and cursor-centered navigation, procedural difficulty levels, dynamic audio synthesis, and offline local record tracking without requiring any account or backend server.

---

## 🎮 Game Modes

### 1. 🌐 Global Conquest (Name All 197 Nations)
* **Goal**: Name every sovereign state on Earth.
* **Map Integration**: As you type, nations immediately light up in vibrant emerald green on the world map.
* **Fuzzy Autocomplete**: Tolerates common typos, abbreviations ("USA", "UK", "UAE"), accents ("Côte d'Ivoire"), and aliases ("Holland" ➔ Netherlands).
* **Timer Styles**:
  * ⏱️ **Countdown**: Set custom pressure limits (e.g., 15 min) with urgency audio below 30s.
  * ⏳ **Stopwatch**: Increments upward to measure your fastest 197-nation clear time.
  * 🧘 **Zen Mode**: Relaxed, untimed cartographic session.
* **Review Screen**: Full game-over review detailing discovered countries vs. missed nations with one-tap map inspection.

---

### 2. 👻 The Vanishing 10 (Phantom Nations)
* **Goal**: 10 mystery nations have vanished from Earth, leaving behind pitch-black void silhouettes on the vector globe.
* **Gameplay**: Inspect the empty voids, identify the missing landmasses, and type their names to restore them with particle effects.
* **Assistance**:
  * 💡 **Geographic Hint**: Reveals continent, neighboring borders, or capital city.
  * 🏳️ **Give Up**: Unmasks all remaining voids in red.
* **Difficulty Scaling**: Filters mystery picks by Explorer, Challenger, or Grandmaster pools.

---

### 3. 🏛️ Capital City Blitz
* **Goal**: Rapid-fire 90-second recall of sovereign capital cities under clock pressure.
* **Two Playstyles**:
  * 🎯 **Targeted Mode**: Displays a country (with flag and name) and highlights it on the world map. Players type its capital city. Includes a `Skip` button (-15s penalty).
  * 🌊 **Freeflow Mode**: Type any world capital in any order to bank +100 points and claim that nation on the globe.
* **Combos**: Streak multiplier with celebratory confetti and sound effects every 5 correct answers.

---

### 4. ⚔️ Stat Battle (Higher or Lower)
* **Design Philosophy**: The vector map is automatically disabled and unmounted in this mode to eliminate background clutter, CPU/GPU overhead, and wheel zoom conflicts.
* **Centered Arena View**: Renders in a dedicated, distraction-free arena stage with ambient dual-spotlight lighting (Sky Blue for Demographics, Emerald/Teal for Land Territory).
* **Strictly Separated Modes**:
  * 👥 **Population Battle**: Compare citizen counts ("Which nation has more people?").
  * 📐 **Land Area Battle**: Compare territorial surface in square kilometers ("Which nation spans more km²?").
  *(Note: Population and Area are strictly isolated and never mixed in a single run.)*
* **Dynamic Buttons**: Context-aware actions (`HIGHER / LOWER Population` vs `LARGER / SMALLER Land Area`).
* **Records**: Tracks independent high-score streaks for both Population and Land Area.

---

### 5. 🛣️ Border Bridge (Geography Chain)
* **Goal**: Connect an Origin country to a Destination country by naming contiguous, bordering land neighbors step-by-step.
* **Graph Validation**: Verifies land connectivity in real time using a sovereign border topology graph.
* **Visual Route**: Highlights the growing cyan transit chain directly across continents.
* **Difficulty Route Sets**: Short 3–4 step routes on Regular, intermediate routes on Medium, and demanding transcontinental chains on Hard.

---

### 6. 🎯 Flag Hunter (Visual Identification)
* **Goal**: Inspect a displayed national flag and identify the country.
* **Interactive Map Clicking**: Click directly on the vector world map to guess, or enter the country name into the input field.
* **Instant Feedback**: Wrong clicks flash rose-red on the map; correct clicks pulse in emerald green and advance the streak.

---

## 📚 The Learning Hub

A dedicated reference and study suite accessible from any device:

1. 🗺️ **Interactive 2D Atlas**:
   * Pan and zoom freely across the projected globe.
   * Tap any nation to open a slide-out dossier detailing:
     * Flag, official name, capital, continent, population, and land area (km²).
     * Currency code, name, and symbol.
     * Contiguous neighbors with one-tap navigation to jump directly to them.
     * Quick bookmarking system.
2. 📊 **Comparative Matrix**:
   * Searchable demographic database of all 197 nations.
   * Filterable by continent (`All`, `Africa`, `Asia`, `Europe`, `North America`, `South America`, `Oceania`).
   * Multi-column sorting: Country Name, Capital City, Continent, Population, and Land Area (km²).
3. 🗂️ **Smart Flashcards**:
   * Spaced repetition study deck with filter modes (`All`, `Still Learning`, `Bookmarked`).
   * 3D card flip animation revealing capital, demographics, and neighboring borders.
   * Real-time mastery percentage tracker.

---

## 🛡️ Difficulty Levels

Selection-based game modes (Phantom 10, Capital Blitz, Stat Battle, Border Bridge, Flag Hunter) feature a 3-tier difficulty engine:

| Tier | Level Name | Nation Pool | Description |
| :--- | :--- | :--- | :--- |
| 🟢 | **Regular (Explorer)** | Top 50 prominent nations | Globally recognized world powers (USA, Japan, France, Brazil, Germany, Egypt, etc.) |
| 🟡 | **Medium (Challenger)** | Top 90 intermediate nations | Regionally significant countries (Norway, Peru, Vietnam, Morocco, Kazakhstan, etc.) |
| 🔴 | **Hard (Grandmaster)** | All 197 sovereign states | Complete catalog including microstates and island nations (Tuvalu, Nauru, San Marino, Bhutan, etc.) |

---

## 💾 Local Storage, Activity Feed & Achievements

GeoQuest Pro operates **100% offline** using the browser's `localStorage` with zero telemetry, accounts, or database setup:

* 🏆 **Personal Bests Grid**:
  * Conquest: Best country count & fastest completion time.
  * Phantom 10: Best solved count & total 10/10 clears.
  * Capital Blitz: High score & peak streak.
  * Stat Battle: Independent best streaks for **Population** and **Land Area**.
  * Border Bridge: Shortest path steps & total completed routes.
  * Flag Hunter: High score & peak streak.
* 📜 **Activity Timeline**:
  * Rolling chronological feed of your last 60 completed game sessions with timestamps, mode badges, streak summaries, and `NEW BEST` awards.
* 🎖️ **Milestone Achievements**:
  * Unlockable badges tracking exploration, speed, demographic knowledge, and mastery.
* 🔄 **One-Click Reset**: Safely clear local records and reset statistics at any time.

---

## 📐 Interactive Vector Map Architecture

* **Projection**: Equirectangular D3 cartographic projection transforming spherical coordinates $(lon, lat)$ to canvas space.
* **Cursor-Centered Zoom**: Mouse-wheel zooming calculates transforms directly relative to cursor coordinates `(cursorX, cursorY)` instead of the viewport corner.
* **Touch Support**: 1-finger panning and smooth 2-finger pinch-to-zoom for mobile and tablet displays.
* **Dynamic Rendering**:
  * `Default`: Sleek dark slate styling with subtle border strokes.
  * `Discovered / Correct`: Radiant emerald fill.
  * `Phantom Void`: Masked blackout silhouette.
  * `Target / Prompt`: Pulsing gold glow.
  * `Bridge Chain`: Interconnected cyan route highlight.
  * `Spotlight Neighbor`: Dimmed surrounding world with highlighted adjacent borders.

---

## 🔊 Synthesized Audio Engine

Built using the native **Web Audio API** (`AudioContext`) with zero external sound asset downloads:
* **Correct Chime**: Dual-tone sine wave arpeggio (587 Hz ➔ 880 Hz).
* **Error Thud**: Low-frequency detuned saw oscillator (180 Hz ➔ 110 Hz).
* **Streak Milestone**: Tri-tone fanfare with canvas confetti burst.
* **Victory Fanfare**: Multi-stage harmonic chord progression.
* **Urgency Tick**: Crisp high-frequency wooden click for final countdown seconds.
* **Mute Toggle**: Global audio toggle state persisted across sessions.

---

## 📱 Responsive Mobile & Tablet Layout

* **Adaptive Header**: Desktop mode bar on wide displays (`xl:`); compact Quick Mode Switcher pill and slide-over drawer sheet on mobile and tablets (`< xl`).
* **Non-Shrinking Controls**: Stable flexbox layouts with fixed dimensions prevent UI jumping or menu tightening when switching sub-tabs.
* **Landscape & Portrait Tested**: Optimized for smartphones, iPads, Android tablets, and ultrawide desktop monitors.

---

## 🛠️ Tech Stack & Libraries

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component framework and reactive hooks |
| **TypeScript 5** | Strict type definitions and compile-time safety |
| **Vite 6** | Ultra-fast development server and production bundler |
| **Tailwind CSS v4** | Modern utility-first styling with `@tailwindcss/vite` |
| **Zustand** | Centralized, reactive game store with custom actions |
| **D3-Geo & TopoJSON** | GeoJSON processing and vector map projections |
| **Lucide React** | Feather-style iconography |
| **Canvas Confetti** | Hardware-accelerated victory particle celebrations |

---

## 📂 Project Directory Structure

```text
├── src/
│   ├── components/
│   │   ├── Atlas/
│   │   │   ├── AtlasPanel.tsx          # Slide-out country detail dossier
│   │   │   ├── ComparisonTable.tsx     # Filterable demographic data table
│   │   │   └── Flashcards.tsx          # 3D spaced repetition flashcard deck
│   │   ├── Common/
│   │   │   └── DifficultySelector.tsx  # Reusable 3-tier difficulty pill
│   │   ├── HUD/
│   │   │   ├── GameHUD.tsx             # Global conquest top HUD & input
│   │   │   └── GameOverModal.tsx       # Conquest end review dialog
│   │   ├── Map/
│   │   │   └── VectorMap.tsx           # Interactive SVG/Canvas vector world map
│   │   ├── Modals/
│   │   │   └── RecordsModal.tsx        # Personal bests, activity feed, achievements
│   │   ├── Modes/
│   │   │   ├── BorderBridge.tsx        # Contiguous land neighbor chain mode
│   │   │   ├── CapitalBlitz.tsx        # 90-second rapid capital recall blitz
│   │   │   ├── FlagHunter.tsx          # Visual flag identification mode
│   │   │   ├── PhantomNations.tsx      # The Vanishing 10 mystery void mode
│   │   │   └── StatBattle.tsx          # Higher or Lower Population & Land Area arena
│   │   └── Navigation/
│   │       └── Navbar.tsx              # Responsive top navigation & mobile drawer
│   ├── data/
│   │   ├── countries.ts                # 197 sovereign states dataset & borders
│   │   ├── difficulty.ts               # Difficulty tiers & bridge preset routes
│   │   ├── mapData.ts                  # Cartographic projected paths
│   │   └── types.ts                    # TypeScript interfaces & game models
│   ├── store/
│   │   └── gameStore.ts                # Central Zustand game engine store
│   ├── utils/
│   │   ├── activityStorage.ts          # Offline local storage & achievements engine
│   │   ├── audio.ts                    # Web Audio API sound synthesizer
│   │   └── normalize.ts                # Diacritics stripping & fuzzy matching
│   ├── App.tsx                         # Main workspace stage & mode router
│   ├── main.tsx                        # React application entry point
│   └── index.css                       # Global styles & Tailwind CSS v4 import
├── index.html                          # HTML shell & viewport metadata
├── package.json                        # Dependencies and build scripts
├── tsconfig.json                       # TypeScript compiler configuration
└── vite.config.ts                      # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/geoquest-engine.git
cd geoquest-engine
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Production assets will be output to the `dist/` directory.

### 5. Typecheck & Lint
```bash
npm run lint
```

---

## ⌨️ Controls & Gestures

| Action | Control (Desktop) | Control (Touch / Mobile) |
| :--- | :--- | :--- |
| **Pan Map** | Left Click + Drag | 1-Finger Drag |
| **Zoom Map** | Scroll Wheel (centers on cursor) | 2-Finger Pinch In / Out |
| **Select Country** | Left Click | Single Tap |
| **Submit Guess** | Type in input bar + `Enter` | Type on on-screen keyboard + `Done` |
| **Flip Flashcard** | Left Click Card | Tap Card |
| **Quick Play** | Click `Quick Play` in Navbar | Tap `Quick Play` in Mobile Drawer |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🤝 Acknowledgments

* Geographic boundaries derived from [Natural Earth](https://www.naturalearthdata.com/) via [World Atlas](https://github.com/topojson/world-atlas).
* Demographic and geographic data aggregated from the United Nations and ISO 3166-1 standards.
* Icons courtesy of [Lucide Icons](https://lucide.dev/).
