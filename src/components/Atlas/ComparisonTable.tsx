import React, { useState, useMemo } from 'react';
import { COUNTRIES } from '../../data/countries';
import { CountryRecord } from '../../data/types';
import { useGameStore } from '../../store/gameStore';
import { Search, ArrowUpDown, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';

type SortField = 'name' | 'capital' | 'continent' | 'population' | 'areaSqKm';
type SortOrder = 'asc' | 'desc';

export const ComparisonTable: React.FC = () => {
  const { setSelectedCountry, bookmarkedCountryIds, toggleBookmark } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('population');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const continents = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' || field === 'capital' || field === 'continent' ? 'asc' : 'desc');
    }
  };

  const filteredData = useMemo(() => {
    return COUNTRIES.filter((c) => {
      const matchContinent = selectedContinent === 'All' || c.continent === selectedContinent;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.officialName.toLowerCase().includes(q);
      return matchContinent && matchSearch;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        const comp = (valA as string).localeCompare(valB as string);
        return sortOrder === 'asc' ? comp : -comp;
      } else {
        const comp = (valA as number) - (valB as number);
        return sortOrder === 'asc' ? comp : -comp;
      }
    });
  }, [searchQuery, selectedContinent, sortField, sortOrder]);

  return (
    <div className="flex flex-col h-full w-full bg-[#080d1a] p-3 sm:p-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
        <div>
          <h1 className="text-base sm:text-xl font-extrabold text-white">Comparative Matrix Table</h1>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Searchable geographic metrics across {COUNTRIES.length} sovereign states
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-auto min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country or capital..."
            className="w-full rounded-xl bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none border border-white/10 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Continent Filter Segmented Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 shrink-0">
        {continents.map((cont) => (
          <button
            key={cont}
            onClick={() => setSelectedContinent(cont)}
            className={`whitespace-nowrap px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors ${
              selectedContinent === cont
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {cont}
          </button>
        ))}
      </div>

      {/* Datagrid Table with smooth horizontal scroll on mobile */}
      <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left text-xs min-w-[580px] sm:min-w-full">
          <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-md text-slate-400 border-b border-white/10">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-8">#</th>
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Nation</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('capital')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Capital</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('continent')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Continent</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('population')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Population</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('areaSqKm')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Area (km²)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold text-center w-16">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.map((country, idx) => {
              const isBookmarked = bookmarkedCountryIds.has(country.id);

              return (
                <tr
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{country.flagEmoji}</span>
                      <span className="font-semibold">{country.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({country.id})</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{country.capital}</td>
                  <td className="py-2.5 px-3 text-slate-400">{country.continent}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-200 tabular-nums">
                    {country.population.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                    {country.areaSqKm.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(country.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-amber-300"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-amber-400" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
