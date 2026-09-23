/**
 * TMDB API Service for MovieHub
 * Centralized service handling all TMDB requests via `/api/tmdb/*` proxy.
 *
 * Requirements:
 * - Direct frontend calls to `/api/tmdb${endpoint}` (No client API key)
 * - Pure server-side API key injection
 * - Hardcoded BASE_URL = '/api/tmdb'
 * - Target 15 valid live TMDB results per category/section with multi-page fallback
 * - Unified normalization for the single MovieCard component
 */

const BASE_URL = '/api/tmdb';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Standard TMDB Genre ID dictionary for reliable normalization
export const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV specific genres
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// Mood ID to TMDB Genre ID mapping
export const MOOD_GENRE_MAP = {
  romantic: 10749, // Romance
  comedy: 35, // Comedy
  action: 28, // Action
  horror: 27, // Horror
  emotional: 18, // Drama
  thriller: 53, // Thriller
  mystery: 9648, // Mystery
  fantasy: 14, // Fantasy
  'sci-fi': 878, // Science Fiction
};

/**
 * Image URL Helpers with optimized default sizes (w1280 for backdrops, w500 for posters)
 */
export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${size}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${size}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${size}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Normalize raw TMDB movie or TV item into a consistent UI-compatible structure
 */
export const normalizeMovie = (item, extra = {}) => {
  if (!item) return null;

  const genres = Array.isArray(item.genres)
    ? item.genres.map((g) => g.name)
    : Array.isArray(item.genre_ids)
    ? item.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean)
    : [];

  const primaryGenre =
    genres.length > 0
      ? genres[0]
      : item.title
      ? 'Movie'
      : item.name
      ? 'TV Series'
      : 'Feature';

  const releaseYear = item.release_date
    ? item.release_date.split('-')[0]
    : item.first_air_date
    ? item.first_air_date.split('-')[0]
    : 'TBA';

  const durationStr = item.runtime
    ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
    : item.number_of_seasons
    ? `Season ${item.number_of_seasons}`
    : '';

  return {
    id: String(item.id),
    title: item.title || item.name || 'Untitled',
    tagline: item.tagline || '',
    description: item.overview || 'No description available for this title.',
    poster: getPosterUrl(item.poster_path, 'w500'),
    backdrop: getBackdropUrl(item.backdrop_path, 'w1280'),
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
    voteCount: item.vote_count || 0,
    year: releaseYear,
    duration: durationStr,
    genre: primaryGenre,
    genres: genres,
    certification: item.adult ? '18+' : '13+',
    type: item.title ? 'movie' : 'series',
    isOriginal: Boolean(item.vote_count > 500 && item.vote_average >= 7.8),
    badge:
      extra.badge ||
      (item.vote_average >= 8.5
        ? '★ 8.5+'
        : item.popularity > 1000
        ? 'Trending'
        : undefined),
    popularity: item.popularity || 0,
    productionCompanies: item.production_companies || [],
    spokenLanguages: item.spoken_languages || [],
    cast: Array.isArray(item.credits?.cast)
      ? item.credits.cast.slice(0, 10).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile: getImageUrl(c.profile_path, 'w185'),
        }))
      : [],
    similar: Array.isArray(item.similar?.results)
      ? item.similar.results
          .filter((m) => m.poster_path)
          .slice(0, 15)
          .map((m) => normalizeMovie(m))
      : [],
    videos: Array.isArray(item.videos?.results) ? item.videos.results : [],
  };
};

/**
 * Generic fetch wrapper for /api/tmdb/* proxy with AbortController support
 */
const fetchFromTMDB = async (endpoint, params = {}, options = {}) => {
  const { signal } = options;

  const queryParams = new URLSearchParams();
  if (!params.language) {
    queryParams.set('language', 'en-US');
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Helper to fetch a target of 15 valid results for any TMDB category.
 * If page 1 has fewer than 15 valid results with posters, fetches page 2 to top up.
 */
export const fetch15TMDBItems = async (endpoint, params = {}, options = {}, extra = {}) => {
  try {
    const page1Data = await fetchFromTMDB(endpoint, { ...params, page: params.page || 1 }, options);
    let validItems = (page1Data.results || []).filter((m) => m.poster_path);

    // If fewer than 15 valid items and there are more pages, fetch page 2
    if (validItems.length < 15 && page1Data.total_pages > 1) {
      try {
        const page2Data = await fetchFromTMDB(endpoint, { ...params, page: (params.page || 1) + 1 }, options);
        const page2Valid = (page2Data.results || []).filter((m) => m.poster_path);
        validItems = [...validItems, ...page2Valid];
      } catch (err) {
        // If page 2 fetch fails or is aborted, continue with page 1 items
        if (err.name === 'AbortError') throw err;
      }
    }

    // Return target of exactly up to 15 normalized items
    return validItems.slice(0, 15).map((m, index) => {
      const itemBadge =
        typeof extra.badge === 'function'
          ? extra.badge(m, index)
          : extra.badge;
      return normalizeMovie(m, { badge: itemBadge });
    });
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error(`Error fetching 15 items for ${endpoint}:`, error);
    return [];
  }
};

/**
 * =========================================================================
 * TMDB API Category Methods (Each targets 15 live TMDB items)
 * =========================================================================
 */

// 1. Trending Movies (15 live items)
export const getTrendingMovies = async (timeWindow = 'day', options = {}) => {
  return await fetch15TMDBItems(
    `/trending/movie/${timeWindow}`,
    {},
    options,
    { badge: (_, index) => (index < 3 ? `Trending #${index + 1}` : undefined) }
  );
};

// 2. Popular Movies (15 live items)
export const getPopularMovies = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/movie/popular', { page }, options);
};

// 3. Now Playing / Latest Releases (15 live items)
export const getNowPlayingMovies = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/movie/now_playing', { page }, options, {
    badge: 'In Theatres',
  });
};

