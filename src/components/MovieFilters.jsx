import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  Star,
  Calendar,
  Clapperboard,
  ArrowDownUp,
} from 'lucide-react';
import Button from './Button';

/**
 * Sort options mapped to TMDB movie discover sort_by parameters
 */
export const MOVIE_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popular' },
  { value: 'vote_average.desc', label: 'Rating: High to Low' },
  { value: 'vote_average.asc', label: 'Rating: Low to High' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.asc', label: 'Oldest' },
  { value: 'vote_count.desc', label: 'Most Voted' },
];

/**
 * Sort options mapped to TMDB TV / Web Series / Anime discover sort_by parameters
 */
export const TV_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popular' },
  { value: 'vote_average.desc', label: 'Rating: High to Low' },
  { value: 'vote_average.asc', label: 'Rating: Low to High' },
  { value: 'first_air_date.desc', label: 'Newest' },
  { value: 'first_air_date.asc', label: 'Oldest' },
  { value: 'vote_count.desc', label: 'Most Voted' },
];

/**
 * Default combined sort options list for generic resolution
 */
export const SORT_OPTIONS = MOVIE_SORT_OPTIONS;

/**
 * Rating filter options representing TMDB vote_average.gte
 */
export const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '9', label: '9+ (Masterpiece)' },
  { value: '8', label: '8+ (Great)' },
  { value: '7', label: '7+ (Good)' },
  { value: '6', label: '6+ (Decent)' },
  { value: '5', label: '5+ (Average)' },
];

/**
 * Reusable Active Filter Chips Component
 * Renders compact removable chips outside the popup when filters are active
 */
