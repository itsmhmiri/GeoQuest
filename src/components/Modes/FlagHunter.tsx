import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES } from '../../data/countries';
import { normalizeString, matchesCandidate } from '../../utils/normalize';
import { DifficultySelector } from '../Common/DifficultySelector';
import { Flag, Target, Flame, Trophy, RefreshCw, MousePointerClick, CheckCircle2, XCircle } from 'lucide-react';

export const FlagHunter: React.FC = () => {
  const {
    flagTarget,
    flagScore,
    flagStreak,
    flagRoundsPlayed,
    flagFeedback,
    startFlagHunter,
    submitFlagGuess,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'shake'>('idle');

  if (!flagTarget) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      e.preventDefault();
      const clean = normalizeString(inputVal.trim());

      const matched = COUNTRIES.find((c) =>
        matchesCandidate(clean, [c.name, c.officialName, ...c.aliases])
      );

      if (matched) {
        const ok = submitFlagGuess(matched.id);
        if (ok) {
          setFeedback('success');
          setTimeout(() => setFeedback('idle'), 600);
          setInputVal('');
        } else {
          setFeedback('shake');
          setTimeout(() => setFeedback('idle'), 600);
        }
      } else {
        setFeedback('shake');
        setTimeout(() => setFeedback('idle'), 600);
      }
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-xl">
      <div className="rounded-2xl bg-[#090e1c]/92 p-4.5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Ambient rose aura */}
        <div className="pointer-events-none absolute -top-12 -left-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-md shadow-rose-950/40">
              <Flag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">Flag Hunter · Visual ID</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Score: <strong className="text-emerald-400 tabular-nums font-mono">{flagScore}</strong></span>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                  <Flame className="h-3 w-3 fill-current" />
                  <strong className="tabular-nums font-mono">{flagStreak} streak</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={startFlagHunter}
            title="Restart round"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sub-header Controls: Difficulty Selector */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pool:</span>
            <DifficultySelector onDifficultyChange={() => startFlagHunter()} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Filters target flags
          </span>
        </div>

        {/* Flag Visual Stage */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/75 p-5 mb-3 border border-white/5 text-center shadow-inner relative overflow-hidden">
          <div className="absolute top-2.5 left-3 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            <MousePointerClick className="h-3 w-3 text-emerald-400" />
            <span>Interactive: Click directly on the world map</span>
          </div>

          <span className="text-7xl mt-4 mb-2 drop-shadow-2xl select-none transform hover:scale-105 transition-transform duration-200">
            {flagTarget.flagEmoji}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Continent: <strong className="text-white font-semibold">{flagTarget.continent}</strong>
          </p>
        </div>

        {/* Last round feedback */}
        {flagFeedback && (
          <div
            className={`mb-3 rounded-xl p-2.5 text-xs flex items-center justify-between animate-fadeIn border ${
              flagFeedback.correct
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              {flagFeedback.correct ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400" />
              )}
              <span>
                {flagFeedback.correct ? 'Correct! ' : 'Missed! It was '}{' '}
                <strong>{flagFeedback.country.name}</strong> ({flagFeedback.country.capital})
              </span>
            </span>
            <span className="text-[10px] opacity-80">{flagFeedback.country.subregion}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type country name or click on map..."
            autoFocus
            className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border transition-all ${
              feedback === 'success'
                ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : feedback === 'shake'
                ? 'border-rose-500 bg-rose-950/25 animate-shake'
                : 'border-slate-800/80 focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
            Or Click Map
          </span>
        </div>
      </div>
    </div>
  );
};
