import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES, COUNTRIES_BY_ID } from '../../data/countries';
import { normalizeString, matchesCandidate } from '../../utils/normalize';
import { DifficultySelector } from '../Common/DifficultySelector';
import { Route, CheckCircle2, ArrowRight, RefreshCw, Trophy, Compass, Footprints } from 'lucide-react';

export const BorderBridge: React.FC = () => {
  const {
    bridgeStart,
    bridgeTarget,
    bridgeChain,
    bridgeComplete,
    startBridge,
    addBridgeNeighbor,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'shake'>('idle');

  if (!bridgeStart || !bridgeTarget) return null;

  const currentHeadId = bridgeChain[bridgeChain.length - 1];
  const currentHead = COUNTRIES_BY_ID.get(currentHeadId);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      e.preventDefault();
      const clean = normalizeString(inputVal.trim());

      // Find matching country
      const matched = COUNTRIES.find((c) =>
        matchesCandidate(clean, [c.name, c.officialName, ...c.aliases])
      );

      if (matched) {
        const ok = addBridgeNeighbor(matched.id);
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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl">
      <div className="rounded-2xl bg-[#090e1c]/92 p-4.5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Ambient cyan glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/40">
              <Route className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">Border Bridge · Geography Chain</h2>
              <p className="text-[11px] text-slate-400">
                Connect contiguous land neighbors to traverse from origin to destination
              </p>
            </div>
          </div>

          <button
            onClick={() => startBridge()}
            title="Generate new route challenge"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-white/5 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>New Route</span>
          </button>
        </div>

        {/* Sub-header Controls: Difficulty Selector */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Route:</span>
            <DifficultySelector onDifficultyChange={() => startBridge()} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Filters expedition route difficulty
          </span>
        </div>

        {/* Mission Objectives: Start -> Destination */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/70 p-3.5 mb-3 border border-white/5 shadow-inner">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow">{bridgeStart.flagEmoji}</span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                Origin
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-white">{bridgeStart.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span className="h-[1px] w-6 bg-slate-700 hidden sm:block" />
            <ArrowRight className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="h-[1px] w-6 bg-slate-700 hidden sm:block" />
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Destination
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-white">{bridgeTarget.name}</p>
            </div>
            <span className="text-2xl drop-shadow">{bridgeTarget.flagEmoji}</span>
          </div>
        </div>

        {/* Active Chain Path Nodes */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Footprints className="h-3 w-3 text-cyan-400" />
              <span>Waypoints ({bridgeChain.length} steps):</span>
            </span>
            {currentHead && (
              <span>Frontier: <strong className="text-cyan-300 font-bold">{currentHead.name}</strong></span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-white/5 min-h-[46px]">
            {bridgeChain.map((id, index) => {
              const country = COUNTRIES_BY_ID.get(id);
              if (!country) return null;
              const isLatest = index === bridgeChain.length - 1;

              return (
                <React.Fragment key={`${id}-${index}`}>
                  <div
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                      isLatest
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                        : 'bg-slate-900/90 text-slate-300 border-white/5'
                    }`}
                  >
                    <span>{country.flagEmoji}</span>
                    <span>{country.name}</span>
                  </div>
                  {index < bridgeChain.length - 1 && (
                    <span className="text-[10px] text-slate-600 font-bold">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Input or Victory State */}
        {!bridgeComplete ? (
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Name a land neighbor of ${currentHead?.name || 'frontier'}...`}
              autoFocus
              className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none border transition-all ${
                feedback === 'success'
                  ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                  : feedback === 'shake'
                  ? 'border-rose-500 bg-rose-950/25 animate-shake'
                  : 'border-slate-800/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
              Press ↵
            </span>
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/35 p-3.5 text-center animate-fadeIn">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-1.5 shadow-md shadow-emerald-950/50">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm font-extrabold text-emerald-300">Expedition Route Completed!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Successfully bridged {bridgeStart.name} to {bridgeTarget.name} in {bridgeChain.length} steps.
            </p>
            <button
              onClick={() => startBridge()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Next Route</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
