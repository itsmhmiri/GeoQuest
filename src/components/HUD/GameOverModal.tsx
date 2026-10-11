import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES, COUNTRIES_BY_ID } from '../../data/countries';
import { Trophy, RefreshCw, Eye, BookOpen, Clock, Target, CheckCircle2, XCircle } from 'lucide-react';

interface GameOverModalProps {
  onCloseReview?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onCloseReview }) => {
  const {
    conquestSolved,
    conquestSecondsElapsed,
    conquestGiveUp,
    startConquest,
    setSelectedCountry,
    setCurrentMode,
  } = useGameStore();

  const total = COUNTRIES.length;
  const solvedCount = conquestSolved.size;
  const missedCountries = COUNTRIES.filter((c) => !conquestSolved.has(c.id));
  const accuracy = ((solvedCount / total) * 100).toFixed(1);
  const isVictory = solvedCount === total;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        {/* Header Ribbon */}
        <div className="p-6 border-b border-slate-800 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isVictory
              ? 'Global Conquest Achieved!'
              : conquestGiveUp
              ? 'Conquest Concluded'
              : 'Time Expired!'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {isVictory
              ? 'You have successfully identified every sovereign nation on Earth.'
              : `You discovered ${solvedCount} of ${total} nations.`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Discovered</span>
            </div>
            <span className="text-xl font-bold text-white tabular-nums">{solvedCount}</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Target className="h-3.5 w-3.5 text-sky-400" />
              <span>Completion</span>
            </div>
            <span className="text-xl font-bold text-white tabular-nums">{accuracy}%</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Time</span>
            </div>
            <span className="text-xl font-bold text-white tabular-nums">
              {formatTime(conquestSecondsElapsed)}
            </span>
          </div>
        </div>

        {/* Missed Countries Drawer */}
        {missedCountries.length > 0 && (
          <div className="p-6 max-h-60 overflow-y-auto border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Missed Nations ({missedCountries.length})
              </span>
              <span className="text-xs text-slate-500">Click any country to inspect</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {missedCountries.slice(0, 30).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCountry(c);
                    if (onCloseReview) onCloseReview();
                  }}
                  className="flex items-center gap-2 rounded-lg bg-slate-950/50 p-2 text-left hover:bg-rose-950/30 border border-white/5 hover:border-rose-500/30 transition-all group"
                >
                  <span className="text-base">{c.flagEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-300 group-hover:text-rose-200">
                      {c.name}
                    </p>
                    <p className="truncate text-[10px] text-slate-500">{c.capital}</p>
                  </div>
                </button>
              ))}
            </div>
            {missedCountries.length > 30 && (
              <p className="mt-3 text-center text-xs text-slate-500">
                + {missedCountries.length - 30} more missed nations
              </p>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 p-6 bg-slate-900">
          <button
            onClick={() => {
              setCurrentMode('atlas');
              if (onCloseReview) onCloseReview();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Atlas Study</span>
          </button>

          <div className="flex items-center gap-3">
            {onCloseReview && (
              <button
                onClick={onCloseReview}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Review Map</span>
              </button>
            )}

            <button
              onClick={() => {
                startConquest();
                if (onCloseReview) onCloseReview();
              }}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
