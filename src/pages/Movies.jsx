import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, SlidersHorizontal, RotateCcw } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import MovieFilters, { ActiveFilterChips } from '../components/MovieFilters';
import { MovieCardSkeleton, MovieRowSkeleton } from '../components/Skeletons';
import Button from '../components/Button';
import {
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieGenres,
  discoverMovies,
} from '../services/tmdbApi';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Genres fetched from TMDB
  const [genres, setGenres] = useState([]);

  // Filter states derived from URL search parameters
  const genreParam = searchParams.get('genre') || 'all';
  const yearParam = searchParams.get('year') || 'all';
  const ratingParam = searchParams.get('rating') || 'all';
  const sortParam = searchParams.get('sort') || 'popularity.desc';

  // Filtered results state
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Default categorized movie sections (15 items each)
  const [popular, setPopular] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  // Category loading states
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  const abortControllerRef = useRef(null);

  // Check if any structured filter is active
  const hasActiveFilters =
    genreParam !== 'all' ||
    yearParam !== 'all' ||
    ratingParam !== 'all' ||
    sortParam !== 'popularity.desc';

  // 1. Fetch TMDB Movie Genres list once on mount
  useEffect(() => {
    let isMounted = true;
    getMovieGenres()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setGenres(data);
        }
      })
      .catch((err) => {
        console.error('Error loading movie genres:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch default categorized movie sections if no filters are active
  useEffect(() => {
    if (hasActiveFilters) return;

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    // Popular Movies
    if (popular.length === 0) {
      setLoadingPopular(true);
      getPopularMovies(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setPopular(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching popular movies:', err);
          if (isMounted) setPopular([]);
        })
        .finally(() => {
          if (isMounted) setLoadingPopular(false);
        });
    }

    // Now Playing Movies
    if (nowPlaying.length === 0) {
      setLoadingNowPlaying(true);
      getNowPlayingMovies(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setNowPlaying(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching now playing movies:', err);
          if (isMounted) setNowPlaying([]);
        })
        .finally(() => {
          if (isMounted) setLoadingNowPlaying(false);
        });
    }

    // Top Rated Movies
    if (topRated.length === 0) {
      setLoadingTopRated(true);
      getTopRatedMovies(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setTopRated(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching top rated movies:', err);
          if (isMounted) setTopRated([]);
        })
        .finally(() => {
          if (isMounted) setLoadingTopRated(false);
        });
    }

    // Upcoming Movies
    if (upcoming.length === 0) {
      setLoadingUpcoming(true);
      getUpcomingMovies(1, { signal })
        .then((data) => {
          if (!isMounted) return;
          setUpcoming(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Error fetching upcoming movies:', err);
          if (isMounted) setUpcoming([]);
        })
        .finally(() => {
          if (isMounted) setLoadingUpcoming(false);
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [hasActiveFilters, popular.length, nowPlaying.length, topRated.length, upcoming.length]);

  // 3. Fetch filtered / discovered movies when filter params change
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredMovies([]);
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

    // Use discoverMovies with combined criteria (Genre, Year, Rating, Sort)
    discoverMovies(
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
        setFilteredMovies(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error discovering filtered movies:', err);
        if (isMounted) {
          setFilterError('Unable to load movies with the selected filters.');
          setFilteredMovies([]);
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
                <Film className="w-5 h-5" />
              </div>
              <span className="line-clamp-1">
                {hasActiveFilters ? 'Filtered Catalog' : 'Movies'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Discover popular blockbusters, theatrical releases, top rated masterpieces, and custom filtered titles.
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
                Filtered Movies ({filteredMovies.length})
              </h2>
            </div>
            {filteredMovies.length > 0 && (
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
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4 my-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/20 flex items-center justify-center text-[#FF1A24] mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white">No movies found</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  We couldn&apos;t find any titles matching your selected filters. Try changing or clearing your filters to explore the catalog.
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
        /* Default Categorized Movie Sections (15 Cards each) */
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {/* 1. Popular Movies (15) */}
          {loadingPopular && popular.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : popular.length > 0 ? (
            <MovieRow
              title="Popular Movies"
              badge="TRENDING"
              subtitle="15 worldwide fan favorites"
              movies={popular}
              seeAllLink="/movies"
            />
          ) : null}

          {/* 2. Now Playing in Theatres (15) */}
          {loadingNowPlaying && nowPlaying.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : nowPlaying.length > 0 ? (
            <MovieRow
              title="Now Playing in Theatres"
              badge="IN CINEMAS"
              subtitle="15 current box-office releases"
              movies={nowPlaying}
              seeAllLink="/movies"
            />
          ) : null}

          {/* 3. Top Rated (15) */}
          {loadingTopRated && topRated.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : topRated.length > 0 ? (
            <MovieRow
              title="Top Rated Movies"
              badge="★ 8.0+"
              subtitle="15 highest-rated cinematic masterpieces"
              movies={topRated}
              seeAllLink="/movies"
            />
          ) : null}

          {/* 4. Upcoming Releases (15) */}
          {loadingUpcoming && upcoming.length === 0 ? (
            <MovieRowSkeleton count={6} />
          ) : upcoming.length > 0 ? (
            <MovieRow
              title="Upcoming Releases"
              badge="COMING SOON"
              subtitle="15 highly anticipated future premieres"
              movies={upcoming}
              seeAllLink="/movies"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Movies;
