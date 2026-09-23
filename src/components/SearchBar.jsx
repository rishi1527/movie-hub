import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Star, Film, Sparkles } from 'lucide-react';
import { searchMovies } from '../services/tmdbApi';

// Local cache for search queries
const searchCache = new Map();

/**
 * Smooth Expanding Liquid Glass SearchBar Component
 * Transitions smoothly between a compact pill and an expanded search capsule without Navbar layout jumping.
 */
const SearchBar = ({ onSelectResult, isMobile = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  const isExpanded = isMobile || isFocused || Boolean(query.trim());

  // Expand and focus search
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query.trim()) {
      setIsOpen(true);
    }
  }, [query]);

  // Collapse search if query is empty
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!query.trim()) {
      setIsOpen(false);
    }
  }, [query]);

  // Debounced TMDB search effect (300ms) with AbortController
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setResults([]);
      setIsLoading(false);
      setError(null);
      setSelectedIndex(-1);
      return;
    }

    // Check search cache first
    if (searchCache.has(trimmed.toLowerCase())) {
      setResults(searchCache.get(trimmed.toLowerCase()));
      setIsLoading(false);
      setError(null);
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Cancel any previous in-flight search request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const data = await searchMovies(trimmed, 1, { signal: controller.signal });
        const sliced = data ? data.slice(0, 15) : [];
        searchCache.set(trimmed.toLowerCase(), sliced);
        setResults(sliced);
        setIsOpen(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('TMDB Search error:', err);
          setError('Unable to fetch movies right now.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  // Click outside to collapse/close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selecting a movie
  const handleSelectMovie = (movieId) => {
    setIsOpen(false);
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
    if (onSelectResult) onSelectResult();
    navigate(`/movies/${movieId}`);
  };

  // Keyboard navigation within suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (query.trim()) {
        setQuery('');
        setResults([]);
      }
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectMovie(results[selectedIndex].id);
      } else if (results.length > 0) {
        handleSelectMovie(results[0].id);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative z-50 flex items-center shrink-0">
      {/* Smoothly Expanding Liquid Glass Capsule */}
      <div
        onClick={handleContainerClick}
        className={`relative flex items-center glass-explore-pill rounded-full overflow-hidden transition-[width,background-color,border-color,box-shadow] duration-300 ease-out cursor-pointer ${
          isMobile
            ? 'w-full'
            : isExpanded
            ? 'w-48 sm:w-60 md:w-72 lg:w-80 border-[#FF1A24]/50 ring-2 ring-[#FF1A24]/20 bg-[#0A0A0A]/90 shadow-lg shadow-[#E50914]/10'
            : 'w-28 sm:w-32 border-white/12 hover:border-white/25 hover:bg-white/10 shadow-sm'
        }`}
      >
        {/* Left Search Icon */}
        <div className="pl-2.5 pr-1.5 flex items-center pointer-events-none text-zinc-400 shrink-0">
          <Search
            className={`w-3.5 h-3.5 transition-colors duration-200 shrink-0 ${
              isExpanded ? 'text-[#FF1A24]' : 'text-[#FF1A24]/90'
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={
            isMobile
              ? 'Search movies, series, anime...'
              : isExpanded
              ? 'Search movies, series, anime...'
              : 'Search'
          }
          aria-label="Search movies and series"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="w-full bg-transparent py-1.5 pl-0.5 pr-8 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none cursor-pointer focus:cursor-text min-w-0"
        />

        {/* Right Action / Shortcut Badge */}
        <div className="absolute right-2.5 flex items-center gap-1 shrink-0">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-[#FF1A24] animate-spin shrink-0" aria-hidden="true" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none cursor-pointer shrink-0"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : !isMobile && isExpanded ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFocused(false);
                inputRef.current?.blur();
              }}
              className="text-[9px] font-semibold text-zinc-400 hover:text-white px-1 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors shrink-0 whitespace-nowrap"
              aria-label="Close search"
            >
              ESC
            </button>
          ) : null}
        </div>
      </div>

      {/* Floating Liquid Glass Search Results Dropdown */}
      {isOpen && query.trim() && (
        <div
          className={`glass-panel absolute top-full mt-2 rounded-2xl p-2 z-50 shadow-2xl border border-white/15 max-h-[65vh] overflow-y-auto no-scrollbar animate-in fade-in-50 slide-in-from-top-2 duration-150 ${
            isMobile
              ? 'left-0 right-0 w-full'
              : 'right-0 w-[calc(100vw-32px)] max-w-sm sm:max-w-md sm:w-80 md:w-96'
          }`}
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Loading Indicator */}
          {isLoading && results.length === 0 && (
            <div className="p-4 flex items-center justify-center gap-2.5 text-xs text-zinc-300 font-medium">
              <Loader2 className="w-4 h-4 text-[#FF1A24] animate-spin" />
              <span>Scanning cinematic library...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 text-center text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Empty Results State */}
          {!isLoading && !error && results.length === 0 && (
            <div className="p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-zinc-300">No titles found</p>
              <p className="text-[11px] text-zinc-500">
                Try searching for a different movie, series, or anime name.
              </p>
            </div>
          )}

          {/* Results List */}
          {!error && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF1A24]" />
                  <span>Cinematic Results</span>
                </span>
                <span className="text-zinc-500">{results.length} found</span>
              </div>

              {results.map((movie, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                      isSelected
                        ? 'bg-[#E50914]/20 border border-[#FF1A24]/30'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {/* Thumbnail Poster */}
                    <div className="w-10 h-14 rounded-lg bg-[#161616] overflow-hidden shrink-0 border border-white/10 relative shadow-md">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#FF1A24] transition-colors truncate">
                        {movie.title}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        {movie.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{movie.rating}</span>
                          </span>
                        )}
                        {movie.year && <span>{movie.year}</span>}
                        {movie.genre && (
                          <span className="truncate text-zinc-500">• {movie.genre}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(SearchBar);
