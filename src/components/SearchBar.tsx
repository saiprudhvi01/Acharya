'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export interface SearchFilters {
  type?: 'all' | 'courses' | 'teachers' | 'materials';
  materialType?: 'all' | 'pdf' | 'video';
  category?: string;
  subject?: string;
  skillLevel?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function SearchBar({ onSearch, placeholder = 'Search keywords...', showFilters = true }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    onSearch('', {});
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`p-3 rounded-xl border transition-all ${
              showFilterPanel || Object.keys(filters).length > 0
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Search
        </button>
      </div>

      {showFilters && showFilterPanel && (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Type</label>
              <select
                value={filters.type || 'all'}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Results</option>
                <option value="courses">Courses</option>
                <option value="teachers">Teachers</option>
                <option value="materials">Materials (PDFs/Videos)</option>
              </select>
            </div>

            {(filters.type === 'all' || filters.type === 'materials') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Material Type</label>
                <select
                  value={filters.materialType || 'all'}
                  onChange={(e) => updateFilter('materialType', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Materials</option>
                  <option value="pdf">PDFs Only</option>
                  <option value="video">Videos Only</option>
                </select>
              </div>
            )}

            {(filters.type === 'all' || filters.type === 'courses') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    placeholder="e.g., Science, Math"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={filters.subject || ''}
                    onChange={(e) => updateFilter('subject', e.target.value)}
                    placeholder="e.g., Physics, Chemistry"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skill Level</label>
                  <select
                    value={filters.skillLevel || ''}
                    onChange={(e) => updateFilter('skillLevel', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            {(filters.type === 'all' || filters.type === 'courses') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Price (₹)</label>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="10000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setFilters({})}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
