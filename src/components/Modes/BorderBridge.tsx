import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES, COUNTRIES_BY_ID } from '../../data/countries';
import { normalizeString, matchesCandidate } from '../../utils/normalize';
import { Route, CheckCircle2, ArrowRight, RefreshCw, Trophy } from 'lucide-react';

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
      <div className="rounded-2xl bg-slate-900/90 p-4 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Border Bridge · Geography Chain</h2>
              <p className="text-[11px] text-slate-400">
                Connect terrestrial neighbors to bridge from start to destination
              </p>
            </div>
          </div>

          <button
            onClick={() => startBridge()}
            title="New route challenge"
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>New Route</span>
          </button>
        </div>

        {/* Mission Objectives: Start -> Destination */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-950/70 p-3 mb-3 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{bridgeStart.flagEmoji}</span>
            <div>
              <span className="text-[10px] uppercase font-semibold text-sky-400">Origin</span>
              <p className="text-xs font-bold text-white">{bridgeStart.name}</p>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />

          <div className="flex items-center gap-2">
            <span className="text-xl">{bridgeTarget.flagEmoji}</span>
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-400">Target</span>
              <p className="text-xs font-bold text-white">{bridgeTarget.name}</p>
            </div>
          </div>
        </div>

        {/* Active Chain Path Chips */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
            <span>Illuminated Pathway ({bridgeChain.length} steps):</span>
            {currentHead && (
              <span>Current Frontier: <strong className="text-sky-300">{currentHead.name}</strong></span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/50 border border-white/5 min-h-[42px]">
            {bridgeChain.map((id, index) => {
              const country = COUNTRIES_BY_ID.get(id);
              if (!country) return null;
              const isLatest = index === bridgeChain.length - 1;

              return (
                <React.Fragment key={`${id}-${index}`}>
                  <div
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border ${
                      isLatest
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-900 text-slate-300 border-white/5'
                    }`}
                  >
                    <span>{country.flagEmoji}</span>
                    <span>{country.name}</span>
                  </div>
                  {index < bridgeChain.length - 1 && (
                    <span className="text-[10px] text-slate-600">→</span>
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
              placeholder={`Name a land neighbor of ${currentHead?.name}...`}
              autoFocus
              className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none border transition-all ${
                feedback === 'success'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : feedback === 'shake'
                  ? 'border-rose-500 animate-shake'
                  : 'border-slate-800 focus:border-sky-500/50'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
              Press Enter
            </span>
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-center">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <Trophy className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-emerald-300">Border Bridge Complete!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Unbroken terrestrial connection formed across {bridgeChain.length} nations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
