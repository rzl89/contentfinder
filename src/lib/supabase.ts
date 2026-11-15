import { createClient } from '@supabase/supabase-js';
import type { Project } from '@/types';

/**
 * ============================================================================
 * SUPABASE DATABASE CLIENT & PROJECT PERSISTENCE
 * ============================================================================
 *
 * Target Supabase Project Ref: uoxoljiucezwdpqfnuga
 * URL: https://uoxoljiucezwdpqfnuga.supabase.co
 */

export const SUPABASE_PROJECT_REF = 'uoxoljiucezwdpqfnuga';
export const SUPABASE_DEFAULT_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

function safeGetStorage(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  safeGetStorage('temporaforge_supabase_url') ||
  SUPABASE_DEFAULT_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  safeGetStorage('temporaforge_supabase_anon_key') ||
  '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-anon-key-placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 10);
}

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    projectRef: SUPABASE_PROJECT_REF,
    isConfigured: isSupabaseConfigured(),
    anonKeyMasked: supabaseAnonKey ? `...${supabaseAnonKey.slice(-6)}` : 'Belum dikonfigurasi',
  };
}

export function setSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    if (url) window.localStorage.setItem('temporaforge_supabase_url', url.trim());
    if (anonKey) window.localStorage.setItem('temporaforge_supabase_anon_key', anonKey.trim());
  }
}

/**
 * Saves or updates a project in Supabase database.
 */
export async function syncProjectToSupabase(project: Project): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'SUPABASE_UNCONFIGURED' };
  }

  try {
    const { error } = await supabase.from('projects').upsert(
      {
        id: project.id,
        user_id: project.userId || 'user_local_owner',
        name: project.name,
        description: project.description || '',
        category_id: project.categoryId,
        status: project.status,
        target_model: project.targetModel || 'universal-neutral',
        updated_at: project.updatedAt,
        // Store full project document payload in metadata jsonb column
        data: project,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Supabase project sync error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Loads all projects from Supabase database.
 */
export async function fetchProjectsFromSupabase(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('data')
      .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => row.data as Project).filter(Boolean);
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return [];
  }
}

/**
 * Deletes a project from Supabase database.
 */
export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    return !error;
  } catch {
    return false;
  }
}
