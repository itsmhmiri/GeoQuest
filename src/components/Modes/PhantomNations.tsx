import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES_BY_ID } from '../../data/countries';
import { normalizeString, matchesCandidate } from '../../utils/normalize';
import { Ghost, HelpCircle, RefreshCw, Trophy, Flag, CheckCircle2 } from 'lucide-react';

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
      setTimeout(() => setFeedbackState('idle'), 600);
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-xl">
      <div className="rounded-2xl bg-slate-900/90 p-3.5 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Ghost className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">The Vanishing 10</h2>
                <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                  {vanishingSolvedIds.size} / 10 Restored
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                10 countries are missing from the map. Name them to restore landmasses!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (remaining.length > 0) {
                  setHintIndex((prev) => (prev === null ? 0 : (prev + 1) % remaining.length));
                }
              }}
              title="Get a hint"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Hint</span>
            </button>

            {!isComplete && !vanishingGiveUp && (
              <button
                onClick={giveUpVanishing}
                title="Reveal all"
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
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
              title="New mystery set"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Found Success Banner */}
        {lastFoundName && (
          <div className="mb-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 p-2 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Restored <strong>{lastFoundName}</strong> onto the world map!</span>
          </div>
        )}

        {/* Hint Banner if Active */}
        {hintIndex !== null && remaining[hintIndex] && (
          <div className="mb-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 p-2 text-xs text-amber-200">
            Hint: A missing nation is located in{' '}
            <strong className="text-white">{remaining[hintIndex].continent}</strong> (starts with{' '}
            <strong className="text-white">{remaining[hintIndex].name[0]}</strong>).
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
              placeholder="Name a missing country..."
              autoFocus
              className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none border transition-all ${
                feedback === 'success'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : feedback === 'shake'
                  ? 'border-rose-500 animate-shake'
                  : 'border-slate-800 focus:border-indigo-500/50'
              }`}
            />
          </div>
        ) : isComplete ? (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-center">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <Trophy className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-emerald-300">All 10 Missing Nations Restored!</p>
            <p className="text-xs text-slate-400 mt-0.5">The continental map is fully intact.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-center">
            <p className="text-sm font-bold text-rose-300">Unsolved Phantom Nations Revealed</p>
            <p className="text-xs text-slate-400 mt-0.5">All 10 missing nations have been restored onto the map.</p>
          </div>
        )}
      </div>
    </div>
  );
};
