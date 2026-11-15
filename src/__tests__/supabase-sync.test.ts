import { describe, it, expect } from 'vitest';
import {
  SUPABASE_PROJECT_REF,
  SUPABASE_DEFAULT_URL,
  isSupabaseConfigured,
  getSupabaseConfig,
  syncProjectToSupabase,
} from '../lib/supabase';
import { DEFAULT_CONTEXT_PROFILE } from '../context-engine';
import type { Project } from '@/types';

describe('Supabase Database Client & Sync', () => {
  it('should be pre-configured with project ref uoxoljiucezwdpqfnuga', () => {
    expect(SUPABASE_PROJECT_REF).toBe('uoxoljiucezwdpqfnuga');
    expect(SUPABASE_DEFAULT_URL).toBe('https://uoxoljiucezwdpqfnuga.supabase.co');

    const config = getSupabaseConfig();
    expect(config.projectRef).toBe('uoxoljiucezwdpqfnuga');
    expect(config.url).toBe('https://uoxoljiucezwdpqfnuga.supabase.co');
  });

  it('should safely guard when anon key is not set', async () => {
    const sampleProject: Project = {
      id: 'proj-sync-test',
      userId: 'user-sync-test',
      name: 'Sync Test Project',
      categoryId: 'time-travel',
      contextProfile: DEFAULT_CONTEXT_PROFILE,
      characters: [],
      scenes: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const result = await syncProjectToSupabase(sampleProject);
      expect(result.success).toBe(false);
      expect(result.error).toBe('SUPABASE_UNCONFIGURED');
    }
  });
});
