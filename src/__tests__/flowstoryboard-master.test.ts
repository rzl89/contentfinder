import { describe, it, expect } from 'vitest';
import {
  generateStoryboardImageJson,
  generateStoryboardVideoJson,
  validateStoryboardPackage,
  getProjectAnchorDescription,
} from '@/lib/prompt-compiler';
import type { Project } from '@/types';

describe('FlowStoryboard-Pro Universal Master Prompt Suite', () => {
  const sampleProject: Project = {
    id: 'proj_test_01',
    userId: 'user_01',
    name: 'Smart Glasses AI Spotlight',
    categoryId: 'tech-gadgets',
    contextProfile: {
      id: 'profile_id',
      name: 'Indonesia Natural',
      targetMarket: 'Indonesia',
      environment: 'urban',
      visualStyle: 'cinematic_realistic',
      dialogLanguage: 'indonesian',
      captionLanguage: 'id',
      promptLanguage: 'en',
      localization: {
        region: 'Indonesia',
        culturalNotes: [],
        namingConvention: 'indonesian_common',
        currency: 'IDR',
        typicalLandscapes: [],
      },
      preset: 'indonesia_natural',
    },
    selectedIdea: {
      id: 'idea_01',
      title: 'Smart Glasses AI Spotlight',
      hook: 'Detik 0-3: Kacamata pintar mendeteksi anomali di ruang gelap',
      premise: 'Seorang profesional menguji prototipe lensa AI mutakhir.',
      synopsis: 'Di koridor modern, lensa kacamata menampilkan data real-time dengan presisi.',
      storyBeats: ['Hook anomali', 'Aktivasi HUD', 'Navigasi visual', 'Puncak pengungkapan data'],
      conflict: 'Waktu menipis untuk mengungkap petunjuk tersembunyi.',
      ending: 'Data terenkripsi berhasil disinkronisasi.',
      estimatedDuration: '30-60s',
      visualStyle: 'cinematic_realistic',
      suggestedLocation: 'Modern lab interior with ambient lighting',
      localizationNotes: 'Konteks natural profesional tanpa stereotip.',
      creativeRationale: 'Retensi tinggi dengan visual HUD sinematik.',
      categoryId: 'tech-gadgets',
      saved: true,
      createdAt: new Date().toISOString(),
    },
    characters: [
      {
        id: 'char_01',
        projectId: 'proj_test_01',
        name: 'Arga Santoso',
        role: 'Protagonis Utama',
        appearance: 'Pria muda 26 tahun bertubuh atletis dengan potongan rambut rapi modern',
        clothing: 'Jaket overshirt katun abu-abu arang kanonis di atas kaos hitam',
        personality: 'Fokus, tenang, dan observatif',
        voiceStyle: 'Tenang, percaya diri, nada rendah',
        consistencyAnchors: [
          'Jaket overshirt abu-abu arang kanonis',
          'Kacamata pintar bingkai hitam matte tipis',
          'Jam tangan kulit cokelat di pergelangan tangan kiri',
        ],
      },
    ],
    scenes: [
      {
        id: 'scene_01',
        projectId: 'proj_test_01',
        sceneNumber: 1,
        beatTitle: 'Opening Hook: Deteksi Anomali',
        purpose: 'Stop scroll in 2s',
        summary: 'Lensa kacamata memancarkan pendar cyan lembut di ruang temaram.',
        location: {
          environmentType: 'urban',
          description: 'Modern glass atrium corridor',
          timeOfDay: 'Dusk',
          weather: 'Clear',
        },
        characterActions: 'Arga menoleh tajam ke arah kamera saat HUD kacamata menyala.',
        props: ['Smart Glasses'],
        dialogue: 'Sistem aktif. Semuanya siap.',
        camera: {
          shot: 'Close-Up',
          angle: 'Eye-level',
          movement: 'Slow push in',
          framing: 'Center framed',
        },
        lighting: 'Cool cyan key light with warm golden rim',
        continuityAnchors: ['Jaket katun abu-abu arang', 'Bingkai hitam kacamata'],
        imagePrompt: 'Cinematic close-up still of Arga wearing smart glasses in modern atrium.',
        videoPrompt: 'Camera slowly pushes into subject as HUD illuminates.',
        negativePrompt: 'blurry, low quality',
        locked: false,
      },
    ],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('1. builds an exact identical anchor description across image and video prompts', () => {
    const anchor = getProjectAnchorDescription(sampleProject);
    expect(anchor).toContain('Arga Santoso');
    expect(anchor).toContain('Jaket overshirt abu-abu arang kanonis');

    const imageJson = generateStoryboardImageJson(sampleProject);
    const videoJson = generateStoryboardVideoJson(sampleProject, imageJson);

    expect(imageJson.global_consistency.anchor_description).toBe(anchor);
    expect(videoJson.consistency_lock).toBe(anchor);
  });

  it('2. generates a valid 9-panel Storyboard Image Grid JSON (Code Block 1)', () => {
    const imageJson = generateStoryboardImageJson(sampleProject);

    expect(imageJson.task).toBe('9-panel storyboard grid, single image');
    expect(imageJson.grid_layout.total_panels).toBe(9);
    expect(imageJson.grid_layout.rows).toBe(3);
    expect(imageJson.grid_layout.columns).toBe(3);
    expect(imageJson.panels.length).toBe(9);

    // Each panel must contain the canonical anchor description for consistency
    imageJson.panels.forEach((p, idx) => {
      expect(p.panel).toBe(idx + 1);
      expect(p.description).toContain(imageJson.global_consistency.anchor_description);
    });

    // On-screen text rule: max 3 placements
    expect(imageJson.on_screen_text.placements.length).toBeLessThanOrEqual(3);
  });

  it('3. generates a valid 10-second Image-to-Video JSON (Code Block 2) with exact 10.0s timing', () => {
    const imageJson = generateStoryboardImageJson(sampleProject);
    const videoJson = generateStoryboardVideoJson(sampleProject, imageJson);

    expect(videoJson.duration_seconds).toBe(10);
    expect(videoJson.timeline.length).toBe(9);

    // Panels 1-8 each 1.1s, Panel 9 is 1.2s -> ending exactly at 10.0s
    expect(videoJson.timeline[0].time).toBe('0.0s-1.1s');
    expect(videoJson.timeline[7].time).toBe('7.7s-8.8s');
    expect(videoJson.timeline[8].time).toBe('8.8s-10.0s');

    // Voiceover total word limit constraint (<= 15 words)
    const allVoWords = videoJson.audio_design.voiceover.lines
      .map((l) => l.line)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean);
    expect(allVoWords.length).toBeLessThanOrEqual(15);
  });

  it('4. passes all Self-Validation Report checks with green PASS flags', () => {
    const imageJson = generateStoryboardImageJson(sampleProject);
    const videoJson = generateStoryboardVideoJson(sampleProject, imageJson);
    const report = validateStoryboardPackage(imageJson, videoJson);

    expect(report.timingTotal10s).toBe(true);
    expect(report.anchorConsistent).toBe(true);
    expect(report.ingredientRefsMatch).toBe(true);
    expect(report.styleAspectIdentical).toBe(true);
    expect(report.onScreenTextRuleCompliant).toBe(true);
    expect(report.voiceoverRuleCompliant).toBe(true);
  });
});
