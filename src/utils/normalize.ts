/**
 * Fuzzy Match & String Normalization Pipeline
 * Normalizes user input and country/capital names for resilient matching.
 */

const ACRONYM_MAP: Record<string, string> = {
  'usa': 'united states of america',
  'us': 'united states of america',
  'uk': 'united kingdom',
  'uae': 'united arab emirates',
  'drc': 'democratic republic of the congo',
  'dr congo': 'democratic republic of the congo',
  'congo kinshasa': 'democratic republic of the congo',
  'congo brazzaville': 'republic of the congo',
  'car': 'central african republic',
  'png': 'papua new guinea',
  'dprk': 'north korea',
  'rok': 'south korea',
  'prc': 'china',
  'nz': 'new zealand',
  'bih': 'bosnia and herzegovina',
  'tt': 'trinidad and tobago',
  'svg': 'saint vincent and the grenadines',
  'kn': 'saint kitts and nevis',
  'fsm': 'micronesia',
  'sl': 'sierra leone',
  'sa': 'saudi arabia',
  'za': 'south africa',
};

/**
 * Strips diacritics, lowercase, removes punctuation, handles articles and acronyms.
 */
export function normalizeString(input: string): string {
  if (!input) return '';

  let normalized = input
    // Normalize unicode to NFD and remove diacritic marks
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Lowercase
    .toLowerCase()
    // Replace special dashes / quotes with standard characters
    .replace(/[‘’´`]/g, "'")
    .replace(/[–—]/g, '-')
    // Replace '&' with 'and'
    .replace(/\s*&\s*/g, ' and ')
    // Replace common abbreviations: 'st.' -> 'saint'
    .replace(/\bst\.\s*/g, 'saint ')
    .replace(/\bst\b/g, 'saint')
    // Remove punctuation
    .replace(/[-_.,'’"()\/]/g, ' ')
    // Strip extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Strip leading articles
  if (normalized.startsWith('the ')) {
    normalized = normalized.slice(4).trim();
  }

  // Check acronym expansion
  if (ACRONYM_MAP[normalized]) {
    normalized = ACRONYM_MAP[normalized];
  }

  return normalized;
}

/**
 * Checks if a normalized input matches any of the target candidates (name, aliases, etc.)
 */
export function matchesCandidate(input: string, candidates: string[]): boolean {
  const cleanInput = normalizeString(input);
  if (!cleanInput) return false;

  for (const candidate of candidates) {
    const cleanCand = normalizeString(candidate);
    if (cleanCand === cleanInput) {
      return true;
    }
  }
  return false;
}
