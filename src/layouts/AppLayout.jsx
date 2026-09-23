import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Clapperboard, Heart } from 'lucide-react';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#E50914] selection:text-white overflow-x-hidden w-full">
      {/* Top Navigation Bar with Liquid Glass */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Outlet />
      </main>

      {/* Responsive Modern Liquid Glass Footer */}
      <footer className="w-full glass-footer mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand & Description */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#FF1A24] flex items-center justify-center text-white shadow-md shadow-[#E50914]/25 border border-red-400/40">
                  <Clapperboard className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-lg text-white">
                  Movie<span className="text-[#FF1A24]">Hub</span>
                </span>
              </div>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                Discover trending movies, explore top-rated films, and manage your personalized watchlist with our modern cinematic discovery platform.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-200 tracking-widest uppercase">
                Explore
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link to="/" className="hover:text-[#FF1A24] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/movies" className="hover:text-[#FF1A24] transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/web-series" className="hover:text-[#FF1A24] transition-colors">
                    Web Series
                  </Link>
                </li>
                <li>
                  <Link to="/anime" className="hover:text-[#FF1A24] transition-colors">
                    Anime
                  </Link>
                </li>
                <li>
                  <Link to="/tv-shows" className="hover:text-[#FF1A24] transition-colors">
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="hover:text-[#FF1A24] transition-colors">
                    Favorites
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-200 tracking-widest uppercase">
                Account
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link to="/login" className="hover:text-[#FF1A24] transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#FF1A24] transition-colors">
                    User Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p>© {new Date().getFullYear()} MovieHub. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#FF1A24] fill-[#FF1A24] mx-1" />
              <span>using React & Liquid Glass design</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
