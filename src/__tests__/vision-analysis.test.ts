import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeReferenceImage } from '../lib/ai-generator';
import { calculateActionCredits } from '../stores/subscription-store';
import { compileScenePrompt, compileProjectPrompts, exportProductionSheetMarkdown } from '../lib/prompt-compiler';
import { DEFAULT_CONTEXT_PROFILE } from '../context-engine';
import type { Scene, Project, ProductVisionAnalysis, CharacterVisionAnalysis } from '@/types';

describe('Vision AI (GPT-6.1-Terra) Analysis & Pipeline', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleProductAnalysis: ProductVisionAnalysis = {
    productName: 'Lumina Smart Glasses',
    category: 'Wearable Tech',
    physicalDescription: 'Matte titanium frame with electrochromic lenses and minimal temple capacitive controls',
    colorPalette: ['#1A1A1A', '#0D9488', '#F59E0B'],
    keyVisualFeatures: ['Titanium unibody', 'Micro-LED indicator', 'Matte finish'],
    packagingStyle: 'Minimalist magnetic pull box with silver embossed logo',
    suggestedCameraAngles: ['Hero 45-degree close-up', 'Smooth 360-degree turntable'],
    midjourneyCrefParam: '--cref https://example.com/lumina.jpg --cw 100',
    i2vStartFrameInstruction: '[I2V Mode: First frame = product reference]',
    promptEnhancement: 'photorealistic titanium frame smart glasses with amber lens reflections and crisp studio rim light',
  };

  const sampleCharacterAnalysis: CharacterVisionAnalysis = {
    characterName: 'Aria',
    age: '25-28 years old',
    gender: 'Female',
    appearance: 'Sharp angular jawline, obsidian black hair in low ponytail, expressive hazel eyes',
    clothing: 'Tailored charcoal minimalist blazer over high-neck silk shell',
    hairStyle: 'Sleek low ponytail with loose front strands',
    distinctiveFeatures: ['Silver geometric ear cuff', 'Subtle scar near left eyebrow'],
    anchorDescription: '26yo woman with obsidian hair in sleek low ponytail, wearing tailored charcoal blazer and silver ear cuff',
    midjourneyCrefParam: '--cref https://example.com/aria.jpg --cw 100',
    i2vStartFrameInstruction: '[I2V Mode: Lock character face and outfit from reference image]',
    promptEnhancement: 'photorealistic character consistency lock, 26yo woman with sleek low ponytail in charcoal blazer',
  };

  const sampleScene: Scene = {
    id: 's-vision-1',
    projectId: 'p-1',
    sceneNumber: 1,
    beatTitle: 'Product Reveal',
    purpose: 'Hook viewer with product hero shot',
    summary: 'Aria unboxes the smart glasses.',
    location: {
      environmentType: 'indoor',
      description: 'Futuristic glass-walled studio with soft directional spotlight',
      timeOfDay: 'Evening twilight',
      weather: 'Clear',
    },
    characterActions: 'Aria places the glasses on the oak display pedestal.',
    props: ['Lumina Smart Glasses', 'Display pedestal'],
    dialogue: 'Masa depan ada di genggaman kita.',
    narration: 'Evolusi teknologi dimulai di sini.',
    camera: {
      shot: 'Close-Up',
      angle: 'Eye-level',
      movement: 'Slow push-in',
      framing: 'Centrally composed',
    },
    lighting: 'High-contrast studio rim light with soft specular reflections',
    continuityAnchors: ['Aria in charcoal blazer'],
    imagePrompt: '',
    videoPrompt: '',
    negativePrompt: 'blurry, distorted',
    locked: false,
  };

  it('calculateActionCredits should charge 1 credit for analyze_reference_image', () => {
    const calc = calculateActionCredits('analyze_reference_image');
    expect(calc.baseCost).toBe(1);
    expect(calc.totalCost).toBe(1);
    expect(calc.isExtended).toBe(false);
  });

  it('analyzeReferenceImage returns fallback structured analysis when offline or mocked', async () => {
    const result = await analyzeReferenceImage('https://images.unsplash.com/photo-product.jpg', 'product');

    expect(result).toBeDefined();
    expect(result.modelUsed).toBe('gpt-6.1-terra');
    expect(result.creditCost).toBe(1);
    expect(result.tokenUsage).toBeDefined();
    expect(result.tokenUsage.totalTokens).toBeGreaterThan(0);
    expect(result.tokenUsage.promptTokens).toBeGreaterThan(0);
    expect(result.tokenUsage.completionTokens).toBeGreaterThan(0);

    const prodAnalysis = result.analysis as ProductVisionAnalysis;
    expect(prodAnalysis.physicalDescription).toBeDefined();
    expect(prodAnalysis.promptEnhancement).toBeDefined();
  });

  it('analyzeReferenceImage handles character images correctly', async () => {
    const result = await analyzeReferenceImage('https://images.unsplash.com/photo-portrait.jpg', 'character');

    expect(result).toBeDefined();
    expect(result.modelUsed).toBe('gpt-6.1-terra');
    expect(result.creditCost).toBe(1);

    const charAnalysis = result.analysis as CharacterVisionAnalysis;
    expect(charAnalysis.anchorDescription).toBeDefined();
    expect(charAnalysis.clothing).toBeDefined();
  });

  it('compileScenePrompt injects vision prompt enhancements and continuity parameters', () => {
    const compiled = compileScenePrompt(
      sampleScene,
      'google-veo-3',
      [],
      undefined,
      ['https://example.com/lumina.jpg'],
      ['https://example.com/aria.jpg'],
      sampleProductAnalysis,
      sampleCharacterAnalysis
    );

    // Midjourney --cref injection
    expect(compiled.imagePrompt).toContain('--cref https://example.com/lumina.jpg --cw 100');
    expect(compiled.imagePrompt).toContain('--cref https://example.com/aria.jpg --cw 100');

    // Video prompt enhancement injection
    expect(compiled.videoPrompt).toContain('[I2V Mode: First frame = product reference]');
    expect(compiled.videoPrompt).toContain('[Character Lock: Consistent face and wardrobe from reference]');
    expect(compiled.videoPrompt).toContain(sampleProductAnalysis.promptEnhancement);
    expect(compiled.videoPrompt).toContain(sampleCharacterAnalysis.anchorDescription);
  });

  it('compileProjectPrompts properly propagates vision parameters across all project scenes', () => {
    const project: Project = {
      id: 'proj-vision-test',
      userId: 'user-1',
      name: 'Lumina Commercial Launch',
      categoryId: 'technology-explainer',
      contextProfile: DEFAULT_CONTEXT_PROFILE,
      characters: [],
      scenes: [sampleScene],
      productReferenceImages: ['https://example.com/lumina.jpg'],
      characterReferenceImages: ['https://example.com/aria.jpg'],
      productVisionAnalysis: sampleProductAnalysis,
      characterVisionAnalysis: sampleCharacterAnalysis,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const compiledList = compileProjectPrompts(project, 'kling-2-1');
    expect(compiledList.length).toBe(1);
    expect(compiledList[0].videoPrompt).toContain(sampleProductAnalysis.promptEnhancement);
    expect(compiledList[0].videoPrompt).toContain(sampleCharacterAnalysis.anchorDescription);
  });

  it('exportProductionSheetMarkdown outputs Vision AI (GPT-6.1-Terra) analysis section', () => {
    const project: Project = {
      id: 'proj-sheet-test',
      userId: 'user-1',
      name: 'Lumina Launch',
      categoryId: 'product-ad',
      contextProfile: DEFAULT_CONTEXT_PROFILE,
      characters: [],
      scenes: [sampleScene],
      productReferenceImages: ['https://example.com/lumina.jpg'],
      characterReferenceImages: ['https://example.com/aria.jpg'],
      productVisionAnalysis: sampleProductAnalysis,
      characterVisionAnalysis: sampleCharacterAnalysis,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const markdown = exportProductionSheetMarkdown(project);
    expect(markdown).toContain('VISION AI ANALYSIS (GPT-6.1-TERRA)');
    expect(markdown).toContain('Lumina Smart Glasses');
    expect(markdown).toContain(sampleProductAnalysis.physicalDescription);
    expect(markdown).toContain(sampleCharacterAnalysis.anchorDescription);
  });
});
