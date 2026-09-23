import { Link } from 'react-router-dom';
import { Heart, Compass, LogIn, Film } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import Button from '../components/Button';
import { MovieCardSkeleton } from '../components/Skeletons';

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();

  const isLoading = authLoading || favoritesLoading;

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF1A24] fill-[#FF1A24]/20 shrink-0" />
            <span>My Favorites</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Loading your personalized watchlist...
          </p>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} className="w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Unauthenticated / Logged Out State
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-16 space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF1A24] fill-[#FF1A24]/20 shrink-0" />
            <span>My Favorites</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sign in to access and manage your saved movies.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-12 border border-white/10 text-center space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-[#E50914]/10 border border-[#FF1A24]/20 flex items-center justify-center text-[#FF1A24] shadow-inner">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Sign In to View Favorites</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Create an account or sign in to sync your personal watchlist across devices, track your favorite movies, and receive customized recommendations.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full justify-center" icon={<LogIn className="w-4 h-4" />}>
                Sign In / Create Account
              </Button>
            </Link>
            <Link to="/movies" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full justify-center" icon={<Compass className="w-4 h-4" />}>
                Explore Movies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty State (Authenticated, but 0 saved favorites)
  if (!favorites || favorites.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF1A24] fill-[#FF1A24]/20 shrink-0" />
            <span>My Favorites</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your saved movies and personalized watchlist.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 sm:p-16 border border-white/10 text-center flex flex-col items-center justify-center space-y-5 sm:space-y-6 shadow-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/20 flex items-center justify-center text-[#FF1A24]">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">No Favorites Saved Yet</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              As you explore movies on MovieHub, click the heart icon on any movie card or detail page to add it to your personal favorites collection.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/movies">
              <Button variant="primary" size="md" icon={<Compass className="w-4 h-4" />}>
                Explore Movies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Populated Favorites Grid
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF1A24] fill-[#FF1A24]/20 shrink-0" />
            <span>My Favorites</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {favorites.length} {favorites.length === 1 ? 'title' : 'titles'} saved to your watchlist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/movies">
            <Button variant="outline" size="sm" icon={<Film className="w-4 h-4" />}>
              Browse More
            </Button>
          </Link>
        </div>
      </div>

      {/* Responsive Grid with MovieCards */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {favorites.map((fav) => {
          const movieObj = {
            id: fav.movie_id || fav.movie_data?.id,
            title: fav.movie_data?.title || 'Untitled Movie',
            poster: fav.movie_data?.poster || fav.movie_data?.backdrop || null,
            backdrop: fav.movie_data?.backdrop || fav.movie_data?.poster || null,
            rating: fav.movie_data?.rating || null,
            year: fav.movie_data?.year || '',
            genre: fav.movie_data?.genre || '',
            badge: fav.movie_data?.badge || null,
            type: fav.movie_data?.type || 'movie',
            description: fav.movie_data?.description || '',
            ...fav.movie_data,
          };

          return (
            <MovieCard
              key={fav.id || fav.movie_id}
              movie={movieObj}
              className="w-full"
            />
          );
        })}
      </div>
    </div>
  );
};

export default Favorites;

