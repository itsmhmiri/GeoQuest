import React, { useState, useMemo } from 'react';
import { COUNTRIES } from '../../data/countries';
import { CountryRecord } from '../../data/types';
import { useGameStore } from '../../store/gameStore';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, Bookmark, BookmarkCheck } from 'lucide-react';

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
    <div className="flex flex-col h-full w-full bg-[#090d16] p-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Comparative Matrix Table</h1>
          <p className="text-xs text-slate-400">
            Searchable geographic metrics across {COUNTRIES.length} sovereign states
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter country or capital..."
            className="w-full rounded-xl bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none border border-white/10 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Continent Filter Segmented Control */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 shrink-0">
        {continents.map((cont) => (
          <button
            key={cont}
            onClick={() => setSelectedContinent(cont)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedContinent === cont
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {cont}
          </button>
        ))}
      </div>

      {/* Datagrid Table */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md text-slate-400 border-b border-white/10">
            <tr>
              <th className="py-3 px-4 font-semibold w-10">#</th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nation</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('capital')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Capital</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('continent')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Continent</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('population')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Population</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('areaSqKm')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right hidden md:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Area (km²)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center w-12">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.map((country, index) => {
              const isSaved = bookmarkedCountryIds.has(country.id);

              return (
                <tr
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-slate-500 tabular-nums">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{country.flagEmoji}</span>
                      <span className="group-hover:text-emerald-400 transition-colors font-semibold">
                        {country.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{country.capital}</td>
                  <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                    {country.continent}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-slate-200">
                    {country.population.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-mono text-slate-400 hidden md:table-cell">
                    {country.areaSqKm.toLocaleString()}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(country.id);
                    }}
                  >
                    <button
                      className={`p-1 rounded hover:bg-slate-700/60 transition-colors ${
                        isSaved ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
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