export const ActiveFilterChips = ({
  genres = [],
  selectedGenre = 'all',
  onGenreChange,
  selectedYear = 'all',
  onYearChange,
  selectedRating = 'all',
  onRatingChange,
  selectedSort = 'popularity.desc',
  onSortChange,
  onClearAll,
  type = 'movie',
}) => {
  const isTvType = type === 'tv' || type === 'web-series' || type === 'anime' || type === 'tv-shows';
  const sortOptions = isTvType ? TV_SORT_OPTIONS : MOVIE_SORT_OPTIONS;

  const activeGenreName = useMemo(() => {
    if (!selectedGenre || selectedGenre === 'all') return null;
    const found = genres.find((g) => String(g.id) === String(selectedGenre));
    return found ? found.name : `Genre #${selectedGenre}`;
  }, [genres, selectedGenre]);

  const activeSortLabel = useMemo(() => {
    if (selectedSort === 'popularity.desc') return null;
    const found =
      sortOptions.find((s) => s.value === selectedSort) ||
      MOVIE_SORT_OPTIONS.find((s) => s.value === selectedSort) ||
      TV_SORT_OPTIONS.find((s) => s.value === selectedSort);
    return found ? found.label : selectedSort;
  }, [selectedSort, sortOptions]);

  const isAnyFilterActive =
    (selectedGenre && selectedGenre !== 'all') ||
    (selectedYear && selectedYear !== 'all') ||
    (selectedRating && selectedRating !== 'all') ||
    (selectedSort && selectedSort !== 'popularity.desc');

  if (!isAnyFilterActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-200">
      <span className="text-xs font-semibold text-zinc-400 shrink-0">
        Active Filters:
      </span>

      {/* Active Genre Chip */}
      {activeGenreName && (
        <span className="glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#FF1A24] border-[#FF1A24]/30 bg-[#E50914]/10 shadow-sm animate-in fade-in duration-200">
          <Clapperboard className="w-3 h-3 text-[#FF1A24]" />
          <span>{activeGenreName}</span>
          <button
            type="button"
            onClick={() => onGenreChange?.('all')}
            className="p-0.5 hover:bg-[#FF1A24]/20 rounded-full cursor-pointer transition-colors focus:outline-none"
            aria-label={`Remove ${activeGenreName} genre filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Active Year Chip */}
      {selectedYear && selectedYear !== 'all' && (
        <span className="glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#FF1A24] border-[#FF1A24]/30 bg-[#E50914]/10 shadow-sm animate-in fade-in duration-200">
          <Calendar className="w-3 h-3 text-[#FF1A24]" />
          <span>Year: {selectedYear}</span>
          <button
            type="button"
            onClick={() => onYearChange?.('all')}
            className="p-0.5 hover:bg-[#FF1A24]/20 rounded-full cursor-pointer transition-colors focus:outline-none"
            aria-label={`Remove ${selectedYear} year filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Active Rating Chip */}
      {selectedRating && selectedRating !== 'all' && (
        <span className="glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#FF1A24] border-[#FF1A24]/30 bg-[#E50914]/10 shadow-sm animate-in fade-in duration-200">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>Rating {selectedRating}+</span>
          <button
            type="button"
            onClick={() => onRatingChange?.('all')}
            className="p-0.5 hover:bg-[#FF1A24]/20 rounded-full cursor-pointer transition-colors focus:outline-none"
            aria-label={`Remove ${selectedRating}+ rating filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Active Sort Chip */}
      {activeSortLabel && (
        <span className="glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-zinc-200 border-white/20 bg-white/5 shadow-sm animate-in fade-in duration-200">
          <ArrowDownUp className="w-3 h-3 text-zinc-300" />
          <span>Sort: {activeSortLabel}</span>
          <button
            type="button"
            onClick={() => onSortChange?.('popularity.desc')}
            className="p-0.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors focus:outline-none"
            aria-label="Reset sorting to popular"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Quick Clear All Button */}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-zinc-400 hover:text-[#FF1A24] underline underline-offset-2 ml-1 cursor-pointer transition-colors focus:outline-none"
          aria-label="Clear all active filters"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

/**
 * Reusable Catalog Filter Component for MovieHub
 * Adapts fields and options based on `type` ('movie' | 'tv' | 'web-series' | 'anime' | 'tv-shows')
 */
const MovieFilters = ({
  genres = [],
  selectedGenre = 'all',
  onGenreChange,
  selectedYear = 'all',
  onYearChange,
  selectedRating = 'all',
  onRatingChange,
  selectedSort = 'popularity.desc',
  onSortChange,
  onApply,
  onClearFilters,
  type = 'movie',
  title = 'Filter & Sort',
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const isTvType = type === 'tv' || type === 'web-series' || type === 'anime' || type === 'tv-shows';
  const sortOptions = isTvType ? TV_SORT_OPTIONS : MOVIE_SORT_OPTIONS;
  const yearLabel = isTvType ? 'Release / Air Year' : 'Release Year';

  // Temporary draft state inside the popup/drawer to prevent accidental uncommitted updates
  const [draftGenre, setDraftGenre] = useState(selectedGenre || 'all');
  const [draftYear, setDraftYear] = useState(selectedYear || 'all');
  const [draftRating, setDraftRating] = useState(selectedRating || 'all');
  const [draftSort, setDraftSort] = useState(selectedSort || 'popularity.desc');

  // Generate dynamic year options (current year down to 1980)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = ['all'];
    for (let y = currentYear; y >= 1980; y--) {
      years.push(String(y));
    }
    return years;
  }, []);

  // Count active structured filters for the button badge
  const activeCount = useMemo(() => {
    let count = 0;
    if (selectedGenre && selectedGenre !== 'all') count++;
    if (selectedYear && selectedYear !== 'all') count++;
    if (selectedRating && selectedRating !== 'all') count++;
    if (selectedSort && selectedSort !== 'popularity.desc') count++;
    return count;
  }, [selectedGenre, selectedYear, selectedRating, selectedSort]);

  // Open popup/drawer and sync draft states
  const handleOpen = () => {
    setDraftGenre(selectedGenre || 'all');
    setDraftYear(selectedYear || 'all');
    setDraftRating(selectedRating || 'all');
    setDraftSort(selectedSort || 'popularity.desc');
    if (!isControlled) {
      setUncontrolledIsOpen(true);
    }
  };

  // Close popup/drawer and discard unapplied draft changes
  const handleClose = useCallback(() => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setUncontrolledIsOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  // Escape key handler and body scroll lock while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Apply draft filter values
  const handleApply = () => {
    if (onApply) {
      onApply({
        genre: draftGenre,
        year: draftYear,
        rating: draftRating,
        sort: draftSort,
      });
    } else {
      if (draftGenre !== selectedGenre) onGenreChange?.(draftGenre);
      if (draftYear !== selectedYear) onYearChange?.(draftYear);
      if (draftRating !== selectedRating) onRatingChange?.(draftRating);
      if (draftSort !== selectedSort) onSortChange?.(draftSort);
    }
    handleClose();
  };

  // Reset/Clear filter values
  const handleClear = () => {
    setDraftGenre('all');
    setDraftYear('all');
    setDraftRating('all');
    setDraftSort('popularity.desc');
    onClearFilters?.();
    handleClose();
  };

  return (
    <div className="relative shrink-0">
      {/* 1. Compact Liquid Glass Filter Button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] shrink-0 ${
          activeCount > 0
            ? 'bg-[#E50914]/15 hover:bg-[#E50914]/25 text-[#FF1A24] border border-[#FF1A24]/40 shadow-lg shadow-[#E50914]/10'
            : 'glass-button-secondary text-zinc-200 hover:text-white border border-white/10 hover:border-white/20'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Open catalog filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#FF1A24] shrink-0" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-[#E50914] to-[#FF1A24] text-white shadow-sm shrink-0">
            {activeCount}
          </span>
        )}
      </button>

      {/* 2. Responsive Liquid Glass Filter Modal (Bottom Sheet on Mobile, Centered Popover on Desktop) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-[#050505]/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={handleClose}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-filters-title"
            className="w-full sm:max-w-md md:max-w-lg glass-drawer sm:glass-panel rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-white/25 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E50914]/10 border border-[#FF1A24]/30 flex items-center justify-center text-[#FF1A24] shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="catalog-filters-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                    {title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-normal">
                    Refine catalog by genre, year, rating, and sort
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="glass-action-btn p-2 rounded-xl text-zinc-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24]"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filter Controls */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Genre Filter */}
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-genre-select"
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-[#FF1A24]" />
                  <span>Genre</span>
                </label>
                <div className="relative">
                  <select
                    id="filter-genre-select"
                    value={draftGenre}
                    onChange={(e) => setDraftGenre(e.target.value)}
                    className="w-full appearance-none bg-[#111111]/90 text-zinc-100 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl pl-3.5 pr-9 py-2.5 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF1A24] focus:border-transparent transition-all backdrop-blur-xl cursor-pointer"
                    aria-label="Filter by genre"
                  >
                    <option value="all" className="bg-[#111111] text-zinc-100">
                      All Genres
                    </option>
                    {genres.map((g) => (
                      <option key={g.id} value={String(g.id)} className="bg-[#111111] text-zinc-100">
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Year Filter (Release Year for Movies, First Air Year for TV) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-year-select"
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#FF1A24]" />
                  <span>{yearLabel}</span>
                </label>
                <div className="relative">
                  <select
                    id="filter-year-select"
                    value={draftYear}
                    onChange={(e) => setDraftYear(e.target.value)}
                    className="w-full appearance-none bg-[#111111]/90 text-zinc-100 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl pl-3.5 pr-9 py-2.5 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF1A24] focus:border-transparent transition-all backdrop-blur-xl cursor-pointer"
                    aria-label={`Filter by ${yearLabel.toLowerCase()}`}
                  >
                    <option value="all" className="bg-[#111111] text-zinc-100">
                      All Years
                    </option>
                    {yearOptions
                      .filter((y) => y !== 'all')
                      .map((year) => (
                        <option key={year} value={year} className="bg-[#111111] text-zinc-100">
                          {year}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Minimum Rating Filter */}
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-rating-select"
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
                >
                  <Star className="w-3.5 h-3.5 text-[#FF1A24] fill-[#FF1A24]" />
                  <span>Minimum Rating</span>
                </label>
                <div className="relative">
                  <select
                    id="filter-rating-select"
                    value={draftRating}
                    onChange={(e) => setDraftRating(e.target.value)}
                    className="w-full appearance-none bg-[#111111]/90 text-zinc-100 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl pl-3.5 pr-9 py-2.5 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF1A24] focus:border-transparent transition-all backdrop-blur-xl cursor-pointer"
                    aria-label="Filter by minimum rating"
                  >
                    {RATING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#111111] text-zinc-100">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Sort By Filter */}
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-sort-select"
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
                >
                  <ArrowDownUp className="w-3.5 h-3.5 text-[#FF1A24]" />
                  <span>Sort By</span>
                </label>
                <div className="relative">
                  <select
                    id="filter-sort-select"
                    value={draftSort}
                    onChange={(e) => setDraftSort(e.target.value)}
                    className="w-full appearance-none bg-[#111111]/90 text-zinc-100 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl pl-3.5 pr-9 py-2.5 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF1A24] focus:border-transparent transition-all backdrop-blur-xl cursor-pointer"
                    aria-label="Sort catalog by"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#111111] text-zinc-100">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-white/10 bg-[#050505]/50 flex items-center justify-between gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs sm:text-sm text-zinc-300 hover:text-[#FF1A24] gap-1.5 py-2 px-3"
                aria-label="Clear all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="text-xs sm:text-sm py-2 px-3.5"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  className="text-xs sm:text-sm py-2 px-4.5 font-bold"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieFilters;