// 4. Top Rated Movies (15 live items)
export const getTopRatedMovies = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/movie/top_rated', { page }, options, {
    badge: 'Top Rated',
  });
};

// 5. Upcoming Movies (15 live items)
export const getUpcomingMovies = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/movie/upcoming', { page }, options, {
    badge: 'Upcoming',
  });
};

// 6. Popular Web Series / TV (15 live items)
export const getPopularSeries = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/tv/popular', { page }, options, {
    badge: 'Series',
  });
};

// 7. Top Rated Web Series / TV (15 live items)
export const getTopRatedSeries = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/tv/top_rated', { page }, options, {
    badge: '★ 8.5+',
  });
};

// 8. On The Air / Airing TV Series (15 live items)
export const getOnTheAirSeries = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/tv/on_the_air', { page }, options, {
    badge: 'On Air',
  });
};

// 9. Airing Today TV Series (15 live items)
export const getAiringTodaySeries = async (page = 1, options = {}) => {
  return await fetch15TMDBItems('/tv/airing_today', { page }, options, {
    badge: 'New Episode',
  });
};

// 10. Anime & Animation (15 live items)
export const getAnimeMovies = async (page = 1, options = {}) => {
  return await fetch15TMDBItems(
    '/discover/movie',
    {
      with_genres: 16, // Animation
      sort_by: 'popularity.desc',
      page,
    },
    options,
    { badge: 'Anime' }
  );
};

export const getAnimeSeries = async (page = 1, options = {}) => {
  return await fetch15TMDBItems(
    '/discover/tv',
    {
      with_genres: 16, // Animation
      with_original_language: 'ja', // Japanese Anime
      sort_by: 'popularity.desc',
      page,
    },
    options,
    { badge: 'Anime Series' }
  );
};

// 11. Movies by Genre ID (Discover) (15 live items)
export const getMoviesByGenre = async (genreId, page = 1, options = {}) => {
  return await fetch15TMDBItems(
    '/discover/movie',
    {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
    },
    options
  );
};

// 12. Movies by Mood ID (15 live items)
export const getMoviesByMood = async (moodId, page = 1, options = {}) => {
  const genreId = MOOD_GENRE_MAP[moodId] || 28;
  return await getMoviesByGenre(genreId, page, options);
};

// 13. Search Movies (Up to 15 live items)
export const searchMovies = async (query, page = 1, options = {}) => {
  if (!query || !query.trim()) return [];
  try {
    const data = await fetchFromTMDB(
      '/search/movie',
      { query: query.trim(), page },
      options
    );
    const results = data.results || [];
    return results
      .filter((m) => m.poster_path)
      .slice(0, 15)
      .map((m) => normalizeMovie(m));
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('Error searching movies:', error);
    return [];
  }
};

// 14. Single Movie Details by ID
export const getMovieDetails = async (movieId, options = {}) => {
  try {
    const data = await fetchFromTMDB(
      `/movie/${movieId}`,
      { append_to_response: 'credits,similar,videos' },
      options
    );
    return normalizeMovie(data);
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return null;
  }
};

// 15. Movie Genres List
export const getMovieGenres = async (options = {}) => {
  try {
    const data = await fetchFromTMDB('/genre/movie/list', {}, options);
    return data.genres || [];
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('Error fetching movie genres:', error);
    return [];
  }
};

// 16. TV Genres List (for Web Series, TV Shows, Anime)
export const getTvGenres = async (options = {}) => {
  try {
    const data = await fetchFromTMDB('/genre/tv/list', {}, options);
    return data.genres || [];
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('Error fetching TV genres:', error);
    return [];
  }
};

