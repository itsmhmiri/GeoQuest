import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries50m from 'world-atlas/countries-50m.json';
import { COUNTRIES, COUNTRIES_BY_ID, COUNTRIES_BY_NUMERIC_ID } from '../data/countries';
import { CountryRecord } from '../data/types';
import type { Feature, Geometry, GeoJsonProperties } from 'geojson';

export const MAP_BASE_WIDTH = 1000;
export const MAP_BASE_HEIGHT = 500;

// Set up Natural Earth 1 projection
export const projection = geoNaturalEarth1()
  .scale(165)
  .translate([MAP_BASE_WIDTH / 2, MAP_BASE_HEIGHT / 2]);

export const pathGenerator = geoPath(projection);

export interface ProjectedCountry {
  country: CountryRecord;
  pathData: string;
  centroid: [number, number]; // [svgX, svgY]
  isMicroState: boolean;
}

// Identify micro-states whose area is under 25,000 km² or specific island/city states
export const MICRO_STATE_IDS = new Set([
  'VAT', 'MCO', 'SMR', 'LIE', 'AND', 'MLT', 'SGP', 'BHR', 'MDV',
  'BRB', 'ATG', 'DMA', 'GRD', 'KNA', 'LCA', 'VCT', 'TTO', 'NRU',
  'TUV', 'PLW', 'MHL', 'FSM', 'KIR', 'TON', 'WSM', 'STP', 'SYC', 'MUS', 'CPV', 'LUX'
]);

// Build map features and link them to CountryRecord
let cachedProjectedCountries: ProjectedCountry[] | null = null;
let cachedCountryByNumericId = new Map<string, CountryRecord>();

export function getProjectedMapData(): {
  projectedCountries: ProjectedCountry[];
  unmatchedPaths: { id: string; name: string; pathData: string }[];
} {
  if (cachedProjectedCountries) {
    return { projectedCountries: cachedProjectedCountries, unmatchedPaths: [] };
  }

  // Convert TopoJSON to GeoJSON features
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geojson = feature(countries50m as any, (countries50m as any).objects.countries) as unknown as {
    type: string;
    features: Feature<Geometry, GeoJsonProperties & { name?: string }>[];
  };

  const projectedMap = new Map<string, ProjectedCountry>();
  const unmatched: { id: string; name: string; pathData: string }[] = [];

  geojson.features.forEach((feat) => {
    const rawId = String(feat.id || '');
    const numId = String(Number(rawId) || rawId);
    const featName = feat.properties?.name || '';
    const pathStr = pathGenerator(feat) || '';

    if (!pathStr) return;

    // Find country record
    let country: CountryRecord | undefined = COUNTRIES_BY_NUMERIC_ID.get(numId);

    // Fallback: match by name or aliases
    if (!country && featName) {
      const lower = featName.toLowerCase();
      country = COUNTRIES.find(
        (c) =>
          c.name.toLowerCase() === lower ||
          c.aliases.some((a) => a.toLowerCase() === lower)
      );
    }

    if (country) {
      const existing = projectedMap.get(country.id);
      if (existing) {
        // Append path data for additional territory/island polygons (e.g. Australia mainland + external islands)
        existing.pathData = existing.pathData ? existing.pathData + ' ' + pathStr : pathStr;
      } else {
        const coords = country.coordinates;
        const projPoint = projection(coords) || [MAP_BASE_WIDTH / 2, MAP_BASE_HEIGHT / 2];

        projectedMap.set(country.id, {
          country,
          pathData: pathStr,
          centroid: [projPoint[0], projPoint[1]],
          isMicroState: MICRO_STATE_IDS.has(country.id) || country.areaSqKm < 20000,
        });
      }
    } else {
      unmatched.push({
        id: rawId,
        name: featName,
        pathData: pathStr,
      });
    }
  });

  // For any sovereign country that didn't have a polygon in 50m (e.g. tiny enclaves or atolls),
  // add a synthetic projected country point so it can still be interacted with and solved
  COUNTRIES.forEach((c) => {
    if (!projectedMap.has(c.id)) {
      const projPoint = projection(c.coordinates) || [MAP_BASE_WIDTH / 2, MAP_BASE_HEIGHT / 2];
      projectedMap.set(c.id, {
        country: c,
        pathData: '', // Microstate rendered via dot/marker
        centroid: [projPoint[0], projPoint[1]],
        isMicroState: true,
      });
    }
  });

  const projected = Array.from(projectedMap.values());
  cachedProjectedCountries = projected;
  return { projectedCountries: projected, unmatchedPaths: unmatched };
}

/**
 * Projects longitude and latitude into map SVG space
 */
export function projectCoordinates(coords: [number, number]): [number, number] {
  const p = projection(coords);
  return p ? [p[0], p[1]] : [MAP_BASE_WIDTH / 2, MAP_BASE_HEIGHT / 2];
}
