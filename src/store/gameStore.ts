import { create } from 'zustand';
import {
  CountryRecord,
  GameModeId,
  TimerType,
  UserActivityRecord,
  BestRecords,
  AchievementItem,
  DifficultyLevel,
} from '../data/types';
import { COUNTRIES, COUNTRIES_BY_ID } from '../data/countries';
import { getCountriesForDifficulty, BRIDGE_PAIRS_BY_DIFFICULTY } from '../data/difficulty';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { activityStorage } from '../utils/activityStorage';

interface ChainStep {
  country: CountryRecord;
  isValid: boolean;
}

export interface GameState {
  // Navigation & Mode
  currentMode: GameModeId;
  setCurrentMode: (mode: GameModeId) => void;
  atlasSubTab: 'map' | 'table' | 'flashcards';
  setAtlasSubTab: (tab: 'map' | 'table' | 'flashcards') => void;

  // Challenge Difficulty (Regular, Medium, Hard)
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;

  // Sound & Preferences
  soundEnabled: boolean;
  toggleSound: () => void;
  autoPanEnabled: boolean;
  toggleAutoPan: () => void;

  // Selected Country for Atlas / Inspector
  selectedCountry: CountryRecord | null;
  setSelectedCountry: (country: CountryRecord | null) => void;
  hoveredCountry: CountryRecord | null;
  setHoveredCountry: (country: CountryRecord | null) => void;
  spotlightNeighbors: boolean;
  setSpotlightNeighbors: (active: boolean) => void;

  // Local User Activity & Best Records
  bestRecords: BestRecords;
  recentActivities: UserActivityRecord[];
  achievements: AchievementItem[];
  recordsModalOpen: boolean;
  setRecordsModalOpen: (open: boolean) => void;
  recordActivity: (activity: Omit<UserActivityRecord, 'id' | 'timestamp'>) => { isNewBest: boolean };
  refreshRecords: () => void;
  resetAllLocalData: () => void;

  // Global Conquest (Mode 1)
  conquestSolved: Set<string>; // country IDs
  conquestTimerType: TimerType;
  conquestSecondsLeft: number;
  conquestSecondsElapsed: number;
  conquestIsActive: boolean;
  conquestIsPaused: boolean;
  conquestIsFinished: boolean;
  conquestGiveUp: boolean;
  setConquestTimerType: (type: TimerType) => void;
  startConquest: () => void;
  pauseConquest: () => void;
  resumeConquest: () => void;
  giveUpConquest: () => void;
  guessCountry: (countryId: string) => boolean; // returns true if newly added

  // Vanishing 10 (Mode 2)
  vanishingTargetIds: string[]; // 10 mystery country IDs
  vanishingSolvedIds: Set<string>;
  vanishingGiveUp: boolean;
  startVanishing10: () => void;
  guessVanishing: (countryId: string) => boolean;
  giveUpVanishing: () => void;

  // Capital Blitz (Mode 3)
  capitalVariant: 'targeted' | 'freeflow';
  setCapitalVariant: (v: 'targeted' | 'freeflow') => void;
  capitalSolved: Set<string>;
  capitalCurrentTarget: CountryRecord | null;
  capitalScore: number;
  capitalStreak: number;
  capitalSecondsLeft: number;
  capitalIsActive: boolean;
  capitalIsFinished: boolean;
  startCapitalBlitz: () => void;
  guessCapital: (guess: string) => boolean;
  skipCapital: () => void;
  endCapitalBlitz: () => void;

  // Higher or Lower (Mode 4A)
  statCountryA: CountryRecord | null;
  statCountryB: CountryRecord | null;
  statMetric: 'population' | 'areaSqKm';
  statScore: number;
  statBestScore: number;
  statGameOver: boolean;
  statRevealed: boolean;
  statIsCorrect: boolean | null;
  setStatMetric: (metric: 'population' | 'areaSqKm') => void;
  startStatBattle: (forcedMetric?: 'population' | 'areaSqKm') => void;
  answerStatBattle: (choice: 'higher' | 'lower') => boolean;

