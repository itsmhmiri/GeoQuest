import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { DifficultySelector } from '../Common/DifficultySelector';
import { Landmark, FastForward, Timer, Trophy, Flame, Play, RefreshCw, Zap } from 'lucide-react';

export const CapitalBlitz: React.FC = () => {
  const {
    capitalVariant,
    setCapitalVariant,
    capitalCurrentTarget,
    capitalSolved,
    capitalScore,
    capitalStreak,
    capitalSecondsLeft,
    capitalIsActive,
    capitalIsFinished,
    startCapitalBlitz,
    guessCapital,
    skipCapital,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'shake'>('idle');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      e.preventDefault();
      const success = guessCapital(inputVal.trim());
      if (success) {
        setFeedback('success');
        setTimeout(() => setFeedback('idle'), 600);
        setInputVal('');
      } else {
        setFeedback('shake');
        setTimeout(() => setFeedback('idle'), 600);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = capitalSecondsLeft <= 15 && capitalIsActive;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl">
      <div className="rounded-2xl bg-[#0a0f1e]/92 p-4.5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle amber ambient rim glow */}
        <div className="pointer-events-none absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-950/40">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">Capital City Blitz</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Score: <strong className="text-emerald-400 tabular-nums font-mono">{capitalScore}</strong></span>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                  <Flame className="h-3 w-3 fill-current" />
                  <strong className="tabular-nums font-mono">{capitalStreak} streak</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Variant Toggle */}
            <div className="flex items-center rounded-xl bg-slate-950/80 p-1 border border-white/5">
              <button
                onClick={() => setCapitalVariant('targeted')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  capitalVariant === 'targeted'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Targeted
              </button>
              <button
                onClick={() => setCapitalVariant('freeflow')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  capitalVariant === 'freeflow'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Freeflow
              </button>
            </div>

            {/* Timer Badge with Urgency animation */}
            <div
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 border text-xs font-bold tabular-nums font-mono transition-all ${
                isUrgent
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-slate-950/80 border-white/5 text-slate-200'
              }`}
            >
              <Timer className={`h-3.5 w-3.5 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
              <span>{formatTime(capitalSecondsLeft)}</span>
            </div>

            <button
              onClick={startCapitalBlitz}
              title="Restart blitz"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-header Controls: Difficulty Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pool:</span>
            <DifficultySelector onDifficultyChange={() => startCapitalBlitz()} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Filters target capital cities
          </span>
        </div>

        {/* Game State Body */}
        {!capitalIsActive && !capitalIsFinished ? (
          <div className="text-center py-4">
            <p className="text-xs sm:text-sm text-slate-300 mb-3.5">
              Test your rapid recall of sovereign capitals under clock pressure. 90-second blitz timer!
            </p>
            <button
              onClick={startCapitalBlitz}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Capital Blitz</span>
            </button>
          </div>
        ) : capitalIsFinished ? (
          <div className="text-center py-4 animate-fadeIn">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-2 border border-amber-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">Blitz Round Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Final Score: <span className="font-bold text-amber-400 tabular-nums font-mono">{capitalScore}</span> · Solved: <span className="font-bold text-emerald-400 tabular-nums font-mono">{capitalSolved.size} capitals</span>
            </p>
            <button
              onClick={startCapitalBlitz}
              className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        ) : (
          <div>
            {capitalVariant === 'targeted' && capitalCurrentTarget && (
              <div className="flex items-center justify-between mb-3 rounded-2xl bg-amber-950/30 border border-amber-500/25 p-3.5 shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="text-3xl drop-shadow">{capitalCurrentTarget.flagEmoji}</span>
                  <div>
                    <span className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">
                      Capital of
                    </span>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {capitalCurrentTarget.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={skipCapital}
                  title="Skip (-15s penalty)"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/90 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-white/5 active:scale-95"
                >
                  <FastForward className="h-3.5 w-3.5 text-amber-400" />
                  <span>Skip (-15s)</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  capitalVariant === 'targeted'
                    ? `Type capital city of ${capitalCurrentTarget?.name}...`
                    : 'Type any world capital (e.g. Ottawa, Tokyo, Paris)...'
                }
                autoFocus
                className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border transition-all ${
                  feedback === 'success'
                    ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : feedback === 'shake'
                    ? 'border-rose-500 bg-rose-950/25 animate-shake'
                    : 'border-slate-800/80 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                Press ↵
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
