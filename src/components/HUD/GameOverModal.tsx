import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES } from '../../data/countries';
import { Trophy, RefreshCw, Eye, BookOpen, Clock, Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    bestRecords,
    setRecordsModalOpen,
  } = useGameStore();

  const total = COUNTRIES.length;
  const solvedCount = conquestSolved.size;
  const missedCountries = COUNTRIES.filter((c) => !conquestSolved.has(c.id));
  const accuracy = ((solvedCount / total) * 100).toFixed(1);
  const isVictory = solvedCount === total;
  const isNewBest = solvedCount > 0 && solvedCount >= bestRecords.conquestBestCount;

  useEffect(() => {
    if (isVictory) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isVictory]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-[#090e1c] border border-white/10 shadow-2xl">
        {/* Header Ribbon */}
        <div className="p-4 sm:p-6 border-b border-white/10 text-center shrink-0">
          <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 mb-2 sm:mb-3 border border-emerald-500/30">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          {isNewBest && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse">
                ★ NEW PERSONAL BEST RECORD! ★
              </span>
            </div>
          )}
          <h2 className="text-lg sm:text-xl font-black text-white">
            {isVictory
              ? 'Global Conquest Achieved!'
              : conquestGiveUp
              ? 'Conquest Concluded'
              : 'Time Expired!'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {isVictory
              ? 'You have successfully identified every sovereign nation on Earth.'
              : `You discovered ${solvedCount} of ${total} nations. (Personal Best: ${Math.max(solvedCount, bestRecords.conquestBestCount)})`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-5 border-b border-white/10 bg-slate-950/50 shrink-0">
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/70 p-2 sm:p-3 border border-white/5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">
              <CheckCircle2 className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-emerald-400" />
              <span>Found</span>
            </div>
            <span className="text-base sm:text-xl font-black text-white tabular-nums font-mono">{solvedCount}</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/70 p-2 sm:p-3 border border-white/5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">
              <Target className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-sky-400" />
              <span>Rate</span>
            </div>
            <span className="text-base sm:text-xl font-black text-white tabular-nums font-mono">{accuracy}%</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/70 p-2 sm:p-3 border border-white/5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1">
              <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-amber-400" />
              <span>Time</span>
            </div>
            <span className="text-base sm:text-xl font-black text-white tabular-nums font-mono">
              {formatTime(conquestSecondsElapsed)}
            </span>
          </div>
        </div>

        {/* Missed Countries Drawer */}
        {missedCountries.length > 0 && (
          <div className="p-3 sm:p-5 flex-1 overflow-y-auto border-b border-white/10">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-rose-400 uppercase tracking-wider">
                Missed Nations ({missedCountries.length})
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500">Tap to inspect</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {missedCountries.slice(0, 36).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCountry(c);
                    if (onCloseReview) onCloseReview();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-slate-950/60 p-2 text-left hover:bg-rose-950/30 border border-white/5 hover:border-rose-500/30 transition-all group"
                >
                  <span className="text-base sm:text-lg">{c.flagEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-300 group-hover:text-rose-200">
                      {c.name}
                    </p>
                    <p className="truncate text-[9px] sm:text-[10px] text-slate-500">{c.capital}</p>
                  </div>
                </button>
              ))}
            </div>
            {missedCountries.length > 36 && (
              <p className="mt-2.5 text-center text-xs text-slate-500">
                + {missedCountries.length - 36} more missed nations
              </p>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 sm:p-5 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setCurrentMode('atlas');
                if (onCloseReview) onCloseReview();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Atlas Study</span>
            </button>

            <button
              onClick={() => {
                setRecordsModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Records</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {onCloseReview && (
              <button
                onClick={onCloseReview}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Review Map</span>
              </button>
            )}

            <button
              onClick={() => {
                startConquest();
                if (onCloseReview) onCloseReview();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
