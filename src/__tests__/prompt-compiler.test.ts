import { describe, it, expect } from 'vitest';
import {
  compileScenePrompt,
  exportProductionSheetMarkdown,
  exportProjectJSON,
} from '../lib/prompt-compiler';
import { DEFAULT_CONTEXT_PROFILE } from '../context-engine';
import type { Scene, Project } from '@/types';

describe('Prompt Compiler & Exporter', () => {
  const sampleScene: Scene = {
    id: 's-1',
    projectId: 'p-1',
    sceneNumber: 1,
    beatTitle: 'Discovery of the Ancient Compass',
    purpose: 'Hook viewer within 2 seconds',
    summary: 'Rian uncovers a brass instrument in the library.',
    location: {
      environmentType: 'indoor',
      description: 'Dimly lit university archive with tall oak bookshelves',
      timeOfDay: 'Evening twilight',
      weather: 'Rain outside misty windows',
    },
    characterActions: 'Rian gently picks up the brass compass and inspects the dial.',
    props: ['Brass ancient compass', 'Magnifying glass'],
    dialogue: 'Simbol ini... persis dengan yang ada di peta kakek.',
    narration: 'Beberapa rahasia memang ditakdirkan untuk ditemukan.',
    camera: {
      shot: 'Close-Up',
      angle: 'Low-angle looking up',
      movement: 'Slow push-in',
      framing: 'Centrally composed',
    },
    lighting: 'Soft warm desk lamp amber glow with deep shadows',
    continuityAnchors: ['Rian wears dark grey cotton overshirt', 'Vintage leather wristwatch'],
    imagePrompt: '',
    videoPrompt: '',
    negativePrompt: 'blurry, low quality, artifacts',
    locked: false,
  };

  const sampleProject: Project = {
    id: 'proj-test-1',
    userId: 'user-1',
    name: 'Nusantara Relic Chronicles',
    categoryId: 'time-travel',
    contextProfile: DEFAULT_CONTEXT_PROFILE,
    characters: [
      {
        id: 'c-1',
        projectId: 'p-1',
        name: 'Rian',
        role: 'Protagonist',
        appearance: '26 year old man, neat wavy hair',
        clothing: 'Dark grey cotton overshirt',
        personality: 'Curious researcher',
        consistencyAnchors: ['Dark grey overshirt'],
      },
    ],
    scenes: [sampleScene],
    status: 'draft',
    createdAt: '2025-02-15T12:00:00Z',
    updatedAt: '2025-02-15T12:00:00Z',
  };

  it('should compile standardized English visual prompts from structured scene data', () => {
    const compiled = compileScenePrompt(sampleScene, 'universal-neutral', sampleProject.characters);

    expect(compiled.sceneNumber).toBe(1);
    expect(compiled.beatTitle).toBe('Discovery of the Ancient Compass');
    expect(compiled.imagePrompt).toContain('Cinematic still shot');
    expect(compiled.imagePrompt).toContain('archive');
    expect(compiled.videoPrompt).toContain('Slow push-in');
    expect(compiled.dialogueQuote).toBe('Simbol ini... persis dengan yang ada di peta kakek.');
  });

  it('should inject model-specific verified formatting for Kling', () => {
    const compiledKling = compileScenePrompt(sampleScene, 'kling-1-5', sampleProject.characters);
    expect(compiledKling.videoPrompt).toContain('[Camera: Slow push-in]');
  });

  it('should generate a complete Markdown production sheet', () => {
    const sheet = exportProductionSheetMarkdown(sampleProject);

    expect(sheet).toContain('# FIXPROM — PRODUCTION SHEET');
    expect(sheet).toContain('Nusantara Relic Chronicles');
    expect(sheet).toContain('CHARACTER BIBLE');
    expect(sheet).toContain('Rian');
    expect(sheet).toContain('SCENE-BY-SCENE STORYBOARD');
    expect(sheet).toContain('Simbol ini... persis dengan yang ada di peta kakek.');
  });

  it('should export clean JSON without sensitive credentials or keys', () => {
    const jsonStr = exportProjectJSON(sampleProject);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.name).toBe('Nusantara Relic Chronicles');
    expect(parsed.credentials).toBeUndefined();
    expect(parsed.apiKey).toBeUndefined();
  });
});
