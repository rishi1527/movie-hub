import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Film,
  Heart,
  LogOut,
  LogIn,
  Sparkles,
  Calendar,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Button from '../components/Button';

// High-fidelity Google 'G' brand mark SVG
const GoogleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const Profile = () => {
  const { user, loading: authLoading, signOut, signInWithGoogle } = useAuth();
  const { favorites } = useFavorites();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      setIsSigningOut(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-3xl flex items-center gap-3 text-zinc-300">
          <Loader2 className="w-5 h-5 text-[#FF1A24] animate-spin" />
          <span className="text-sm font-medium">Loading profile information...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED OUT STATE
  // =========================================================================
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-12 space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/30 flex items-center justify-center text-[#FF1A24] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <span>User Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your account and preferences.
          </p>
        </div>

        {/* Logged Out Glass Panel */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/10 text-center space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-[#111111] border border-white/10 flex items-center justify-center text-zinc-400 shadow-inner">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-500" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-zinc-400">
              <span>Guest Mode</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">You Are Not Signed In</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Sign in with your Google account to sync your watchlist, store movie ratings, and access personalized recommendations across all your devices.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="md" icon={<LogIn className="w-4 h-4" />} className="w-full justify-center">
                Sign In / Register
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl font-bold text-sm bg-white text-slate-950 hover:bg-zinc-100 transition-all shadow-lg hover:shadow-white/20 active:scale-95 disabled:opacity-60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24]"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </>
              )}
            </button>

            <Link to="/movies" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full justify-center">
                Browse Movies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED IN / AUTHENTICATED STATE
  // =========================================================================
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const fullName =
    user.user_metadata?.full_name || user.user_metadata?.name || 'Movie Enthusiast';
  const email = user.email;
  const isGoogleUser =
    user.app_metadata?.provider === 'google' ||
    user.identities?.some((id) => id.provider === 'google') ||
    Boolean(user.user_metadata?.avatar_url || user.user_metadata?.picture);
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Profile Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/30 flex items-center justify-center text-[#FF1A24] shrink-0">
            <User className="w-5 h-5" />
          </div>
          <span>User Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your authenticated account, watchlist preferences, and streaming data.
        </p>
      </div>

      {/* Primary User Information Card */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* User Avatar */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#FF1A24]/40 shadow-xl shadow-[#E50914]/10"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#E50914] to-[#FF1A24] flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-[#E50914]/20">
                <User className="w-10 h-10" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 p-1 bg-[#111111] rounded-full border border-white/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2.5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                {fullName}
              </h2>
              {isGoogleUser ? (
                <span className="glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border-emerald-400/30 self-center sm:self-auto">
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>Google Verified</span>
                </span>
              ) : (
                <span className="glass-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#FF1A24] border-[#FF1A24]/30 self-center sm:self-auto">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Verified Member</span>
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-300 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-[#FF1A24]/80 shrink-0" />
              <span className="truncate">{email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Member since {joinedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#FF1A24]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MovieHub Pass Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-white/10 relative z-10">
          <Link
            to="/favorites"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center group"
          >
            <div className="text-2xl font-black text-[#FF1A24] group-hover:scale-105 transition-transform">
              {favorites ? favorites.length : 0}
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#FF1A24]" />
              <span>Favorites</span>
            </div>
          </Link>

          <Link
            to="/movies"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center group"
          >
            <div className="text-2xl font-black text-zinc-200 group-hover:scale-105 transition-transform">
              0
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
              <Film className="w-3.5 h-3.5 text-zinc-400" />
              <span>Watched</span>
            </div>
          </Link>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
            <div className="text-2xl font-black text-emerald-400">Active</div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <Link to="/favorites">
            <Button variant="outline" size="sm" icon={<Heart className="w-4 h-4 text-[#FF1A24]" />}>
              View Watchlist
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            isLoading={isSigningOut}
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
