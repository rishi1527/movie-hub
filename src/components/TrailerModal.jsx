import { useEffect } from 'react';
import { X, Play } from 'lucide-react';

/**
 * Select the best official YouTube trailer from a list of TMDB video objects.
 *
 * Preferred order:
 * 1. YouTube platform
 * 2. Video type = 'Trailer'
 * 3. Official video = true
 * 4. Prefer English language ('en')
 * 5. First available YouTube Trailer
 *
 * @param {Array} videos - Array of TMDB video objects from movie.videos
 * @returns {Object|null} Selected video object or null
 */
export const selectBestTrailer = (videos) => {
  if (!Array.isArray(videos) || videos.length === 0) return null;

  // Filter for valid YouTube entries with a key
  const youtubeVideos = videos.filter(
    (v) =>
      v &&
      v.key &&
      typeof v.key === 'string' &&
      v.key.trim() !== '' &&
      v.site?.toLowerCase() === 'youtube'
  );

  if (youtubeVideos.length === 0) return null;

  // Filter for videos of type 'Trailer'
  const trailers = youtubeVideos.filter(
    (v) => v.type && v.type.toLowerCase() === 'trailer'
  );

  if (trailers.length > 0) {
    // 1. Official English trailer
    const officialEn = trailers.find(
      (v) => v.official === true && v.iso_639_1?.toLowerCase() === 'en'
    );
    if (officialEn) return officialEn;

    // 2. Official trailer (any language)
    const official = trailers.find((v) => v.official === true);
    if (official) return official;

    // 3. English trailer
    const enTrailer = trailers.find(
      (v) => v.iso_639_1?.toLowerCase() === 'en'
    );
    if (enTrailer) return enTrailer;

    // 4. Any available trailer
    return trailers[0];
  }

  // Do not select unrelated clips, featurettes, or teasers when looking for official trailer
  return null;
};

/**
 * Reusable Cinematic Liquid Glass Trailer Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when closing the modal
 * @param {string} props.videoKey - YouTube video ID/key
 * @param {string} [props.title] - Movie or video title
 * @param {string} [props.trailerName] - Name of the trailer
 */
const TrailerModal = ({
  isOpen,
  onClose,
  videoKey,
  title = '',
  trailerName = 'Official Trailer',
}) => {
  // Lock background scroll and handle Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoKey) return null;

  const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoKey)}?rel=0&modestbranding=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#050505]/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} Trailer Player` : 'Movie Trailer Player'}
    >
      <div
        className="glass-panel relative w-full max-w-4xl lg:max-w-5xl rounded-3xl border border-white/15 p-4 sm:p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col gap-3 sm:gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#B20710]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#E50914]/20 border border-[#FF1A24]/40 flex items-center justify-center text-[#FF1A24] shrink-0">
              <Play className="w-4 h-4 fill-[#FF1A24]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {title ? `${title}` : 'Movie Trailer'}
              </h3>
              <p className="text-xs text-[#FF1A24]/90 font-medium truncate">
                {trailerName || 'Official Trailer'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="glass-action-btn p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer shrink-0"
            aria-label="Close trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Aspect Ratio Video Player */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#050505] border border-white/10 shadow-2xl">
          <iframe
            src={embedUrl}
            title={`${title || 'Movie'} Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
