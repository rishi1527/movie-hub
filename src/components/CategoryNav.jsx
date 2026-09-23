import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Tv, Flame, Sparkles, Clapperboard, Compass } from 'lucide-react';

/**
 * Reusable Category Navigation Bar with Apple Liquid Glass styling
 *
 * @param {Object} props
 * @param {string} [props.activeCategory='Trending'] - Current active category
 * @param {Function} [props.onSelectCategory] - Optional callback on selection
 */
const CategoryNav = ({ activeCategory: initialCategory = 'Trending', onSelectCategory }) => {
  const [active, setActive] = useState(initialCategory);
  const navigate = useNavigate();

  const categories = [
    { id: 'trending', name: 'Trending', icon: <Flame className="w-4 h-4" /> },
    { id: 'movies', name: 'Movies', icon: <Film className="w-4 h-4" /> },
    { id: 'web-series', name: 'Web Series', icon: <Tv className="w-4 h-4" /> },
    { id: 'tv-shows', name: 'TV Shows', icon: <Clapperboard className="w-4 h-4" /> },
    { id: 'anime', name: 'Anime', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'latest', name: 'Latest', icon: <Compass className="w-4 h-4" /> },
  ];

  const handleCategoryClick = (category) => {
    setActive(category.name);
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      navigate('/movies');
    }
  };

  return (
    <nav
      className="relative -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 py-2"
      aria-label="Movie & Show Categories"
    >
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 touch-pan-x">
        {categories.map((cat) => {
          const isSelected = active.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`flex items-center gap-2 shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] select-none ${
                isSelected
                  ? 'glass-pill-active text-white font-bold'
                  : 'glass-pill text-zinc-300 hover:text-white'
              }`}
              aria-pressed={isSelected}
            >
              <span className={isSelected ? 'text-white' : 'text-[#FF1A24]'}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryNav;
