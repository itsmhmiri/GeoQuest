import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { ArrowUp, ArrowDown, Flame, Trophy, RefreshCw, BarChart2, CheckCircle2, XCircle } from 'lucide-react';

export const StatBattle: React.FC = () => {
  const {
    statCountryA,
    statCountryB,
    statMetric,
    statScore,
    statBestScore,
    statGameOver,
    statRevealed,
    statIsCorrect,
    startStatBattle,
    answerStatBattle,
  } = useGameStore();

  if (!statCountryA || !statCountryB) {
    return null;
  }

  const metricLabel = statMetric === 'population' ? 'Population' : 'Land Area (km²)';

  const formatStat = (val: number) => {
    return val.toLocaleString();
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-xl">
      <div className="rounded-2xl bg-slate-900/90 p-5 backdrop-blur-xl border border-white/10 shadow-2xl relative">
        {/* Floating Correct Toast Badge */}
        {statRevealed && statIsCorrect === true && (
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/90 text-slate-950 px-4 py-1 text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
            <span>Correct! +1 Streak</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Higher or Lower · Stat Battle</h2>
              <p className="text-[11px] text-slate-400">Compare national demographics & territory</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold tabular-nums">{statScore} Streak</span>
            </div>
            <div className="text-xs text-slate-400">
              Best: <strong className="text-slate-200 tabular-nums">{statBestScore}</strong>
            </div>
          </div>
        </div>

        {/* Dual Cards Comparison Split */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Card A: Reference Country */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/70 p-4 border border-white/5 text-center">
            <span className="text-4xl mb-2">{statCountryA.flagEmoji}</span>
            <h3 className="text-sm font-bold text-white truncate max-w-full">{statCountryA.name}</h3>
            <span className="text-[11px] text-slate-400 mb-2">{statCountryA.continent}</span>
            <div className="w-full rounded-lg bg-slate-900/80 py-1.5 px-2 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {metricLabel}
              </span>
              <span className="text-sm font-bold text-sky-400 tabular-nums">
                {formatStat(statCountryA[statMetric])}
              </span>
            </div>
          </div>

          {/* Card B: Challenger Country */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl p-4 border text-center relative overflow-hidden transition-all duration-200 ${
              statRevealed && statIsCorrect === true
                ? 'bg-emerald-950/30 border-emerald-500/50 ring-2 ring-emerald-500/30'
                : statRevealed && statIsCorrect === false
                ? 'bg-rose-950/30 border-rose-500/50 ring-2 ring-rose-500/30'
                : 'bg-slate-950/70 border-white/5'
            }`}
          >
            <span className="text-4xl mb-2">{statCountryB.flagEmoji}</span>
            <h3 className="text-sm font-bold text-white truncate max-w-full">{statCountryB.name}</h3>
            <span className="text-[11px] text-slate-400 mb-2">{statCountryB.continent}</span>

            {statRevealed || statGameOver ? (
              <div
                className={`w-full rounded-lg py-1.5 px-2 border transition-all ${
                  statIsCorrect === true
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                  {statIsCorrect === true ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>Actual {metricLabel}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-rose-400" />
                      <span>Actual {metricLabel}</span>
                    </>
                  )}
                </div>
                <span className="text-base font-bold tabular-nums">
                  {formatStat(statCountryB[statMetric])}
                </span>
              </div>
            ) : (
              <div className="w-full rounded-lg bg-slate-900/80 py-1.5 px-2 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Has a {metricLabel}
                </span>
                <span className="text-sm font-bold text-amber-400">?</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons / Intermediate Revealed State / Game Over State */}
        {!statGameOver ? (
          statRevealed ? (
            <div
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold border animate-fadeIn transition-colors ${
                statIsCorrect === true
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}
            >
              {statIsCorrect === true ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Correct! Loading next comparison...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-400" />
                  <span>Incorrect! Resolving score...</span>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => answerStatBattle('higher')}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                <ArrowUp className="h-4 w-4" />
                <span>HIGHER than {statCountryA.name}</span>
              </button>

              <button
                onClick={() => answerStatBattle('lower')}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-xs font-bold text-slate-950 hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98]"
              >
                <ArrowDown className="h-4 w-4" />
                <span>LOWER than {statCountryA.name}</span>
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-950/30 border border-rose-500/20 p-3">
            <div>
              <p className="text-xs font-bold text-rose-300">Run Terminated</p>
              <p className="text-[11px] text-slate-400">Final Streak: {statScore}</p>
            </div>
            <button
              onClick={startStatBattle}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
