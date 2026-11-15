import type {
  ContextProfile,
  ContextProfilePreset,
  Scene,
} from '@/types';
import { DEFAULT_CONTEXT_PROFILE, CONTEXT_PRESETS } from './default-profile';

/**
 * ============================================================================
 * CONTEXT RESOLVER
 * ============================================================================
 *
 * Resolves context hierarchy:
 * Default Profile -> Project Overrides -> Scene Overrides
 *
 * Ensures technical prompts are always in English, while dialog/caption can be
 * Indonesian or other specified languages.
 */

export function resolveContextProfile(
  preset: ContextProfilePreset = 'indonesia_natural',
  projectOverrides?: Partial<Omit<ContextProfile, 'id' | 'overrides'>>,
  sceneOverrides?: Partial<Omit<ContextProfile, 'id' | 'overrides'>>
): ContextProfile {
  const base = CONTEXT_PRESETS[preset] || DEFAULT_CONTEXT_PROFILE;

  const mergedLocalization = {
    ...base.localization,
    ...(projectOverrides?.localization || {}),
    ...(sceneOverrides?.localization || {}),
  };

  const resolved: ContextProfile = {
    ...base,
    ...(projectOverrides || {}),
    ...(sceneOverrides || {}),
    localization: mergedLocalization,
    promptLanguage: 'en', // strictly English for technical image/video AI prompts
  };

  return resolved;
}

/**
 * Compiles a rich instruction block for LLM prompts (Gemini, Claude, GPT, etc.)
 * embedding the 9 Core Context Rules.
 */
export function buildContextSystemInstructions(profile: ContextProfile): string {
  const loc = profile.localization;
  return `
[CONTEXT ENGINE INSTRUCTIONS - MANDATORY]
Target Market: ${profile.targetMarket}
Preset Mode: ${profile.preset}
Primary Environment: ${profile.environment} (Mixed means natural variety across scenes, NOT chaotic jumping)
Visual Aesthetic: ${profile.visualStyle.replace(/_/g, ' ')}
Dialogue Language: ${profile.dialogLanguage}
Caption Language: ${profile.captionLanguage}
Technical Visual Prompt Language: ${profile.promptLanguage.toUpperCase()} (STRICTLY ENGLISH)
Regional Anchor: ${loc.region}
Naming Convention: ${loc.namingConvention}

[NINE GOLDEN RULES OF CONTEXT AUTHENTICITY]:
1. DO NOT force Jakarta as the default setting for every story unless specifically requested.
2. DO NOT casually insert stereotype tokens (warung, motor bebek, gang sempit, gerobak) unless narratively necessary.
3. Select environments organically based on narrative purpose (modern office, quiet coastline, cafe, suburban street, etc.).
4. If a specific province/city is chosen, use accurate and verifiable landmarks/customs without stereotyping.
5. Do not generalize culture, social strata, or religious habits of the Indonesian population.
6. When analyzing photo references, describe only objective visible traits (clothing, silhouette, hair, posture, lighting); never speculate on ethnicity or sensitive demographics.
7. Fictional, sci-fi, historical, or fantasy genres may use non-Indonesian or imaginary settings while respecting dialog preferences.
8. Project and scene level overrides possess absolute priority over base presets.
9. Context Engine guidance applies from premise conception all the way to final prompt generation.

[CULTURAL FIDELITY GUIDELINES]:
${loc.culturalNotes.map((note) => `- ${note}`).join('\n')}
`.trim();
}

/**
 * Validates whether a scene respects the resolved context profile.
 */
export function validateSceneContext(
  scene: Scene,
  _profile: ContextProfile
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Rule 2 Check: detect suspicious forced stereotype tropes in prompt
  const stereotypeTropeRegex = /\b(warung indomie|motor bebek berkarat|gang becek kumuh|kaki lima kumal)\b/i;
  if (
    stereotypeTropeRegex.test(scene.summary) ||
    stereotypeTropeRegex.test(scene.imagePrompt)
  ) {
    warnings.push(
      `Adegan ${scene.sceneNumber}: Terdeteksi kemungkinan token stereotip lokal yang dipaksakan. Pastikan elemen ini relevan dengan alur cerita.`
    );
  }

  // Language check: image prompt should be in English
  const indonesianWordsInPromptRegex = /\b(seorang|dengan|memakai|berjalan|melihat|pencahayaan|kamera)\b/i;
  if (indonesianWordsInPromptRegex.test(scene.imagePrompt)) {
    warnings.push(
      `Adegan ${scene.sceneNumber}: Image prompt terdeteksi memuat kata Bahasa Indonesia. Prompt teknis wajib berbahasa Inggris.`
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
