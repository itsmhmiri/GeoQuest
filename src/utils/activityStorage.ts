import { BestRecords, UserActivityRecord, AchievementItem, GameModeId } from '../data/types';

const STORAGE_KEY_RECORDS = 'geoquest_best_records_v1';
const STORAGE_KEY_ACTIVITIES = 'geoquest_activities_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'geoquest_achievements_v1';

export const DEFAULT_BEST_RECORDS: BestRecords = {
  conquestBestCount: 0,
  conquestBestTimeSec: null,
  vanishingBestCount: 0,
  vanishingTotalClears: 0,
  capitalBlitzHighScore: 0,
  capitalBlitzMaxStreak: 0,
  higherLowerBestStreak: 0,
  higherLowerPopulationBestStreak: 0,
  higherLowerAreaBestStreak: 0,
  higherLowerTotalCorrect: 0,
  bridgeTotalCompleted: 0,
  bridgeShortestSteps: null,
  flagHunterHighScore: 0,
  flagHunterMaxStreak: 0,
  totalGamesPlayed: 0,
  totalCountriesDiscovered: 0,
};

export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'first_step',
    title: 'First Footstep',
    description: 'Name your first sovereign nation in Conquest',
    category: 'exploration',
    icon: 'Compass',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'explorer_50',
    title: 'Half-Century Voyager',
    description: 'Discover at least 50 nations in Global Conquest',
    category: 'exploration',
    icon: 'Globe',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'conquest_master',
    title: 'Master Cartographer',
    description: 'Name every single nation on Earth in Global Conquest',
    category: 'mastery',
    icon: 'Trophy',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'phantom_clear',
    title: 'Phantom Whisperer',
    description: 'Restore all 10 mystery nations in Phantom 10',
    category: 'knowledge',
    icon: 'Ghost',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'capital_1000',
    title: 'Capital Maestro',
    description: 'Score 1,000+ points in a single Capital Blitz run',
    category: 'speed',
    icon: 'Landmark',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'stat_streak_10',
    title: 'Statistical Oracle',
    description: 'Achieve a winning streak of 10 in Higher or Lower',
    category: 'knowledge',
    icon: 'BarChart2',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'bridge_solved',
    title: 'Silk Road Pioneer',
    description: 'Successfully bridge start and destination nations',
    category: 'exploration',
    icon: 'Route',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'flag_virtuoso',
    title: 'Vexillology Virtuoso',
    description: 'Achieve a 10-streak in Flag Hunter',
    category: 'knowledge',
    icon: 'Flag',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'polymath_6',
    title: 'Global Polymath',
    description: 'Complete at least one session in 5 different modes',
    category: 'mastery',
    icon: 'Sparkles',
    progress: 0,
    unlockedAt: null,
  },
  {
    id: 'scholar_cards',
    title: 'Dedicated Scholar',
    description: 'Master at least 15 flashcards in the Learning Hub',
    category: 'knowledge',
    icon: 'BookOpen',
    progress: 0,
    unlockedAt: null,
  },
];

// Helper to safely load JSON from localStorage
function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed reading ${key} from localStorage:`, err);
    return fallback;
  }
}

// Helper to safely save JSON to localStorage
function safeSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed writing ${key} to localStorage:`, err);
  }
}

