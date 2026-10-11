import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES } from '../../data/countries';
import { matchesCandidate, normalizeString } from '../../utils/normalize';
import { Play, Pause, Flag, Volume2, VolumeX, Timer, Search, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface GameHUDProps {
  onInputSubmit?: (guess: string) => void;
  placeholder?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  onInputSubmit,
  placeholder = 'Type country name (e.g., Japan, Brazil)...',
}) => {
  const {
    currentMode,
    conquestSolved,
    conquestSecondsLeft,
    conquestSecondsElapsed,
    conquestTimerType,
    conquestIsActive,
    conquestIsPaused,
    setConquestTimerType,
    startConquest,
    pauseConquest,
    resumeConquest,
    giveUpConquest,
    guessCountry,
    soundEnabled,
    toggleSound,
    tickTimer,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'shake' | 'already'>('idle');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'already' } | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<{ id: string; name: string; flag: string }[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

  // Keep input focused unless modal is open
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentMode]);

  // Handle Input typing and instant match evaluation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    if (currentMode === 'global_conquest') {
      const cleanVal = normalizeString(val);
      if (!cleanVal || cleanVal.length < 2) return;

      // Look for a matching country
      const matched = COUNTRIES.find((c) =>
        matchesCandidate(cleanVal, [c.name, c.officialName, ...c.aliases])
      );

      if (matched) {
        if (conquestSolved.has(matched.id)) {
          // Already found
          setFeedbackState('already');
          setToastMessage({ text: `Already identified: ${matched.name}`, type: 'already' });
          setTimeout(() => {
            setFeedbackState('idle');
            setToastMessage(null);
          }, 1400);
          setInputVal('');
        } else {
          // Success match!
          guessCountry(matched.id);
          setRecentUnlocks((prev) => [
            { id: matched.id, name: matched.name, flag: matched.flagEmoji },
            ...prev.slice(0, 2),
          ]);
          setFeedbackState('success');
          setToastMessage({ text: `Discovered: ${matched.flagEmoji} ${matched.name}`, type: 'success' });
          setTimeout(() => {
            setFeedbackState('idle');
            setToastMessage(null);
          }, 1400);
          setInputVal('');
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onInputSubmit && inputVal.trim()) {
        onInputSubmit(inputVal.trim());
        setInputVal('');
      } else if (currentMode === 'global_conquest' && inputVal.trim()) {
        setFeedbackState('shake');
        setTimeout(() => setFeedbackState('idle'), 500);
      }
    }
  };

  // Format Timer String
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalCountries = COUNTRIES.length;
  const solvedCount = conquestSolved.size;
  const percentage = ((solvedCount / totalCountries) * 100).toFixed(1);

  // Radial progress stroke
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (Number(percentage) / 100) * circumference;

  return (
    <div className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-30 w-[96%] sm:w-[94%] max-w-3xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`pointer-events-none absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2 rounded-full px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold backdrop-blur-xl shadow-xl flex items-center gap-1.5 animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 shadow-emerald-950/60'
              : 'bg-amber-950/90 border border-amber-500/40 text-amber-300 shadow-amber-950/60'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Glassmorphic Dock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-2xl bg-[#090e1c]/92 p-2 sm:p-2.5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Top Controls on Mobile / Left Section on Desktop */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 px-1 sm:px-0">
          {/* Progress Ring & Counter */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center">
              <svg className="h-9 w-9 sm:h-11 sm:w-11 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="text-slate-800/80 sm:hidden"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="text-emerald-400 transition-all duration-300 ease-out sm:hidden"
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 - (Number(percentage) / 100) * (2 * Math.PI * 14)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="text-slate-800/80 hidden sm:block"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="text-emerald-400 transition-all duration-300 ease-out hidden sm:block"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] sm:text-[11px] font-bold text-white tabular-nums">
                {Math.round(Number(percentage))}%
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white">
                <span className="tabular-nums text-emerald-400 font-extrabold">{solvedCount}</span>
                <span className="text-slate-500 font-normal">/</span>
                <span className="tabular-nums text-slate-300">{totalCountries}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Found</span>
            </div>
          </div>

          {/* Timer Display with Cycle Mode on Click (Mobile inline) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={() => {
                if (!conquestIsActive) {
                  const nextType =
                    conquestTimerType === 'countdown'
                      ? 'stopwatch'
                      : conquestTimerType === 'stopwatch'
                      ? 'zen'
                      : 'countdown';
                  setConquestTimerType(nextType);
                }
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-950/80 px-2 py-1.5 border border-white/5 text-[11px] font-bold font-mono text-slate-200"
            >
              <Timer className="h-3 w-3 text-emerald-400" />
              <span>
                {conquestTimerType === 'countdown'
                  ? formatTime(conquestSecondsLeft)
                  : conquestTimerType === 'stopwatch'
                  ? formatTime(conquestSecondsElapsed)
                  : 'Zen'}
              </span>
            </button>

            {/* Play/Pause on mobile */}
            {conquestIsActive ? (
              conquestIsPaused ? (
                <button
                  onClick={resumeConquest}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                >
                  <Play className="h-3 w-3 fill-current" />
                </button>
              ) : (
                <button
                  onClick={pauseConquest}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-white/5"
                >
                  <Pause className="h-3 w-3" />
                </button>
              )
            ) : (
              <button
                onClick={startConquest}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold"
              >
                <Play className="h-3 w-3 fill-current" />
              </button>
            )}

            {/* Give Up on mobile */}
            {conquestIsActive && (
              <button
                onClick={giveUpConquest}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20"
              >
                <Flag className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Input Bar with Instant Feedback Flash & Shake */}
        <div className="relative flex-1 w-full min-w-0">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            className={`w-full rounded-xl bg-slate-950/75 pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all duration-150 border ${
              feedbackState === 'success'
                ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/25'
                : feedbackState === 'shake'
                ? 'border-rose-500 bg-rose-950/25 animate-shake'
                : feedbackState === 'already'
                ? 'border-amber-500 bg-amber-950/25 ring-2 ring-amber-500/20'
                : 'border-slate-800/80 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30'
            }`}
          />
          {inputVal && (
            <button
              onClick={() => setInputVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Controls (hidden on mobile, visible on sm:) */}
        <div className="hidden sm:flex items-center gap-2 pr-1">
          {/* Timer Display */}
          <button
            onClick={() => {
              if (!conquestIsActive) {
                const nextType =
                  conquestTimerType === 'countdown'
                    ? 'stopwatch'
                    : conquestTimerType === 'stopwatch'
                    ? 'zen'
                    : 'countdown';
                setConquestTimerType(nextType);
              }
            }}
            title={
              conquestIsActive
                ? `Mode: ${conquestTimerType}`
                : `Click to change mode (Current: ${conquestTimerType})`
            }
            className="flex items-center gap-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 px-3 py-2 border border-white/5 transition-colors"
          >
            <Timer className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-bold tabular-nums font-mono text-slate-200">
              {conquestTimerType === 'countdown'
                ? formatTime(conquestSecondsLeft)
                : conquestTimerType === 'stopwatch'
                ? formatTime(conquestSecondsElapsed)
                : 'Zen'}
            </span>
          </button>

          {/* Pause / Resume Button */}
          {conquestIsActive ? (
            conquestIsPaused ? (
              <button
                onClick={resumeConquest}
                title="Resume game"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/30 active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={pauseConquest}
                title="Pause game"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-white/5 active:scale-95"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            )
          ) : (
            <button
              onClick={startConquest}
              title="Start game"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/25 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
          )}

          {/* Give Up button */}
          {conquestIsActive && (
            <button
              onClick={giveUpConquest}
              title="Give up & review missed countries"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors border border-rose-500/20 active:scale-95"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Recent Unlocks Micro Strip */}
      {recentUnlocks.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 px-1 text-[10px] sm:text-[11px] text-slate-400 animate-fadeIn overflow-x-auto">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0">
            Recent:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {recentUnlocks.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-900/85 border border-emerald-500/30 text-emerald-300 font-medium shadow-md backdrop-blur-md text-[11px] sm:text-xs"
              >
                <span>{u.flag}</span>
                <span className="font-semibold truncate max-w-[100px] sm:max-w-none">{u.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
