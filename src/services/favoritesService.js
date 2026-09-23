import { supabase } from '../lib/supabase';

/**
 * Normalizes movie data from MovieCard or MovieDetails objects
 * into a clean, safe JSON structure for database storage.
 *
 * @param {Object} movie
 * @returns {Object} normalized movie JSON object
 */
export const normalizeMovieData = (movie) => {
  if (!movie) return {};

  const id = Number(movie.id) || movie.id;
  const title = movie.title || movie.name || 'Untitled Movie';
  const poster = movie.poster || movie.poster_path || movie.backdrop || null;
  const backdrop = movie.backdrop || movie.backdrop_path || movie.poster || null;
  const rating =
    movie.rating !== undefined && movie.rating !== null
      ? typeof movie.rating === 'number'
        ? Number(movie.rating.toFixed(1))
        : movie.rating
      : null;

  let year = movie.year || '';
  if (!year && movie.release_date) {
    year = movie.release_date.slice(0, 4);
  } else if (!year && movie.first_air_date) {
    year = movie.first_air_date.slice(0, 4);
  }

  let genre = movie.genre || '';
  if (!genre && Array.isArray(movie.genres) && movie.genres.length > 0) {
    genre = typeof movie.genres[0] === 'string' ? movie.genres[0] : movie.genres[0]?.name || '';
  }

  const badge = movie.badge || null;
  const type =
    movie.type ||
    (movie.media_type === 'tv' || movie.first_air_date ? 'series' : 'movie');
  const description = movie.description || movie.overview || '';
  const duration = movie.duration || '';

  return {
    id,
    title,
    poster,
    backdrop,
    rating,
    year,
    genre,
    badge,
    type,
    description,
    duration,
  };
};

/**
 * Fetch all favorites for a specific authenticated user
 *
 * @param {string} userId - Supabase auth user UUID
 * @returns {Promise<Array>} List of favorite rows
 */
export const getFavorites = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error.message);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Supabase getFavorites service error:', err.message || err);
    throw err;
  }
};

/**
 * Check if a movie is already favorited by the current user
 *
 * @param {string} userId - Supabase auth user UUID
 * @param {number|string} movieId - TMDB movie ID
 * @returns {Promise<boolean>}
 */
export const isFavorite = async (userId, movieId) => {
  if (!userId || !movieId) return false;

  try {
    const numericMovieId = Number(movieId);
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', numericMovieId)
      .maybeSingle();

    if (error) {
      console.error('Error checking favorite status:', error.message);
      return false;
    }

    return Boolean(data);
  } catch (err) {
    console.error('Supabase isFavorite service error:', err.message || err);
    return false;
  }
};

/**
 * Add a movie to the user's favorites in Supabase
 * Prevents duplicate rows if already favorited
 *
 * @param {string} userId - Supabase auth user UUID
 * @param {Object} movie - Movie object to save
 * @returns {Promise<Object>} The inserted/existing favorite record
 */
export const addFavorite = async (userId, movie) => {
  if (!userId) {
    throw new Error('User authentication required to save favorites.');
  }
  if (!movie || !movie.id) {
    throw new Error('Valid movie data is required to add a favorite.');
  }

  const numericMovieId = Number(movie.id);
  const normalizedData = normalizeMovieData(movie);

  try {
    // 1. Check if favorite already exists to prevent duplicates
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id, user_id, movie_id, movie_data, created_at')
      .eq('user_id', userId)
      .eq('movie_id', numericMovieId)
      .maybeSingle();

    if (checkError) {
      console.warn('Check favorite duplicate warning:', checkError.message);
    }

    if (existing) {
      return existing;
    }

    // 2. Insert new favorite record
    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: userId,
          movie_id: numericMovieId,
          movie_data: normalizedData,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting favorite record:', error.message);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Supabase addFavorite service error:', err.message || err);
    throw err;
  }
};

/**
 * Remove a movie from the user's favorites in Supabase
 *
 * @param {string} userId - Supabase auth user UUID
 * @param {number|string} movieId - TMDB movie ID
 * @returns {Promise<boolean>}
 */
export const removeFavorite = async (userId, movieId) => {
  if (!userId) {
    throw new Error('User authentication required to remove favorites.');
  }
  if (!movieId) {
    throw new Error('Movie ID is required to remove a favorite.');
  }

  const numericMovieId = Number(movieId);

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', numericMovieId);

    if (error) {
      console.error('Error deleting favorite record:', error.message);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Supabase removeFavorite service error:', err.message || err);
    throw err;
  }
};
