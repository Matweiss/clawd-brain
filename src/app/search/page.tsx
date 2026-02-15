'use client';

import { useState, useCallback } from 'react';
import { Search as SearchIcon, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SearchResult {
  file: string;
  snippet: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search across all your memories and documents
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <SearchIcon 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories, documents, tasks..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 
                     dark:border-gray-700 bg-white dark:bg-gray-900
                     text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-primary-500
                     placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2
                     px-4 py-1.5 bg-primary-600 text-white rounded-md
                     hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl 
                          border border-gray-200 dark:border-gray-800">
              <SearchIcon className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg text-gray-900 dark:text-white font-medium">
                No results found
              </p>
              <p className="text-gray-500 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 rounded-lg border 
                             border-gray-200 dark:border-gray-800 p-4
                             hover:border-primary-500 dark:hover:border-primary-500
                             transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="text-gray-400 mt-1" size={20} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-600 mb-2">
                          {result.file}
                        </p>
                        <div className="text-gray-700 dark:text-gray-300 text-sm 
                                      bg-gray-50 dark:bg-gray-800/50 rounded p-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {result.snippet}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searched && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl 
                      border border-gray-200 dark:border-gray-800">
          <SearchIcon className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-lg text-gray-900 dark:text-white font-medium">
            Start typing to search
          </p>
          <p className="text-gray-500 mt-1">
            Search across all your memories, documents, and config files
          </p>
        </div>
      )}
    </div>
  );
}
