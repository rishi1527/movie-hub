import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Plus,
  Star,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import Button from './Button';

/**
 * Reusable Cinematic Hero Movie Slider Component with Apple-Style Liquid Glass Controls
 *
 * @param {Object} props
 * @param {Array} props.movies - Array of featured hero movies
 * @param {number} [props.autoplayInterval=5000] - Autoplay duration in ms (5 seconds)
 */
const HeroSlider = ({ movies = [], autoplayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = movies.length;

  // Navigate to next slide with circular wrapping
  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  }, [totalSlides]);

  // Navigate to previous slide with circular wrapping
  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Jump to specific slide index
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Setup controlled autoplay timer with clean pause/resume and timer reset
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoplayInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [nextSlide, isPaused, autoplayInterval, totalSlides, currentIndex]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex] || movies[0];

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#050505] border border-white/10 shadow-2xl group select-none min-h-[420px] h-[55vh] sm:h-[60vh] md:h-[580px] lg:h-[640px] max-h-[720px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured Movies Carousel"
    >
      {/* 1. Background Backdrops Layer with Crossfade Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {movies.map((movie, index) => {
          const isActive = index === currentIndex;
          const bgSrc = movie.backdrop || movie.poster;
          return (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {bgSrc && (
                <img
                  src={bgSrc}
                  alt={movie.title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000 ease-out transform group-hover:scale-100"
                />
              )}

              {/* Multi-layer Cinematic Vignettes & Gradient Overlays */}
              {/* Left-to-right dark gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent w-full md:w-3/4 z-10" />
              {/* Bottom-to-top gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
              {/* Top ambient vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-transparent to-transparent z-10" />
            </div>
          );
        })}
      </div>

      {/* 2. Content Layer (Positioned inside hero with safe horizontal margins) */}
      <div className="relative z-20 h-full w-full flex flex-col justify-end px-4 sm:px-10 md:px-16 lg:px-20 pb-5 sm:pb-10 md:pb-14 pointer-events-none">
        <div className="max-w-2xl space-y-2.5 sm:space-y-4 pointer-events-auto">
          {/* Badges & Original Tag */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {currentMovie.isOriginal && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#E50914] to-[#B20710] text-white shadow-md shadow-[#E50914]/25 border border-red-400/40">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
                MovieHub Original
              </span>
            )}
            {currentMovie.certification && (
              <span className="glass-badge px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-zinc-200">
                {currentMovie.certification}
              </span>
            )}
            {currentMovie.type && (
              <span className="glass-badge px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[#FF1A24] border-[#FF1A24]/30">
                {currentMovie.type === 'series' ? 'Web Series' : 'Movie'}
              </span>
            )}
          </div>

          {/* Movie Title */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-snug sm:leading-tight drop-shadow-md">
            {currentMovie.title}
          </h1>

          {/* Meta Info: Rating, Year, Duration, Genres */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#E50914]/15 text-[#FF1A24] border border-[#FF1A24]/30 font-bold backdrop-blur-md">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentMovie.rating}</span>
            </div>
            <div className="glass-badge flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-zinc-300">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
              <span>{currentMovie.year}</span>
            </div>
            <div className="glass-badge flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-zinc-300">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              <span>{currentMovie.duration}</span>
            </div>
            {currentMovie.genres && currentMovie.genres.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
                <span>•</span>
                <span>{currentMovie.genres.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Movie Short Description */}
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
            <Link to={`/movies/${currentMovie.id}`}>
              <Button
                variant="primary"
                size="md"
                className="text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
                icon={<Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />}
              >
                Watch Now
              </Button>
            </Link>

            <Link to={`/movies/${currentMovie.id}`}>
              <Button
                variant="secondary"
                size="md"
                className="text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
                icon={<Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              >
                Details
              </Button>
            </Link>

            <Button
              variant="outline"
              size="md"
              className="text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
              icon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              aria-label="Add to my watchlist"
            >
              <span className="hidden sm:inline">Add to List</span>
              <span className="sm:hidden">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Previous Control (Overlay, absolute vertically centered on left) */}
      <button
        type="button"
        onClick={prevSlide}
        className="glass-control hidden sm:flex absolute left-2 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full items-center justify-center text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer"
        aria-label="Previous movie slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      {/* 4. Next Control (Overlay, absolute vertically centered on right) */}
      <button
        type="button"
        onClick={nextSlide}
        className="glass-control hidden sm:flex absolute right-2 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full items-center justify-center text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer"
        aria-label="Next movie slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      {/* 5. Slider Indicator Dots (Overlay at bottom right) */}
      <div className="glass-badge absolute bottom-3 right-3 sm:bottom-6 sm:right-8 z-30 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
        {movies.map((movie, index) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer ${
              index === currentIndex
                ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[#FF1A24] shadow-sm shadow-[#FF1A24]/50'
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}: ${movie.title}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(HeroSlider);
