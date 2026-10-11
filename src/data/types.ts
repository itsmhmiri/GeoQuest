export interface CountryRecord {
  id: string; // ISO 3166-1 alpha-3 (e.g., "FRA")
  numericId: string; // TopoJSON feature ID mapping (e.g. "250")
  name: string; // "France"
  officialName: string; // "French Republic"
  aliases: string[]; // ["France", "French Republic", "La France"]
  capital: string; // "Paris"
  capitalAliases: string[]; // ["Paris"]
  continent: 'Africa' | 'Asia' | 'Europe' | 'North America' | 'Oceania' | 'South America' | 'Antarctica';
  subregion: string;
  flagUrl: string; // SVG or data URL
  flagEmoji: string;
  population: number; // e.g., 67750000
  areaSqKm: number; // e.g., 551695
  currency: {
    code: string; // "EUR"
    name: string; // "Euro"
    symbol: string; // "€"
  };
  borders: string[]; // Neighboring ISO alpha-3 codes: ["BEL", "DEU", "ITA", "ESP", ...]
  coordinates: [number, number]; // [Longitude, Latitude] for centering/zoom
}

export type GameModeId = 
  | 'global_conquest'  // Mode 1: Name All Countries
  | 'vanishing_10'    // Mode 2: The Vanishing 10 (Phantom Nations)
  | 'capital_blitz'    // Mode 3: Capital City Blitz
  | 'higher_lower'     // Mode 4A: Stat Battle
  | 'border_bridge'    // Mode 4B: Geography Chain
  | 'flag_hunter'      // Mode 4C: Visual Identification
  | 'atlas';           // Mode 5: Interactive Learning Atlas

export type TimerType = 'countdown' | 'stopwatch' | 'zen';

export interface GameStats {
  gamesPlayed: number;
  countriesDiscoveredTotal: number;
  highScores: Record<string, number>;
  bestStreaks: Record<string, number>;
  flashcardsMastered: string[];
}
