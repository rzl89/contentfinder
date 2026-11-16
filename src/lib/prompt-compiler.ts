import type { Scene, Project, CharacterBible, WorldBible } from '@/types';
import { getModelCapability } from './model-catalog';

/**
 * ============================================================================
 * PROMPT COMPILER & EXPORT ENGINE
 * ============================================================================
 *
 * Compiles rich scene data into model-specific prompts adhering strictly to
 * vendor capability parameters without injecting hallucinated flags.
 */

export interface CompiledScenePrompts {
  sceneNumber: number;
  beatTitle: string;
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  dialogueQuote?: string;
  audioInstruction?: string;
  technicalMetadata: {
    targetModel: string;
    aspectRatio?: string;
    cameraMovement?: string;
  };
}

/**
 * Compiles a single scene for a specified target model.
 */
export function compileScenePrompt(
  scene: Scene,
  targetModelId: string = 'universal-neutral',
  characters: CharacterBible[] = [],
  _worldBible?: WorldBible
): CompiledScenePrompts {
  const model = getModelCapability(targetModelId);

  const charDetails = characters
    .map((c) => `${c.name}: ${c.appearance}, wearing ${c.clothing}`)
    .join('; ');

  // Pull voiceStyle from the first character (primary speaker)
  const primaryVoiceStyle = characters[0]?.voiceStyle;

  // Base English Visual description
  const visualContext = [
    `Setting: ${scene.location.description}, ${scene.location.timeOfDay}, ${scene.location.weather}.`,
    scene.characterActions ? `Subject action: ${scene.characterActions}.` : '',
    charDetails ? `Characters involved (${charDetails}).` : '',
    scene.props.length > 0 ? `Key props: ${scene.props.join(', ')}.` : '',
    `Camera framing: ${scene.camera.shot}, ${scene.camera.angle} angle, ${scene.camera.framing}.`,
    `Lighting: ${scene.lighting}.`,
    scene.continuityAnchors.length > 0
      ? `Visual continuity: ${scene.continuityAnchors.join(', ')}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  // 1. Image Prompt (One still frame, composition, texture, lighting)
  let compiledImagePrompt = `Cinematic still shot. ${visualContext} Ultra-detailed textures, photorealistic depth of field, balanced color grading.`;

  // 2. Video Prompt (Action sequence, camera movement, timing)
  let compiledVideoPrompt = `Cinematic sequence. Camera movement: ${scene.camera.movement}. ${scene.characterActions}. Smooth motion cadence, natural physical momentum in ${scene.location.description}.`;

  // 3. Audio & Dialogue instructions tailored to model capability
  let audioInstruction: string | undefined = undefined;
  if (scene.dialogue?.trim()) {
    const voiceNote = primaryVoiceStyle ? ` [Karakter suara: ${primaryVoiceStyle}]` : '';
    if (model.dialogueLipSync === true) {
      audioInstruction = `Spoken dialogue (exact): "${scene.dialogue}"${voiceNote}`;
      compiledVideoPrompt += ` Character speaks line: "${scene.dialogue}".`;
    } else {
      audioInstruction = `Dialogue to be dubbed in post-production: "${scene.dialogue}"${voiceNote}`;
    }
  }

  // Model-specific syntax formatting (Strict vendor syntax adherence)
  if (targetModelId === 'kling-1-5') {
    // Kling format: prefers explicit camera direction prefix
    compiledVideoPrompt = `[Camera: ${scene.camera.movement}] ${compiledVideoPrompt}`;
  } else if (targetModelId === 'luma-dream-machine') {
    // Luma format: movement speed & cinematic clarity
    compiledVideoPrompt = `${compiledVideoPrompt} Smooth tracking shot, photorealistic rendering, accurate momentum.`;
  } else if (targetModelId === 'google-veo-2') {
    // Veo 2 format: high-fidelity prompt
    compiledVideoPrompt = `High-definition cinematic capture: ${compiledVideoPrompt}`;
  } else if (targetModelId === 'runway-gen3') {
    // Runway Gen-3 format: continuous motion vectors and cinematic physical momentum
    compiledVideoPrompt = `${compiledVideoPrompt} Photorealistic motion, continuous dynamic vector, 4k master.`;
  }

  return {
    sceneNumber: scene.sceneNumber,
    beatTitle: scene.beatTitle,
    imagePrompt: scene.imagePrompt || compiledImagePrompt,
    videoPrompt: scene.videoPrompt || compiledVideoPrompt,
    negativePrompt:
      scene.negativePrompt ||
      'blurry, plastic skin, oversaturated, deformed hands, extra fingers, mutated limbs, text artifacts, watermark, low quality, glitch',
    dialogueQuote: scene.dialogue,
    audioInstruction,
    technicalMetadata: {
      targetModel: model.displayName,
      cameraMovement: scene.camera.movement,
    },
  };
}

/**
 * Compiles all scenes in a project.
 */
export function compileProjectPrompts(
  project: Project,
  targetModelId?: string
): CompiledScenePrompts[] {
  const modelId = targetModelId || project.targetModel || 'universal-neutral';
  return project.scenes.map((scene) =>
    compileScenePrompt(scene, modelId, project.characters, project.worldBible)
  );
}

/**
 * Generates Markdown / Plaintext Production Sheet for export.
 */
export function exportProductionSheetMarkdown(project: Project): string {
  const model = getModelCapability(project.targetModel || 'universal-neutral');
  const compiledScenes = compileProjectPrompts(project);

  const lines: string[] = [];

  lines.push(`# FIXPROM — PRODUCTION SHEET`);
  lines.push(`**Project Name:** ${project.name}`);
  lines.push(`**Created:** ${new Date(project.createdAt).toLocaleDateString('id-ID')}`);
  lines.push(`**Target Model:** ${model.displayName} (${model.provider})`);
  lines.push(`**Category:** ${project.categoryId}`);
  lines.push(`**Context Preset:** ${project.contextProfile.name} (${project.contextProfile.preset})`);
  lines.push(`**Target Market:** ${project.contextProfile.targetMarket}`);
  lines.push('');

  if (project.selectedIdea) {
    lines.push(`## 💡 SELECTED CONCEPT`);
    lines.push(`**Title:** ${project.selectedIdea.title}`);
    lines.push(`**Hook (1-3s):** ${project.selectedIdea.hook}`);
    lines.push(`**Premise:** ${project.selectedIdea.premise}`);
    lines.push(`**Synopsis:** ${project.selectedIdea.synopsis}`);
    lines.push(`**Ending / Payoff:** ${project.selectedIdea.ending}`);
    lines.push('');
  }

  if (project.characters.length > 0) {
    lines.push(`## 👤 CHARACTER BIBLE`);
    project.characters.forEach((char) => {
      lines.push(`### ${char.name} (${char.role})`);
      lines.push(`- **Penampilan:** ${char.appearance}`);
      lines.push(`- **Pakaian:** ${char.clothing}`);
      lines.push(`- **Kepribadian:** ${char.personality}`);
      if (char.voiceStyle) {
        lines.push(`- **🎙️ Karakter Suara:** ${char.voiceStyle}`);
      }
      if (char.consistencyAnchors?.length > 0) {
        lines.push(`- **Jangkar Konsistensi:** ${char.consistencyAnchors.join('; ')}`);
      }
      lines.push('');
    });
  }

  if (project.worldBible) {
    lines.push(`## 🌍 WORLD / ENVIRONMENT BIBLE`);
    lines.push(`- **Nama Setting:** ${project.worldBible.name}`);
    lines.push(`- **Tipe Lingkungan:** ${project.worldBible.environmentType}`);
    lines.push(`- **Deskripsi:** ${project.worldBible.description}`);
    lines.push(`- **Mood & Tone:** ${project.worldBible.moodAndTone}`);
    lines.push(`- **Pencahayaan & Waktu:** ${project.worldBible.timeOfDay}, ${project.worldBible.weather}`);
    lines.push('');
  }

  lines.push(`## 🎬 SCENE-BY-SCENE STORYBOARD & PROMPTS`);
  lines.push(`Total Scenes: ${compiledScenes.length}`);
  lines.push('');

  compiledScenes.forEach((s) => {
    lines.push(`---`);
    lines.push(`### Scene ${s.sceneNumber}: ${s.beatTitle}`);
    lines.push('');
    lines.push(`**📸 Image Prompt (Midjourney / Flux / Ideogram):**`);
    lines.push(`\`\`\``);
    lines.push(s.imagePrompt);
    lines.push(`\`\`\``);
    lines.push('');
    lines.push(`**🎥 Video Prompt (${model.displayName}):**`);
    lines.push(`\`\`\``);
    lines.push(s.videoPrompt);
    lines.push(`\`\`\``);
    lines.push('');
    if (s.dialogueQuote) {
      lines.push(`**💬 Dialog Kanonis (Bahasa Indonesia):** "${s.dialogueQuote}"`);
    }
    if (s.audioInstruction) {
      lines.push(`**🔊 Audio Direction:** ${s.audioInstruction}`);
    }
    lines.push(`**🚫 Negative Prompt:** \`${s.negativePrompt}\``);
    lines.push('');
  });

  lines.push(`---`);
  lines.push(`*Generated by Fixprom — AI Content Idea & Prompt Studio*`);

  return lines.join('\n');
}

/**
 * Exports clean structured JSON without credentials or secret keys.
 */
export function exportProjectJSON(project: Project): string {
  // Deep clone and clean
  const cleanProject = JSON.parse(JSON.stringify(project));

  // Double check that no token or secret accidentally sits on the object
  delete cleanProject.credentials;
  delete cleanProject.apiKey;

  return JSON.stringify(cleanProject, null, 2);
}
