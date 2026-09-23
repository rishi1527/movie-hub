import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Heart,
  Share2,
  Calendar,
  Star,
  Clock,
  Sparkles,
  Globe,
  Building,
  LogIn,
  Play,
} from 'lucide-react';
import Button from '../components/Button';
import MovieRow from '../components/MovieRow';
import TrailerModal, { selectBestTrailer } from '../components/TrailerModal';
import { getMovieDetails } from '../services/tmdbApi';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isOperationLoading } = useFavorites();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const isLiked = isFavorite(id || movie?.id);
  const isProcessing = localProcessing || isOperationLoading(id || movie?.id);

  // Select the official/best trailer from TMDB videos
  const trailer = useMemo(() => {
    return movie?.videos ? selectBestTrailer(movie.videos) : null;
  }, [movie?.videos]);

  const handleFavoriteToggle = async () => {
    if (isProcessing || !movie) return;

    if (!user) {
      setShowAuthNotice(true);
      setTimeout(() => {
        setShowAuthNotice(false);
      }, 4000);
      return;
    }

    try {
      setLocalProcessing(true);
      await toggleFavorite(movie);
    } catch (err) {
      console.error('Error toggling favorite in MovieDetails:', err);
    } finally {
      setLocalProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchDetails = async () => {
      try {
        const tmdbData = await getMovieDetails(id, { signal: controller.signal });

        if (!isMounted) return;

        if (tmdbData && tmdbData.title) {
          setMovie(tmdbData);
        } else {
          setError(`Movie with ID "${id}" was not found in the movie database.`);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error in MovieDetails fetch:', err);
        if (isMounted) {
          setError(`Unable to load movie details for ID "${id}".`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 relative animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 w-32 bg-white/10 rounded-2xl" />
          <div className="h-9 w-36 bg-white/10 rounded-2xl" />
        </div>
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-white/10 space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 items-center md:items-start">
            <div className="w-48 xs:w-56 sm:w-64 md:w-72 aspect-[2/3] rounded-2xl sm:rounded-3xl bg-[#111111]/80 shrink-0 mx-auto md:mx-0" />
            <div className="flex-1 space-y-5 w-full">
              <div className="h-6 w-36 bg-white/10 rounded-full" />
              <div className="h-10 w-3/4 bg-white/15 rounded-2xl" />
              <div className="flex gap-3">
                <div className="h-6 w-20 bg-[#E50914]/20 rounded-full" />
                <div className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full bg-white/10 rounded-lg" />
                <div className="h-4 w-5/6 bg-white/10 rounded-lg" />
                <div className="h-4 w-2/3 bg-white/10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="space-y-6 text-center py-16">
        <div className="glass-panel max-w-lg mx-auto p-10 rounded-3xl border border-white/10 space-y-4">
          <Film className="w-12 h-12 mx-auto text-[#FF1A24]" />
          <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
          <p className="text-sm text-zinc-400">{error || 'This movie could not be loaded.'}</p>
          <div className="pt-2">
            <Link to="/movies">
              <Button variant="primary" size="md">
                Browse All Movies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = movie.title;
  const poster = movie.poster || movie.backdrop || null;
  const backdrop = movie.backdrop || movie.poster || null;
  const rating = movie.rating || 0;
  const year = movie.year || 'TBA';
  const duration = movie.duration || '';
  const genres =
    movie.genres && movie.genres.length > 0
      ? movie.genres
      : [movie.genre || 'Cinema'];
  const description =
    movie.description || 'No overview provided for this movie.';
  const tagline = movie.tagline || '';
  const productionCompanies = movie.productionCompanies || [];
  const cast = movie.cast || [];
  const similarMovies = movie.similar || [];

  return (
    <div className="space-y-8 relative">
      {/* Ambient Backdrop Glow if available */}
      {backdrop && (
        <div className="absolute -top-10 left-0 right-0 h-96 -z-10 overflow-hidden rounded-3xl opacity-25 blur-3xl pointer-events-none">
          <img
            src={backdrop}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Navigation & Back Action */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/movies">
          <Button variant="outline" size="sm" icon={<Film className="w-4 h-4" />}>
            Browse Catalog
          </Button>
        </Link>
      </div>

      {/* Movie Details Glass Card */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-white/10 space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden">
        {/* Subtle top banner backdrop */}
        {backdrop && (
          <div className="absolute top-0 left-0 right-0 h-48 sm:h-64 opacity-15 overflow-hidden -z-0 pointer-events-none">
            <img
              src={backdrop}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top mask-radial"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 items-center md:items-start">
          {/* Poster Frame */}
          <div className="w-48 xs:w-56 sm:w-64 md:w-72 aspect-[2/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#111111] border border-white/15 flex flex-col items-center justify-center text-zinc-500 shrink-0 shadow-2xl relative group mx-auto md:mx-0">
            {poster ? (
              <img
                src={poster}
                alt={title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Film className="w-12 h-12 mb-3 text-[#FF1A24]" />
                <span className="text-sm font-semibold text-zinc-300">No Poster Available</span>
                <span className="text-xs text-zinc-500 font-mono mt-1">ID: {id}</span>
              </div>
            )}
          </div>

          {/* Details Metadata */}
          <div className="flex-1 w-full space-y-5 sm:space-y-6">
            <div className="space-y-3">
              {/* Genre Chips */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {genres.map((g, index) => (
                  <span
                    key={index}
                    className="glass-badge px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[#FF1A24] text-xs font-bold border-[#FF1A24]/30"
                  >
                    {g}
                  </span>
                ))}
                {movie.isOriginal && (
                  <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#E50914] to-[#B20710] text-white shadow-md">
                    <Sparkles className="w-3 h-3" />
                    Original
                  </span>
                )}
                <span className="text-[11px] sm:text-xs font-mono text-zinc-500">TMDB ID: {id}</span>
              </div>

              {/* Movie Title & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {title}
                </h1>
                {tagline && (
                  <p className="text-xs sm:text-sm md:text-base text-[#FF1A24]/90 font-medium italic mt-1.5">
                    &ldquo;{tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Meta Metrics Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#E50914]/15 text-[#FF1A24] border border-[#FF1A24]/30 font-bold backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FF1A24]" />
                  <span>{rating} / 10</span>
                </div>
                {duration && (
                  <div className="glass-badge flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                    <span>{duration}</span>
                  </div>
                )}
                <div className="glass-badge flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                  <span>{year}</span>
                </div>
                {movie.popularity > 0 && (
                  <div className="glass-badge hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-zinc-300">
                    <Globe className="w-4 h-4 text-zinc-400" />
                    <span>Pop: {Math.round(movie.popularity)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Overview
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed">
                {description}
              </p>
            </div>

            {/* Top Cast Members */}
            {cast.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Top Cast
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-zinc-300">
                  {cast.map((actor) => (
                    <span
                      key={actor.id || actor.name}
                      className="glass-badge px-2.5 sm:px-3 py-1 rounded-xl text-zinc-200 flex items-center gap-1.5 text-[11px] sm:text-xs"
                    >
                      <span className="font-semibold text-white">{actor.name}</span>
                      {actor.character && (
                        <span className="text-zinc-400">as {actor.character}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Production Companies if available */}
            {productionCompanies.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Production
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-zinc-300">
                  {productionCompanies.map((c) => (
                    <span
                      key={c.id}
                      className="glass-badge px-2.5 py-1 rounded-xl text-zinc-300 text-[11px] sm:text-xs"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons & Auth Notice */}
            <div className="space-y-3 pt-3 sm:pt-4 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Watch Trailer Primary Button */}
                {trailer ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                    onClick={() => setIsTrailerOpen(true)}
                    icon={<Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />}
                  >
                    Watch Trailer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    disabled
                    className="opacity-50 cursor-not-allowed text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                    icon={<Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  >
                    Trailer Unavailable
                  </Button>
                )}

                {/* Add to Favorites / In Favorites Button */}
                <Button
                  variant={isLiked ? 'danger' : trailer ? 'secondary' : 'primary'}
                  size="md"
                  disabled={isProcessing}
                  isLoading={isProcessing}
                  className="text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                  onClick={handleFavoriteToggle}
                  icon={
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-white' : ''}`}
                    />
                  }
                >
                  {isLiked ? 'In Favorites' : 'Add to Favorites'}
                </Button>

                {/* Share Title Button */}
                <Button
                  variant="outline"
                  size="md"
                  className="text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: title,
                        text: `Check out ${title} on MovieHub`,
                        url: window.location.href,
                      });
                    }
                  }}
                  icon={<Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                >
                  Share Title
                </Button>
              </div>

              {/* Unauthenticated User Sign In Notice */}
              {showAuthNotice && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs text-zinc-200 animate-in fade-in">
                  <span>Please sign in to add movies to your personal favorites collection.</span>
                  <Link to="/login" className="shrink-0">
                    <Button variant="primary" size="sm" icon={<LogIn className="w-3.5 h-3.5" />}>
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Titles Row from TMDB */}
      {similarMovies.length > 0 && (
        <div className="pt-4">
          <MovieRow
            title="Similar Movies"
            subtitle="More like this from TMDB"
            movies={similarMovies}
            seeAllLink="/movies"
          />
        </div>
      )}

      {/* Cinematic Liquid Glass Trailer Modal */}
      {trailer && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          videoKey={trailer.key}
          title={title}
          trailerName={trailer.name}
        />
      )}
    </div>
  );
};

export default MovieDetails;
