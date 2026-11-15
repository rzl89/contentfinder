import { describe, it, expect } from 'vitest';
import { runQualityControl } from '../lib/qc-engine';
import type { Scene } from '@/types';

describe('Quality Control (QC) Engine', () => {
  const validScene1: Scene = {
    id: 's-1',
    projectId: 'p-1',
    sceneNumber: 1,
    beatTitle: 'Opening',
    purpose: 'Hook',
    summary: 'A researcher finds an old map in a cafe.',
    location: {
      environmentType: 'indoor',
      description: 'Coffee shop corner with soft daylight',
      timeOfDay: 'Morning daylight',
      weather: 'Sunny',
    },
    characterActions: 'Opens a notebook.',
    props: ['Notebook'],
    camera: { shot: 'Medium', angle: 'Eye-level', movement: 'Static', framing: 'Center' },
    lighting: 'Soft daylight',
    continuityAnchors: ['Blue shirt'],
    imagePrompt: 'Cinematic morning photo in modern coffee shop.',
    videoPrompt: 'Camera slowly pans over the table.',
    negativePrompt: 'blurry',
    locked: false,
  };

  const validScene2: Scene = {
    ...validScene1,
    id: 's-2',
    sceneNumber: 2,
    beatTitle: 'Discovery',
    summary: 'A strange text appears on the screen.',
  };

  it('should PASS when scenes are sequential and valid', () => {
    const qc = runQualityControl({
      scenes: [validScene1, validScene2],
      expectedSceneCount: 2,
      targetModelId: 'universal-neutral',
    });

    expect(qc.overallStatus).toBe('PASS');
    expect(qc.issues.length).toBe(0);
  });

  it('should FAIL when scene count does not match expected target', () => {
    const qc = runQualityControl({
      scenes: [validScene1],
      expectedSceneCount: 4,
    });

    expect(qc.overallStatus).toBe('FAIL');
    expect(qc.issues.some((i) => i.field === 'sceneCount')).toBe(true);
  });

  it('should FAIL on duplicate scene numbers', () => {
    const duplicateScene = { ...validScene2, sceneNumber: 1 };
    const qc = runQualityControl({
      scenes: [validScene1, duplicateScene],
    });

    expect(qc.overallStatus).toBe('FAIL');
    expect(qc.issues.some((i) => i.field.includes('duplicate'))).toBe(true);
  });

  it('should FAIL on direct time-of-day contradiction between image and video prompt', () => {
    const contradictingScene: Scene = {
      ...validScene1,
      imagePrompt: 'Dark midnight night scene under starlight.',
      videoPrompt: 'Shot in bright sunny noon with midday sun overhead.',
    };

    const qc = runQualityControl({
      scenes: [contradictingScene],
    });

    expect(qc.overallStatus).toBe('FAIL');
    expect(qc.issues.some((i) => i.field.includes('promptContradiction'))).toBe(true);
  });
});
