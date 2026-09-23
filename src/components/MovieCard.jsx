import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Info, Film, Loader2, LogIn } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable OTT Movie Card Component with Liquid Glass Treatment,
 * Supabase-backed Like state, and direct Movie Details navigation.
 *
 * @param {Object} props
 * @param {Object} props.movie - Movie data object
 * @param {string|number} props.movie.id - Unique identifier
 * @param {string} props.movie.title - Title
 * @param {string} props.movie.poster - Image URL
 * @param {number|string} [props.movie.rating] - Score (e.g. 8.8)
 * @param {string} [props.movie.year] - Release year
 * @param {string} [props.movie.genre] - Primary genre
 * @param {string} [props.movie.badge] - Optional badge tag (e.g. "Trending #1", "New Season")
 * @param {string} [props.movie.type] - "movie" | "series"
 * @param {string} [props.className] - Optional container classes
 */
const MovieCard = ({ movie, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [showAuthTooltip, setShowAuthTooltip] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isOperationLoading } = useFavorites();

  if (!movie) return null;

  const isLiked = isFavorite(movie.id);
  const isProcessing = localProcessing || isOperationLoading(movie.id);

  // Toggle Like state in Supabase without triggering card navigation
  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    if (!user) {
      setShowAuthTooltip(true);
      setTimeout(() => {
        setShowAuthTooltip(false);
      }, 3500);
      return;
    }

    try {
      setLocalProcessing(true);
      await toggleFavorite(movie);
    } catch (err) {
      console.error('Error toggling movie favorite:', err);
    } finally {
      setLocalProcessing(false);
    }
  };

  // Navigate directly to that specific movie's details page
  const handleDetailsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/movies/${movie.id}`);
  };

  const defaultWidth = className && className.includes('w-')
    ? ''
    : 'shrink-0 w-[135px] sm:w-[160px] md:w-[185px] lg:w-[210px]';

  return (
    <div
      className={`group relative flex flex-col select-none rounded-2xl sm:rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-1.5 ${defaultWidth} ${className}`}
    >
      {/* Poster Image Container with Glass Frame */}
      <div className="glass-card relative aspect-[2/3] w-full overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 bg-[#111111]">
        {/* Shimmer Placeholder while image is loading */}
        {!imageLoaded && !imageError && movie.poster && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#161616]/40 via-[#111111]/60 to-[#050505] animate-pulse pointer-events-none" />
        )}

        {/* Poster Image */}
        {!imageError && movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#161616] to-[#050505] text-zinc-500">
            <Film className="w-8 h-8 mb-2 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-400 line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* Primary Clickable Backdrop Link to Movie Details */}
        <Link
          to={`/movies/${movie.id}`}
          className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24]"
          aria-label={`${movie.title} (${movie.year || 'Movie'}), Rating ${movie.rating || 'N/A'}`}
        />

        {/* Top Badges (Trending / New / Series) */}
        {movie.badge && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            <span className="glass-badge px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-[#FF1A24] border-[#FF1A24]/30">
              {movie.badge}
            </span>
          </div>
        )}

        {/* Floating Like Button (Top Right) */}
        <button
          type="button"
          onClick={handleLikeToggle}
          disabled={isProcessing}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] active:scale-90 disabled:cursor-wait ${
            isLiked
              ? 'bg-[#E50914] text-white border border-[#FF1A24] shadow-lg shadow-[#E50914]/40 scale-105 opacity-100'
              : 'glass-control text-zinc-200 hover:text-[#FF1A24] opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          aria-label={isLiked ? `Unlike ${movie.title}` : `Like ${movie.title}`}
          title={isLiked ? `Unlike ${movie.title}` : `Like ${movie.title}`}
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" aria-hidden="true" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isLiked ? 'fill-white scale-110 text-white' : ''
              }`}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Unauthenticated Sign In Tooltip */}
        {showAuthTooltip && (
          <div className="absolute top-12 right-2 z-30 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="glass-drawer p-2.5 rounded-2xl border border-[#FF1A24]/40 shadow-2xl text-center space-y-1 w-32">
              <p className="text-[10px] font-bold text-red-300 leading-tight">
                Sign In Required
              </p>
              <p className="text-[9px] text-zinc-400 leading-tight">
                Sign in to save favorites.
              </p>
              <Link
                to="/login"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1 w-full text-[9px] font-bold text-white bg-[#E50914] hover:bg-[#FF1A24] py-1 rounded-xl transition-colors mt-0.5"
              >
                <LogIn className="w-2.5 h-2.5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* Subtle Dark Vignette & Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none z-0" />

        {/* Bottom Poster Controls (Rating & Details Button) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          {/* Rating Chip */}
          {movie.rating ? (
            <div className="glass-badge flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white pointer-events-auto">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{movie.rating}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Details Button - Navigates directly to /movies/:id */}
          <button
            type="button"
            onClick={handleDetailsClick}
            className="glass-pill flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-200 hover:text-[#FF1A24] hover:border-[#FF1A24]/40 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] pointer-events-auto opacity-90 sm:opacity-0 sm:group-hover:opacity-100 shadow-md"
            aria-label={`View details for ${movie.title}`}
            title={`View details for ${movie.title}`}
          >
            <Info className="w-3.5 h-3.5 text-[#FF1A24]" aria-hidden="true" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </div>

      {/* Movie Info below Poster */}
      <div className="mt-2.5 px-1 space-y-0.5">
        <Link
          to={`/movies/${movie.id}`}
          className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-[#FF1A24] transition-colors line-clamp-1 block focus:outline-none focus-visible:underline"
        >
          {movie.title}
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium line-clamp-1">
          {movie.year && <span>{movie.year}</span>}
          {movie.year && movie.genre && <span>•</span>}
          {movie.genre && <span>{movie.genre}</span>}
        </div>
      </div>
    </div>
  );
};

export default memo(MovieCard);

