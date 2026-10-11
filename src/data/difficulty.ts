import { COUNTRIES, COUNTRIES_BY_ID } from './countries';
import { CountryRecord, DifficultyLevel } from './types';

// Regular / Explorer: Top 50 prominent, internationally recognizable nations
export const REGULAR_COUNTRY_IDS = new Set([
  'USA', 'GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'JPN', 'CHN', 'IND', 'BRA',
  'CAN', 'AUS', 'RUS', 'MEX', 'EGY', 'ZAF', 'ARG', 'KOR', 'TUR', 'GRC',
  'SWE', 'NOR', 'NLD', 'CHE', 'POL', 'PRT', 'SAU', 'IDN', 'THA', 'VNM',
  'PHL', 'CHL', 'COL', 'PER', 'NGA', 'KEN', 'MAR', 'NZL', 'IRL', 'AUT',
  'BEL', 'DNK', 'FIN', 'ISR', 'SGP', 'CUB', 'JAM', 'ISL', 'UKR', 'CZE'
]);

// Medium: Regular + 65 intermediate nations
export const MEDIUM_COUNTRY_IDS = new Set([
  ...REGULAR_COUNTRY_IDS,
  'DZA', 'ROU', 'HUN', 'SRB', 'HRV', 'BGR', 'SVK', 'SVN', 'LTU', 'LVA',
  'EST', 'KAZ', 'UZB', 'PAK', 'BGD', 'LKA', 'NPL', 'MMR', 'MYS', 'IRN',
  'IRQ', 'JOR', 'LBN', 'ARE', 'QAT', 'KWT', 'OMN', 'TUN', 'GHA', 'ETH',
  'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'CIV', 'ZWE', 'ECU', 'BOL', 'PRY',
  'URY', 'VEN', 'CRI', 'PAN', 'GTM', 'DOM', 'BHS', 'FJI', 'PNG', 'MNG',
  'LUX', 'CYP', 'MLT', 'ALB', 'MKD', 'BIH', 'MNE', 'GEO', 'ARM', 'AZE'
]);

// Filter nations by difficulty level
export function getCountriesForDifficulty(difficulty: DifficultyLevel): CountryRecord[] {
  if (difficulty === 'regular') {
    return COUNTRIES.filter((c) => REGULAR_COUNTRY_IDS.has(c.id));
  }
  if (difficulty === 'medium') {
    return COUNTRIES.filter((c) => MEDIUM_COUNTRY_IDS.has(c.id));
  }
  // Hard: All 196+ sovereign nations, including microstates & obscure nations
  return COUNTRIES;
}

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  badge: string;
  desc: string;
  color: string;
  badgeClass: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  regular: {
    id: 'regular',
    label: 'Regular',
    badge: 'Famous Nations',
    desc: 'Focuses on 50 prominent, globally recognizable sovereign nations',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    badge: 'Intermediate',
    desc: 'Expands pool to 115 regional & continental sovereign nations',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    badge: 'All 196 Nations',
    desc: 'Full atlas including lesser-known nations, microstates & remote islands',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

// Preset pairs for Border Bridge by difficulty
export const BRIDGE_PAIRS_BY_DIFFICULTY: Record<DifficultyLevel, { start: string; target: string }[]> = {
  regular: [
    { start: 'PRT', target: 'FRA' }, // Portugal -> France
    { start: 'ESP', target: 'DEU' }, // Spain -> Germany
    { start: 'DEU', target: 'ITA' }, // Germany -> Italy
    { start: 'CAN', target: 'MEX' }, // Canada -> Mexico
    { start: 'NOR', target: 'DEU' }, // Norway -> Germany
    { start: 'FRA', target: 'POL' }, // France -> Poland
  ],
  medium: [
    { start: 'PRT', target: 'POL' }, // Portugal -> Poland
    { start: 'ESP', target: 'DNK' }, // Spain -> Denmark
    { start: 'ZAF', target: 'KEN' }, // South Africa -> Kenya
    { start: 'ARG', target: 'COL' }, // Argentina -> Colombia
    { start: 'NOR', target: 'ITA' }, // Norway -> Italy
    { start: 'DEU', target: 'TUR' }, // Germany -> Turkey
    { start: 'IND', target: 'THA' }, // India -> Thailand
  ],
  hard: [
    { start: 'PRT', target: 'VNM' }, // Portugal -> Vietnam (Eurasian epic route)
    { start: 'ZAF', target: 'EGY' }, // South Africa -> Egypt (Trans-African route)
    { start: 'NOR', target: 'GRC' }, // Norway -> Greece
    { start: 'ESP', target: 'TUR' }, // Spain -> Turkey
    { start: 'IND', target: 'VNM' }, // India -> Vietnam
    { start: 'FIN', target: 'CHN' }, // Finland -> China (via Russia)
  ],
};
