import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  Trophy,
  X,
  History,
  Award,
  Globe2,
  Ghost,
  Landmark,
  BarChart2,
  Route,
  Flag,
  BookOpen,
  Trash2,
  Sparkles,
  CheckCircle2,
  Flame,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({ isOpen, onClose }) => {
  const {
    bestRecords,
    recentActivities,
    achievements,
    resetAllLocalData,
    setCurrentMode,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'bests' | 'activity' | 'achievements'>('bests');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const formatTimestamp = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'global_conquest':
        return <Globe2 className="h-4 w-4 text-emerald-400" />;
      case 'vanishing_10':
        return <Ghost className="h-4 w-4 text-indigo-400" />;
      case 'capital_blitz':
        return <Landmark className="h-4 w-4 text-amber-400" />;
      case 'higher_lower':
        return <BarChart2 className="h-4 w-4 text-sky-400" />;
      case 'border_bridge':
        return <Route className="h-4 w-4 text-cyan-400" />;
      case 'flag_hunter':
        return <Flag className="h-4 w-4 text-rose-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="h-5 w-5 text-amber-400" />;
      case 'Globe':
        return <Globe2 className="h-5 w-5 text-emerald-400" />;
      case 'Trophy':
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case 'Ghost':
        return <Ghost className="h-5 w-5 text-indigo-400" />;
      case 'Landmark':
        return <Landmark className="h-5 w-5 text-amber-400" />;
      case 'BarChart2':
        return <BarChart2 className="h-5 w-5 text-sky-400" />;
      case 'Route':
        return <Route className="h-5 w-5 text-cyan-400" />;
      case 'Flag':
        return <Flag className="h-5 w-5 text-rose-400" />;
      case 'BookOpen':
        return <BookOpen className="h-5 w-5 text-teal-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-purple-400" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl bg-[#090f22] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 shrink-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-950/50">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Records & Activity</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Local Storage</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved offline on this browser · No account or backend required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-white/5"
            title="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-white/10 bg-slate-950/40 shrink-0">
          <button
            onClick={() => setActiveTab('bests')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'bests'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Personal Bests</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'activity'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Activity Feed</span>
            {recentActivities.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                {recentActivities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'achievements'
                ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Milestones</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-mono">
              {unlockedCount}/{achievements.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Personal Bests */}
        {activeTab === 'bests' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Lifetime Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-2xl bg-slate-900/80 p-3 border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Games Played
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                  {bestRecords.totalGamesPlayed}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 p-3 border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Nations Discovered
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                  {bestRecords.totalCountriesDiscovered}
                  <span className="text-xs text-slate-500 font-normal ml-1">/ 197</span>
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 p-3 border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Blitz High Score
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
                  {bestRecords.capitalBlitzHighScore.toLocaleString()}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 p-3 border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Stat Max Streak
                </span>
                <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">
                  {bestRecords.higherLowerBestStreak}
                </span>
              </div>
            </div>

            {/* Mode-by-Mode Record Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Global Conquest */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900/60 p-4 border border-emerald-500/20 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">Global Conquest</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Mode 1
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Best Country Count:</span>
                  <span className="text-lg font-black text-emerald-300 font-mono">
                    {bestRecords.conquestBestCount}{' '}
                    <span className="text-xs text-slate-500 font-normal">/ 197</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (bestRecords.conquestBestCount / 197) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* 2. Phantom 10 */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900/60 p-4 border border-indigo-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                      <Ghost className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">Phantom 10</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    Mode 2
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Best Mystery Solved:</span>
                  <span className="text-lg font-black text-indigo-300 font-mono">
                    {bestRecords.vanishingBestCount}{' '}
                    <span className="text-xs text-slate-500 font-normal">/ 10</span>
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                  <span>Full Clears:</span>
                  <span className="font-bold text-white font-mono">
                    {bestRecords.vanishingTotalClears} times
                  </span>
                </div>
              </div>

              {/* 3. Capital Blitz */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900/60 p-4 border border-amber-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">Capital Blitz</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Mode 3
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">All-Time High Score:</span>
                  <span className="text-lg font-black text-amber-300 font-mono">
                    {bestRecords.capitalBlitzHighScore.toLocaleString()} pts
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                  <span>Max Streak:</span>
                  <span className="font-bold text-white font-mono">
                    {bestRecords.capitalBlitzMaxStreak}
                  </span>
                </div>
              </div>

              {/* 4. Stat Battle */}
              <div className="rounded-2xl bg-gradient-to-br from-sky-950/30 to-slate-900/60 p-4 border border-sky-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
                      <BarChart2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">Stat Battle (Higher/Lower)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                    Mode 4A
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">👥 Population Best:</span>
                  <span className="text-base font-black text-sky-300 font-mono">
                    {bestRecords.higherLowerPopulationBestStreak || bestRecords.higherLowerBestStreak} streak
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">📐 Land Area Best:</span>
                  <span className="text-base font-black text-teal-300 font-mono">
                    {bestRecords.higherLowerAreaBestStreak || 0} streak
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                  <span>Total Correct:</span>
                  <span className="font-bold text-white font-mono">
                    {bestRecords.higherLowerTotalCorrect}
                  </span>
                </div>
              </div>

              {/* 5. Border Bridge */}
              <div className="rounded-2xl bg-gradient-to-br from-cyan-950/30 to-slate-900/60 p-4 border border-cyan-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                      <Route className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">Border Bridge</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    Mode 4B
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Routes Completed:</span>
                  <span className="text-lg font-black text-cyan-300 font-mono">
                    {bestRecords.bridgeTotalCompleted}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                  <span>Best Route Length:</span>
                  <span className="font-bold text-white font-mono">
                    {bestRecords.bridgeShortestSteps ? `${bestRecords.bridgeShortestSteps} steps` : 'None yet'}
                  </span>
                </div>
              </div>

              {/* 6. Flag Hunter */}
              <div className="rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/60 p-4 border border-rose-500/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                      <Flag className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-white">Flag Hunter</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                    Mode 4C
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Best Flag Score:</span>
                  <span className="text-lg font-black text-rose-300 font-mono">
                    {bestRecords.flagHunterHighScore.toLocaleString()} pts
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs text-slate-400">
                  <span>Max Streak:</span>
                  <span className="font-bold text-white font-mono">
                    {bestRecords.flagHunterMaxStreak} flags
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Activity Feed */}
        {activeTab === 'activity' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
            {recentActivities.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-white/5">
                <History className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">No Activities Recorded Yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Play any game mode (Conquest, Blitz, Higher or Lower, etc.) and your results, scores, and records will automatically appear here!
                </p>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5 shrink-0">
                      {getModeIcon(act.mode)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{act.modeTitle}</span>
                        {act.isNewBest && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5 fill-amber-300" />
                            <span>NEW BEST</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-300 truncate">{act.summary}</p>
                      {act.details && (
                        <p className="text-[10px] text-slate-500 truncate">{act.details}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {formatTimestamp(act.timestamp)}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentMode(act.mode);
                        onClose();
                      }}
                      className="mt-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-0.5"
                    >
                      <span>Play</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Milestones & Achievements */}
        {activeTab === 'achievements' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => {
                const isUnlocked = ach.unlockedAt !== null;

                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isUnlocked
                        ? 'bg-slate-900/90 border-emerald-500/30 shadow-md shadow-emerald-950/30'
                        : 'bg-slate-950/60 border-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 border ${
                          isUnlocked
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-900 border-white/5 text-slate-600'
                        }`}
                      >
                        {getAchievementIcon(ach.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-400 shrink-0">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>UNLOCKED</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {ach.progress}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {ach.description}
                        </p>
                        {!isUnlocked && (
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-sky-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${ach.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer / Local Data Control */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 text-center sm:text-left">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Data stored strictly on client localStorage (no tracking, no servers).</span>
          </div>

          <div className="flex items-center gap-2">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset Local Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <span className="text-xs text-rose-300 font-bold">Clear all?</span>
                <button
                  onClick={() => {
                    resetAllLocalData();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
