import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES } from '../../data/countries';
import { matchesCandidate, normalizeString } from '../../utils/normalize';
import { Play, Pause, Flag, Volume2, VolumeX, Eye, Compass, Timer, Zap } from 'lucide-react';

interface GameHUDProps {
  onInputSubmit?: (guess: string) => void;
  placeholder?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  onInputSubmit,
  placeholder = 'Type country name...',
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
    autoPanEnabled,
    toggleAutoPan,
    tickTimer,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'shake' | 'already'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
          setToastMessage(`Already found: ${matched.name}`);
          setTimeout(() => {
            setFeedbackState('idle');
            setToastMessage(null);
          }, 1200);
          setInputVal('');
        } else {
          // Success match!
          guessCountry(matched.id);
          setFeedbackState('success');
          setToastMessage(`Found: ${matched.flagEmoji} ${matched.name}`);
          setTimeout(() => {
            setFeedbackState('idle');
            setToastMessage(null);
          }, 1000);
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
        // Trigger invalid shake
        setFeedbackState('shake');
        setTimeout(() => setFeedbackState('idle'), 600);
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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-3xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 border border-emerald-500/30 px-4 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md shadow-lg transition-all animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Glassmorphic Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/85 p-2.5 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Progress Ring & Counter */}
        <div className="flex items-center gap-3 pl-1.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <svg className="h-11 w-11 -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="18"
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                className="text-emerald-500 transition-all duration-300 ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-semibold text-slate-200 tabular-nums">
              {Math.round(Number(percentage))}%
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="tabular-nums text-emerald-400 font-bold">{solvedCount}</span>
              <span className="text-slate-500">/</span>
              <span className="tabular-nums text-slate-300">{totalCountries}</span>
            </div>
            <span className="text-[10px] text-slate-400">Nations Discovered</span>
          </div>
        </div>

        {/* Input Bar with Instant Feedback Flash & Shake */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            className={`w-full rounded-xl bg-slate-950/70 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all duration-150 border ${
              feedbackState === 'success'
                ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : feedbackState === 'shake'
                ? 'border-rose-500 bg-rose-950/20 animate-shake'
                : feedbackState === 'already'
                ? 'border-amber-500 bg-amber-950/20'
                : 'border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30'
            }`}
          />
          {inputVal && (
            <button
              onClick={() => setInputVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              esc
            </button>
          )}
        </div>

        {/* Timer Controller & Actions */}
        <div className="flex items-center gap-2 pr-1">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/60 px-2.5 py-1.5 border border-white/5">
            <Timer className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium tabular-nums text-slate-200">
              {conquestTimerType === 'countdown'
                ? formatTime(conquestSecondsLeft)
                : conquestTimerType === 'stopwatch'
                ? formatTime(conquestSecondsElapsed)
                : 'Zen'}
            </span>
          </div>

          {/* Pause / Resume Button */}
          {conquestIsActive ? (
            conquestIsPaused ? (
              <button
                onClick={resumeConquest}
                title="Resume game"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={pauseConquest}
                title="Pause game"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            )
          ) : (
            <button
              onClick={startConquest}
              title="Start game"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Give Up button */}
          {conquestIsActive && (
            <button
              onClick={giveUpConquest}
              title="Give up & review missed countries"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
