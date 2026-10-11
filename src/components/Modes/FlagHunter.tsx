import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES } from '../../data/countries';
import { normalizeString, matchesCandidate } from '../../utils/normalize';
import { Flag, Target, Flame, Trophy, RefreshCw } from 'lucide-react';

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
      <div className="rounded-2xl bg-slate-900/90 p-4 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Flag Hunter · Visual Identification</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Score: <strong className="text-emerald-400 tabular-nums">{flagScore}</strong></span>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Flame className="h-3 w-3" />
                  <strong className="tabular-nums">{flagStreak} streak</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={startFlagHunter}
            title="Restart"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Flag Visual Stage */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/70 p-4 mb-3 border border-white/5 text-center">
          <span className="text-6xl drop-shadow-md mb-2">{flagTarget.flagEmoji}</span>
          <p className="text-xs text-slate-400">
            Type country name below <strong className="text-emerald-400">OR click directly on the map</strong>
          </p>
        </div>

        {/* Last round feedback */}
        {flagFeedback && (
          <div
            className={`mb-3 rounded-lg p-2 text-xs flex items-center justify-between ${
              flagFeedback.correct
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
            }`}
          >
            <span>
              {flagFeedback.correct ? '✓ Correct!' : '✗ Missed! It was:'}{' '}
              <strong>{flagFeedback.country.name}</strong> ({flagFeedback.country.capital})
            </span>
            <span>{flagFeedback.country.continent}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Identify country by flag..."
            autoFocus
            className={`w-full rounded-xl bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none border transition-all ${
              feedback === 'success'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : feedback === 'shake'
                ? 'border-rose-500 animate-shake'
                : 'border-slate-800 focus:border-emerald-500/50'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
            Or Click Map
          </span>
        </div>
      </div>
    </div>
  );
};
