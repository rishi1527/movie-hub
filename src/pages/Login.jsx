import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Film,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  LogIn,
  UserPlus,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const Login = () => {
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState('signin');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailConfirmationNotice, setEmailConfirmationNotice] = useState(false);

  // Redirect to Home if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Mode switcher with clean state reset
  const handleModeSwitch = (targetMode) => {
    setMode(targetMode);
    setErrorMessage(null);
    setEmailConfirmationNotice(false);
    setPassword('');
    setConfirmPassword('');
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSubmitting(true);
      setIsSubmitting(true);
      setErrorMessage(null);
      setEmailConfirmationNotice(false);
      await signInWithGoogle();
      // OAuth redirects the browser automatically to Google consent screen
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setErrorMessage(
        error.message || 'Unable to connect to Google Sign-In. Please verify your connection and try again.'
      );
      setIsSubmitting(false);
      setIsGoogleSubmitting(false);
    }
  };

  // Email & Password Auth Handler (Sign In / Sign Up)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setEmailConfirmationNotice(false);

    // Common Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // Common Password validation
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      // Full Name validation
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      // Password length check
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      // Confirm Password match check
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify and try again.');
        return;
      }

      try {
        setIsSubmitting(true);
        const data = await signUpWithEmail(trimmedEmail, password, fullName);

        // If Supabase created an active session immediately, onAuthStateChange/useEffect will redirect to '/'
        if (data?.session) {
          navigate('/', { replace: true });
        } else {
          // If Supabase requires email verification before session is granted
          setEmailConfirmationNotice(true);
        }
      } catch (error) {
        console.error('Sign up error:', error);
        setErrorMessage(
          error.message || 'Unable to create account. Please check your details and try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In mode
      try {
        setIsSubmitting(true);
        await signInWithEmail(trimmedEmail, password);
        // Successful login establishes session and redirects to Home
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Sign in error:', error);
        // User-friendly mapping for common auth issues
        if (error.message?.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please check your credentials.');
        } else if (error.message?.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Your email address has not been confirmed yet. Please check your inbox.');
        } else {
          setErrorMessage(error.message || 'Failed to sign in. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-3xl flex items-center gap-3 text-zinc-300">
          <Loader2 className="w-5 h-5 text-[#FF1A24] animate-spin" />
          <span className="text-sm font-medium">Checking authentication state...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 space-y-6 animate-in fade-in-50 duration-300">
      {/* Back to Home Button */}
      <div>
        <Link to="/">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#FF1A24] text-white shadow-lg shadow-[#E50914]/25 border border-[#FF1A24]/30 mb-1">
          <Film className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {mode === 'signin' ? (
            <>
              Welcome to Movie<span className="text-[#FF1A24]">Hub</span>
            </>
          ) : (
            <>
              Join Movie<span className="text-[#FF1A24]">Hub</span>
            </>
          )}
        </h1>
        <p className="text-sm text-zinc-400 max-w-xs mx-auto">
          {mode === 'signin'
            ? 'Sign in to access your watchlist, personal favorites, and personalized movie recommendations.'
            : 'Create an account to track your favorite films, rate movies, and sync across all devices.'}
        </p>
      </div>

      {/* Authentication Card */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#B20710]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Email Verification Required Notice */}
        {emailConfirmationNotice && (
          <div className="p-4 rounded-2xl bg-[#E50914]/10 border border-[#FF1A24]/30 text-zinc-200 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2.5 font-bold text-sm text-[#FF1A24]">
              <Inbox className="w-5 h-5 text-[#FF1A24] shrink-0" />
              <span>Verify Your Email</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              We&apos;ve sent a confirmation link to <strong className="text-[#FF1A24]">{email}</strong>. Please check your inbox and confirm your email before signing in.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="text-xs font-semibold text-[#FF1A24] hover:text-[#FF333C] underline underline-offset-4 cursor-pointer"
              >
                Proceed to Sign In &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm bg-white text-slate-950 hover:bg-zinc-100 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1A24]"
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#111111] px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            or
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {/* Full Name field (Sign Up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#111111]/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF1A24]/70 focus:bg-white/5 focus:ring-1 focus:ring-[#FF1A24]/30 transition-all duration-200 disabled:opacity-50"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#111111]/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF1A24]/70 focus:bg-white/5 focus:ring-1 focus:ring-[#FF1A24]/30 transition-all duration-200 disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#111111]/80 border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF1A24]/70 focus:bg-white/5 focus:ring-1 focus:ring-[#FF1A24]/30 transition-all duration-200 disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field (Sign Up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#111111]/80 border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF1A24]/70 focus:bg-white/5 focus:ring-1 focus:ring-[#FF1A24]/30 transition-all duration-200 disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting && !isGoogleSubmitting}
              disabled={isSubmitting}
              className="w-full py-3 text-sm justify-center"
              icon={
                mode === 'signin' ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )
              }
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Mode Switch Link */}
        <div className="pt-2 border-t border-white/10 text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className="font-bold text-[#FF1A24] hover:text-[#FF333C] transition-colors cursor-pointer focus:outline-none focus:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="font-bold text-[#FF1A24] hover:text-[#FF333C] transition-colors cursor-pointer focus:outline-none focus:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-[#FF1A24] shrink-0" />
            <span>Google OAuth or secure Email/Password authentication</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF1A24] shrink-0" />
            <span>Save and sync your favorite movies & series across devices</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

