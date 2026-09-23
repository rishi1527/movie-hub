import { useState, useEffect, useRef, memo } from 'react';
import {
  Heart,
  Smile,
  Zap,
  Ghost,
  Eye,
  Flame,
  Search,
  Sparkles,
  Rocket,
} from 'lucide-react';
import { getMoviesByMood } from '../services/tmdbApi';
import MovieRow from './MovieRow';
import { MovieRowSkeleton } from './Skeletons';

const MOODS = [
  { id: 'romantic', name: 'Romantic', icon: Heart },
  { id: 'comedy', name: 'Comedy', icon: Smile },
  { id: 'action', name: 'Action', icon: Zap },
  { id: 'horror', name: 'Horror', icon: Ghost },
  { id: 'emotional', name: 'Emotional', icon: Eye },
  { id: 'thriller', name: 'Thriller', icon: Flame },
  { id: 'mystery', name: 'Mystery', icon: Search },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles },
  { id: 'sci-fi', name: 'Sci-Fi', icon: Rocket },
];

/**
 * Mood-based Movie & Series Discovery Component
 * Styled with compact professional OTT-style section heading and Navbar-matching mood buttons
 */
const MoodDiscovery = () => {
  const [selectedMood, setSelectedMood] = useState(MOODS[0]); // Default 'Romantic'
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const moodId = selectedMood.id;

    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    getMoviesByMood(moodId, 1, { signal: controller.signal })
      .then((data) => {
        if (!isMounted) return;
        setMovies(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Error in MoodDiscovery TMDB fetch:', error);
        if (isMounted) {
          setMovies([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedMood]);

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Compact Mood Section Header */}
      <div className="space-y-0.5 px-1">
        <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>What&apos;s Your Mood?</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal">
          Pick a mood and discover something you&apos;ll love.
        </p>
      </div>

      {/* Mood Buttons matching Navbar Sign In Button Styling */}
      <div className="relative -mx-2 sm:-mx-0 px-2 sm:px-0">
        <div
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar sm:flex-wrap py-1 touch-pan-x"
          role="tablist"
          aria-label="Mood filter options"
        >
          {MOODS.map((mood) => {
            const isSelected = selectedMood.id === mood.id;
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedMood(mood)}
                className={`glass-action-btn flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer select-none ${
                  isSelected
                    ? 'glass-nav-active text-[#FF1A24] border-[#FF1A24]/40 shadow-sm'
                    : 'text-zinc-200 hover:text-[#FF1A24]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-[#FF1A24]' : 'text-[#FF1A24]/90'
                  }`}
                />
                <span className="whitespace-nowrap shrink-0">{mood.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamically Filtered Movie Row */}
      <div className="pt-1">
        {loading ? (
          <MovieRowSkeleton count={6} />
        ) : movies.length > 0 ? (
          <MovieRow
            title={`${selectedMood.name} Picks`}
            badge="MOOD"
            subtitle={`Top curated titles for when you're feeling ${selectedMood.name.toLowerCase()}`}
            movies={movies}
            seeAllLink="/movies"
          />
        ) : (
          <div className="glass-panel p-6 rounded-2xl text-center text-zinc-400 text-sm">
            No {selectedMood.name.toLowerCase()} titles found at this moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MoodDiscovery);
