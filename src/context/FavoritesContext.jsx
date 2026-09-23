import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getFavorites,
  addFavorite as addFavoriteService,
  removeFavorite as removeFavoriteService,
} from '../services/favoritesService';

const FavoritesContext = createContext(null);

/**
 * Provider component managing synchronized user favorites via Supabase
 */
export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingMap, setActionLoadingMap] = useState({});

  // Fetch current authenticated user's favorites from Supabase
  const refreshFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites([]);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      const data = await getFavorites(user.id);
      setFavorites(data || []);
      return data || [];
    } catch (err) {
      console.error('Error in refreshFavorites:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Synchronize favorites whenever the authenticated user changes
  useEffect(() => {
    let isMounted = true;

    if (user?.id) {
      setLoading(true);
      getFavorites(user.id)
        .then((data) => {
          if (isMounted) {
            setFavorites(data || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error fetching favorites on auth change:', err);
          if (isMounted) {
            setFavorites([]);
            setLoading(false);
          }
        });
    } else {
      // Clear favorites immediately when logged out to avoid leaking state
      setFavorites([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Fast in-memory lookup to verify if a movie is favorited
  const isFavorite = useCallback(
    (movieId) => {
      if (!movieId || !favorites.length) return false;
      const numericId = Number(movieId);
      return favorites.some(
        (item) => Number(item.movie_id) === numericId || Number(item.movie_data?.id) === numericId
      );
    },
    [favorites]
  );

  // Add a movie to favorites
  const addFavorite = useCallback(
    async (movie) => {
      if (!user?.id) {
        return { error: 'unauthenticated' };
      }
      if (!movie || !movie.id) {
        return { error: 'invalid_movie' };
      }

      const movieId = Number(movie.id);
      setActionLoadingMap((prev) => ({ ...prev, [movieId]: true }));

      try {
        const newRecord = await addFavoriteService(user.id, movie);
        setFavorites((prev) => {
          // Avoid duplicate entry in local state
          const exists = prev.some((item) => Number(item.movie_id) === movieId);
          if (exists) return prev;
          return [newRecord, ...prev];
        });
        return { data: newRecord };
      } catch (err) {
        console.error('Failed to add favorite:', err);
        return { error: err.message || err };
      } finally {
        setActionLoadingMap((prev) => {
          const next = { ...prev };
          delete next[movieId];
          return next;
        });
      }
    },
    [user?.id]
  );

  // Remove a movie from favorites
  const removeFavorite = useCallback(
    async (movieId) => {
      if (!user?.id) {
        return { error: 'unauthenticated' };
      }
      if (!movieId) {
        return { error: 'invalid_movie_id' };
      }

      const numericId = Number(movieId);
      setActionLoadingMap((prev) => ({ ...prev, [numericId]: true }));

      try {
        await removeFavoriteService(user.id, numericId);
        setFavorites((prev) =>
          prev.filter((item) => Number(item.movie_id) !== numericId)
        );
        return { success: true };
      } catch (err) {
        console.error('Failed to remove favorite:', err);
        return { error: err.message || err };
      } finally {
        setActionLoadingMap((prev) => {
          const next = { ...prev };
          delete next[numericId];
          return next;
        });
      }
    },
    [user?.id]
  );

  // Toggle favorite state
  const toggleFavorite = useCallback(
    async (movie) => {
      if (!user?.id) {
        return { error: 'unauthenticated' };
      }
      if (!movie || !movie.id) {
        return { error: 'invalid_movie' };
      }

      const movieId = Number(movie.id);
      if (isFavorite(movieId)) {
        return await removeFavorite(movieId);
      } else {
        return await addFavorite(movie);
      }
    },
    [user?.id, isFavorite, addFavorite, removeFavorite]
  );

  // Helper to check if a specific movie is currently undergoing an async favorite operation
  const isOperationLoading = useCallback(
    (movieId) => {
      if (!movieId) return false;
      return Boolean(actionLoadingMap[Number(movieId)]);
    },
    [actionLoadingMap]
  );

  const value = useMemo(
    () => ({
      favorites,
      loading,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      refreshFavorites,
      isOperationLoading,
    }),
    [
      favorites,
      loading,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      refreshFavorites,
      isOperationLoading,
    ]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

/**
 * Custom hook to consume MovieHub Favorites context
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