// 17. Discover Movies with Filters & Sorting
export const discoverMovies = async (params = {}, options = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
    };

    // Sort mapping
    const sortBy = params.sort_by || params.sortBy || 'popularity.desc';
    queryParams.sort_by = sortBy;

    // Minimum vote count handling for quality results when sorting by ratings
    if (sortBy === 'vote_average.desc' || sortBy === 'vote_average.asc') {
      queryParams['vote_count.gte'] = params['vote_count.gte'] || 100;
    } else if (params['vote_count.gte']) {
      queryParams['vote_count.gte'] = params['vote_count.gte'];
    }

    // Genre filter
    const genre = params.with_genres || params.genre;
    if (genre && genre !== 'all' && genre !== '') {
      queryParams.with_genres = genre;
    }

    // Year filter (primary release year)
    const year = params.primary_release_year || params.year;
    if (year && year !== 'all' && year !== '') {
      queryParams.primary_release_year = year;
    }

    // Minimum rating filter (vote_average.gte)
    const minRating = params['vote_average.gte'] || params.rating || params.minRating;
    if (minRating && minRating !== 'all' && minRating !== '') {
      const parsedRating = Number(minRating);
      if (!isNaN(parsedRating) && parsedRating > 0) {
        queryParams['vote_average.gte'] = parsedRating;
      }
    }

    const data = await fetchFromTMDB('/discover/movie', queryParams, options);
    let results = (data.results || []).filter((m) => m.poster_path);

    // If page 1 has fewer than 15 valid poster items and more pages exist, fetch page 2
    if (results.length < 15 && data.total_pages > 1 && (!params.page || params.page === 1)) {
      try {
        const page2Data = await fetchFromTMDB('/discover/movie', { ...queryParams, page: 2 }, options);
        const page2Results = (page2Data.results || []).filter((m) => m.poster_path);
        results = [...results, ...page2Results];
      } catch (err) {
        if (err.name === 'AbortError') throw err;
      }
    }

    return results.slice(0, 24).map((m) => normalizeMovie(m));
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('Error in discoverMovies:', error);
    return [];
  }
};

// 18. Discover TV Series / Web Series / Anime with Filters & Sorting
export const discoverTv = async (params = {}, options = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
    };

    // Sort mapping for TV
    const sortBy = params.sort_by || params.sortBy || 'popularity.desc';
    if (sortBy === 'primary_release_date.desc') {
      queryParams.sort_by = 'first_air_date.desc';
    } else if (sortBy === 'primary_release_date.asc') {
      queryParams.sort_by = 'first_air_date.asc';
    } else {
      queryParams.sort_by = sortBy;
    }

    // Minimum vote count handling for quality results when sorting by ratings
    if (queryParams.sort_by === 'vote_average.desc' || queryParams.sort_by === 'vote_average.asc') {
      queryParams['vote_count.gte'] = params['vote_count.gte'] || 40;
    } else if (params['vote_count.gte']) {
      queryParams['vote_count.gte'] = params['vote_count.gte'];
    }

    // Genre filter
    const genre = params.with_genres || params.genre;
    if (genre && genre !== 'all' && genre !== '') {
      queryParams.with_genres = genre;
    }

    // First air date year filter for TV
    const year = params.first_air_date_year || params.primary_release_year || params.year;
    if (year && year !== 'all' && year !== '') {
      queryParams.first_air_date_year = year;
    }

    // Minimum rating filter (vote_average.gte)
    const minRating = params['vote_average.gte'] || params.rating || params.minRating;
    if (minRating && minRating !== 'all' && minRating !== '') {
      const parsedRating = Number(minRating);
      if (!isNaN(parsedRating) && parsedRating > 0) {
        queryParams['vote_average.gte'] = parsedRating;
      }
    }

    // Language filter (e.g., 'ja' for anime)
    if (params.with_original_language) {
      queryParams.with_original_language = params.with_original_language;
    }

    const data = await fetchFromTMDB('/discover/tv', queryParams, options);
    let results = (data.results || []).filter((m) => m.poster_path);

    // If page 1 has fewer than 15 valid poster items and more pages exist, fetch page 2
    if (results.length < 15 && data.total_pages > 1 && (!params.page || params.page === 1)) {
      try {
        const page2Data = await fetchFromTMDB('/discover/tv', { ...queryParams, page: 2 }, options);
        const page2Results = (page2Data.results || []).filter((m) => m.poster_path);
        results = [...results, ...page2Results];
      } catch (err) {
        if (err.name === 'AbortError') throw err;
      }
    }

    return results.slice(0, 24).map((m) => normalizeMovie(m));
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('Error in discoverTv:', error);
    return [];
  }
};

export default {
  getTrendingMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularSeries,
  getTopRatedSeries,
  getOnTheAirSeries,
  getAiringTodaySeries,
  getAnimeMovies,
  getAnimeSeries,
  getMovieDetails,
  searchMovies,
  getMovieGenres,
  getTvGenres,
  getMoviesByGenre,
  getMoviesByMood,
  discoverMovies,
  discoverTv,
  getPosterUrl,
  getBackdropUrl,
  getImageUrl,
  normalizeMovie,
};
