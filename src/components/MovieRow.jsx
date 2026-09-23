import { useRef, useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { MovieCardSkeleton } from './Skeletons';

/**
 * Reusable Horizontal Movie Row Component with Compact Professional OTT-Style Section Headings
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.subtitle] - Optional subtitle or description
 * @param {Array} [props.movies=[]] - Array of movie data objects
 * @param {boolean} [props.isLoading=false] - Whether row is in loading state
 * @param {string} [props.seeAllLink='/movies'] - Route target for "See All" action
 * @param {string} [props.badge] - Optional badge beside title (e.g. "HOT", "4K")
 */
const MovieRow = ({
  title,
  subtitle,
  movies = [],
  isLoading = false,
  seeAllLink = '/movies',
  badge,
}) => {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to dynamically show/hide scroll chevrons
  const updateScrollButtons = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const currentRef = rowRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', updateScrollButtons);
      }
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [movies, isLoading]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isLoading && (!movies || movies.length === 0)) return null;

  return (
    <section className="relative space-y-2.5 sm:space-y-3 group/row">
      {/* Header with Compact Title, Badge, and See All */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2 truncate">
            <span>{title}</span>
            {badge && (
              <span className="glass-badge px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-extrabold uppercase text-[#FF1A24] border-[#FF1A24]/30 shrink-0">
                {badge}
              </span>
            )}
          </h2>
          {subtitle && (
            <span className="hidden md:inline text-xs text-zinc-400 font-normal truncate">
              • {subtitle}
            </span>
          )}
        </div>

        <Link
          to={seeAllLink}
          className="glass-pill group/link flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#FF1A24] hover:text-[#FF333C] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF1A24] rounded-full px-2.5 sm:px-3 py-1 shrink-0"
          aria-label={`See all ${title}`}
        >
          <span>See All</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8">
        {/* Desktop Left Scroll Button */}
        {!isLoading && canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="glass-control hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center text-white cursor-pointer opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          className="flex items-start gap-3 sm:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1 focus:outline-none touch-pan-x"
          tabIndex={0}
          aria-label={`${title} carousel`}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))
            : movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
        </div>

        {/* Desktop Right Scroll Button */}
        {!isLoading && canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="glass-control hidden md:flex absolute right-2 lg:left-auto lg:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center text-white cursor-pointer opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default memo(MovieRow);
