import { create } from 'zustand';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; session?: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    // Automatically capture auth tokens from Supabase email confirmation hash links
    try {
      const fullUrl = window.location.href;
      if (fullUrl.includes('access_token=') && fullUrl.includes('refresh_token=')) {
        const tokenMatch = fullUrl.match(/access_token=([^&]+)/);
        const refreshMatch = fullUrl.match(/refresh_token=([^&]+)/);
        if (tokenMatch && refreshMatch) {
          const { data, error } = await supabase.auth.setSession({
            access_token: tokenMatch[1],
            refresh_token: refreshMatch[1],
          });
          if (!error && data.session) {
            set({
              session: data.session,
              user: data.session.user,
              initialized: true,
            });
            if (window.location.hash.includes('access_token')) {
              window.location.hash = '#/studio';
            }
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Token recovery error', e);
    }

    // Get initial session from Supabase (persisted in localStorage)
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
    });

    // Listen for future auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
      });
    });
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect after email confirmation (HashRouter: /#/login)
        emailRedirectTo: `${window.location.origin}/#/login`,
      },
    });
    if (!error && data?.session) {
      set({ session: data.session, user: data.session.user });
    }
    set({ loading: false });
    return { error, session: data?.session ?? null };
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      set({ session: data.session, user: data.session.user });
    }
    set({ loading: false });
    return { error };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },

  resendConfirmation: async (email: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/#/login`,
      },
    });
    set({ loading: false });
    return { error };
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },
}));
