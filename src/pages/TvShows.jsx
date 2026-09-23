import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tv, SlidersHorizontal, RotateCcw } from 'lucide-react';
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

const TvShows = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // TV Genres fetched from TMDB
  const [genres, setGenres] = useState([]);

  // Filter states derived from URL search parameters
  const genreParam = searchParams.get('genre') || 'all';
  const yearParam = searchParams.get('year') || 'all';
  const ratingParam = searchParams.get('rating') || 'all';
  const sortParam = searchParams.get('sort') || 'popularity.desc';

  // Filtered results state
  const [filteredTv, setFilteredTv] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Default categorized TV sections (15 items each)
  const [popularTv, setPopularTv] = useState([]);
  const [topRatedTv, setTopRatedTv] = useState([]);
  const [onTheAirTv, setOnTheAirTv] = useState([]);

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

  // 2. Fetch default categorized TV sections if no filters are active
  useEffect(() => {
    if (hasActiveFilters) return;

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    // 1. Popular TV (15)
    if (popularTv.length === 0) {
      setLoadingPopular(true);
      getPopularSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setPopularTv(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching popular TV:', err);
          if (isMounted) setPopularTv([]);
        })
        .finally(() => {
          if (isMounted) setLoadingPopular(false);
        });
    }

    // 2. Top Rated TV (15)
    if (topRatedTv.length === 0) {
      setLoadingTopRated(true);
      getTopRatedSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setTopRatedTv(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching top rated TV:', err);
          if (isMounted) setTopRatedTv([]);
        })
        .finally(() => {
          if (isMounted) setLoadingTopRated(false);
        });
    }

    // 3. On The Air (15)
    if (onTheAirTv.length === 0) {
      setLoadingOnTheAir(true);
      getOnTheAirSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setOnTheAirTv(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching on the air TV:', err);
          if (isMounted) setOnTheAirTv([]);
        })
        .finally(() => {
          if (isMounted) setLoadingOnTheAir(false);
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [hasActiveFilters, popularTv.length, topRatedTv.length, onTheAirTv.length]);

  // 3. Fetch filtered / discovered TV Shows when filter params change
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredTv([]);
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
        setFilteredTv(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error discovering filtered TV:', err);
        if (isMounted) {
          setFilterError('Unable to load TV shows with the selected filters.');
          setFilteredTv([]);
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
                <Tv className="w-5 h-5" />
              </div>
              <span className="line-clamp-1">
                {hasActiveFilters ? 'Filtered TV Shows' : 'TV Shows'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Top reality TV, comedy sitcoms, documentaries, prime-time broadcasts, and late-night shows.
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
              type="tv-shows"
              title="Filter TV Shows"
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
            type="tv-shows"
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
                Filtered TV Shows ({filteredTv.length})
              </h2>
            </div>
            {filteredTv.length > 0 && (
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
          ) : filteredTv.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {filteredTv.map((tv) => (
                <MovieCard key={tv.id} movie={tv} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4 my-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/20 flex items-center justify-center text-[#FF1A24] mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white">No TV shows found</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  We couldn&apos;t find any TV shows matching your selected filters. Try changing or clearing your filters.
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
          {/* 1. Popular TV (15) */}
          {loadingPopular && popularTv.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : popularTv.length > 0 ? (
            <MovieRow
              title="Popular TV Shows"
              badge="TOP PICKS"
              subtitle="15 prime-time shows and global hits"
              movies={popularTv}
              seeAllLink="/tv-shows"
            />
          ) : null}

          {/* 2. Top Rated TV (15) */}
          {loadingTopRated && topRatedTv.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : topRatedTv.length > 0 ? (
            <MovieRow
              title="Top Rated TV Shows"
              badge="★ 8.5+"
              subtitle="15 highest-rated television programs"
              movies={topRatedTv}
              seeAllLink="/tv-shows"
            />
          ) : null}

          {/* 3. On The Air (15) */}
          {loadingOnTheAir && onTheAirTv.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : onTheAirTv.length > 0 ? (
            <MovieRow
              title="Trending Television On The Air"
              badge="ON AIR"
              subtitle="15 shows currently airing worldwide"
              movies={onTheAirTv}
              seeAllLink="/tv-shows"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TvShows;
