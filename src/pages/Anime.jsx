import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import MovieFilters, { ActiveFilterChips } from '../components/MovieFilters';
import { MovieCardSkeleton, MovieRowSkeleton } from '../components/Skeletons';
import Button from '../components/Button';
import {
  getAnimeMovies,
  getAnimeSeries,
  getTvGenres,
  discoverTv,
} from '../services/tmdbApi';

const Anime = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // TV / Anime Genres fetched from TMDB
  const [genres, setGenres] = useState([]);

  // Filter states derived from URL search parameters
  const genreParam = searchParams.get('genre') || 'all';
  const yearParam = searchParams.get('year') || 'all';
  const ratingParam = searchParams.get('rating') || 'all';
  const sortParam = searchParams.get('sort') || 'popularity.desc';

  // Filtered results state
  const [filteredAnime, setFilteredAnime] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Default categorized anime sections (15 items each)
  const [animeMovies, setAnimeMovies] = useState([]);
  const [animeSeries, setAnimeSeries] = useState([]);

  // Category loading states
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);

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
        console.error('Error loading anime TV genres:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch default categorized anime sections if no filters are active
  useEffect(() => {
    if (hasActiveFilters) return;

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    // 1. Top Anime Feature Films (15)
    if (animeMovies.length === 0) {
      setLoadingMovies(true);
      getAnimeMovies(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setAnimeMovies(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching anime movies:', err);
          if (isMounted) setAnimeMovies([]);
        })
        .finally(() => {
          if (isMounted) setLoadingMovies(false);
        });
    }

    // 2. Japanese Anime Series (15)
    if (animeSeries.length === 0) {
      setLoadingSeries(true);
      getAnimeSeries(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setAnimeSeries(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching anime series:', err);
          if (isMounted) setAnimeSeries([]);
        })
        .finally(() => {
          if (isMounted) setLoadingSeries(false);
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [hasActiveFilters, animeMovies.length, animeSeries.length]);

  // 3. Fetch filtered / discovered Anime when filter params change
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredAnime([]);
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

    // Keep Anime specific criteria: Animation genre (16) + Japanese language ('ja')
    const combinedGenres =
      genreParam && genreParam !== 'all' && genreParam !== '16'
        ? `16,${genreParam}`
        : '16';

    discoverTv(
      {
        with_genres: combinedGenres,
        with_original_language: 'ja',
        year: yearParam,
        rating: ratingParam,
        sortBy: sortParam,
        page: 1,
      },
      { signal }
    )
      .then((data) => {
        if (!isMounted) return;
        setFilteredAnime(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error discovering filtered anime:', err);
        if (isMounted) {
          setFilterError('Unable to load anime with the selected filters.');
          setFilteredAnime([]);
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
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="line-clamp-1">
                {hasActiveFilters ? 'Filtered Anime' : 'Anime & Animation'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Top Japanese anime series, animated feature films, shonen sagas, and fantasy adventures.
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
              type="anime"
              title="Filter Anime"
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
            type="anime"
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
                Filtered Anime ({filteredAnime.length})
              </h2>
            </div>
            {filteredAnime.length > 0 && (
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
          ) : filteredAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {filteredAnime.map((anime) => (
                <MovieCard key={anime.id} movie={anime} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4 my-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/20 flex items-center justify-center text-[#FF1A24] mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white">No anime found</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  We couldn&apos;t find any anime matching your selected filters. Try changing or clearing your filters.
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
        /* Rows with 15 Live TMDB Cards each */
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {/* 1. Top Anime Feature Films (15) */}
          {loadingMovies && animeMovies.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : animeMovies.length > 0 ? (
            <MovieRow
              title="Top Anime & Animated Hits"
              badge="TOP RATED"
              subtitle="15 critically acclaimed animated masterpieces"
              movies={animeMovies}
              seeAllLink="/anime"
            />
          ) : null}

          {/* 2. Japanese Anime Series (15) */}
          {loadingSeries && animeSeries.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : animeSeries.length > 0 ? (
            <MovieRow
              title="Trending Anime Series & Shonen"
              badge="SERIES"
              subtitle="15 popular Japanese anime sagas"
              movies={animeSeries}
              seeAllLink="/anime"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Anime;
