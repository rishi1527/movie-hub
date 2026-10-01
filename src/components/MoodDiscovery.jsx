/* eslint-disable react-refresh/only-export-components */
import { useState, memo } from 'react';
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

/**
 * Mood Definitions with icons, emojis, and OTT-style descriptions
 */
export const MOODS = [
  {
    id: 'romantic',
    name: 'Romantic',
    icon: Heart,
    emoji: '❤️',
    subtitle: 'Heartwarming romances & passionate love stories',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    icon: Smile,
    emoji: '🍿',
    subtitle: 'Feel-good laughs & top comedy hits',
  },
  {
    id: 'action',
    name: 'Action',
    icon: Zap,
    emoji: '💥',
    subtitle: 'High-octane blockbusters & explosive thrills',
  },
  {
    id: 'horror',
    name: 'Horror',
    icon: Ghost,
    emoji: '👻',
    subtitle: 'Chilling scares, dark suspense & paranormal frights',
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: Eye,
    emoji: '🎭',
    subtitle: 'Deeply moving dramas & profound human journeys',
  },
  {
    id: 'thriller',
    name: 'Thriller',
    icon: Flame,
    emoji: '🔥',
    subtitle: 'Edge-of-your-seat suspense & psychological twists',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    icon: Search,
    emoji: '🔍',
    subtitle: 'Gripping whodunits & unsolved detective puzzles',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: Sparkles,
    emoji: '✨',
    subtitle: 'Mythical realms, magic spells & legendary quests',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    icon: Rocket,
    emoji: '🚀',
    subtitle: 'Mind-bending futures, space odysseys & sci-tech sagas',
  },
];

/**
 * MoodDiscovery Component
 * Renders the "What's Your Mood?" pill selector.
 * Clicking a mood selects it on the Home Page and scrolls down to the mood row,
 * without navigating away from the page.
 */
const MoodDiscovery = ({ selectedMood, onSelectMood, className = '' }) => {
  const [internalMood, setInternalMood] = useState(
    MOODS.find((m) => m.id === 'comedy') || MOODS[0]
  );

  const activeMood = selectedMood || internalMood;

  const handleMoodClick = (mood) => {
    if (onSelectMood) {
      onSelectMood(mood);
    } else {
      setInternalMood(mood);
    }
  };

  return (
    <section className={`space-y-3 sm:space-y-3.5 ${className}`} aria-label="Mood discovery">
      {/* Compact Mood Section Header */}
      <div className="space-y-0.5 px-1">
        <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>What&apos;s Your Mood?</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal">
          Pick a mood and discover curated movies tailored just for you.
        </p>
      </div>

      {/* Mood Buttons Pill Container */}
      <div className="relative -mx-2 sm:-mx-0 px-2 sm:px-0">
        <div
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar sm:flex-wrap py-1 touch-pan-x"
          role="tablist"
          aria-label="Mood filter options"
        >
          {MOODS.map((mood) => {
            const isSelected = activeMood.id === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleMoodClick(mood)}
                className={`glass-action-btn flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer select-none ${
                  isSelected
                    ? 'glass-nav-active text-[#FF1A24] border-[#FF1A24]/40 shadow-sm shadow-[#FF1A24]/20 scale-[1.03]'
                    : 'text-zinc-200 hover:text-[#FF1A24] hover:border-white/20'
                }`}
              >
                <span className="text-sm leading-none shrink-0" role="img" aria-label={mood.name}>
                  {mood.emoji}
                </span>
                <span className="whitespace-nowrap shrink-0">{mood.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(MoodDiscovery);
