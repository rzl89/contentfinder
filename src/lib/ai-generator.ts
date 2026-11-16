import type {
  ContentIdea,
  IdeaGenerationConfig,
  CharacterBible,
  WorldBible,
  Scene,
  DurationRange,
  VisualStyle,
} from '@/types';
import { getCategoryById } from '@/context-engine';

/**
 * ============================================================================
 * AI GENERATOR SERVICE WITH SECURE BACKEND GATEWAY
 * ============================================================================
 *
 * Calls the secure Vercel backend proxy (/api/generate) which accesses OPENAI_API_KEY.
 * Falls back gracefully to the deterministic Algorithmic Context Engine if the
 * backend API is unreachable or offline.
 */

export async function generateContentIdeas(
  config: IdeaGenerationConfig
): Promise<ContentIdea[]> {
  const category = getCategoryById(config.categoryId);
  if (!category) {
    throw new Error(`Category not found: ${config.categoryId}`);
  }

  const subcat =
    category.subcategories.find((s) => s.id === config.subcategoryId) ||
    category.subcategories[0];

  // 1. Try calling the secure backend proxy
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_ideas',
        payload: {
          categoryName: category.name,
          categoryDescription: category.description,
          subcatName: subcat?.name,
          platform: config.platform,
          duration: config.duration,
          visualStyle: config.visualStyle,
          contextName: config.contextProfile.name,
          targetMarket: config.contextProfile.targetMarket,
          targetAudience: config.targetAudience,
          additionalTheme: config.additionalTheme,
          count: config.ideaCount || 5,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.ideas) && data.ideas.length > 0) {
        return data.ideas.map((raw: any, idx: number): ContentIdea => ({
          id: `idea_ai_${Date.now()}_${idx + 1}`,
          title: raw.title || `${category.name} #${idx + 1}`,
          hook: raw.hook || '[Detik 0-3] Hook pembuka dramatis',
          premise: raw.premise || category.description,
          synopsis: raw.synopsis || raw.premise || '',
          storyBeats: Array.isArray(raw.storyBeats) ? raw.storyBeats : [
            'Beat 1 (Hook)', 'Beat 2 (Eskalasi)', 'Beat 3 (Puncak)', 'Beat 4 (Twist)'
          ],
          conflict: raw.conflict || 'Konflik utama dalam narasi.',
          ending: raw.ending || 'Penyelesaian berkesan.',
          estimatedDuration: config.duration || '30-60s',
          visualStyle: config.visualStyle || 'cinematic_realistic',
          suggestedLocation: raw.suggestedLocation || 'Latar natural seimbang',
          localizationNotes: raw.localizationNotes || 'Nuansa Indonesia natural tanpa stereotip',
          creativeRationale: raw.creativeRationale || `Menerapkan framework ${category.name}`,
          trendEvidence: config.trendApproach === 'trend_first'
            ? 'Format hook tervalidasi dari pola retensi tinggi TikTok Creative Center.'
            : undefined,
          categoryId: category.id,
          subcategoryId: subcat?.id,
          saved: false,
          createdAt: new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.info('Backend AI proxy offline or unconfigured, utilizing Algorithmic Context Engine.', err);
  }

  // 2. Deterministic Algorithmic Fallback
  await new Promise((resolve) => setTimeout(resolve, 600));

  const count = config.ideaCount || 5;
  const ideas: ContentIdea[] = [];

  for (let i = 1; i <= count; i++) {
    const ideaId = `idea_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
    const subcatItem = category.subcategories[(i - 1) % category.subcategories.length];
    const baseExample = category.exampleIdeas[(i - 1) % category.exampleIdeas.length];

    const isTrending = config.trendApproach === 'trend_first';
    const duration: DurationRange = config.duration || '30-60s';
    const visualStyle: VisualStyle = config.visualStyle || 'cinematic_realistic';

    ideas.push({
      id: ideaId,
      title: `${category.name}: Eksplorasi ${subcatItem.name} #${i}`,
      hook: `[Detik 0-3] "${baseExample.split('—')[0] || 'Tunggu sebentar... kamu tidak akan menyangka apa yang terjadi selanjutnya.'}"`,
      premise: `Sebuah narasi tentang ${subcatItem.description.toLowerCase()} dalam balutan gaya ${visualStyle.replace(/_/g, ' ')}.`,
      synopsis: `Di sebuah latar yang dirancang autentik, tokoh utama mengalami dinamika tak terduga. ${category.creativeFramework.split('.')[0]}. Alur berkembang cepat menyesuaikan durasi pendek ${duration}.`,
      storyBeats: [
        'Beat 1 (Hook): Kejadian tak terduga langsung menghentikan scroll penonton.',
        'Beat 2 (Eskalasi): Situasi berkembang rumit dengan konflik atau misteri utama.',
        'Beat 3 (Puncak/Climax): Momen paling intens atau visual paling memukau.',
        'Beat 4 (Payoff/Twist): Penyelesaian cerdas atau twist yang memuaskan rasa ingin tahu.',
      ],
      conflict: `Pertentangan antara ekspektasi awal dan kenyataan situasi di lapangan.`,
      ending: `Payoff yang memberikan kepuasan emosional atau memicu diskusi di kolom komentar.`,
      estimatedDuration: duration,
      visualStyle,
      suggestedLocation:
        config.contextProfile.preset === 'indonesia_urban'
          ? 'Area perkantoran modern atau ruang komunal urban'
          : config.contextProfile.preset === 'indonesia_rural'
          ? 'Perbukitan asri atau pesisir tenang'
          : 'Latar natural seimbang sesuai kebutuhan adegan',
      localizationNotes:
        config.contextProfile.targetMarket === 'Indonesia'
          ? 'Dialog santai percakapan harian. Hindari karikatur atau simbol lokal berlebihan.'
          : 'Gaya universal tanpa stereotip geografis.',
      creativeRationale: `Menerapkan framework ${category.name} untuk menghasilkan engagement tinggi tanpa clickbait murahan.`,
      trendEvidence: isTrending
        ? 'Format hook 3 detik terinspirasi dari pola retensi tinggi TikTok Creative Center Q1.'
        : undefined,
      categoryId: category.id,
      subcategoryId: subcatItem.id,
      saved: false,
      createdAt: new Date().toISOString(),
    });
  }

  return ideas;
}

