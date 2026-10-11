import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Globe2, Volume2, VolumeX, BookOpen } from 'lucide-react';

interface NavbarProps {
  onOpenQuickPlay?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickPlay }) => {
  const { currentMode, setCurrentMode, soundEnabled, toggleSound, startConquest } = useGameStore();

  const gameModes: { id: typeof currentMode; label: string }[] = [
    { id: 'global_conquest', label: 'Conquest' },
    { id: 'vanishing_10', label: 'Phantom 10' },
    { id: 'capital_blitz', label: 'Capitals' },
    { id: 'higher_lower', label: 'Stat Battle' },
    { id: 'border_bridge', label: 'Border Bridge' },
    { id: 'flag_hunter', label: 'Flag Hunter' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-3 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 select-none">
      {/* Zone 1: Brand Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setCurrentMode('global_conquest');
        }}
        className="flex items-center gap-2 text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Globe2 className="h-4 w-4" />
        </div>
        <span>GeoQuest</span>
      </a>

      {/* Zone 2: All Game Modes Directly Visible in Main Menu */}
      <nav className="flex items-center gap-3 md:gap-5 text-xs font-medium text-slate-400 overflow-x-auto max-w-[50vw] sm:max-w-none">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCurrentMode(mode.id)}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              currentMode === mode.id
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'hover:text-white'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Learning Hub (separated on the right with icon) + Sound + Quick Play */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Learning Hub as a single clean link with icon */}
        <button
          onClick={() => setCurrentMode('atlas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'atlas'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-white/10'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          <span>Learning Hub</span>
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-white/10 transition-colors"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>

        {/* Quick Play CTA */}
        <button
          onClick={() => {
            setCurrentMode('global_conquest');
            startConquest();
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap shrink-0"
        >
          Quick Play
        </button>
      </div>
    </header>
  );
};
