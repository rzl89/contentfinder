import { describe, it, expect } from 'vitest';
import {
  CONTENT_CATEGORIES,
  getCategoryById,
  getCategoriesByGroup,
  searchCategories,
  DEFAULT_CONTEXT_PROFILE,
  CONTEXT_PRESETS,
  resolveContextProfile,
  buildContextSystemInstructions,
  validateSceneContext,
} from '../index';
import type { Scene } from '@/types';

describe('Context Engine & Categories Catalog', () => {
  it('should have exactly 31 unique content categories', () => {
    expect(CONTENT_CATEGORIES.length).toBe(31);

    const ids = CONTENT_CATEGORIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(31);
  });

  it('every category should have unique creative frameworks and hooks', () => {
    CONTENT_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.creativeFramework).toBeTruthy();
      expect(cat.hookStyle).toBeTruthy();
      expect(cat.visualGuidance).toBeTruthy();
      expect(cat.subcategories.length).toBeGreaterThan(0);
      expect(cat.exampleIdeas.length).toBeGreaterThan(0);
    });

    // Ensure they don't share identical creative framework templates
    const frameworks = new Set(CONTENT_CATEGORIES.map((c) => c.creativeFramework));
    expect(frameworks.size).toBe(31);
  });

  it('should retrieve category by id and search correctly', () => {
    const timeTravel = getCategoryById('time-travel');
    expect(timeTravel).toBeDefined();
    expect(timeTravel?.name).toContain('Perjalanan Waktu');

    const storytellingCategories = getCategoriesByGroup('Storytelling & Entertainment');
    expect(storytellingCategories.length).toBe(6);

    const searchResults = searchCategories('stickman');
    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults[0].id).toBe('stickman');
  });

  it('should provide default Indonesia Natural profile with required configuration', () => {
    expect(DEFAULT_CONTEXT_PROFILE.targetMarket).toBe('Indonesia');
    expect(DEFAULT_CONTEXT_PROFILE.preset).toBe('indonesia_natural');
    expect(DEFAULT_CONTEXT_PROFILE.promptLanguage).toBe('en');
    expect(DEFAULT_CONTEXT_PROFILE.dialogLanguage).toBe('indonesian');
    expect(DEFAULT_CONTEXT_PROFILE.localization.culturalNotes.length).toBeGreaterThan(0);
    expect(Object.keys(CONTEXT_PRESETS).length).toBe(6);
  });

  it('should resolve project and scene overrides correctly', () => {
    const resolved = resolveContextProfile('indonesia_natural', {
      environment: 'urban',
      visualStyle: '3d_animation',
    });

    expect(resolved.environment).toBe('urban');
    expect(resolved.visualStyle).toBe('3d_animation');
    expect(resolved.promptLanguage).toBe('en'); // Always English
  });

  it('should build rich instruction block containing the 9 golden rules', () => {
    const instructions = buildContextSystemInstructions(DEFAULT_CONTEXT_PROFILE);
    expect(instructions).toContain('NINE GOLDEN RULES');
    expect(instructions).toContain('DO NOT force Jakarta');
    expect(instructions).toContain('DO NOT casually insert stereotype tokens');
    expect(instructions).toContain('STRICTLY ENGLISH');
  });

  it('should validate scene context and flag Indonesian words in technical prompts', () => {
    const invalidScene: Scene = {
      id: 'sc-1',
      projectId: 'proj-1',
      sceneNumber: 1,
      beatTitle: 'Intro',
      purpose: 'Hook',
      summary: 'Seorang pria di warung indomie',
      location: {
        environmentType: 'urban',
        description: 'Street',
        timeOfDay: 'Morning',
        weather: 'Sunny',
      },
      characterActions: 'Walks',
      props: ['Bowl'],
      camera: { shot: 'Wide', angle: 'Eye-level', movement: 'Static', framing: 'Rule of thirds' },
      lighting: 'Natural',
      continuityAnchors: [],
      imagePrompt: 'Seorang pria berjalan di jalan dengan lighting cinematic',
      videoPrompt: 'Camera tracks man walking',
      negativePrompt: 'blurry',
      locked: false,
    };

    const validation = validateSceneContext(invalidScene, DEFAULT_CONTEXT_PROFILE);
    expect(validation.valid).toBe(false);
    expect(validation.warnings.length).toBeGreaterThanOrEqual(2); // flagged stereotype + indonesian in prompt
  });
});
