import React, { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Navbar } from './components/Navigation/Navbar';
import { VectorMap } from './components/Map/VectorMap';
import { GameHUD } from './components/HUD/GameHUD';
import { GameOverModal } from './components/HUD/GameOverModal';
import { PhantomNations } from './components/Modes/PhantomNations';
import { CapitalBlitz } from './components/Modes/CapitalBlitz';
import { StatBattle } from './components/Modes/StatBattle';
import { BorderBridge } from './components/Modes/BorderBridge';
import { FlagHunter } from './components/Modes/FlagHunter';
import { AtlasPanel } from './components/Atlas/AtlasPanel';
import { ComparisonTable } from './components/Atlas/ComparisonTable';
import { Flashcards } from './components/Atlas/Flashcards';
import { Map, Table2, Layers, BookOpen } from 'lucide-react';

export default function App() {
  const {
    currentMode,
    conquestSolved,
    conquestIsFinished,
    vanishingTargetIds,
    vanishingSolvedIds,
    vanishingGiveUp,
    capitalCurrentTarget,
    capitalSolved,
    bridgeChain,
    statCountryA,
    statCountryB,
    selectedCountry,
    setSelectedCountry,
    spotlightNeighbors,
    submitFlagGuess,
    atlasSubTab,
    setAtlasSubTab,
  } = useGameStore();

  const [showReviewModal, setShowReviewModal] = useState(true);

  // Compute masked IDs for Phantom 10 mode
  const maskedPhantomIds = React.useMemo(() => {
    if (currentMode !== 'vanishing_10') return undefined;
    if (vanishingGiveUp) return undefined;
    const masked = new Set(vanishingTargetIds.filter((id) => !vanishingSolvedIds.has(id)));
    return masked;
  }, [currentMode, vanishingTargetIds, vanishingSolvedIds, vanishingGiveUp]);

  // Compute solved / highlighted IDs
  const highlightedIds = React.useMemo(() => {
    if (currentMode === 'global_conquest') return conquestSolved;
    if (currentMode === 'vanishing_10') return vanishingSolvedIds;
    if (currentMode === 'capital_blitz') return capitalSolved;
    return undefined;
  }, [currentMode, conquestSolved, vanishingSolvedIds, capitalSolved]);

  // Handle Map Country Clicks
  const handleMapCountryClick = (country: { id: string }) => {
    if (currentMode === 'flag_hunter') {
      submitFlagGuess(country.id);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#090d16] text-slate-100">
      {/* Universal Top Navigation Bar */}
      <Navbar />

      {/* Main Workspace Stage */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Render Map (for all map-based modes and Atlas map view) */}
        {(currentMode !== 'atlas' || atlasSubTab === 'map') && (
          <div className="absolute inset-0 z-0">
            <VectorMap
              highlightedCountryIds={highlightedIds}
              maskedCountryIds={maskedPhantomIds}
              activePromptCountryId={
                currentMode === 'capital_blitz'
                  ? capitalCurrentTarget?.id
                  : currentMode === 'higher_lower'
                  ? statCountryB?.id
                  : undefined
              }
              chainCountryIds={currentMode === 'border_bridge' ? bridgeChain : undefined}
              spotlightCenterCountryId={spotlightNeighbors && selectedCountry ? selectedCountry.id : null}
              onCountryClick={handleMapCountryClick}
              interactive={true}
            />
          </div>
        )}

        {/* Global Conquest Mode Overlay */}
        {currentMode === 'global_conquest' && (
          <>
            <GameHUD />
            {conquestIsFinished && showReviewModal && (
              <GameOverModal onCloseReview={() => setShowReviewModal(false)} />
            )}
          </>
        )}

        {/* Phantom 10 Mode Overlay */}
        {currentMode === 'vanishing_10' && <PhantomNations />}

        {/* Capital City Blitz Mode Overlay */}
        {currentMode === 'capital_blitz' && <CapitalBlitz />}

        {/* Higher or Lower Stat Battle Overlay */}
        {currentMode === 'higher_lower' && <StatBattle />}

        {/* Border Bridge Overlay */}
        {currentMode === 'border_bridge' && <BorderBridge />}

        {/* Flag Hunter Overlay */}
        {currentMode === 'flag_hunter' && <FlagHunter />}

        {/* Atlas Learning Hub View */}
        {currentMode === 'atlas' && (
          <div className="relative z-10 flex flex-col h-full w-full pointer-events-none">
            {/* Atlas Navigation Sub-Bar */}
            <div className="pointer-events-auto mx-auto mt-4 z-20 flex items-center gap-1 rounded-2xl bg-slate-900/90 p-1.5 backdrop-blur-xl border border-white/10 shadow-xl">
              <button
                onClick={() => setAtlasSubTab('map')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  atlasSubTab === 'map'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span>Interactive 2D Atlas</span>
              </button>

              <button
                onClick={() => setAtlasSubTab('table')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  atlasSubTab === 'table'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span>Comparative Matrix</span>
              </button>

              <button
                onClick={() => setAtlasSubTab('flashcards')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  atlasSubTab === 'flashcards'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Smart Flashcards</span>
              </button>
            </div>

            {/* Sub-tab Views */}
            {atlasSubTab === 'table' && (
              <div className="pointer-events-auto flex-1 w-full h-full bg-[#090d16]">
                <ComparisonTable />
              </div>
            )}

            {atlasSubTab === 'flashcards' && (
              <div className="pointer-events-auto flex-1 w-full h-full bg-[#090d16]">
                <Flashcards />
              </div>
            )}
          </div>
        )}

        {/* Country Details Slide-Over Drawer */}
        <AtlasPanel />
      </main>
    </div>
  );
}