  // Border Bridge (Mode 4B)
  bridgeStart: CountryRecord | null;
  bridgeTarget: CountryRecord | null;
  bridgeChain: string[]; // IDs
  bridgeComplete: boolean;
  startBridge: (startId?: string, targetId?: string) => void;
  addBridgeNeighbor: (countryId: string) => boolean;

  // Flag Hunter (Mode 4C)
  flagTarget: CountryRecord | null;
  flagScore: number;
  flagStreak: number;
  flagRoundsPlayed: number;
  flagFeedback: { correct: boolean; country: CountryRecord } | null;
  startFlagHunter: () => void;
  submitFlagGuess: (countryId: string) => boolean;

  // Stats & Bookmarks
  highScores: Record<string, number>;
  bookmarkedCountryIds: Set<string>;
  toggleBookmark: (id: string) => void;
  flashcardKnownIds: Set<string>;
  markFlashcard: (id: string, known: boolean) => void;

  // Timer Tick
  tickTimer: () => void;
}

// Helper to pick random elements
function pickRandom<T>(arr: T[], count: number = 1): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Chain paths that have known land connection solutions
const PRESET_BRIDGE_PAIRS = [
  { start: 'PRT', target: 'POL' }, // Portugal -> Poland
  { start: 'ESP', target: 'DNK' }, // Spain -> Denmark
  { start: 'ZAF', target: 'EGY' }, // South Africa -> Egypt
  { start: 'NOR', target: 'ITA' }, // Norway -> Italy
  { start: 'DEU', target: 'TUR' }, // Germany -> Turkey
  { start: 'CAN', target: 'PAN' }, // Canada -> Panama
  { start: 'ARG', target: 'COL' }, // Argentina -> Colombia
  { start: 'IND', target: 'VNM' }, // India -> Vietnam
];

