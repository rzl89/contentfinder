import { create } from 'zustand';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSubscriptionStore } from './subscription-store';
import { validateEmailAddress } from '@/lib/disposable-email-validator';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan_tier: string | null;
  subscription_status: string | null;
  credits_balance: number | null;
  created_at: string | null;
  updated_at?: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: AuthError | null; session?: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

let profileSubscriptionChannel: ReturnType<typeof supabase.channel> | null = null;

function setupProfileRealtime(userId: string) {
  if (profileSubscriptionChannel) {
    void supabase.removeChannel(profileSubscriptionChannel);
    profileSubscriptionChannel = null;
  }
  profileSubscriptionChannel = supabase
    .channel(`profile_realtime_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        const updated = payload?.new as UserProfile | undefined;
        if (updated && updated.id === userId) {
          useAuthStore.setState({ profile: updated });
          void useSubscriptionStore.getState().syncSubscriptionWithProfile(userId);
        }
      }
    )
    .subscribe();
}

function cleanupProfileRealtime() {
  if (profileSubscriptionChannel) {
    void supabase.removeChannel(profileSubscriptionChannel);
    profileSubscriptionChannel = null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
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
    const sessionEmail = data.session?.user?.email;
    if (sessionEmail && validateEmailAddress(sessionEmail).isDisposable) {
      await supabase.auth.signOut();
      set({ session: null, user: null, initialized: true });
      return;
    }

    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
    });

    if (data.session?.user) {
      setupProfileRealtime(data.session.user.id);
      void useSubscriptionStore.getState().syncSubscriptionWithProfile(data.session.user.id);
      void get().fetchProfile();
    }

    // Listen for future auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (email && validateEmailAddress(email).isDisposable) {
        cleanupProfileRealtime();
        void supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
        return;
      }

      set({
        session,
        user: session?.user ?? null,
      });
      if (session?.user) {
        setupProfileRealtime(session.user.id);
        void useSubscriptionStore.getState().syncSubscriptionWithProfile(session.user.id);
        void get().fetchProfile();
      } else {
        cleanupProfileRealtime();
        set({ profile: null });
      }
    });
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
        // Redirect after email confirmation (HashRouter: /#/login)
        emailRedirectTo: `${window.location.origin}/#/login`,
      },
    });
    if (!error && data?.session) {
      set({ session: data.session, user: data.session.user });
      if (data.session.user) {
        void useSubscriptionStore.getState().syncSubscriptionWithProfile(data.session.user.id);
        void get().fetchProfile();
      }
    }
    set({ loading: false });
    return { error, session: data?.session ?? null };
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });

    // Reject disposable emails immediately
    const check = validateEmailAddress(email);
    if (check.isDisposable) {
      set({ loading: false });
      return {
        error: {
          name: 'AuthError',
          message:
            'Akun dengan penyedia email sementara (disposable/temp email) dinonaktifkan. Silakan gunakan akun dengan email resmi.',
        } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      set({ session: data.session, user: data.session.user });
      if (data.session.user) {
        void useSubscriptionStore.getState().syncSubscriptionWithProfile(data.session.user.id);
        void get().fetchProfile();
      }
    }
    set({ loading: false });
    return { error };
  },

  signOut: async () => {
    cleanupProfileRealtime();
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, loading: false });
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
    if (session?.user) {
      void get().fetchProfile();
    } else {
      set({ profile: null });
    }
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, plan_tier, subscription_status, credits_balance, created_at, updated_at')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        set({ profile: data as UserProfile });
      }
    } catch (err) {
      console.warn('Failed to fetch profile', err);
    }
  },

  updateDisplayName: async (displayName: string) => {
    const user = get().user;
    if (!user) return { error: new Error('User tidak terautentikasi') };
    const cleanName = displayName.trim();
    if (!cleanName) return { error: new Error('Nama tampilan tidak boleh kosong') };

    try {
      // 1. Update Supabase Auth metadata
      const { data: authData, error: authErr } = await supabase.auth.updateUser({
        data: { display_name: cleanName },
      });
      if (authErr) return { error: authErr };

      // 2. Update profiles table
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({
          display_name: cleanName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (dbErr) return { error: dbErr };

      // 3. Update local store state
      set((state) => ({
        user: authData.user ?? state.user,
        profile: state.profile ? { ...state.profile, display_name: cleanName } : null,
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  updatePassword: async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { error: new Error('Kata sandi minimal 6 karakter.') };
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },
}));
