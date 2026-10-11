import React, { useState } from 'react';
import { COUNTRIES } from '../../data/countries';
import { useGameStore } from '../../store/gameStore';
import { RotateCw, CheckCircle2, HelpCircle, Trophy, BookOpen } from 'lucide-react';

export const Flashcards: React.FC = () => {
  const { flashcardKnownIds, markFlashcard, bookmarkedCountryIds } = useGameStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'bookmarked'>('all');

  // Filter country pool
  const deck = COUNTRIES.filter((c) => {
    if (filterMode === 'bookmarked') return bookmarkedCountryIds.has(c.id);
    if (filterMode === 'learning') return !flashcardKnownIds.has(c.id);
    return true;
  });

  const activeCountry = deck[currentIndex % Math.max(1, deck.length)];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, deck.length));
  };

  const handleKnewIt = () => {
    if (activeCountry) {
      markFlashcard(activeCountry.id, true);
    }
    handleNext();
  };

  const handleStillLearning = () => {
    if (activeCountry) {
      markFlashcard(activeCountry.id, false);
    }
    handleNext();
  };

  const masteryPercent = Math.round((flashcardKnownIds.size / COUNTRIES.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#080d1a] p-3 sm:p-6 max-w-xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 sm:mb-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white">Smart Flashcards</h1>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Mastery: <strong className="text-emerald-400 tabular-nums font-mono">{flashcardKnownIds.size} / {COUNTRIES.length} ({masteryPercent}%)</strong>
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => { setFilterMode('all'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'all' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterMode('learning'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'learning' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Learning
          </button>
          <button
            onClick={() => { setFilterMode('bookmarked'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'bookmarked' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Saved ({bookmarkedCountryIds.size})
          </button>
        </div>
      </div>

      {deck.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 w-full">
          <Trophy className="h-10 w-10 text-emerald-400 mb-3" />
          <h3 className="text-base font-bold text-white">Deck Empty!</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filterMode === 'bookmarked'
              ? 'You have no bookmarked countries yet.'
              : 'You have mastered all countries in this filter!'}
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
          >
            View All Countries
          </button>
        </div>
      ) : (
        <>
          {/* Card Container (3D Flip) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full h-72 sm:h-80 rounded-3xl cursor-pointer perspective-1000 mb-4 sm:mb-5 group select-none"
          >
            <div
              className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d border border-white/10 shadow-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT SIDE */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-slate-900/95 p-6 sm:p-8 text-center backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-6xl sm:text-7xl mb-3 sm:mb-4 drop-shadow-md">{activeCountry.flagEmoji}</span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Territory of
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">{activeCountry.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{activeCountry.continent}</p>

                <div className="mt-4 sm:mt-6 flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Tap anywhere to flip card</span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-slate-900/98 p-5 sm:p-6 text-left backface-hidden rotate-y-180 border border-emerald-500/25"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCountry.flagEmoji}</span>
                    <h3 className="text-sm sm:text-base font-bold text-white">{activeCountry.name}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{activeCountry.continent}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 text-xs">
                  <div className="rounded-xl bg-slate-950/70 p-2 sm:p-2.5 border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-semibold">Capital City</span>
                    <strong className="text-emerald-400 text-xs sm:text-sm">{activeCountry.capital}</strong>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 p-2 sm:p-2.5 border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-semibold">Population</span>
                    <strong className="text-slate-200 tabular-nums font-mono text-xs sm:text-sm">
                      {activeCountry.population.toLocaleString()}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 p-2 sm:p-2.5 border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-semibold">Land Area</span>
                    <strong className="text-slate-200 tabular-nums font-mono text-xs sm:text-sm">
                      {activeCountry.areaSqKm.toLocaleString()} km²
                    </strong>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 p-2 sm:p-2.5 border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-semibold">Currency</span>
                    <strong className="text-slate-200 text-xs sm:text-sm">
                      {activeCountry.currency.code} ({activeCountry.currency.symbol})
                    </strong>
                  </div>
                </div>

                <div className="text-[10px] sm:text-[11px] text-slate-400 pt-2 border-t border-white/5 truncate">
                  Neighbors: {activeCountry.borders.length > 0 ? activeCountry.borders.join(', ') : 'Island Nation'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between gap-3">
            <button
              onClick={handleStillLearning}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/40 text-amber-300 font-bold text-xs transition-colors active:scale-98"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Still Learning</span>
            </button>

            <button
              onClick={handleKnewIt}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/25 active:scale-98"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Knew It!</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
