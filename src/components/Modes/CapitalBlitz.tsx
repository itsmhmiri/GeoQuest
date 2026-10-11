import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES } from '../../data/countries';
import { Landmark, FastForward, Timer, Trophy, Flame, Play, RefreshCw } from 'lucide-react';

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

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl">
      <div className="rounded-2xl bg-slate-900/90 p-4 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Capital City Blitz</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Score: <strong className="text-emerald-400 tabular-nums">{capitalScore}</strong></span>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Flame className="h-3 w-3" />
                  <strong className="tabular-nums">{capitalStreak} streak</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Variant Toggle */}
            <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-white/5">
              <button
                onClick={() => setCapitalVariant('targeted')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  capitalVariant === 'targeted'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Targeted
              </button>
              <button
                onClick={() => setCapitalVariant('freeflow')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  capitalVariant === 'freeflow'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Freeflow
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-950 px-2.5 py-1.5 border border-white/5 text-xs font-medium tabular-nums text-slate-200">
              <Timer className="h-3.5 w-3.5 text-amber-400" />
              <span>{formatTime(capitalSecondsLeft)}</span>
            </div>

            <button
              onClick={startCapitalBlitz}
              title="Restart"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Game State Body */}
        {!capitalIsActive && !capitalIsFinished ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-300 mb-3">
              Test your knowledge of world capitals under pressure. 90-second blitz timer!
            </p>
            <button
              onClick={startCapitalBlitz}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Capital Blitz</span>
            </button>
          </div>
        ) : capitalIsFinished ? (
          <div className="text-center py-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-2">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Blitz Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Final Score: <span className="font-bold text-amber-400 tabular-nums">{capitalScore}</span> · Solved: <span className="font-bold text-emerald-400 tabular-nums">{capitalSolved.size} capitals</span>
            </p>
            <button
              onClick={startCapitalBlitz}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        ) : (
          <div>
            {capitalVariant === 'targeted' && capitalCurrentTarget && (
              <div className="flex items-center justify-between mb-3 rounded-xl bg-amber-950/30 border border-amber-500/20 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{capitalCurrentTarget.flagEmoji}</span>
                  <div>
                    <span className="text-[11px] text-amber-400/80 uppercase font-semibold">
                      Capital of
                    </span>
                    <h3 className="text-base font-bold text-white">{capitalCurrentTarget.name}</h3>
                  </div>
                </div>

                <button
                  onClick={skipCapital}
                  title="Skip (-15s penalty)"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-white/5"
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
                className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none border transition-all ${
                  feedback === 'success'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : feedback === 'shake'
                    ? 'border-rose-500 animate-shake'
                    : 'border-slate-800 focus:border-amber-500/50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                Press Enter
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
