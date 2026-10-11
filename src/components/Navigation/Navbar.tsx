import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  Globe2,
  Volume2,
  VolumeX,
  BookOpen,
  Ghost,
  Landmark,
  BarChart2,
  Route,
  Flag,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Check,
  Compass,
  Layers,
  Table2,
  Trophy,
} from 'lucide-react';

interface NavbarProps {
  onOpenQuickPlay?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickPlay }) => {
  const {
    currentMode,
    setCurrentMode,
    soundEnabled,
    toggleSound,
    startConquest,
    atlasSubTab,
    setAtlasSubTab,
    setRecordsModalOpen,
  } = useGameStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  const gameModes = [
    {
      id: 'global_conquest' as const,
      label: 'Conquest',
      desc: 'Name all 196 sovereign nations',
      icon: Globe2,
      accent: 'emerald',
      activeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40 shadow-lg',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'vanishing_10' as const,
      label: 'Phantom 10',
      desc: 'Identify 10 mystery missing nations',
      icon: Ghost,
      accent: 'indigo',
      activeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-indigo-950/40 shadow-lg',
      iconColor: 'text-indigo-400',
    },
    {
      id: 'capital_blitz' as const,
      label: 'Capitals',
      desc: '90s fast-paced world capitals blitz',
      icon: Landmark,
      accent: 'amber',
      activeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-amber-950/40 shadow-lg',
      iconColor: 'text-amber-400',
    },
    {
      id: 'higher_lower' as const,
      label: 'Stat Battle',
      desc: 'Compare populations & territorial sizes',
      icon: BarChart2,
      accent: 'sky',
      activeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sky-950/40 shadow-lg',
      iconColor: 'text-sky-400',
    },
    {
      id: 'border_bridge' as const,
      label: 'Border Bridge',
      desc: 'Chain contiguous neighbors to target',
      icon: Route,
      accent: 'cyan',
      activeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-cyan-950/40 shadow-lg',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'flag_hunter' as const,
      label: 'Flag Hunter',
      desc: 'Visual flag identification on the map',
      icon: Flag,
      accent: 'rose',
      activeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-950/40 shadow-lg',
      iconColor: 'text-rose-400',
    },
  ];

  const currentModeObj = gameModes.find((m) => m.id === currentMode);
  const CurrentIcon = currentModeObj ? currentModeObj.icon : Globe2;

  const handleSelectMode = (modeId: typeof currentMode) => {
    setCurrentMode(modeId);
    setMobileMenuOpen(false);
    setModeDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#080d19]/95 backdrop-blur-2xl border-b border-white/[0.08] select-none shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleSelectMode('global_conquest');
          }}
          className="flex items-center gap-2 sm:gap-2.5 text-sm font-bold tracking-tight text-white whitespace-nowrap shrink-0 group transition-all"
        >
          <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-sky-500/10 text-emerald-300 border border-emerald-500/35 group-hover:border-emerald-400/70 shadow-lg shadow-emerald-950/50 transition-all group-hover:scale-105">
            <Globe2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                GeoQuest
              </span>
              <span className="hidden sm:inline-block px-1 py-0.2 text-[8px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 rounded">
                PRO
              </span>
            </div>
            <span className="hidden sm:block text-[9px] text-slate-400 font-medium tracking-wide">
              Vector Atlas
            </span>
          </div>
        </a>

        {/* Zone 2A: Desktop Direct Game Modes Bar (visible on xl: screens and wider) */}
        <nav className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/[0.06] shadow-inner">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all duration-200 border ${
                  isActive
                    ? mode.activeClass
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-transparent hover:border-white/5'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 transition-colors ${
                    isActive ? mode.iconColor : 'text-slate-400'
                  }`}
                />
                <span>{mode.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80 ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 2B: Mobile & Tablet Quick Mode Switcher Pill (< xl) */}
        <div className="flex xl:hidden items-center relative">
          <button
            onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              currentMode !== 'atlas'
                ? 'bg-slate-900/90 text-white border-white/15 shadow-md shadow-black/40'
                : 'bg-slate-900/60 text-slate-300 border-white/10'
            }`}
          >
            {currentMode !== 'atlas' && currentModeObj ? (
              <>
                <CurrentIcon className={`h-3.5 w-3.5 ${currentModeObj.iconColor}`} />
                <span className="max-w-[90px] sm:max-w-none truncate">{currentModeObj.label}</span>
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                <span>Learning Hub</span>
              </>
            )}
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Dropdown on Mobile/Tablet */}
          {modeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModeDropdownOpen(false)}
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 sm:w-72 rounded-2xl bg-[#090f20]/98 p-2 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-fadeIn">
              <div className="px-2 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Game Mode
              </div>
              <div className="flex flex-col gap-1">
                {gameModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleSelectMode(mode.id)}
                      className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'hover:bg-slate-800/70 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-slate-900 border border-white/5 ${mode.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{mode.label}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{mode.desc}</div>
                        </div>
                      </div>
                      {isActive && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </button>
                  );
                })}

                <div className="h-[1px] bg-white/10 my-1" />

                {/* Learning Hub in dropdown */}
                <button
                  onClick={() => handleSelectMode('atlas')}
                  className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    currentMode === 'atlas'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-emerald-400">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Learning Hub</div>
                      <div className="text-[10px] text-slate-400 leading-tight">Atlas, Matrix & Flashcards</div>
                    </div>
                  </div>
                  {currentMode === 'atlas' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>
          </>
        )}
        </div>

        {/* Zone 3: Learning Hub (Desktop) + Sound + Quick Play + Mobile Hamburger Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Learning Hub button (Visible on sm: and up) */}
          <button
            onClick={() => handleSelectMode('atlas')}
            className={`hidden sm:flex group items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentMode === 'atlas'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-white/[0.08] hover:border-emerald-500/30'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-400 transition-transform group-hover:scale-110" />
            <span className="hidden md:inline">Learning Hub</span>
            <span className="inline md:hidden">Atlas</span>
          </button>

          {/* Records & Activity CTA */}
          <button
            onClick={() => setRecordsModalOpen(true)}
            title="Personal Bests & Activity Records"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-amber-300 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-200 whitespace-nowrap shrink-0 group active:scale-95 shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400 transition-transform group-hover:scale-110" />
            <span className="hidden md:inline">Records</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/[0.08] transition-all hover:scale-105 active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>

          {/* Quick Play CTA (Desktop) */}
          <button
            onClick={() => {
              handleSelectMode('global_conquest');
              startConquest();
            }}
            className="hidden md:flex relative group overflow-hidden px-3.5 py-1.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 rounded-xl transition-all shadow-md shadow-emerald-500/25 active:scale-95 whitespace-nowrap shrink-0"
          >
            <span className="relative z-10 flex items-center gap-1">
              <Sparkles className="h-3 w-3 fill-slate-950" />
              <span>Quick Play</span>
            </span>
          </button>

          {/* Mobile & Tablet Full Menu Drawer Button (< xl) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex xl:hidden h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-white/10 transition-colors"
            title="Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Slide-Over Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content panel */}
          <div className="relative ml-auto w-full max-w-sm h-full bg-[#080d1a] border-l border-white/10 shadow-2xl flex flex-col p-5 z-10 overflow-y-auto animate-slideLeft">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-400" />
                <span className="font-extrabold text-white text-base">GeoQuest Engine</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Play CTA on Mobile */}
            <button
              onClick={() => {
                handleSelectMode('global_conquest');
                startConquest();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 mb-5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/25 active:scale-98"
            >
              <Sparkles className="h-4 w-4 fill-slate-950" />
              <span>LAUNCH QUICK PLAY</span>
            </button>

            {/* Game Modes Section */}
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Game Modes
              </div>
              <div className="flex flex-col gap-1.5">
                {gameModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleSelectMode(mode.id)}
                      className={`flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-md shadow-emerald-950/40'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-slate-950 border border-white/5 ${mode.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{mode.label}</div>
                          <div className="text-[10px] text-slate-400">{mode.desc}</div>
                        </div>
                      </div>
                      {isActive && <Check className="h-4 w-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Learning Hub Section */}
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Learning & Reference
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    handleSelectMode('atlas');
                    setAtlasSubTab('map');
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left border ${
                    currentMode === 'atlas' && atlasSubTab === 'map'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-200 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-emerald-400">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Interactive 2D Atlas</div>
                      <div className="text-[10px] text-slate-400">Cartographic explorer & borders</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleSelectMode('atlas');
                    setAtlasSubTab('table');
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left border ${
                    currentMode === 'atlas' && atlasSubTab === 'table'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-200 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-sky-400">
                      <Table2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Comparative Matrix</div>
                      <div className="text-[10px] text-slate-400">Sortable demographic data table</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleSelectMode('atlas');
                    setAtlasSubTab('flashcards');
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left border ${
                    currentMode === 'atlas' && atlasSubTab === 'flashcards'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-200 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-white/5 text-amber-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Smart Flashcards</div>
                      <div className="text-[10px] text-slate-400">Spaced repetition memory training</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Records & Activity Drawer Link */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setRecordsModalOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/25 text-amber-300 hover:bg-amber-500/15 transition-all mb-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Records & Activity</div>
                  <div className="text-[10px] text-amber-400/80">Local high scores & achievements</div>
                </div>
              </div>
              <span className="text-xs font-bold">Open →</span>
            </button>

            {/* Sound Toggle Row */}
            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Sound Effects:</span>
              <button
                onClick={toggleSound}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                    <span>Muted</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
