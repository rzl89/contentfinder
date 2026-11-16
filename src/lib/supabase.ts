import { createClient } from '@supabase/supabase-js';
import type { Project, ContentIdea } from '@/types';

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
export const SUPABASE_DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveG9saml1Y2V6d2RwcWZudWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NTM4NzQsImV4cCI6MjExMDMyOTg3NH0.KR2gmO2jx0rQ4msUcFZmct9_eMzeLyqImUADqlnLWfo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  };
}

/**
 * Saves or updates a project in Supabase database.
 * Requires an authenticated user — skips silently for guests.
 */
export async function syncProjectToSupabase(project: Project): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'SUPABASE_UNCONFIGURED' };
  }

  try {
    // Require a real authenticated user — FK to profiles.id must be a valid UUID
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) {
      // Guest user: project lives in localStorage only, no DB write needed
      return { success: false, error: 'NOT_AUTHENTICATED' };
    }

    // Ensure project id is a valid UUID (Postgres uuid column rejects string slugs)
    const dbId = UUID_REGEX.test(project.id) ? project.id : crypto.randomUUID();

    const { error } = await supabase.from('projects').upsert(
      {
        id: dbId,
        user_id: userId,
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

// ─── PERSISTENT IDEA MEMORY (SUPABASE + LOCAL CACHE) ─────────────────────────

const LOCAL_IDEA_MEMORY_KEY = 'fixprom_recent_ideas_v1';

export interface RecentIdeaMemory {
  title: string;
  hook: string;
  premise: string;
  categoryId?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saves newly generated ideas to Supabase public.ideas and updates local memory.
 */
export async function saveIdeasToSupabase(
  ideas: ContentIdea[],
  projectId?: string
): Promise<{ success: boolean; savedCount: number; error?: string }> {
  if (!ideas || ideas.length === 0) return { success: true, savedCount: 0 };

  // Always update local persistent memory for immediate cross-request awareness
  try {
    const existingRaw = localStorage.getItem(LOCAL_IDEA_MEMORY_KEY);
    const existing: RecentIdeaMemory[] = existingRaw ? JSON.parse(existingRaw) : [];
    const newItems: RecentIdeaMemory[] = ideas.map((i) => ({
      title: i.title,
      hook: i.hook,
      premise: i.premise,
      categoryId: i.categoryId,
    }));
    // Keep most recent 50
    const merged = [...newItems, ...existing].slice(0, 50);
    localStorage.setItem(LOCAL_IDEA_MEMORY_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Could not cache ideas locally:', e);
  }

  if (!isSupabaseConfigured()) {
    return { success: true, savedCount: ideas.length };
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) {
      // Guest or unauthenticated user: safely cached in localStorage
      return { success: true, savedCount: ideas.length };
    }

    // Verify if projectId is a valid UUID and exists in DB
    let validProjectId: string | null = null;
    if (projectId && UUID_REGEX.test(projectId)) {
      const { data: projExists } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();
      if (projExists) {
        validProjectId = projectId;
      }
    }

    const rowsToInsert = ideas.map((idea) => {
      // Ensure id is a valid UUID for postgres uuid column
      const dbId = UUID_REGEX.test(idea.id) ? idea.id : crypto.randomUUID();
      return {
        id: dbId,
        project_id: validProjectId,
        user_id: userId,
        title: idea.title,
        hook: idea.hook,
        premise: idea.premise,
        synopsis: idea.synopsis || idea.premise || '',
        story_beats: idea.storyBeats || [],
        conflict: idea.conflict || '',
        ending: idea.ending || '',
        estimated_duration: idea.estimatedDuration || '30-60s',
        visual_style: idea.visualStyle || 'cinematic_realistic',
        suggested_location: idea.suggestedLocation || '',
        localization_notes: idea.localizationNotes || '',
        creative_rationale: idea.creativeRationale || '',
        trend_evidence: idea.trendEvidence || null,
        category_id: idea.categoryId,
        subcategory_id: idea.subcategoryId || null,
        is_favorite: false,
        created_at: idea.createdAt || new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('ideas').insert(rowsToInsert);
    if (error) {
      console.warn('Supabase save ideas error:', error.message);
      return { success: false, savedCount: 0, error: error.message };
    }

    return { success: true, savedCount: ideas.length };
  } catch (err: any) {
    console.warn('Error saving ideas to Supabase:', err);
    return { success: false, savedCount: 0, error: err.message };
  }
}

/**
 * Fetches recent ideas to provide memory context to the AI generator.
 */
export async function fetchRecentIdeasFromSupabase(
  categoryId?: string,
  limit = 20
): Promise<RecentIdeaMemory[]> {
  const memoryList: RecentIdeaMemory[] = [];

  // 1. Fetch from Supabase if user authenticated
  if (isSupabaseConfigured()) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user?.id) {
        let query = supabase
          .from('ideas')
          .select('title, hook, premise, category_id')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          for (const row of data) {
            memoryList.push({
              title: row.title,
              hook: row.hook,
              premise: row.premise,
              categoryId: row.category_id,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to read recent ideas from Supabase:', e);
    }
  }

  // 2. Supplement from local memory cache
  try {
    const raw = localStorage.getItem(LOCAL_IDEA_MEMORY_KEY);
    if (raw) {
      const localItems: RecentIdeaMemory[] = JSON.parse(raw);
      for (const item of localItems) {
        if (!categoryId || item.categoryId === categoryId) {
          const alreadyExists = memoryList.some(
            (m) => m.title.toLowerCase() === item.title.toLowerCase()
          );
          if (!alreadyExists && memoryList.length < limit) {
            memoryList.push(item);
          }
        }
      }
    }
  } catch (e) {
    // Ignore local parse error
  }

  return memoryList.slice(0, limit);
}
