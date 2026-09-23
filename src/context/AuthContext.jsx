import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Authentication Provider wrapping MovieHub with Supabase Auth state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    // 1. Check active session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error fetching Supabase session:', error.message);
        }
        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Unexpected error checking session:', err);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });

    // 2. Subscribe to auth state updates (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Trigger Google OAuth login with Supabase
   * Uses the dynamic browser origin for seamless development and production redirects
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Supabase Google Sign-In error:', err.message || err);
      throw err;
    }
  }, []);

  /**
   * Sign in using Email and Password
   * @param {string} email
   * @param {string} password
   */
  const signInWithEmail = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Supabase Email Sign-In error:', err.message || err);
      throw err;
    }
  }, []);

  /**
   * Sign up a new user using Email, Password, and Full Name
   * Stores the full name in Supabase user metadata
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   */
  const signUpWithEmail = useCallback(async (email, password, fullName) => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || '',
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Supabase Email Sign-Up error:', err.message || err);
      throw err;
    }
  }, []);

  /**
   * Sign out the active user session
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (err) {
      console.error('Supabase Sign-Out error:', err.message || err);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume MovieHub Authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
