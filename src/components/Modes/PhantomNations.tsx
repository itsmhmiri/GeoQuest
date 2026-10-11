import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES_BY_ID } from '../../data/countries';
import { normalizeString, matchesCandidate } from '../../utils/normalize';
import { DifficultySelector } from '../Common/DifficultySelector';
import { Ghost, HelpCircle, RefreshCw, Trophy, Flag, CheckCircle2, Sparkles } from 'lucide-react';

export const PhantomNations: React.FC = () => {
  const {
    vanishingTargetIds,
    vanishingSolvedIds,
    vanishingGiveUp,
    startVanishing10,
    guessVanishing,
    giveUpVanishing,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedbackState] = useState<'idle' | 'success' | 'shake'>('idle');
  const [lastFoundName, setLastFoundName] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const targets = vanishingTargetIds.map((id) => COUNTRIES_BY_ID.get(id)!).filter(Boolean);
  const remaining = targets.filter((c) => !vanishingSolvedIds.has(c.id));
  const isComplete = vanishingSolvedIds.size === vanishingTargetIds.length && vanishingTargetIds.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    const clean = normalizeString(val);
    if (!clean || clean.length < 2) return;

    // Check if matches any remaining target country
    for (const c of remaining) {
      if (matchesCandidate(clean, [c.name, c.officialName, ...c.aliases])) {
        guessVanishing(c.id);
        setFeedbackState('success');
        setLastFoundName(`${c.flagEmoji} ${c.name}`);
        setTimeout(() => {
          setFeedbackState('idle');
          setLastFoundName(null);
        }, 1800);
        setInputVal('');
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFeedbackState('shake');
      setTimeout(() => setFeedbackState('idle'), 500);
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-xl">
      <div className="rounded-2xl bg-[#0a1020]/90 p-4 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle ambient indigo aura */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-950/40">
              <Ghost className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white tracking-tight">The Vanishing 10</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tabular-nums">
                  {vanishingSolvedIds.size} / 10 Restored
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                10 missing voids across the map. Name them to restore landmasses!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (remaining.length > 0) {
                  setHintIndex((prev) => (prev === null ? 0 : (prev + 1) % remaining.length));
                }
              }}
              title="Get a geographic hint"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-all border border-amber-500/20 active:scale-95"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Hint</span>
            </button>

            {!isComplete && !vanishingGiveUp && (
              <button
                onClick={giveUpVanishing}
                title="Reveal all 10 nations"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/20 active:scale-95"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Give Up</span>
              </button>
            )}

            <button
              onClick={() => {
                setHintIndex(null);
                startVanishing10();
              }}
              title="New random mystery set"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Controls Bar: Difficulty Selector */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <DifficultySelector
            onDifficultyChange={() => {
              setHintIndex(null);
              startVanishing10();
            }}
          />
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Filters mystery nations pool
          </span>
        </div>

        {/* 10 Mystery Phantom Slot Indicators */}
        <div className="flex items-center justify-between gap-1.5 px-1 py-1.5 mb-3 bg-slate-950/60 rounded-xl border border-white/5">
          {vanishingTargetIds.map((id, idx) => {
            const isSolved = vanishingSolvedIds.has(id);
            const country = COUNTRIES_BY_ID.get(id);

            return (
              <div
                key={id}
                title={isSolved && country ? `${country.name}` : `Mystery #${idx + 1}`}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  isSolved
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                    : 'bg-slate-800/80 border border-white/5'
                }`}
              />
            );
          })}
        </div>

        {/* Found Success Banner */}
        {lastFoundName && (
          <div className="mb-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 p-2.5 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn shadow-lg shadow-emerald-950/40">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Restored <strong>{lastFoundName}</strong> seamlessly onto the world map!</span>
          </div>
        )}

        {/* Hint Banner if Active */}
        {hintIndex !== null && remaining[hintIndex] && (
          <div className="mb-3 rounded-xl bg-amber-950/50 border border-amber-500/35 p-2.5 text-xs text-amber-200 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              Clue: A missing nation lies in <strong className="text-white">{remaining[hintIndex].continent}</strong> (starts with <strong className="text-white">{remaining[hintIndex].name[0]}</strong>).
            </span>
          </div>
        )}

        {/* Input Bar */}
        {!isComplete && !vanishingGiveUp ? (
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Name any missing country..."
              autoFocus
              className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border transition-all ${
                feedback === 'success'
                  ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                  : feedback === 'shake'
                  ? 'border-rose-500 bg-rose-950/25 animate-shake'
                  : 'border-slate-800/80 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30'
              }`}
            />
          </div>
        ) : isComplete ? (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/35 p-3.5 text-center animate-fadeIn">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-1.5 shadow-md shadow-emerald-950/50">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm font-extrabold text-emerald-300">All 10 Phantom Nations Restored!</p>
            <p className="text-xs text-slate-400 mt-0.5">The world map is fully repaired and complete.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-center animate-fadeIn">
            <p className="text-sm font-bold text-rose-300">Unsolved Phantom Nations Revealed</p>
            <p className="text-xs text-slate-400 mt-0.5">All 10 missing nations have been restored onto the map.</p>
          </div>
        )}
      </div>
    </div>
  );
};
