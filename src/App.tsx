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
import { RecordsModal } from './components/Modals/RecordsModal';
import { Map, Table2, Layers } from 'lucide-react';

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
    recordsModalOpen,
    setRecordsModalOpen,
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

  // Only render VectorMap in game modes that actively require or utilize the interactive map
  const isMapRequiredMode =
    currentMode === 'global_conquest' ||
    currentMode === 'vanishing_10' ||
    currentMode === 'capital_blitz' ||
    currentMode === 'border_bridge' ||
    currentMode === 'flag_hunter' ||
    (currentMode === 'atlas' && atlasSubTab === 'map');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#090d16] text-slate-100">
      {/* Universal Top Navigation Bar */}
      <Navbar />

      {/* Main Workspace Stage */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Render Map (only for modes that actively require the map) */}
        {isMapRequiredMode && (
          <div className="absolute inset-0 z-0">
            <VectorMap
              highlightedCountryIds={highlightedIds}
              maskedCountryIds={maskedPhantomIds}
              activePromptCountryId={
                currentMode === 'capital_blitz'
                  ? capitalCurrentTarget?.id
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
            {/* Atlas Navigation Sub-Bar (fixed dimensions, non-shrinking, rock solid width) */}
            <div className="pointer-events-auto shrink-0 flex-none mx-auto my-2 sm:my-3 z-20 flex items-center justify-center gap-1 sm:gap-2 rounded-2xl bg-slate-900/95 p-1.5 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setAtlasSubTab('map')}
                className={`flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 flex-none min-w-[125px] sm:min-w-[165px] transition-all duration-150 ${
                  atlasSubTab === 'map'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Map className="h-4 w-4 shrink-0" />
                <span>Interactive Atlas</span>
              </button>

              <button
                onClick={() => setAtlasSubTab('table')}
                className={`flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 flex-none min-w-[125px] sm:min-w-[165px] transition-all duration-150 ${
                  atlasSubTab === 'table'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Table2 className="h-4 w-4 shrink-0" />
                <span>Comparative Matrix</span>
              </button>

              <button
                onClick={() => setAtlasSubTab('flashcards')}
                className={`flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 flex-none min-w-[125px] sm:min-w-[165px] transition-all duration-150 ${
                  atlasSubTab === 'flashcards'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span>Smart Flashcards</span>
              </button>
            </div>

            {/* Sub-tab Views */}
            {atlasSubTab === 'table' && (
              <div className="pointer-events-auto flex-1 w-full min-h-0 bg-[#080d1a] overflow-hidden">
                <ComparisonTable />
              </div>
            )}

            {atlasSubTab === 'flashcards' && (
              <div className="pointer-events-auto flex-1 w-full min-h-0 bg-[#080d1a] overflow-hidden">
                <Flashcards />
              </div>
            )}
          </div>
        )}

        {/* Country Details Slide-Over Drawer */}
        <AtlasPanel />

        {/* User Local Records & Activity Modal */}
        <RecordsModal
          isOpen={recordsModalOpen}
          onClose={() => setRecordsModalOpen(false)}
        />
      </main>
    </div>
  );
}
