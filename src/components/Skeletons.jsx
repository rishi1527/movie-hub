/**
 * Shimmering Hero Slider Skeleton Placeholder
 */
export const HeroSkeleton = () => {
  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#111111]/80 border border-white/10 shadow-2xl min-h-[420px] h-[55vh] sm:h-[60vh] md:h-[580px] lg:h-[640px] max-h-[720px] animate-pulse"
      aria-label="Loading featured movie..."
    >
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#161616] to-[#111111]" />

      {/* Gradient vignette overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent w-full md:w-3/4 z-10" />

      {/* Content Skeleton */}
      <div className="relative z-20 h-full w-full flex flex-col justify-end px-4 sm:px-10 md:px-16 lg:px-20 pb-5 sm:pb-10 md:pb-14 space-y-3 sm:space-y-4">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className="h-5 sm:h-6 w-20 sm:w-24 bg-white/10 rounded-full" />
          <div className="h-5 sm:h-6 w-10 sm:w-12 bg-white/10 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 sm:h-12 md:h-14 w-3/4 max-w-lg bg-white/15 rounded-xl sm:rounded-2xl" />
          <div className="h-8 sm:h-12 w-1/2 max-w-sm bg-white/10 rounded-xl sm:rounded-2xl" />
        </div>

        {/* Meta info chips */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-5 sm:h-6 w-14 sm:w-16 bg-[#E50914]/20 rounded-full" />
          <div className="h-5 sm:h-6 w-14 sm:w-16 bg-white/10 rounded-full" />
          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-white/10 rounded-full" />
        </div>

        {/* Description lines */}
        <div className="space-y-2 max-w-xl">
          <div className="h-3.5 sm:h-4 w-full bg-white/10 rounded-lg" />
          <div className="h-3.5 sm:h-4 w-5/6 bg-white/10 rounded-lg" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
          <div className="h-9 sm:h-11 w-24 sm:w-32 bg-[#E50914]/40 rounded-xl sm:rounded-2xl" />
          <div className="h-9 sm:h-11 w-20 sm:w-28 bg-white/10 rounded-xl sm:rounded-2xl" />
          <div className="h-9 sm:h-11 w-20 sm:w-28 bg-white/5 rounded-xl sm:rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Shimmering Movie Card Skeleton Placeholder
 */
export const MovieCardSkeleton = ({ className = '' }) => {
  const defaultWidth = className && className.includes('w-')
    ? ''
    : 'shrink-0 w-[135px] sm:w-[160px] md:w-[185px] lg:w-[210px]';

  return (
    <div
      className={`relative flex flex-col rounded-2xl sm:rounded-3xl animate-pulse ${defaultWidth} ${className}`}
    >
      {/* Poster Placeholder */}
      <div className="glass-card relative aspect-[2/3] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#111111] border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#161616] via-[#111111] to-[#050505]" />
        
        {/* Rating chip placeholder */}
        <div className="absolute bottom-2.5 left-2.5 h-4 sm:h-5 w-10 sm:w-12 bg-white/10 rounded-full" />
      </div>

      {/* Info Placeholder */}
      <div className="mt-2.5 px-1 space-y-1.5">
        <div className="h-3 sm:h-3.5 w-4/5 bg-white/15 rounded-md" />
        <div className="h-2.5 sm:h-3 w-1/2 bg-white/10 rounded-md" />
      </div>
    </div>
  );
};

/**
 * Shimmering Horizontal Movie Row Skeleton
 */
export const MovieRowSkeleton = ({ count = 6 }) => {
  return (
    <section className="relative space-y-3.5 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-40 sm:w-56 bg-white/15 rounded-xl animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
      </div>

      {/* Horizontal Cards */}
      <div className="relative -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3 sm:gap-4 lg:gap-5 overflow-x-hidden py-2 px-1">
          {Array.from({ length: count }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Universal Page Skeleton (Used as lightweight route fallback instead of blocking full-page spinner)
 */
export const PageSkeleton = () => {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 animate-in fade-in duration-150">
      <HeroSkeleton />
      <MovieRowSkeleton count={5} />
      <MovieRowSkeleton count={5} />
    </div>
  );
};

export default {
  HeroSkeleton,
  MovieCardSkeleton,
  MovieRowSkeleton,
  PageSkeleton,
};