/**
 * Generates Story Treatment, Character Bible, World Bible, and exact scene count storyboard.
 */
export async function developStoryFromIdea(
  idea: ContentIdea,
  targetSceneCount: number = 4
): Promise<{
  characters: CharacterBible[];
  worldBible: WorldBible;
  scenes: Scene[];
}> {
  const projectId = `proj_${Date.now()}`;

  // 1. Try calling the secure backend proxy
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'develop_story',
        payload: {
          idea,
          targetSceneCount,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.package) {
        const pkg = data.package;
        const char = pkg.character || {};
        const wb = pkg.worldBible || {};
        const rawScenes = Array.isArray(pkg.scenes) ? pkg.scenes : [];

        const character: CharacterBible = {
          id: `char_${Date.now()}_1`,
          projectId,
          name: char.name || 'Rian Pratama',
          role: char.role || 'Protagonis Utama',
          appearance: char.appearance || 'Pria muda berpenampilan rapi dengan pandangan tajam.',
          clothing: char.clothing || 'Jaket katun gelap dengan kaos polos.',
          personality: char.personality || 'Tenang, analitis, dan adaptif.',
          consistencyAnchors: Array.isArray(char.consistencyAnchors)
            ? char.consistencyAnchors
            : ['Jaket katun gelap kanonis', 'Jam tangan kulit cokelat'],
        };

        const worldBible: WorldBible = {
          id: `wb_${Date.now()}`,
          projectId,
          name: wb.name || `${idea.title} Universe`,
          environmentType: wb.environmentType || 'mixed',
          description: wb.description || idea.synopsis,
          timeOfDay: wb.timeOfDay || 'Sore hari (Golden hour)',
          weather: wb.weather || 'Cerah sejuk',
          props: Array.isArray(wb.props) ? wb.props : ['Kamera ponsel', 'Buku saku'],
          rules: Array.isArray(wb.rules)
            ? wb.rules
            : ['Pencahayaan natural sinematik', 'Kostum konsisten antar scene'],
          moodAndTone: wb.moodAndTone || 'Cinematic, suspenseful, authentic',
          colorPalette: Array.isArray(wb.colorPalette)
            ? wb.colorPalette
            : ['#0A0A0E', '#F59E0B', '#27272A'],
        };

        const scenes: Scene[] = rawScenes.map((s: any, idx: number): Scene => ({
          id: `scene_${Date.now()}_${idx + 1}`,
          projectId,
          sceneNumber: idx + 1,
          beatTitle: s.beatTitle || `Scene ${idx + 1}: Story Beat`,
          purpose: s.purpose || 'Memajukan alur narasi dengan visual menarik',
          summary: s.summary || s.characterActions || 'Adegan utama berlangsung.',
          location: {
            environmentType: s.location?.environmentType || 'urban',
            description: s.location?.description || 'Interior kontemporer dengan pencahayaan alami',
            timeOfDay: s.location?.timeOfDay || 'Golden hour',
            weather: s.location?.weather || 'Cerah',
          },
          characterActions: s.characterActions || `${character.name} mengamati situasi di sekelilingnya.`,
          props: Array.isArray(s.props) ? s.props : ['Perangkat digital'],
          dialogue: s.dialogue,
          narration: s.narration,
          camera: {
            shot: s.camera?.shot || 'Medium Close-Up',
            angle: s.camera?.angle || 'Eye-level',
            movement: s.camera?.movement || 'Slow push in',
            framing: s.camera?.framing || 'Rule of thirds',
          },
          lighting: s.lighting || 'Warm key light, subtle rim light',
          continuityAnchors: Array.isArray(s.continuityAnchors)
            ? s.continuityAnchors
            : character.consistencyAnchors,
          imagePrompt:
            s.imagePrompt ||
            `Cinematic photorealistic still frame of ${character.name}, ${character.appearance}, wearing ${character.clothing}. High production quality 8k shot.`,
          videoPrompt:
            s.videoPrompt ||
            `Cinematic tracking shot. Camera glides smoothly around subject. Photorealistic motion blur, high frame rate smoothness.`,
          negativePrompt:
            s.negativePrompt ||
            'blurry, distorted facial features, low quality, watermark, extra limbs',
          locked: false,
        }));

        if (scenes.length > 0) {
          return {
            characters: [character],
            worldBible,
            scenes,
          };
        }
      }
    }
  } catch (err) {
    console.info('Backend story develop proxy offline, utilizing Algorithmic Context Engine.', err);
  }

  // 2. Deterministic Algorithmic Fallback
  await new Promise((resolve) => setTimeout(resolve, 800));

  const characters: CharacterBible[] = [
    {
      id: `char_${Date.now()}_1`,
      projectId,
      name: 'Rian Adiputra',
      age: 26,
      gender: 'Laki-laki',
      appearance: 'Pria muda berambut rapi bergelombang, tatapan observatif, postur tegak atletis.',
      clothing: 'Jaket overshirt katun abu-abu tua di atas kaos hitam polos, celana chino gelap.',
      personality: 'Cerdas, tenang, mudah penasaran terhadap hal-hal ganjil di sekitarnya.',
      role: 'Protagonis Utama',
      backstory: 'Seorang profesional muda yang gemar mendokumentasikan fenomena visual unik.',
      consistencyAnchors: [
        'Jaket overshirt abu-abu tua katun',
        'Jam tangan kulit cokelat tua di tangan kiri',
        'Gaya rambut undercut belah samping rapi',
      ],
    },
  ];

  const worldBible: WorldBible = {
    id: `wb_${Date.now()}`,
    projectId,
    name: `${idea.title} Universe`,
    environmentType: 'mixed',
    description: `Dunia visual sinematik dengan atmosfer mendalam yang mendukung premis: ${idea.premise}`,
    timeOfDay: 'Sore hari menjelang senja (Golden hour)',
    weather: 'Cerah dengan hembusan angin sejuk',
    props: ['Smartphone kamera pro', 'Notebook catatan kulit', 'Kunci kuno berukir'],
    rules: [
      'Pencahayaan naturalistik dengan kontras bayangan tajam.',
      'Karakter selalu mengenakan kostum kanonis yang sama antar-adegan.',
      'Gerakan kamera stabil dengan depth-of-field sinematik.',
    ],
    moodAndTone: 'Cinematic, suspenseful, grounded realism',
    colorPalette: ['#0A0A0E', '#F59E0B', '#27272A', '#E4E4E7'],
  };

  const scenes: Scene[] = [];
  const beats = [
    { title: 'The Sudden Hook', purpose: 'Menghentikan scroll penonton dalam 2 detik pertama' },
    { title: 'The Exploration', purpose: 'Menunjukkan detail dan kompleksitas situasi' },
    { title: 'The Climax Moment', purpose: 'Puncak ketegangan visual dan interaksi karakter' },
    { title: 'The Payoff / Twist', purpose: 'Resolusi akhir yang memuaskan dan berkesan' },
    { title: 'The Lingering Aftermath', purpose: 'Meninggalkan kesan mendalam dan dorongan interaksi' },
    { title: 'Bonus Epilogue', purpose: 'Penutup opsional dengan implikasi masa depan' },
  ];

  for (let s = 1; s <= targetSceneCount; s++) {
    const beat = beats[(s - 1) % beats.length];

    scenes.push({
      id: `scene_${Date.now()}_${s}`,
      projectId,
      sceneNumber: s,
      beatTitle: `Scene ${s}: ${beat.title}`,
      purpose: beat.purpose,
      summary: `Rian berada di lokasi adegan ke-${s}. ${idea.storyBeats[(s - 1) % idea.storyBeats.length] || 'Peristiwa penting berlangsung dengan intensitas sinematik.'}`,
      location: {
        environmentType: 'urban',
        description: `Modern architectural interior with wide floor-to-ceiling glass windows overlooking ambient landscape`,
        timeOfDay: s % 2 === 1 ? 'Golden hour evening light' : 'Twilight dusk ambient lighting',
        weather: 'Clear atmosphere with soft ambient dust particles',
      },
      characterActions: `Rian inspects the surroundings carefully, turning his head towards camera with focused expression.`,
      props: ['Smartphone with illuminated screen', 'Leather notebook'],
      dialogue: s === 1 ? 'Tunggu... ini bukan tempat yang seharusnya.' : s === targetSceneCount ? 'Semuanya berubah mulai detik ini.' : undefined,
      narration: s === 2 ? 'Setiap detik membawa petunjuk baru yang tak terduga.' : undefined,
      camera: {
        shot: s === 1 ? 'Medium Close-Up' : s === 2 ? 'Tracking Wide Shot' : 'Slow Push-in Close-Up',
        angle: 'Eye-level cinematic angle',
        movement: s === 1 ? 'Static tripod with subtle breathing motion' : 'Smooth motorized gimbal tracking',
        framing: 'Rule of thirds, strong subject separation from background',
      },
      lighting: 'Warm key light at 45 degrees, soft cool rim light along jawline',
      continuityAnchors: [
        'Rian wears dark grey cotton overshirt and black t-shirt',
        'Brown leather watch strap on left wrist',
      ],
      imagePrompt: `Cinematic photorealistic still frame of a 26-year-old Indonesian man named Rian with neatly styled wavy hair, wearing a dark grey cotton overshirt. Standing in a modern interior with floor-to-ceiling windows during golden hour. Warm directional sunlight creating soft shadows, 35mm lens photography, 8k resolution, Kodak Portra color tones.`,
      videoPrompt: `Cinematic tracking shot. Camera smoothly glides closer to the man in dark grey overshirt as he turns his gaze towards the horizon. Natural cinematic motion, high frame rate smoothness, photorealistic depth of field.`,
      negativePrompt: `blurry, distorted facial features, extra limbs, cartoon rendering, low resolution, watermark, bad anatomy`,
      locked: false,
    });
  }

  return {
    characters,
    worldBible,
    scenes,
  };
}
