import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clapperboard, SlidersHorizontal, RotateCcw } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import MovieFilters, { ActiveFilterChips } from '../components/MovieFilters';
import { MovieCardSkeleton, MovieRowSkeleton } from '../components/Skeletons';
import Button from '../components/Button';
import {
  getPopularSeries,
  getTopRatedSeries,
  getOnTheAirSeries,
  getTvGenres,
  discoverTv,
} from '../services/tmdbApi';

const WebSeries = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // TV Genres fetched from TMDB
  const [genres, setGenres] = useState([]);

  // Filter states derived from URL search parameters
  const genreParam = searchParams.get('genre') || 'all';
  const yearParam = searchParams.get('year') || 'all';
  const ratingParam = searchParams.get('rating') || 'all';
  const sortParam = searchParams.get('sort') || 'popularity.desc';

  // Filtered results state
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Default categorized series sections (15 items each)
  const [popularSeries, setPopularSeries] = useState([]);
  const [topRatedSeries, setTopRatedSeries] = useState([]);
  const [onTheAirSeries, setOnTheAirSeries] = useState([]);

  // Category loading states
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingOnTheAir, setLoadingOnTheAir] = useState(true);

  const abortControllerRef = useRef(null);

  // Check if any structured filter is active
  const hasActiveFilters =
    genreParam !== 'all' ||
    yearParam !== 'all' ||
    ratingParam !== 'all' ||
    sortParam !== 'popularity.desc';

  // 1. Fetch TMDB TV Genres list once on mount
  useEffect(() => {
    let isMounted = true;
    getTvGenres()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setGenres(data);
        }
      })
      .catch((err) => {
        console.error('Error loading TV genres:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch default categorized series sections if no filters are active
  useEffect(() => {
    if (hasActiveFilters) return;

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    // 1. Popular Series (15)
    if (popularSeries.length === 0) {
      setLoadingPopular(true);
      getPopularSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setPopularSeries(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching popular series:', err);
          if (isMounted) setPopularSeries([]);
        })
        .finally(() => {
          if (isMounted) setLoadingPopular(false);
        });
    }

    // 2. Top Rated Series (15)
    if (topRatedSeries.length === 0) {
      setLoadingTopRated(true);
      getTopRatedSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setTopRatedSeries(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching top rated series:', err);
          if (isMounted) setTopRatedSeries([]);
        })
        .finally(() => {
          if (isMounted) setLoadingTopRated(false);
        });
    }

    // 3. On The Air / Airing (15)
    if (onTheAirSeries.length === 0) {
      setLoadingOnTheAir(true);
      getOnTheAirSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setOnTheAirSeries(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching on the air series:', err);
          if (isMounted) setOnTheAirSeries([]);
        })
        .finally(() => {
          if (isMounted) setLoadingOnTheAir(false);
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [hasActiveFilters, popularSeries.length, topRatedSeries.length, onTheAirSeries.length]);

  // 3. Fetch filtered / discovered TV Series when filter params change
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredSeries([]);
      setLoadingFiltered(false);
      setFilterError(null);
      return;
    }

    let isMounted = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setLoadingFiltered(true);
    setFilterError(null);

    discoverTv(
      {
        genre: genreParam,
        year: yearParam,
        rating: ratingParam,
        sortBy: sortParam,
        page: 1,
      },
      { signal }
    )
      .then((data) => {
        if (!isMounted) return;
        setFilteredSeries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error discovering filtered series:', err);
        if (isMounted) {
          setFilterError('Unable to load series with the selected filters.');
          setFilteredSeries([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingFiltered(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [hasActiveFilters, genreParam, yearParam, ratingParam, sortParam]);

  // Helper to update URL search parameters
  const updateUrlParams = useCallback(
    (updates) => {
      const current = {
        genre: genreParam,
        year: yearParam,
        rating: ratingParam,
        sort: sortParam,
        ...updates,
      };

      const nextParams = new URLSearchParams();
      if (current.genre && current.genre !== 'all') nextParams.set('genre', current.genre);
      if (current.year && current.year !== 'all') nextParams.set('year', current.year);
      if (current.rating && current.rating !== 'all') nextParams.set('rating', current.rating);
      if (current.sort && current.sort !== 'popularity.desc') nextParams.set('sort', current.sort);

      setSearchParams(nextParams, { replace: true });
    },
    [genreParam, yearParam, ratingParam, sortParam, setSearchParams]
  );

  // Clear all active filters
  const handleClearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Section: Header & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/30 flex items-center justify-center text-[#FF1A24] shrink-0">
                <Clapperboard className="w-5 h-5" />
              </div>
              <span className="line-clamp-1">
                {hasActiveFilters ? 'Filtered Web Series' : 'Web Series'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Binge-worthy original series, top rated multi-season sagas, and current broadcasting series.
            </p>
          </div>

          {/* Compact OTT-Style Filter Button & Liquid Glass Popup/Drawer */}
          <div className="flex items-center justify-start sm:justify-end">
            <MovieFilters
              genres={genres}
              selectedGenre={genreParam}
              selectedYear={yearParam}
              selectedRating={ratingParam}
              selectedSort={sortParam}
              type="web-series"
              title="Filter Web Series"
              onApply={({ genre, year, rating, sort }) => {
                updateUrlParams({ genre, year, rating, sort });
              }}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Active Filter Chips (Displayed ONLY when filters are active) */}
        {hasActiveFilters && (
          <ActiveFilterChips
            genres={genres}
            selectedGenre={genreParam}
            onGenreChange={(genre) => updateUrlParams({ genre })}
            selectedYear={yearParam}
            onYearChange={(year) => updateUrlParams({ year })}
            selectedRating={ratingParam}
            onRatingChange={(rating) => updateUrlParams({ rating })}
            selectedSort={sortParam}
            onSortChange={(sort) => updateUrlParams({ sort })}
            onClearAll={handleClearFilters}
            type="web-series"
          />
        )}
      </div>

      {/* Main Content Area */}
      {hasActiveFilters ? (
        /* Filtered Grid View */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF1A24]" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Filtered Web Series ({filteredSeries.length})
              </h2>
            </div>
            {filteredSeries.length > 0 && (
              <span className="text-xs text-zinc-400">
                Live TMDB Data
              </span>
            )}
          </div>

          {loadingFiltered ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCardSkeleton key={i} className="w-full" />
              ))}
            </div>
          ) : filterError ? (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <p className="text-rose-400 font-semibold text-sm sm:text-base">{filterError}</p>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {filteredSeries.map((series) => (
                <MovieCard key={series.id} movie={series} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4 my-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/20 flex items-center justify-center text-[#FF1A24] mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white">No series found</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  We couldn&apos;t find any web series matching your selected filters. Try changing or clearing your filters.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* 3 Categories with 15 Live TMDB Cards each */
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {/* 1. Popular Series (15) */}
          {loadingPopular && popularSeries.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : popularSeries.length > 0 ? (
            <MovieRow
              title="Popular Web Series"
              badge="HOT"
              subtitle="15 top streamed episodic titles on TMDB"
              movies={popularSeries}
              seeAllLink="/web-series"
            />
          ) : null}

          {/* 2. Top Rated Series (15) */}
          {loadingTopRated && topRatedSeries.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : topRatedSeries.length > 0 ? (
            <MovieRow
              title="Top Rated Web Series"
              badge="★ 8.5+"
              subtitle="15 critically acclaimed multi-episode sagas"
              movies={topRatedSeries}
              seeAllLink="/web-series"
            />
          ) : null}

          {/* 3. On The Air / Airing (15) */}
          {loadingOnTheAir && onTheAirSeries.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : onTheAirSeries.length > 0 ? (
            <MovieRow
              title="On The Air & Airing"
              badge="BROADCASTING"
              subtitle="15 series currently releasing new episodes"
              movies={onTheAirSeries}
              seeAllLink="/web-series"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default WebSeries;
