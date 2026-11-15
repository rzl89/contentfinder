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
 * AI GENERATOR SERVICE
 * ============================================================================
 *
 * Generates structured ideas, story treatments, bibles, and scenes.
 * Runs on backend or graceful client-side generator engine without exposing keys.
 */

export async function generateContentIdeas(
  config: IdeaGenerationConfig
): Promise<ContentIdea[]> {
  const category = getCategoryById(config.categoryId);
  if (!category) {
    throw new Error(`Category not found: ${config.categoryId}`);
  }

  // Simulate network processing delay for authentic UX
  await new Promise((resolve) => setTimeout(resolve, 800));

  const count = config.ideaCount || 5;
  const ideas: ContentIdea[] = [];

  // Generate category-specific, creative-logic-driven ideas
  for (let i = 1; i <= count; i++) {
    const ideaId = `idea_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;

    // Build specific variation based on category and subcategory
    const subcat = category.subcategories[(i - 1) % category.subcategories.length];
    const baseExample = category.exampleIdeas[(i - 1) % category.exampleIdeas.length];

    const isTrending = config.trendApproach === 'trend_first';
    const duration: DurationRange = config.duration || '30-60s';
    const visualStyle: VisualStyle = config.visualStyle || 'cinematic_realistic';

    ideas.push({
      id: ideaId,
      title: `${category.name}: Eksplorasi ${subcat.name} #${i}`,
      hook: `[Detik 0-3] "${baseExample.split('—')[0] || 'Tunggu sebentar... kamu tidak akan menyangka apa yang terjadi selanjutnya.'}"`,
      premise: `Sebuah narasi tentang ${subcat.description.toLowerCase()} dalam balutan gaya ${visualStyle.replace(/_/g, ' ')}.`,
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
      subcategoryId: subcat.id,
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
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const projectId = `proj_${Date.now()}`;

  // 1. Generate Character Bible
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

  // 2. Generate World Bible
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

  // 3. Generate Scenes matching EXACT scene count
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
