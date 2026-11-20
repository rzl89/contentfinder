import type {
  Scene,
  Project,
  CharacterBible,
  WorldBible,
  StoryboardImagePromptJSON,
  StoryboardVideoPromptJSON,
  StoryboardValidationReport,
  StoryboardPanelItem,
  StoryboardTimelineEntry,
} from '@/types';
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
  _worldBible?: WorldBible,
  productReferenceImages?: string[]
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
  if (targetModelId === 'kling-1-5' || targetModelId === 'kling-2-1') {
    // Kling format: prefers explicit camera direction prefix
    compiledVideoPrompt = `[Camera: ${scene.camera.movement}] ${compiledVideoPrompt}`;
  } else if (targetModelId === 'luma-dream-machine' || targetModelId === 'luma-ray2-flash') {
    // Luma format: movement speed & cinematic clarity
    compiledVideoPrompt = `${compiledVideoPrompt} Smooth tracking shot, photorealistic rendering, accurate momentum.`;
  } else if (targetModelId === 'google-veo-2' || targetModelId === 'google-veo-3') {
    // Veo format: high-fidelity prompt
    compiledVideoPrompt = `High-definition cinematic capture: ${compiledVideoPrompt}`;
  } else if (targetModelId === 'runway-gen3' || targetModelId === 'runway-gen3-alpha' || targetModelId === 'runway-gen4-turbo') {
    // Runway format: continuous motion vectors and cinematic physical momentum
    compiledVideoPrompt = `${compiledVideoPrompt} Photorealistic motion, continuous dynamic vector, 4k master.`;
  } else if (targetModelId === 'minimax-hailuo' || targetModelId === 'minimax-video-01-live') {
    // MiniMax format: focus on physics realism and camera dynamics
    compiledVideoPrompt = `${compiledVideoPrompt} Photorealistic motion, natural physics momentum, cinema textures.`;
  } else if (targetModelId === 'openai-sora' || targetModelId === 'openai-sora-turbo') {
    // Sora format: detailed physical simulation & cinematography
    compiledVideoPrompt = `Cinematic video shot. ${compiledVideoPrompt} Fluid dynamics, accurate physical momentum, 8k render.`;
  } else if (targetModelId === 'pika-2-0' || targetModelId === 'pika-2-2') {
    // Pika format: camera motion parameter emphasis & focal lock
    compiledVideoPrompt = `${compiledVideoPrompt} -camera ${scene.camera.movement.toLowerCase()} -motion 2 -fps 24`;
  } else if (targetModelId === 'pixverse-v3' || targetModelId === 'pixverse-v4') {
    // PixVerse format: character consistency engine & 4K cinematic clarity
    compiledVideoPrompt = `${compiledVideoPrompt} High character consistency, 4K UHD, smooth cinematic frame transition.`;
  } else if (targetModelId === 'tencent-hunyuan' || targetModelId === 'hunyuan-turbo') {
    // Hunyuan format: rich descriptive text-to-video details
    compiledVideoPrompt = `Cinematic video: ${compiledVideoPrompt}. Realistic rendering, accurate temporal motion, rich texture details.`;
  } else if (targetModelId === 'wan-2-1') {
    // Wan format: Alibaba Wan 2.1 cinematic prompt structure
    compiledVideoPrompt = `Cinematic motion shot: ${compiledVideoPrompt}. High visual consistency, master cinematography, realistic physics.`;
  }

  let finalImagePrompt = scene.imagePrompt || compiledImagePrompt;
  let finalVideoPrompt = scene.videoPrompt || compiledVideoPrompt;

  // Append product reference continuity tags for affiliate & commercial ads
  if (productReferenceImages && productReferenceImages.length > 0) {
    const httpUrl = productReferenceImages.find((u) => typeof u === 'string' && u.startsWith('http'));
    if (httpUrl && !finalImagePrompt.includes('--cref')) {
      finalImagePrompt = `${finalImagePrompt} --cref ${httpUrl} --cw 100`;
    }
    if (!finalVideoPrompt.includes('[I2V Mode')) {
      finalVideoPrompt = `[I2V Mode: First frame = product reference] ${finalVideoPrompt}`;
    }
  }

  return {
    sceneNumber: scene.sceneNumber,
    beatTitle: scene.beatTitle,
    imagePrompt: finalImagePrompt,
    videoPrompt: finalVideoPrompt,
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
    compileScenePrompt(
      scene,
      modelId,
      project.characters,
      project.worldBible,
      project.productReferenceImages
    )
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

  if (project.productReferenceImages && project.productReferenceImages.length > 0) {
    lines.push(`## 📸 PRODUCT REFERENCE (IMAGE-TO-VIDEO & MIDJOURNEY CREF)`);
    project.productReferenceImages.forEach((imgUrl, i) => {
      lines.push(`- **Referensi #${i + 1}:** ${imgUrl.startsWith('data:') ? '[Base64 Local Image Attached]' : imgUrl}`);
    });
    lines.push(`- **Midjourney Parameter:** \`--cref ${project.productReferenceImages.find(u => !u.startsWith('data:')) || '[URL_GAMBAR]'} --cw 100\``);
    lines.push(`- **I2V Video Guidance:** Gunakan gambar produk sebagai First Frame / Start Image untuk mengunci logo dan bentuk fisik produk.`);
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
    lines.push(`**🎥 Video Prompt — Format: ${model.displayName} (${model.provider}):**`);
    if (model.modelId !== 'universal-neutral') {
      const formatHint: Record<string, string> = {
        'kling-1-5': '→ Paste langsung ke Kling AI · Prefix [Camera: ...] sudah diformat',
        'kling-2-1': '→ Paste langsung ke Kling 2.1 Pro · Prefix [Camera: ...] & face-ref ready',
        'google-veo-2': '→ Paste ke Google Flow / Veo 2 · Optimized untuk 4K optical realism',
        'google-veo-3': '→ Paste ke Google Flow / Veo 3 · Native dialogue, sfx & 4K cinematic capture',
        'runway-gen3-alpha': '→ Paste ke Runway Gen-3 Alpha · Format [Camera Movement / Framing]: sudah disiapkan',
        'runway-gen4-turbo': '→ Paste ke Runway Gen-4 Turbo · Format continuous motion vectors aktif',
        'luma-dream-machine': '→ Paste ke Luma Ray 2 · Camera motion paths sudah diformat',
        'luma-ray2-flash': '→ Paste ke Luma Ray 2 Flash · Fast camera tracking paths aktif',
        'minimax-hailuo': '→ Paste ke MiniMax Hailuo Video-01 · Micro-expression focus aktif',
        'minimax-video-01-live': '→ Paste ke MiniMax Video-01-Live · Subject & live expression focus aktif',
        'openai-sora': '→ Paste ke OpenAI Sora · 3D spatial consistency sudah diformat',
        'openai-sora-turbo': '→ Paste ke OpenAI Sora Turbo · Foley sound & 3D spatial consistency aktif',
        'pika-2-0': '→ Paste ke Pika 2.0 · Parameter -camera -motion -fps sudah diformat',
        'pika-2-2': '→ Paste ke Pika 2.2 · Parameter -camera -motion -fps & Pikaffects aktif',
        'pixverse-v3': '→ Paste ke PixVerse V3 Pro · Character consistency lock aktif',
        'pixverse-v4': '→ Paste ke PixVerse V4 Pro · 4K UHD & style-ref character lock aktif',
        'tencent-hunyuan': '→ Paste ke Tencent Hunyuan Video · Rich descriptive format aktif',
        'hunyuan-turbo': '→ Paste ke Hunyuan Video Turbo · High temporal motion consistency aktif',
        'wan-2-1': '→ Paste ke Alibaba Wan 2.1 · Master visual consistency & text-to-audio format aktif',
      };
      const hint = formatHint[model.modelId];
      if (hint) lines.push(`> ℹ️ ${hint}`);
    }
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

/**
 * ============================================================================
 * FLOWSTORYBOARD-PRO UNIVERSAL MASTER PROMPT GENERATOR & VALIDATOR
 * ============================================================================
 * Converts any project/story into standard 9-Panel Image Grid JSON (Code Block 1)
 * and 10-Second Image-to-Video JSON (Code Block 2).
 */

const DEFAULT_9_BEATS = [
  { beat: 'Opening Hook (0-2s)', shot_type: 'Close-Up / Wide Dynamic Hook', camera: 'Eye-level, 35mm lens' },
  { beat: 'Problem & Context', shot_type: 'Medium Shot', camera: 'Slow push in, 50mm lens' },
  { beat: 'Subject / Concept Reveal', shot_type: 'Wide Establishing Shot', camera: 'Crane down, 24mm anamorphic' },
  { beat: 'Core Feature & Interaction', shot_type: 'Macro / Detail Close-Up', camera: 'Tracking right, 85mm macro' },
  { beat: 'Escalation & Tension', shot_type: 'Medium Close-Up', camera: 'Dutch angle, 35mm lens' },
  { beat: 'Key Action & Discovery', shot_type: 'Dynamic Action Shot', camera: 'Handheld subtle tracking, 50mm' },
  { beat: 'Emotional Climax Moment', shot_type: 'Hero Close-Up', camera: 'Slow orbit around subject, 85mm f/1.4' },
  { beat: 'Payoff & Resolution', shot_type: 'Medium Wide Shot', camera: 'Smooth pull out, 35mm lens' },
  { beat: 'End Card & Call-To-Action', shot_type: 'Clean Hero Still / End-Card', camera: 'Static tripod, 50mm studio lighting' },
];

const DEFAULT_8_PLAYBOOK_BEATS = [
  { beat: 'Opener (Wide Establishing Shot)', shot_type: 'Wide Establishing Shot', camera: 'Eye-level 35mm, wide perspective', action: 'Introduce character, environment, goal, and key object', emotion: 'Excited' },
  { beat: 'Preparation (Medium Shot)', shot_type: 'Medium Shot', camera: 'Slow push in, 50mm lens', action: 'Character prepares, reveal necessary tools and setup', emotion: 'Focused' },
  { beat: 'First Action (Close-up)', shot_type: 'Close-Up', camera: 'Tactile close-up, 50mm lens', action: 'Process begins, visible progress achieved', emotion: 'Concentrated' },
  { beat: 'Transformation (Extreme Close-up)', shot_type: 'Extreme Close-Up', camera: 'Macro 85mm lens', action: 'Most visually satisfying moment, highlight transformation', emotion: 'Satisfied' },
  { beat: 'Progress (Medium Close-up)', shot_type: 'Medium Close-Up', camera: 'Over-the-shoulder, 50mm lens', action: 'Continue process, show clear improvement', emotion: 'Happy' },
  { beat: 'Creative Camera Angle (POV / Low Angle)', shot_type: 'Low Angle / Cinematic Perspective', camera: 'Engaging dynamic perspective', action: 'Unique technique reveal or dynamic angle', emotion: 'Amazed' },
  { beat: 'Final Step (Dramatic Close Shot)', shot_type: 'Close Dramatic Shot', camera: 'Dramatic shallow depth of field, 85mm f/1.4', action: 'Almost finished, build anticipation', emotion: 'Impressed' },
  { beat: 'Final Reveal (Wide Cinematic Shot)', shot_type: 'Wide Cinematic Shot', camera: 'Smooth pull-out tracking shot, 35mm lens', action: 'Show finished result, natural character reaction, strong satisfying ending', emotion: 'Accomplished' },
];

export function getProjectAnchorDescription(project: Project): string {
  if (project.characters && project.characters.length > 0) {
    const c = project.characters[0];
    const anchors = c.consistencyAnchors?.length ? c.consistencyAnchors.join(', ') : 'consistent canonical attire';
    return `${c.name}: ${c.appearance}. Wearing ${c.clothing}. Key features: ${anchors}.`;
  }
  return `Consistent protagonist: 26-year-old creator with athletic posture, wearing charcoal cotton overshirt, black tee, brown leather watch.`;
}

export function generateStoryboardImageJson(project: Project): StoryboardImagePromptJSON {
  const charAnchor = getProjectAnchorDescription(project);
  const rawStyle = project.contextProfile?.visualStyle || 'cinematic_realistic';
  const cleanStyle = rawStyle.replace(/_/g, ' ');
  const aspectRatio = '16:9';

  const isAdOrAffiliate =
    project.categoryId === 'affiliate-marketing' ||
    project.categoryId === 'product-story';

  const isPlaybook =
    !isAdOrAffiliate &&
    (project.scenes?.length === 8 ||
      project.categoryId?.startsWith('howto-') ||
      Boolean(project.selectedIdea?.creativeFramework?.includes('AI PLAYBOOK')));

  const palette = project.worldBible?.colorPalette?.length
    ? project.worldBible.colorPalette.join(', ')
    : '#0A0A0E, #F59E0B, #27272A, #E4E4E7';

  const lighting = project.scenes?.[0]?.lighting || 'Warm key light at 45 degrees, soft volumetric rim light, balanced shadows';
  const envDesc = project.worldBible?.description || project.scenes?.[0]?.location?.description || 'Contemporary architectural setting with ambient atmosphere';

  if (!isPlaybook) {
    // 9-Panel Commercial / FlowStoryboard layout
    const hookWords = (project.selectedIdea?.hook || project.scenes?.[0]?.beatTitle || 'Discover the secret').split(/\s+/).slice(0, 5).join(' ');
    const featureWords = (project.scenes?.[4]?.beatTitle || 'Core Focus • High Retention').split(/\s+/).slice(0, 5).join(' ');
    const titleWords = (project.name || 'Fixprom Studio').split(/\s+/).slice(0, 4).join(' ');

    const panels: StoryboardPanelItem[] = [];

    for (let i = 1; i <= 9; i++) {
      const defaultBeat = DEFAULT_9_BEATS[i - 1];
      const sceneSource = project.scenes?.[i - 1] || project.scenes?.[(i - 1) % (project.scenes.length || 1)];

      const beatName = sceneSource?.beatTitle || defaultBeat.beat;
      const shotType = sceneSource?.camera?.shot || defaultBeat.shot_type;
      const cameraInfo = sceneSource?.camera ? `${sceneSource.camera.angle}, ${sceneSource.camera.movement}` : defaultBeat.camera;
      const actionDesc = sceneSource?.characterActions || sceneSource?.summary || `Scene action for beat ${i}`;

      panels.push({
        panel: i,
        beat: beatName,
        shot_type: shotType,
        camera: cameraInfo,
        description: `[Panel ${i}: ${beatName}] ${shotType}. ${cameraInfo}. Subject: ${charAnchor} Action: ${actionDesc}. Setting: ${envDesc}. Lighting: ${lighting}. High-resolution cinematic commercial frame.`,
      });
    }

    return {
      task: '9-panel storyboard grid, single image',
      style: cleanStyle,
      aspect_ratio: aspectRatio,
      grid_layout: {
        total_panels: 9,
        rows: 3,
        columns: 3,
        reading_order: 'left to right, top to bottom, panels numbered 1-9',
        panel_borders: 'thin clean white gutters separating every panel',
        panel_numbers: 'small clear number badge in top-left corner of each panel',
      },
      global_consistency: {
        anchor_description: charAnchor,
        color_palette: palette,
        lighting: lighting,
        environment: envDesc,
      },
      on_screen_text: {
        rule: 'MINIMAL premium typography — maximum 3 text placements across all 9 panels.',
        placements: [
          { panel: 1, text: hookWords, style: 'tiny clean sans-serif, bottom corner' },
          { panel: 5, text: featureWords, style: 'tiny elegant label chips beside the product' },
          { panel: 9, text: `${titleWords} — Official Clip`, style: 'clean end-card typography with logo' },
        ],
      },
      ingredients_references: [
        {
          id: 'REF_CHARACTER_01',
          description: charAnchor,
          used_in_panels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
      ],
      panels,
      negative_prompt:
        'no more than 9 panels, no missing panels, no merged panels, no watermark, no text other than the specified on_screen_text placements, no blurry panels, no distorted characters',
    };
  }

  // AI Playbook 8-Panel Infographic Storyboard layout
  const panels: StoryboardPanelItem[] = [];
  const totalDurationStr = project.selectedIdea?.estimatedDuration === '15s' ? '15 Seconds' : '10 Seconds';

  for (let i = 1; i <= 8; i++) {
    const defaultBeat = DEFAULT_8_PLAYBOOK_BEATS[i - 1];
    const sceneSource = project.scenes?.[i - 1] || project.scenes?.[(i - 1) % (project.scenes.length || 1)];

    const beatName = sceneSource?.beatTitle || defaultBeat.beat;
    const shotType = sceneSource?.camera?.shot || defaultBeat.shot_type;
    const cameraInfo = sceneSource?.camera ? `${sceneSource.camera.angle}, ${sceneSource.camera.movement}` : defaultBeat.camera;
    const actionDesc = sceneSource?.action || sceneSource?.characterActions || defaultBeat.action;
    const emotion = sceneSource?.emotion || defaultBeat.emotion;
    const keyObj = sceneSource?.keyObject || (sceneSource?.props?.[0] || 'Tool / Object');
    const vo = sceneSource?.voiceoverLine || sceneSource?.dialogue || 'Learn the smart method.';

    panels.push({
      panel: i,
      beat: beatName,
      shot_type: shotType,
      camera: cameraInfo,
      description: `[Panel ${i}: ${beatName}] ${shotType}. ${cameraInfo}. Main Character: ${charAnchor} Action: ${actionDesc}. Key Object: ${keyObj}. Emotion: ${emotion}. Setting: ${envDesc}. Voice-over: "${vo}". Infographic storyboard panel.`,
      action: actionDesc,
      reaction: sceneSource?.reaction || 'Natural focus',
      time_hint: project.selectedIdea?.estimatedDuration === '15s' ? '1.8s' : '1.2s',
      key_object: keyObj,
      emotion: emotion,
      voiceover: vo,
    });
  }

  return {
    task: '8-panel infographic storyboard poster, single image',
    style: cleanStyle,
    aspect_ratio: aspectRatio,
    header: {
      video_title: project.name || 'AI Playbook How-To Guide',
      total_video_time: `${totalDurationStr} | 8 SHOTS`,
      keywords: ['Educational', 'How-To', 'Cinematic'],
      legend_icons: ['ACTION', 'REACTION', 'TIME', 'KEY OBJECT', 'MAIN CHARACTER'],
    },
    grid_layout: {
      total_panels: 8,
      rows: 8,
      columns: 1,
      reading_order: 'top to bottom, vertical sequence',
      panel_borders: 'clean black borders with white spacing',
      panel_numbers: 'bold panel title headers',
    },
    global_consistency: {
      anchor_description: charAnchor,
      color_palette: palette,
      lighting: lighting,
      environment: envDesc,
    },
    on_screen_text: {
      rule: 'Header and panel titles only. No speech bubbles inside panels.',
      placements: [
        { panel: 1, text: project.name || 'Mastery Guide', style: 'bold header typography' },
      ],
    },
    ingredients_references: [
      {
        id: 'REF_CHARACTER_01',
        description: charAnchor,
        used_in_panels: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    ],
    panels,
    negative_prompt:
      'weapons, blood, disturbing visuals, watermark, blurry panels, deformed fingers, extra limbs, inconsistent character',
  };
}

export function generateStoryboardVideoJson(
  project: Project,
  imageJson?: StoryboardImagePromptJSON
): StoryboardVideoPromptJSON {
  const imgData = imageJson || generateStoryboardImageJson(project);
  const charAnchor = imgData.global_consistency.anchor_description;
  const style = imgData.style;
  const aspectRatio = imgData.aspect_ratio;
  const isPlaybook = imgData.grid_layout?.total_panels === 8;

  const is15s = project.selectedIdea?.estimatedDuration === '15s';
  const durationSec = isPlaybook ? (is15s ? 15 : 10) : 10;
  const targetEngine = isPlaybook ? (is15s ? 'Seedance' : 'Omni Flesh') : 'universal-neutral';

  const hookWords = imgData.on_screen_text.placements[0]?.text || 'Witness the moment';
  const endcardWords = imgData.on_screen_text.placements[2]?.text || `${project.name} — Official Clip`;

  if (isPlaybook) {
    // 8-shot timeline for AI Playbook
    const timeSlots8 = is15s
      ? ['0.0s-1.8s', '1.8s-3.7s', '3.7s-5.6s', '5.6s-7.5s', '7.5s-9.4s', '9.4s-11.3s', '11.3s-13.1s', '13.1s-15.0s']
      : ['0.0s-1.2s', '1.2s-2.5s', '2.5s-3.7s', '3.7s-5.0s', '5.0s-6.2s', '6.2s-7.5s', '7.5s-8.7s', '8.7s-10.0s'];

    const timeline: StoryboardTimelineEntry[] = [];
    const voLines: Array<{ time: string; line: string }> = [];

    for (let i = 0; i < 8; i++) {
      const panel = imgData.panels[i] || imgData.panels[0];
      const isLast = i === 7;
      const voSentence = panel?.voiceover || `Step ${i + 1} action executed with precision.`;

      timeline.push({
        frame_ref: `panel ${i + 1}`,
        time: timeSlots8[i],
        action: `${panel?.action || 'Key process action'}. Accurate physics and realistic tool interaction.`,
        camera_move: panel?.camera || 'Steady cinematic track',
        motion_intensity: i === 3 || i === 7 ? 'high' : 'medium',
        transition_to_next: isLast ? 'smooth final hold' : 'natural motion cut',
        audio: `SFX: Tactile Foley & ambient room sound | VO: "${voSentence}"`,
      });

      voLines.push({
        time: timeSlots8[i],
        line: voSentence,
      });
    }

    return {
      task: `image-to-video, single continuous ${durationSec}-second video built from the 8-panel infographic storyboard poster, optimized for ${targetEngine}`,
      source_image: 'the generated 8-panel infographic storyboard poster',
      style,
      aspect_ratio: aspectRatio,
      duration_seconds: durationSec,
      ingredients_references: ['REF_CHARACTER_01'],
      on_screen_text: {
        rule: 'Minimal typography: header only, no distracting text',
        placements: [
          { appears_at: '0.0s-1.2s', text: hookWords, animation: 'clean bold reveal' },
        ],
      },
      timeline,
      audio_design: {
        music_mood: 'Upbeat, curious, satisfying instructional rhythm',
        sfx_layers: 'Crisp Foley: clicks, cutting, pouring, tactile mechanism sounds',
        voiceover: {
          coverage_rule: 'Exactly 8 narration lines (one per panel), 5 to 12 words each. Friendly, educational, natural.',
          voice_match_rule: 'voice matches the canonical character identity throughout',
          lines: voLines,
          total_word_limit: '50-80 words total across the whole video',
        },
      },
      consistency_lock: charAnchor,
      negative_prompt:
        'subtitles, captions, logos, watermarks, glitches, character changes, sudden morphing, extra limbs, discontinuous objects',
    };
  }

  // Standard 9-panel commercial / ad timeline
  const timeSlots = [
    '0.0s-1.1s',
    '1.1s-2.2s',
    '2.2s-3.3s',
    '3.3s-4.4s',
    '4.4s-5.5s',
    '5.5s-6.6s',
    '6.6s-7.7s',
    '7.7s-8.8s',
    '8.8s-10.0s',
  ];

  const cameraMoves = [
    'slow push-in',
    'subtle pan left',
    'crane shot down',
    'tracking right',
    'slow push-in',
    'orbit around subject',
    'smooth push-in',
    'pull out',
    'static tripod hold',
  ];

  const timeline: StoryboardTimelineEntry[] = [];

  for (let i = 0; i < 9; i++) {
    const sceneSource = project.scenes?.[i] || project.scenes?.[i % (project.scenes.length || 1)];
    const act = sceneSource?.characterActions || `Subject initiates beat ${i + 1} narrative motion`;
    const move = sceneSource?.camera?.movement || cameraMoves[i];
    const isLast = i === 8;

    timeline.push({
      frame_ref: `panel ${i + 1}`,
      time: timeSlots[i],
      action: `${act}. Consistent appearance maintained throughout motion vector.`,
      camera_move: move,
      motion_intensity: i === 6 ? 'high' : i === 0 || i === 8 ? 'low' : 'medium',
      transition_to_next: isLast ? 'smooth fade-out' : 'hard cut',
      audio: `SFX: ${i === 0 ? 'Ambient cinematic riser' : i === 8 ? 'Warm sub-bass outro' : 'Crisp environmental Foley'} | VO: ${i === 1 ? 'Narration intro' : i === 6 ? 'Narration climax' : 'none'}`,
    });
  }

  const voLine1 = (project.scenes?.[1]?.dialogue || 'A mystery awaits in every shadow.').split(/\s+/).slice(0, 7).join(' ');
  const voLine2 = (project.scenes?.[6]?.dialogue || 'Nothing will ever be the same.').split(/\s+/).slice(0, 7).join(' ');

  return {
    task: 'image-to-video, single continuous 10-second video built from the 9-panel storyboard grid, panels become sequential scenes',
    source_image: 'the generated 9-panel storyboard grid',
    style,
    aspect_ratio: aspectRatio,
    duration_seconds: 10,
    ingredients_references: ['REF_CHARACTER_01'],
    on_screen_text: {
      rule: "same minimal placements as the image JSON; each text animates in only during its panel's time slot with a soft fade/slide, then disappears",
      placements: [
        { appears_at: '0.0s-1.1s', text: hookWords, animation: 'soft fade-in, hold, fade-out' },
        { appears_at: '8.8s-10.0s', text: endcardWords, animation: 'clean end-card reveal' },
      ],
    },
    timeline,
    audio_design: {
      music_mood: 'Cinematic tension building to an impactful, memorable climax',
      sfx_layers: 'Subtle atmospheric ambience, footsteps on concrete, gentle wind and riser swells',
      voiceover: {
        coverage_rule: 'LIGHT background narration — voiceover covers only ~50% of the runtime (about 5 seconds of speech out of 10). Music + SFX carry the remaining half. Never wall-to-wall talking.',
        voice_match_rule: 'voice MUST match the on-screen character from ingredients: male character → male voice | female character → female voice | child → child voice | no character on screen → brand-appropriate voice',
        lines: [
          { time: '1.1s-3.3s', line: voLine1 },
          { time: '6.6s-8.8s', line: voLine2 },
        ],
        total_word_limit: 'maximum 15 spoken words across the whole video',
      },
      dialogue_for_cinematic: project.scenes?.[0]?.dialogue ? `Dialogue excerpts in ${project.scenes[0].dialogue}` : undefined,
    },
    consistency_lock: charAnchor,
    negative_prompt:
      'no morphing product shape, no style drift, no new panels appearing, no extra limbs, no watermark, no text artifacts beyond specified on_screen_text, no camera shake unless requested, no voiceover covering the full duration',
  };
}

export function validateStoryboardPackage(
  imageJson: StoryboardImagePromptJSON,
  videoJson: StoryboardVideoPromptJSON
): StoryboardValidationReport {
  const isPlaybook = imageJson.grid_layout?.total_panels === 8;

  // 1. Timing: check if duration_seconds is valid (10s or 15s) and last timeline ends matching duration
  const lastSlot = videoJson.timeline[videoJson.timeline.length - 1]?.time || '';
  const timingTotal10s =
    videoJson.duration_seconds === 10 || videoJson.duration_seconds === 15 || lastSlot.includes('10.0s') || lastSlot.includes('15.0s');

  // 2. Anchor consistency: exact match between imageJson.global_consistency and videoJson.consistency_lock
  const anchorConsistent =
    Boolean(imageJson.global_consistency?.anchor_description) &&
    imageJson.global_consistency.anchor_description === videoJson.consistency_lock;

  // 3. Ingredient refs match
  const imgRef = imageJson.ingredients_references?.[0]?.id || '';
  const vidRef = videoJson.ingredients_references?.[0] || '';
  const ingredientRefsMatch = Boolean(imgRef) && imgRef === vidRef;

  // 4. Style & aspect ratio identical
  const styleAspectIdentical =
    imageJson.style === videoJson.style && imageJson.aspect_ratio === videoJson.aspect_ratio;

  // 5. On-screen text <= 3 placements
  const onScreenTextRuleCompliant =
    (imageJson.on_screen_text?.placements?.length || 0) <= 3;

  // 6. Voiceover rule compliance
  const voWords = (videoJson.audio_design?.voiceover?.lines || [])
    .map((l) => l.line)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const voiceoverRuleCompliant = isPlaybook ? (voWords <= 100) : (voWords <= 25);

  return {
    timingTotal10s,
    anchorConsistent,
    ingredientRefsMatch,
    styleAspectIdentical,
    onScreenTextRuleCompliant,
    voiceoverRuleCompliant,
    timestamp: new Date().toISOString(),
  };
}