export const useGameStore = create<GameState>((set, get) => {
  // Load saved highscores, bookmarks, and local records
  const savedHighScores = JSON.parse(localStorage.getItem('geoquest_highscores') || '{}');
  const savedBookmarks = new Set<string>(JSON.parse(localStorage.getItem('geoquest_bookmarks') || '[]'));
  const savedFlashcards = new Set<string>(JSON.parse(localStorage.getItem('geoquest_flashcards') || '[]'));
  const initialRecords = activityStorage.getRecords();
  const initialActivities = activityStorage.getActivities();
  const initialAchievements = activityStorage.getAchievements();

  return {
    // Local User Activity & Best Records
    bestRecords: initialRecords,
    recentActivities: initialActivities,
    achievements: initialAchievements,
    recordsModalOpen: false,
    setRecordsModalOpen: (open) => set({ recordsModalOpen: open }),

    recordActivity: (act) => {
      const { record, isNewBest, records } = activityStorage.addActivity(act);
      const updatedActivities = activityStorage.getActivities();
      const updatedAchievements = activityStorage.getAchievements();
      set({
        bestRecords: records,
        recentActivities: updatedActivities,
        achievements: updatedAchievements,
        highScores: {
          ...get().highScores,
          [act.mode]: Math.max(get().highScores[act.mode] || 0, act.metricValue),
        },
      });
      return { isNewBest };
    },

    refreshRecords: () => {
      set({
        bestRecords: activityStorage.getRecords(),
        recentActivities: activityStorage.getActivities(),
        achievements: activityStorage.getAchievements(),
      });
    },

    resetAllLocalData: () => {
      activityStorage.clearAllData();
      set({
        bestRecords: activityStorage.getRecords(),
        recentActivities: [],
        achievements: activityStorage.getAchievements(),
        bookmarkedCountryIds: new Set<string>(),
        flashcardKnownIds: new Set<string>(),
        highScores: {},
      });
    },

    difficulty: 'regular',
    setDifficulty: (level) => {
      set({ difficulty: level });
      const { currentMode } = get();
      if (currentMode === 'vanishing_10') {
        get().startVanishing10();
      } else if (currentMode === 'capital_blitz') {
        get().startCapitalBlitz();
      } else if (currentMode === 'higher_lower') {
        get().startStatBattle();
      } else if (currentMode === 'border_bridge') {
        get().startBridge();
      } else if (currentMode === 'flag_hunter') {
        get().startFlagHunter();
      }
    },

    currentMode: 'global_conquest',
    setCurrentMode: (mode) => {
      set({ currentMode: mode });
      if (mode === 'vanishing_10' && get().vanishingTargetIds.length === 0) {
        get().startVanishing10();
      } else if (mode === 'capital_blitz' && !get().capitalIsActive) {
        get().startCapitalBlitz();
      } else if (mode === 'higher_lower' && !get().statCountryA) {
        get().startStatBattle();
      } else if (mode === 'border_bridge' && !get().bridgeStart) {
        get().startBridge();
      } else if (mode === 'flag_hunter' && !get().flagTarget) {
        get().startFlagHunter();
      }
    },
    atlasSubTab: 'map',
    setAtlasSubTab: (tab) => set({ atlasSubTab: tab }),

    soundEnabled: sound.isEnabled(),
    toggleSound: () => {
      const next = sound.toggle();
      set({ soundEnabled: next });
    },
    autoPanEnabled: true,
    toggleAutoPan: () => set((state) => ({ autoPanEnabled: !state.autoPanEnabled })),

    selectedCountry: null,
    setSelectedCountry: (country) => set({ selectedCountry: country }),
    hoveredCountry: null,
    setHoveredCountry: (country) => set({ hoveredCountry: country }),
    spotlightNeighbors: false,
    setSpotlightNeighbors: (active) => set({ spotlightNeighbors: active }),

    // Mode 1: Global Conquest
    conquestSolved: new Set<string>(),
    conquestTimerType: 'countdown',
    conquestSecondsLeft: 15 * 60, // 15 mins
    conquestSecondsElapsed: 0,
    conquestIsActive: false,
    conquestIsPaused: false,
    conquestIsFinished: false,
    conquestGiveUp: false,

    setConquestTimerType: (type) =>
      set({
        conquestTimerType: type,
        conquestSecondsLeft: type === 'countdown' ? 15 * 60 : 0,
        conquestSecondsElapsed: 0,
      }),

    startConquest: () =>
      set((state) => ({
        conquestSolved: new Set<string>(),
        conquestSecondsLeft: state.conquestTimerType === 'countdown' ? 15 * 60 : 0,
        conquestSecondsElapsed: 0,
        conquestIsActive: true,
        conquestIsPaused: false,
        conquestIsFinished: false,
        conquestGiveUp: false,
      })),

    pauseConquest: () => set({ conquestIsPaused: true }),
    resumeConquest: () => set({ conquestIsPaused: false }),
    giveUpConquest: () => {
      sound.playError();
      const { conquestSolved, conquestSecondsElapsed } = get();
      if (conquestSolved.size > 0) {
        get().recordActivity({
          mode: 'global_conquest',
          modeTitle: 'Global Conquest',
          summary: `${conquestSolved.size} / ${COUNTRIES.length} nations discovered`,
          details: `Concluded run in ${Math.floor(conquestSecondsElapsed / 60)}m ${conquestSecondsElapsed % 60}s`,
          metricValue: conquestSolved.size,
          metricLabel: 'Nations',
        });
      }
      set({ conquestIsActive: false, conquestIsFinished: true, conquestGiveUp: true });
    },

    guessCountry: (countryId: string) => {
      const { conquestSolved, conquestIsActive } = get();
      if (!conquestIsActive) {
        get().startConquest();
      }
      if (conquestSolved.has(countryId)) {
        return false;
      }
      const next = new Set(conquestSolved);
      next.add(countryId);
      sound.playCorrect();

      // Check milestones
      const percent = (next.size / COUNTRIES.length) * 100;
      if (next.size === 50 || next.size === 100 || next.size === 150) {
        sound.playStreak();
      }
      if (next.size === COUNTRIES.length) {
        sound.playVictory();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        get().recordActivity({
          mode: 'global_conquest',
          modeTitle: 'Global Conquest',
          summary: `Complete Victory! ${COUNTRIES.length} / ${COUNTRIES.length} nations found`,
          details: 'Earth entirely conquered',
          metricValue: COUNTRIES.length,
          metricLabel: 'Nations',
        });
        set({
          conquestSolved: next,
          conquestIsActive: false,
          conquestIsFinished: true,
          conquestGiveUp: false,
        });
      } else {
        set({ conquestSolved: next });
      }
      return true;
    },

    // Mode 2: Vanishing 10
    vanishingTargetIds: [],
    vanishingSolvedIds: new Set<string>(),
    vanishingGiveUp: false,

    startVanishing10: () => {
      // Pick 10 mystery nations based on challenge difficulty
      const pool = getCountriesForDifficulty(get().difficulty);
      const candidates = pool.filter((c) => c.areaSqKm > 10000 && c.borders.length > 0);
      const safePool = candidates.length >= 10 ? candidates : pool;
      const chosen = pickRandom(safePool, 10).map((c) => c.id);
      set({
        vanishingTargetIds: chosen,
        vanishingSolvedIds: new Set<string>(),
        vanishingGiveUp: false,
      });
    },

    guessVanishing: (countryId: string) => {
      const { vanishingTargetIds, vanishingSolvedIds } = get();
      if (vanishingTargetIds.includes(countryId) && !vanishingSolvedIds.has(countryId)) {
        const next = new Set(vanishingSolvedIds);
        next.add(countryId);
        sound.playCorrect();

        if (next.size === vanishingTargetIds.length) {
          sound.playVictory();
          confetti({ particleCount: 120, spread: 70 });
          get().recordActivity({
            mode: 'vanishing_10',
            modeTitle: 'Phantom 10',
            summary: 'All 10 Phantom Nations Restored!',
            details: 'World map fully repaired and complete',
            metricValue: 10,
            metricLabel: 'Restored',
          });
        }
        set({ vanishingSolvedIds: next });
        return true;
      }
      return false;
    },

    giveUpVanishing: () => {
      sound.playError();
      const { vanishingSolvedIds } = get();
      if (vanishingSolvedIds.size > 0) {
        get().recordActivity({
          mode: 'vanishing_10',
          modeTitle: 'Phantom 10',
          summary: `${vanishingSolvedIds.size} / 10 Phantom Nations Found`,
          details: 'Mystery nations challenge concluded',
          metricValue: vanishingSolvedIds.size,
          metricLabel: 'Restored',
        });
      }
      set({ vanishingGiveUp: true });
    },

    // Mode 3: Capital Blitz
    capitalVariant: 'targeted',
    setCapitalVariant: (v) => set({ capitalVariant: v }),
    capitalSolved: new Set<string>(),
    capitalCurrentTarget: null,
    capitalScore: 0,
    capitalStreak: 0,
    capitalSecondsLeft: 90,
    capitalIsActive: false,
    capitalIsFinished: false,

    startCapitalBlitz: () => {
      const pool = getCountriesForDifficulty(get().difficulty);
      const firstTarget = pickRandom(pool, 1)[0] || COUNTRIES[0];
      set({
        capitalSolved: new Set<string>(),
        capitalCurrentTarget: firstTarget,
        capitalScore: 0,
        capitalStreak: 0,
        capitalSecondsLeft: 90,
        capitalIsActive: true,
        capitalIsFinished: false,
      });
    },

    guessCapital: (guess: string) => {
      const { capitalVariant, capitalCurrentTarget, capitalSolved, capitalScore, capitalStreak, capitalSecondsLeft } = get();
      if (capitalVariant === 'targeted' && capitalCurrentTarget) {
        const targetCapital = capitalCurrentTarget.capital.toLowerCase();
        const aliases = capitalCurrentTarget.capitalAliases.map((a) => a.toLowerCase());
        const cleanGuess = guess.toLowerCase().trim();

        if (cleanGuess === targetCapital || aliases.includes(cleanGuess)) {
          sound.playCorrect();
          const nextSolved = new Set(capitalSolved);
          nextSolved.add(capitalCurrentTarget.id);
          const nextStreak = capitalStreak + 1;
          const nextScore = capitalScore + 100 * Math.min(nextStreak, 5);

          // Pick next unvisited target matching difficulty
          const pool = getCountriesForDifficulty(get().difficulty);
          const remaining = pool.filter((c) => !nextSolved.has(c.id));
          const nextTarget = remaining.length > 0 ? pickRandom(remaining, 1)[0] : null;

          if (!nextTarget) {
            sound.playVictory();
            confetti();
            get().recordActivity({
              mode: 'capital_blitz',
              modeTitle: 'Capital Blitz',
              summary: `Score: ${nextScore.toLocaleString()} pts (${nextSolved.size} capitals)`,
              details: 'All remaining targets mastered',
              metricValue: nextScore,
              metricLabel: 'Score',
            });
            set({
              capitalSolved: nextSolved,
              capitalScore: nextScore,
              capitalStreak: nextStreak,
              capitalIsActive: false,
              capitalIsFinished: true,
            });
          } else {
            set({
              capitalSolved: nextSolved,
              capitalScore: nextScore,
              capitalStreak: nextStreak,
              capitalCurrentTarget: nextTarget,
            });
          }
          return true;
        } else {
          sound.playError();
          return false;
        }
      } else {
        // Freeflow mode: guess any capital
        const match = COUNTRIES.find(
          (c) =>
            !capitalSolved.has(c.id) &&
            (c.capital.toLowerCase() === guess.toLowerCase().trim() ||
              c.capitalAliases.some((a) => a.toLowerCase() === guess.toLowerCase().trim()))
        );
        if (match) {
          sound.playCorrect();
          const nextSolved = new Set(capitalSolved);
          nextSolved.add(match.id);
          set({
            capitalSolved: nextSolved,
            capitalScore: capitalScore + 100,
          });
          return true;
        }
        return false;
      }
    },

    skipCapital: () => {
      const { capitalSolved, capitalSecondsLeft, difficulty } = get();
      sound.playError();
      const pool = getCountriesForDifficulty(difficulty);
      const remaining = pool.filter((c) => !capitalSolved.has(c.id));
      const nextTarget = pickRandom(remaining.length > 0 ? remaining : pool, 1)[0] || COUNTRIES[0];
      set({
        capitalCurrentTarget: nextTarget,
        capitalStreak: 0,
        capitalSecondsLeft: Math.max(0, capitalSecondsLeft - 15),
      });
    },

    endCapitalBlitz: () => {
      const { capitalScore, capitalSolved, capitalStreak, capitalVariant } = get();
      if (capitalSolved.size > 0 || capitalScore > 0) {
        get().recordActivity({
          mode: 'capital_blitz',
          modeTitle: 'Capital Blitz',
          summary: `Score: ${capitalScore.toLocaleString()} pts (${capitalSolved.size} capitals)`,
          details: `${capitalVariant === 'targeted' ? 'Targeted' : 'Freeflow'} · Streak: ${capitalStreak}`,
          metricValue: capitalScore,
          metricLabel: 'Score',
        });
      }
      set({ capitalIsActive: false, capitalIsFinished: true });
    },

    // Mode 4A: Higher or Lower
    statCountryA: null,
    statCountryB: null,
    statMetric: 'population',
    statScore: 0,
    statBestScore:
      savedHighScores.higher_lower_population ?? savedHighScores.higher_lower ?? 0,
    statGameOver: false,
    statRevealed: false,
    statIsCorrect: null,

    setStatMetric: (metric: 'population' | 'areaSqKm') => {
      const saved = JSON.parse(localStorage.getItem('geoquest_highscores') || '{}');
      const bestKey = metric === 'population' ? 'higher_lower_population' : 'higher_lower_area';
      const best = saved[bestKey] ?? (metric === 'population' ? saved.higher_lower || 0 : 0);
      set({ statMetric: metric, statBestScore: best, statScore: 0, statGameOver: false, statRevealed: false, statIsCorrect: null });
      get().startStatBattle(metric);
    },

    startStatBattle: (forcedMetric?: 'population' | 'areaSqKm') => {
      const metric = forcedMetric || get().statMetric || 'population';
      const pool = getCountriesForDifficulty(get().difficulty);
      const safePool = pool.length >= 2 ? pool : COUNTRIES;
      const [cA, cB] = pickRandom(safePool, 2);
      const saved = JSON.parse(localStorage.getItem('geoquest_highscores') || '{}');
      const bestKey = metric === 'population' ? 'higher_lower_population' : 'higher_lower_area';
      const best = saved[bestKey] ?? (metric === 'population' ? saved.higher_lower || 0 : 0);
      set({
        statCountryA: cA,
        statCountryB: cB,
        statMetric: metric,
        statScore: 0,
        statBestScore: best,
        statGameOver: false,
        statRevealed: false,
        statIsCorrect: null,
      });
    },

    answerStatBattle: (choice: 'higher' | 'lower') => {
      const { statCountryA, statCountryB, statMetric, statScore, statBestScore, statRevealed } = get();
      if (!statCountryA || !statCountryB || statRevealed) return false;

      const valA = statCountryA[statMetric];
      const valB = statCountryB[statMetric];

      const isHigher = valB >= valA;
      const isCorrect = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

      if (isCorrect) {
        sound.playCorrect();
        const nextScore = statScore + 1;
        const nextBest = Math.max(nextScore, statBestScore);
        const metricKey = statMetric === 'population' ? 'higher_lower_population' : 'higher_lower_area';
        const saved = JSON.parse(localStorage.getItem('geoquest_highscores') || '{}');
        localStorage.setItem(
          'geoquest_highscores',
          JSON.stringify({
            ...saved,
            [metricKey]: nextBest,
            higher_lower: Math.max(saved.higher_lower || 0, nextBest),
          })
        );

        if (nextScore % 5 === 0) {
          sound.playStreak();
          confetti({ particleCount: 50, spread: 50 });
        }

        // 1. Reveal Country B's actual statistic and indicate correct answer
        set({
          statRevealed: true,
          statIsCorrect: true,
          statScore: nextScore,
          statBestScore: nextBest,
        });

        // 2. Pause briefly (1300ms) so user sees the revealed number and positive feedback,
        // then advance smoothly to the next question with the SAME metric
        setTimeout(() => {
          const stateNow = get();
          if (stateNow.currentMode !== 'higher_lower') return;

          const currentB = stateNow.statCountryB;
          if (!currentB) return;

          const pool = getCountriesForDifficulty(stateNow.difficulty);
          const candidates = pool.filter((c) => c.id !== currentB.id);
          const nextB = pickRandom(
            candidates.length > 0 ? candidates : COUNTRIES.filter((c) => c.id !== currentB.id),
            1
          )[0];

          // Crucial: keep the active statMetric! Population and Area are strictly separate!
          set({
            statCountryA: currentB,
            statCountryB: nextB,
            statRevealed: false,
            statIsCorrect: null,
          });
        }, 1300);

        return true;
      } else {
        sound.playError();
        const { statScore, statCountryA, statCountryB, statMetric } = get();
        if (statScore > 0) {
          get().recordActivity({
            mode: 'higher_lower',
            modeTitle:
              statMetric === 'population'
                ? 'Stat Battle · Population'
                : 'Stat Battle · Land Area',
            summary: `${statScore} Streak (${statMetric === 'population' ? 'Population' : 'Land Area'})`,
            details: `${
              statMetric === 'population' ? '👥 Population Battle' : '📐 Land Area (km²) Battle'
            } · ended at ${statCountryB?.name}`,
            metricValue: statScore,
            metricLabel: statMetric === 'population' ? 'Pop Streak' : 'Area Streak',
          });
        }
        // Reveal the actual statistic on mistake so user sees what it was, then transition to game over
        set({
          statRevealed: true,
          statIsCorrect: false,
        });

        setTimeout(() => {
          const stateNow = get();
          if (stateNow.currentMode !== 'higher_lower') return;
          set({
            statGameOver: true,
            statRevealed: false,
            statIsCorrect: null,
          });
        }, 1300);

        return false;
      }
    },

    // Mode 4B: Border Bridge
    bridgeStart: null,
    bridgeTarget: null,
    bridgeChain: [],
    bridgeComplete: false,

    startBridge: (startId, targetId) => {
      let pair: { start: string; target: string };
      if (startId && targetId) {
        pair = { start: startId, target: targetId };
      } else {
        const presets = BRIDGE_PAIRS_BY_DIFFICULTY[get().difficulty] || BRIDGE_PAIRS_BY_DIFFICULTY.regular;
        pair = pickRandom(presets, 1)[0];
      }
      const s = COUNTRIES_BY_ID.get(pair.start) || COUNTRIES[0];
      const t = COUNTRIES_BY_ID.get(pair.target) || COUNTRIES[1];
      set({
        bridgeStart: s,
        bridgeTarget: t,
        bridgeChain: [s.id],
        bridgeComplete: false,
      });
    },

    addBridgeNeighbor: (countryId: string) => {
      const { bridgeChain, bridgeTarget } = get();
      if (!bridgeTarget) return false;

      const currentHeadId = bridgeChain[bridgeChain.length - 1];
      const currentHead = COUNTRIES_BY_ID.get(currentHeadId);
      if (!currentHead) return false;

      // Check if countryId is a border neighbor of currentHead
      const isNeighbor = currentHead.borders.includes(countryId);
      if (isNeighbor && !bridgeChain.includes(countryId)) {
        sound.playCorrect();
        const nextChain = [...bridgeChain, countryId];
        const isDone = countryId === bridgeTarget.id;

        if (isDone) {
          sound.playVictory();
          confetti({ particleCount: 150, spread: 90 });
          const { bridgeStart, bridgeTarget } = get();
          get().recordActivity({
            mode: 'border_bridge',
            modeTitle: 'Border Bridge',
            summary: `Bridged ${bridgeStart?.name} to ${bridgeTarget?.name}`,
            details: `Expedition completed in ${nextChain.length} steps`,
            metricValue: nextChain.length,
            metricLabel: 'Steps',
          });
        }
        set({
          bridgeChain: nextChain,
          bridgeComplete: isDone,
        });
        return true;
      } else {
        sound.playError();
        return false;
      }
    },

    // Mode 4C: Flag Hunter
    flagTarget: null,
    flagScore: 0,
    flagStreak: 0,
    flagRoundsPlayed: 0,
    flagFeedback: null,

    startFlagHunter: () => {
      const pool = getCountriesForDifficulty(get().difficulty);
      const firstTarget = pickRandom(pool, 1)[0] || COUNTRIES[0];
      set({
        flagTarget: firstTarget,
        flagScore: 0,
        flagStreak: 0,
        flagRoundsPlayed: 0,
        flagFeedback: null,
      });
    },

    submitFlagGuess: (countryId: string) => {
      const { flagTarget, flagScore, flagStreak, flagRoundsPlayed } = get();
      if (!flagTarget) return false;

      const isCorrect = countryId === flagTarget.id;
      const targetCountry = flagTarget;

      if (isCorrect) {
        sound.playCorrect();
        const nextStreak = flagStreak + 1;
        const nextScore = flagScore + 100 + nextStreak * 25;
        if (nextStreak % 5 === 0) {
          confetti({ particleCount: 40 });
        }
        const pool = getCountriesForDifficulty(get().difficulty);
        const candidates = pool.filter((c) => c.id !== targetCountry.id);
        const nextTarget = pickRandom(
          candidates.length > 0 ? candidates : COUNTRIES.filter((c) => c.id !== targetCountry.id),
          1
        )[0];
        set({
          flagScore: nextScore,
          flagStreak: nextStreak,
          flagRoundsPlayed: flagRoundsPlayed + 1,
          flagTarget: nextTarget,
          flagFeedback: { correct: true, country: targetCountry },
        });
        return true;
      } else {
        sound.playError();
        if (flagScore > 0 && flagRoundsPlayed >= 2) {
          get().recordActivity({
            mode: 'flag_hunter',
            modeTitle: 'Flag Hunter',
            summary: `Session Score: ${flagScore.toLocaleString()} pts`,
            details: `${flagRoundsPlayed + 1} rounds played · Max streak: ${flagStreak}`,
            metricValue: flagScore,
            metricLabel: 'Score',
          });
        }
        const pool = getCountriesForDifficulty(get().difficulty);
        const candidates = pool.filter((c) => c.id !== targetCountry.id);
        const nextTarget = pickRandom(
          candidates.length > 0 ? candidates : COUNTRIES.filter((c) => c.id !== targetCountry.id),
          1
        )[0];
        set({
          flagStreak: 0,
          flagRoundsPlayed: flagRoundsPlayed + 1,
          flagTarget: nextTarget,
          flagFeedback: { correct: false, country: targetCountry },
        });
        return false;
      }
    },

    // Bookmarks and Flashcards
    highScores: savedHighScores,
    bookmarkedCountryIds: savedBookmarks,
    toggleBookmark: (id: string) => {
      const { bookmarkedCountryIds } = get();
      const next = new Set(bookmarkedCountryIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('geoquest_bookmarks', JSON.stringify([...next]));
      set({ bookmarkedCountryIds: next });
    },

    flashcardKnownIds: savedFlashcards,
    markFlashcard: (id: string, known: boolean) => {
      const { flashcardKnownIds } = get();
      const next = new Set(flashcardKnownIds);
      if (known) next.add(id);
      else next.delete(id);
      localStorage.setItem('geoquest_flashcards', JSON.stringify([...next]));
      set({ flashcardKnownIds: next });
    },

    // Timer Tick loop
    tickTimer: () => {
      const {
        currentMode,
        conquestIsActive,
        conquestIsPaused,
        conquestTimerType,
        conquestSecondsLeft,
        conquestSecondsElapsed,
        capitalIsActive,
        capitalSecondsLeft,
      } = get();

      // Conquest timer
      if (currentMode === 'global_conquest' && conquestIsActive && !conquestIsPaused) {
        if (conquestTimerType === 'countdown') {
          if (conquestSecondsLeft <= 1) {
            sound.playError();
            const { conquestSolved } = get();
            if (conquestSolved.size > 0) {
              get().recordActivity({
                mode: 'global_conquest',
                modeTitle: 'Global Conquest',
                summary: `${conquestSolved.size} / ${COUNTRIES.length} nations discovered`,
                details: '15-minute challenge completed',
                metricValue: conquestSolved.size,
                metricLabel: 'Nations',
              });
            }
            set({
              conquestSecondsLeft: 0,
              conquestIsActive: false,
              conquestIsFinished: true,
              conquestGiveUp: false,
            });
          } else {
            if (conquestSecondsLeft <= 10) sound.playTick();
            set({
              conquestSecondsLeft: conquestSecondsLeft - 1,
              conquestSecondsElapsed: conquestSecondsElapsed + 1,
            });
          }
        } else if (conquestTimerType === 'stopwatch') {
          set({
            conquestSecondsElapsed: conquestSecondsElapsed + 1,
          });
        }
      }

      // Capital Blitz timer
      if (currentMode === 'capital_blitz' && capitalIsActive) {
        if (capitalSecondsLeft <= 1) {
          sound.playError();
          const { capitalScore, capitalSolved, capitalStreak, capitalVariant } = get();
          if (capitalSolved.size > 0 || capitalScore > 0) {
            get().recordActivity({
              mode: 'capital_blitz',
              modeTitle: 'Capital Blitz',
              summary: `Score: ${capitalScore.toLocaleString()} pts (${capitalSolved.size} capitals)`,
              details: `${capitalVariant === 'targeted' ? 'Targeted' : 'Freeflow'} · Streak: ${capitalStreak}`,
              metricValue: capitalScore,
              metricLabel: 'Score',
            });
          }
          set({
            capitalSecondsLeft: 0,
            capitalIsActive: false,
            capitalIsFinished: true,
          });
        } else {
          if (capitalSecondsLeft <= 10) sound.playTick();
          set({ capitalSecondsLeft: capitalSecondsLeft - 1 });
        }
      }
    },
  };
});
