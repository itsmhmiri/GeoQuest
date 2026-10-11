import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { DifficultySelector } from '../Common/DifficultySelector';
import {
  ArrowUp,
  ArrowDown,
  Flame,
  RefreshCw,
  Users,
  Maximize2,
  CheckCircle2,
  XCircle,
  BarChart2,
} from 'lucide-react';

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
    setStatMetric,
    startStatBattle,
    answerStatBattle,
  } = useGameStore();

  if (!statCountryA || !statCountryB) {
    return null;
  }

  const isPopulation = statMetric === 'population';
  const metricTitle = isPopulation ? 'Population Battle' : 'Land Area Battle';
  const metricSubtitle = isPopulation
    ? 'Compare citizen counts: which country has more people?'
    : 'Compare geographic surface: which nation covers more land (km²)?';
  const metricUnitLabel = isPopulation ? 'Population' : 'Land Area';
  const metricUnitSuffix = isPopulation ? 'citizens' : 'km²';

  const formatStat = (val: number) => {
    return `${val.toLocaleString()} ${metricUnitSuffix}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto z-10">
      {/* Atmospheric Arena Background Lighting (Disabling Map and Replacing with Focused Arena Ambience) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Left Side Demographics Glow */}
        <div
          className={`absolute -left-20 top-1/4 w-[420px] h-[420px] rounded-full blur-[100px] transition-colors duration-700 ${
            isPopulation ? 'bg-sky-500/12' : 'bg-teal-500/12'
          }`}
        />
        {/* Right Side Territory Glow */}
        <div
          className={`absolute -right-20 bottom-1/4 w-[420px] h-[420px] rounded-full blur-[100px] transition-colors duration-700 ${
            isPopulation ? 'bg-indigo-500/12' : 'bg-emerald-500/12'
          }`}
        />
        {/* Central Clash Ambient Core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-900/50 blur-3xl" />
        {/* Subtle arena micro-dot grid for high-tech tactical arena feel */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
      </div>

      {/* Main Arena Card Container */}
      <div className="relative z-10 w-full max-w-xl my-auto">
        <div className="rounded-2xl sm:rounded-3xl bg-[#090e1c]/95 p-3.5 sm:p-5 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Floating Correct Toast Badge */}
          {statRevealed && statIsCorrect === true && (
            <div className="pointer-events-none absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 text-slate-950 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black shadow-xl shadow-emerald-500/30 flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 stroke-[3]" />
              <span>EXCELLENT! +1 STREAK</span>
            </div>
          )}

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border shadow-md ${
              isPopulation
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-sky-950/40'
                : 'bg-teal-500/15 text-teal-300 border-teal-500/30 shadow-teal-950/40'
            }`}>
              {isPopulation ? <Users className="h-4 sm:h-4.5 w-4 sm:w-4.5" /> : <Maximize2 className="h-4 sm:h-4.5 w-4 sm:w-4.5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">{metricTitle}</h2>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                  isPopulation ? 'bg-sky-500/20 text-sky-300' : 'bg-teal-500/20 text-teal-300'
                }`}>
                  {isPopulation ? 'Demographics' : 'Territory'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                {metricSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] sm:text-xs text-amber-300 font-bold shadow-sm">
              <Flame className="h-3 sm:h-3.5 w-3 sm:w-3.5 fill-current text-amber-400 animate-pulse" />
              <span className="tabular-nums font-mono">{statScore} Streak</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
              Best: <strong className="text-slate-200 tabular-nums font-mono">{statBestScore}</strong>
            </div>
          </div>
        </div>

        {/* Dedicated Metric Selector (Separating Population & Land Area) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 mb-3 shadow-inner">
          <button
            onClick={() => setStatMetric('population')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
              isPopulation
                ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-slate-950 shadow-md shadow-sky-500/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Population Battle</span>
          </button>

          <button
            onClick={() => setStatMetric('areaSqKm')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
              !isPopulation
                ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5 shrink-0" />
            <span>Land Area Battle (km²)</span>
          </button>
        </div>

        {/* Sub-header Controls: Difficulty Selector & Shuffle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pool:</span>
            <DifficultySelector onDifficultyChange={() => startStatBattle()} />
          </div>
          <button
            onClick={() => startStatBattle()}
            title="Next comparison"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] sm:text-xs text-slate-300 transition-colors border border-white/5 active:scale-95"
          >
            <RefreshCw className="h-3 w-3" />
            <span>New Match</span>
          </button>
        </div>

        {/* Dual Cards Comparison Split with Center VS badge */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Center VS Badge */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-950 border border-white/20 text-[9px] sm:text-[10px] font-black text-slate-300 shadow-xl">
            VS
          </div>

          {/* Card A: Reference Country */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 p-2.5 sm:p-4 border border-white/[0.08] text-center shadow-inner relative overflow-hidden group">
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
              Reference
            </div>
            <span className="text-3xl sm:text-4xl my-1.5 sm:my-2 drop-shadow-md">{statCountryA.flagEmoji}</span>
            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-full tracking-tight">
              {statCountryA.name}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mb-2 sm:mb-2.5">{statCountryA.continent}</span>

            <div className="w-full rounded-xl bg-slate-900/90 py-1.5 sm:py-2 px-2 sm:px-2.5 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                {metricUnitLabel}
              </span>
              <span className={`text-xs sm:text-sm font-black tabular-nums font-mono ${
                isPopulation ? 'text-sky-400' : 'text-teal-300'
              }`}>
                {formatStat(statCountryA[statMetric])}
              </span>
            </div>
          </div>

          {/* Card B: Challenger Country */}
          <div
            className={`flex flex-col items-center justify-center rounded-2xl p-2.5 sm:p-4 border text-center relative overflow-hidden transition-all duration-300 ${
              statRevealed && statIsCorrect === true
                ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
                : statRevealed && statIsCorrect === false
                ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
                : 'bg-slate-950/70 border-white/[0.08]'
            }`}
          >
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 border border-amber-500/20">
              Challenger
            </div>
            <span className="text-3xl sm:text-4xl my-1.5 sm:my-2 drop-shadow-md">{statCountryB.flagEmoji}</span>
            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-full tracking-tight">
              {statCountryB.name}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mb-2 sm:mb-2.5">{statCountryB.continent}</span>

            {statRevealed || statGameOver ? (
              <div
                className={`w-full rounded-xl py-1.5 sm:py-2 px-2 sm:px-2.5 border transition-all ${
                  statIsCorrect === true
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {statIsCorrect === true ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>Actual {metricUnitLabel}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-rose-400" />
                      <span>Actual {metricUnitLabel}</span>
                    </>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-black tabular-nums font-mono">
                  {formatStat(statCountryB[statMetric])}
                </span>
              </div>
            ) : (
              <div className="w-full rounded-xl bg-slate-900/90 py-1.5 sm:py-2 px-2 sm:px-2.5 border border-white/5">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Has a {metricUnitLabel}
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-400">?</span>
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
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
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
                  <span>Incorrect! Resolving streak...</span>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => answerStatBattle('higher')}
                className="group flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 sm:py-3 px-2 text-center text-[11px] sm:text-xs font-black text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
              >
                <ArrowUp className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5" />
                <span className="truncate">
                  {isPopulation ? 'HIGHER Population' : 'LARGER Land Area'}
                </span>
              </button>

              <button
                onClick={() => answerStatBattle('lower')}
                className="group flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 sm:py-3 px-2 text-center text-[11px] sm:text-xs font-black text-slate-950 hover:from-rose-400 hover:to-pink-400 transition-all shadow-lg shadow-rose-500/25 active:scale-[0.98]"
              >
                <ArrowDown className="h-4 w-4 shrink-0 transition-transform group-hover:translate-y-0.5" />
                <span className="truncate">
                  {isPopulation ? 'LOWER Population' : 'SMALLER Land Area'}
                </span>
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-950/30 border border-rose-500/25 p-3.5">
            <div>
              <p className="text-xs font-bold text-rose-300">Run Terminated</p>
              <p className="text-[11px] text-slate-400">
                Final {metricUnitLabel} Streak: <strong className="text-white font-mono">{statScore}</strong>
              </p>
            </div>
            <button
              onClick={() => startStatBattle()}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-slate-200 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
