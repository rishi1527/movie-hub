import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  House,
  Film,
  Clapperboard,
  Sparkles,
  Tv,
  User,
  Heart,
  Menu,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMenu();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // 5 Main Navigation Links
  const navLinks = [
    { name: 'Home', path: '/', icon: <House className="w-3.5 h-3.5 shrink-0" /> },
    { name: 'Movies', path: '/movies', icon: <Film className="w-3.5 h-3.5 shrink-0" /> },
    { name: 'Web Series', path: '/web-series', icon: <Clapperboard className="w-3.5 h-3.5 shrink-0" /> },
    { name: 'TV Shows', path: '/tv-shows', icon: <Tv className="w-3.5 h-3.5 shrink-0" /> },
    { name: 'Anime', path: '/anime', icon: <Sparkles className="w-3.5 h-3.5 shrink-0" /> },
  ];

  // Desktop active capsule class - slim, non-shrinking, non-wrapping
  const getNavLinkClass = ({ isActive }) =>
    `relative flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full text-xs font-medium tracking-wide whitespace-nowrap shrink-0 transition-all duration-300 select-none ${
      isActive
        ? 'glass-nav-active text-[#FF1A24] font-semibold shadow-sm'
        : 'text-zinc-300 hover:text-white hover:bg-white/5'
    }`;

  // Mobile active drawer item class
  const getMobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-200 select-none ${
      isActive
        ? 'glass-nav-active text-[#FF1A24] font-semibold border border-[#FF1A24]/30'
        : 'text-zinc-300 hover:text-white hover:bg-white/5'
    }`;

  // User avatar URL from Google OAuth metadata
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Profile');

  return (
    <header className="sticky top-1.5 sm:top-2.5 z-40 w-full px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Balanced & Elegant Liquid Glass Command Bar */}
      <div className="glass-command-bar rounded-2xl sm:rounded-full px-3 sm:px-4 py-1.5 transition-all duration-300">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3.5">
          
          {/* =========================================================================
              ZONE 1 (LEFT): BRAND LOGO & CINEMATIC MARK (shrink-0)
             ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {/* Mobile Drawer Hamburger Toggle */}
            <button
              type="button"
              onClick={toggleMenu}
              className="lg:hidden glass-action-btn p-1.5 rounded-xl text-zinc-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] cursor-pointer shrink-0"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isOpen ? <X className="w-4 h-4 text-[#FF1A24]" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Brand Logo Link */}
            <Link
              to="/"
              onClick={closeMenu}
              className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24] rounded-xl shrink-0"
              aria-label="MovieHub Cinematic Platform"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FF1A24] flex items-center justify-center text-white shadow-md shadow-[#E50914]/30 group-hover:scale-105 group-hover:shadow-[#E50914]/50 transition-all duration-300 border border-red-400/40 shrink-0">
                <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:rotate-6 shrink-0" />
                <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1A24] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF1A24]"></span>
                </span>
              </div>

              <div className="flex flex-col shrink-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none group-hover:text-red-100 transition-colors whitespace-nowrap">
                    Movie<span className="text-[#FF1A24] drop-shadow-sm">Hub</span>
                  </span>
                </div>
                <span className="text-[7.5px] sm:text-[8px] text-zinc-400 font-semibold tracking-widest uppercase leading-tight -mt-0.5 hidden xs:block whitespace-nowrap">
                  Cinematic Universe
                </span>
              </div>
            </Link>
          </div>

          {/* =========================================================================
              ZONE 2 (CENTER): SLIM DESKTOP NAVIGATION CAPSULE (shrink-0, perfectly stable)
             ========================================================================= */}
          <nav
            className="hidden lg:flex items-center justify-center glass-nav-capsule rounded-full p-0.5 shadow-inner shrink-0 whitespace-nowrap"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={getNavLinkClass}
              >
                <span className="text-[#FF1A24]/90 shrink-0">{link.icon}</span>
                <span className="whitespace-nowrap shrink-0">{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* =========================================================================
              ZONE 3 (RIGHT): UNIQUE EXPLORE SEARCH & ACTION CONTROLS (shrink-0)
             ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Expandable Liquid Glass Explore SearchBar */}
            <div className="flex items-center shrink-0">
              <SearchBar onSelectResult={closeMenu} />
            </div>

            {/* Watchlist / Favorites Action */}
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `glass-action-btn relative p-1.5 sm:p-2 rounded-xl sm:rounded-full transition-all duration-200 group shrink-0 ${
                  isActive
                    ? 'text-[#FF1A24] border-red-500/40 bg-[#E50914]/10 shadow-sm shadow-[#E50914]/20'
                    : 'text-zinc-300 hover:text-[#FF1A24]'
                }`
              }
              aria-label="Favorites & Watchlist"
              title="Watchlist & Favorites"
            >
              <Heart className="w-3.5 h-3.5 transition-transform group-hover:scale-110 shrink-0" />
            </NavLink>

            {/* Auth / Profile Action Pill */}
            {user ? (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `glass-action-btn flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'glass-nav-active text-[#FF1A24] border-[#FF1A24]/40'
                      : 'text-zinc-200 hover:text-white'
                  }`
                }
                aria-label="User Profile"
                title={`Signed in as ${userDisplayName}`}
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover border border-[#FF1A24]/40 shrink-0"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#FF1A24]/90 shrink-0" />
                )}
                <span className="hidden sm:inline max-w-[85px] truncate whitespace-nowrap shrink-0">
                  {userDisplayName.split(' ')[0]}
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `glass-action-btn flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'glass-nav-active text-[#FF1A24] border-[#FF1A24]/40'
                      : 'text-zinc-200 hover:text-[#FF1A24]'
                  }`
                }
                aria-label="Sign In"
                title="Sign In"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF1A24]/90 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap shrink-0">Sign In</span>
              </NavLink>
            )}
          </div>

        </div>
      </div>

      {/* =========================================================================
          MOBILE LIQUID GLASS DRAWER
         ========================================================================= */}
      {isOpen && (
        <div className="lg:hidden mt-1.5 glass-drawer rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-white/10 shadow-2xl animate-in slide-in-from-top-2 fade-in-50 duration-200 max-h-[calc(100dvh-70px)] overflow-y-auto no-scrollbar">
          <div className="space-y-3">
            
            {/* Authenticated User Banner (Mobile) */}
            {user && (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-[#FF1A24]/50 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E50914]/20 border border-[#FF1A24]/30 flex items-center justify-center text-[#FF1A24] shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                </div>
              </Link>
            )}

            {/* Mobile SearchBar */}
            <div className="pb-1 border-b border-white/5">
              <SearchBar onSelectResult={closeMenu} isMobile={true} />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-0.5" aria-label="Mobile Drawer Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={getMobileNavLinkClass}
                >
                  <span className="p-1 rounded-lg bg-white/5 text-[#FF1A24] shrink-0">
                    {link.icon}
                  </span>
                  <span className="flex-1 font-medium whitespace-nowrap">{link.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile Bottom Action Links */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
              <NavLink
                to="/favorites"
                onClick={closeMenu}
                className="glass-button-secondary flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-[#FF1A24] shrink-0"
              >
                <Heart className="w-3.5 h-3.5 text-[#FF1A24] shrink-0" />
                <span className="whitespace-nowrap">Favorites</span>
              </NavLink>

              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="glass-button-secondary flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#FF1A24] shrink-0" />
                  <span className="whitespace-nowrap">Sign Out</span>
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="glass-button-secondary flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-[#FF1A24] shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#FF1A24] shrink-0" />
                  <span className="whitespace-nowrap">Sign In</span>
                </NavLink>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