export const activityStorage = {
  getRecords(): BestRecords {
    const loaded = safeLoad<Partial<BestRecords>>(STORAGE_KEY_RECORDS, {});
    // Merge with legacy highscores if present
    const legacy = safeLoad<Record<string, number>>('geoquest_highscores', {});
    const popBest = Math.max(
      loaded.higherLowerPopulationBestStreak || 0,
      legacy.higher_lower_population || 0,
      legacy.higher_lower || 0
    );
    const areaBest = Math.max(
      loaded.higherLowerAreaBestStreak || 0,
      legacy.higher_lower_area || 0
    );
    return {
      ...DEFAULT_BEST_RECORDS,
      ...loaded,
      higherLowerPopulationBestStreak: popBest,
      higherLowerAreaBestStreak: areaBest,
      higherLowerBestStreak: Math.max(loaded.higherLowerBestStreak || 0, popBest, areaBest, legacy.higher_lower || 0),
    };
  },

  saveRecords(records: BestRecords): void {
    safeSave(STORAGE_KEY_RECORDS, records);
  },

  getActivities(): UserActivityRecord[] {
    return safeLoad<UserActivityRecord[]>(STORAGE_KEY_ACTIVITIES, []);
  },

  addActivity(activity: Omit<UserActivityRecord, 'id' | 'timestamp'>): {
    record: UserActivityRecord;
    isNewBest: boolean;
    records: BestRecords;
  } {
    const currentRecords = this.getRecords();
    const currentActivities = this.getActivities();
    let isNewBest = false;
    const now = Date.now();

    const updatedRecords: BestRecords = {
      ...currentRecords,
      totalGamesPlayed: currentRecords.totalGamesPlayed + 1,
    };

    // Check best record per mode
    if (activity.mode === 'global_conquest') {
      const count = activity.metricValue;
      if (count > currentRecords.conquestBestCount) {
        isNewBest = true;
        updatedRecords.conquestBestCount = count;
      }
      updatedRecords.totalCountriesDiscovered = Math.max(
        updatedRecords.totalCountriesDiscovered,
        count
      );
    } else if (activity.mode === 'vanishing_10') {
      const count = activity.metricValue;
      if (count > currentRecords.vanishingBestCount) {
        isNewBest = true;
        updatedRecords.vanishingBestCount = count;
      }
      if (count === 10) {
        updatedRecords.vanishingTotalClears = currentRecords.vanishingTotalClears + 1;
      }
    } else if (activity.mode === 'capital_blitz') {
      const score = activity.metricValue;
      if (score > currentRecords.capitalBlitzHighScore) {
        isNewBest = true;
        updatedRecords.capitalBlitzHighScore = score;
      }
    } else if (activity.mode === 'higher_lower') {
      const streak = activity.metricValue;
      if (streak > currentRecords.higherLowerBestStreak) {
        isNewBest = true;
        updatedRecords.higherLowerBestStreak = streak;
      }
      const isPop =
        activity.metricLabel.toLowerCase().includes('pop') ||
        activity.summary.toLowerCase().includes('pop') ||
        activity.details.toLowerCase().includes('pop');
      if (isPop) {
        if (streak > (currentRecords.higherLowerPopulationBestStreak || 0)) {
          isNewBest = true;
          updatedRecords.higherLowerPopulationBestStreak = streak;
        }
      } else {
        if (streak > (currentRecords.higherLowerAreaBestStreak || 0)) {
          isNewBest = true;
          updatedRecords.higherLowerAreaBestStreak = streak;
        }
      }
      updatedRecords.higherLowerTotalCorrect = currentRecords.higherLowerTotalCorrect + streak;
    } else if (activity.mode === 'border_bridge') {
      const steps = activity.metricValue;
      if (steps > 0) {
        updatedRecords.bridgeTotalCompleted = currentRecords.bridgeTotalCompleted + 1;
        if (
          currentRecords.bridgeShortestSteps === null ||
          steps < currentRecords.bridgeShortestSteps
        ) {
          isNewBest = true;
          updatedRecords.bridgeShortestSteps = steps;
        }
      }
    } else if (activity.mode === 'flag_hunter') {
      const score = activity.metricValue;
      if (score > currentRecords.flagHunterHighScore) {
        isNewBest = true;
        updatedRecords.flagHunterHighScore = score;
      }
    }

    const newRecord: UserActivityRecord = {
      ...activity,
      id: `act_${now}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      isNewBest,
    };

    // Prepend and keep the most recent 60 activities
    const updatedActivities = [newRecord, ...currentActivities].slice(0, 60);

    this.saveRecords(updatedRecords);
    safeSave(STORAGE_KEY_ACTIVITIES, updatedActivities);

    // Refresh achievements progress
    this.refreshAchievements(updatedRecords, updatedActivities);

    return { record: newRecord, isNewBest, records: updatedRecords };
  },

  getAchievements(): AchievementItem[] {
    const saved = safeLoad<AchievementItem[]>(STORAGE_KEY_ACHIEVEMENTS, []);
    if (saved.length === 0) return INITIAL_ACHIEVEMENTS;

    // Merge with initial in case new achievements were added
    return INITIAL_ACHIEVEMENTS.map((initial) => {
      const existing = saved.find((s) => s.id === initial.id);
      return existing || initial;
    });
  },

  refreshAchievements(records: BestRecords, activities: UserActivityRecord[]): AchievementItem[] {
    const current = this.getAchievements();
    const now = Date.now();

    // Check unique modes played in activities
    const modesPlayed = new Set(activities.map((a) => a.mode));

    // Mastered flashcards from localstorage
    let flashcardsLearned = 0;
    try {
      const fc = JSON.parse(localStorage.getItem('geoquest_flashcards') || '[]');
      flashcardsLearned = Array.isArray(fc) ? fc.length : 0;
    } catch {
      flashcardsLearned = 0;
    }

    const updated = current.map((ach) => {
      let progress = ach.progress;
      let unlockedAt = ach.unlockedAt;

      switch (ach.id) {
        case 'first_step':
          progress = records.conquestBestCount >= 1 ? 100 : 0;
          break;
        case 'explorer_50':
          progress = Math.min(100, Math.round((records.conquestBestCount / 50) * 100));
          break;
        case 'conquest_master':
          progress = Math.min(100, Math.round((records.conquestBestCount / 197) * 100));
          break;
        case 'phantom_clear':
          progress = records.vanishingBestCount >= 10 ? 100 : Math.round((records.vanishingBestCount / 10) * 100);
          break;
        case 'capital_1000':
          progress = Math.min(100, Math.round((records.capitalBlitzHighScore / 1000) * 100));
          break;
        case 'stat_streak_10':
          progress = Math.min(100, Math.round((records.higherLowerBestStreak / 10) * 100));
          break;
        case 'bridge_solved':
          progress = records.bridgeTotalCompleted >= 1 ? 100 : 0;
          break;
        case 'flag_virtuoso':
          progress = Math.min(100, Math.round((records.flagHunterMaxStreak / 10) * 100));
          break;
        case 'polymath_6':
          progress = Math.min(100, Math.round((modesPlayed.size / 5) * 100));
          break;
        case 'scholar_cards':
          progress = Math.min(100, Math.round((flashcardsLearned / 15) * 100));
          break;
      }

      if (progress >= 100 && !unlockedAt) {
        unlockedAt = now;
      }

      return {
        ...ach,
        progress,
        unlockedAt,
      };
    });

    safeSave(STORAGE_KEY_ACHIEVEMENTS, updated);
    return updated;
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
      localStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS);
      localStorage.removeItem('geoquest_highscores');
      localStorage.removeItem('geoquest_bookmarks');
      localStorage.removeItem('geoquest_flashcards');
    } catch (e) {
      console.warn('Error clearing localStorage', e);
    }
  },
};
