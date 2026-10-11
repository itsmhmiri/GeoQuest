import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { COUNTRIES_BY_ID } from '../../data/countries';
import { X, Bookmark, BookmarkCheck, Compass, Users, MapPin, Coins, Share2, Layers } from 'lucide-react';

export const AtlasPanel: React.FC = () => {
  const {
    selectedCountry,
    setSelectedCountry,
    bookmarkedCountryIds,
    toggleBookmark,
    spotlightNeighbors,
    setSpotlightNeighbors,
  } = useGameStore();

  if (!selectedCountry) return null;

  const isBookmarked = bookmarkedCountryIds.has(selectedCountry.id);
  const neighborCountries = selectedCountry.borders
    .map((id) => COUNTRIES_BY_ID.get(id))
    .filter(Boolean);

  return (
    <div className="absolute top-0 right-0 z-40 h-full w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl overflow-y-auto animate-slideLeft">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{selectedCountry.flagEmoji}</span>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{selectedCountry.name}</h2>
            <p className="text-[11px] text-slate-400">{selectedCountry.continent} · {selectedCountry.subregion}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleBookmark(selectedCountry.id)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark for study'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'text-slate-400 hover:text-white border-white/5 bg-slate-800'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setSelectedCountry(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Body Details */}
      <div className="p-5 space-y-5">
        {/* Official Name */}
        <div className="rounded-xl bg-slate-950/60 p-3.5 border border-white/5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
            Official State Name
          </span>
          <p className="text-xs font-medium text-slate-200">{selectedCountry.officialName}</p>
        </div>

        {/* Core Geography Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Capital</span>
            </div>
            <p className="text-sm font-bold text-white">{selectedCountry.capital}</p>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Users className="h-3.5 w-3.5 text-sky-400" />
              <span>Population</span>
            </div>
            <p className="text-sm font-bold text-white tabular-nums">
              {selectedCountry.population.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Compass className="h-3.5 w-3.5 text-indigo-400" />
              <span>Area</span>
            </div>
            <p className="text-sm font-bold text-white tabular-nums">
              {selectedCountry.areaSqKm.toLocaleString()} km²
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>Currency</span>
            </div>
            <p className="text-sm font-bold text-white truncate">
              {selectedCountry.currency.symbol} {selectedCountry.currency.code} ({selectedCountry.currency.name})
            </p>
          </div>
        </div>

        {/* Borders & Neighbors Visualizer Section */}
        <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Layers className="h-4 w-4 text-sky-400" />
              <span>Terrestrial Neighbors ({neighborCountries.length})</span>
            </div>

            <button
              onClick={() => setSpotlightNeighbors(!spotlightNeighbors)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                spotlightNeighbors
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              {spotlightNeighbors ? 'Dim Borders' : 'Spotlight on Map'}
            </button>
          </div>

          {neighborCountries.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {neighborCountries.map((n) => {
                if (!n) return null;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedCountry(n)}
                    className="flex items-center gap-2 rounded-lg bg-slate-900/80 p-2 text-left hover:bg-slate-800 border border-white/5 transition-colors group"
                  >
                    <span className="text-base">{n.flagEmoji}</span>
                    <span className="truncate text-xs font-medium text-slate-300 group-hover:text-white">
                      {n.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Island or isolated nation with no direct terrestrial land borders.
            </p>
          )}
        </div>

        {/* Known Aliases */}
        {selectedCountry.aliases.length > 1 && (
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-white/5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
              Accepted Aliases & Historical Names
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
              {selectedCountry.aliases.map((a, i) => (
                <span key={i} className="text-slate-300">
                  {a}
                  {i < selectedCountry.aliases.length - 1 && <span className="text-slate-600 ml-1.5">·</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
