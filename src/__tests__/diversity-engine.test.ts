import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  tokenizeMeaningful,
  calculateJaccardSimilarity,
  calculateLevenshteinSimilarity,
  calculateIdeaSimilarity,
  isDuplicateIdea,
  filterDiverseBatch,
  getDiverseAngles,
  CREATIVE_DIMENSIONS,
} from '../lib/diversity-engine';
import { generateContentIdeas } from '../lib/ai-generator';
import { DEFAULT_CONTEXT_PROFILE } from '../context-engine';
import type { ContentIdea, IdeaGenerationConfig } from '@/types';

describe('Creative Diversity Engine — Text Normalization & Similarity', () => {
  it('normalizes text and strips punctuation correctly', () => {
    const raw = 'Halo, Dunia! Ini adalah... tes normalisasi: 123?';
    expect(normalizeText(raw)).toBe('halo dunia ini adalah tes normalisasi 123');
  });

  it('filters Indonesian stopwords in meaningful tokens', () => {
    const text = 'Sebuah ide konten misteri untuk para penonton di Bandung';
    const tokens = tokenizeMeaningful(text);
    expect(tokens.has('misteri')).toBe(true);
    expect(tokens.has('konten')).toBe(true);
    expect(tokens.has('bandung')).toBe(true);
    expect(tokens.has('sebuah')).toBe(false); // stopword
    expect(tokens.has('untuk')).toBe(false); // stopword
    expect(tokens.has('para')).toBe(false); // stopword
  });

  it('calculates Jaccard token overlap between identical and distinct sets', () => {
    const setA = new Set(['kopi', 'kafe', 'barista', 'bandung']);
    const setB = new Set(['kopi', 'kafe', 'barista', 'bandung']);
    const setC = new Set(['gunung', 'hutan', 'kabut', 'petualangan']);

    expect(calculateJaccardSimilarity(setA, setB)).toBe(1.0);
    expect(calculateJaccardSimilarity(setA, setC)).toBe(0.0);
  });

  it('detects near-identical idea duplicates', () => {
    const idea1: Partial<ContentIdea> = {
      title: 'POV: Kamu Menemukan Koper Misterius di Kafe',
      hook: '[Detik 0-3] Koper hitam di bawah kursi bergetar sendiri saat kafe sepi.',
      premise: 'Seorang barista menemukan koper bergetar misterius yang tertinggal di bawah meja.',
      conflict: 'Harus memilih membuka koper atau membiarkannya sebelum pemilik kembali.',
    };

    // Paraphrase with slight cosmetic variation
    const idea2: Partial<ContentIdea> = {
      title: 'POV: Menemukan Koper Hitam Misterius di Sebuah Kafe',
      hook: '[Detik 0-3] Koper di bawah kursi tiba-tiba bergetar sendiri saat kafe sedang sepi.',
      premise: 'Barista kafe menemukan tas koper bergetar yang tertinggal di bawah meja pelanggan.',
      conflict: 'Dilema membuka koper tersebut atau menunggu pemiliknya datang.',
    };

    const similarity = calculateIdeaSimilarity(idea1, idea2);
    expect(similarity).toBeGreaterThan(0.55);

    const dupCheck = isDuplicateIdea(idea2, [idea1], 0.55);
    expect(dupCheck.isDuplicate).toBe(true);
  });

  it('recognizes genuinely distinct ideas as non-duplicates', () => {
    const idea1: Partial<ContentIdea> = {
      title: 'POV: Kamu Menemukan Koper Misterius di Kafe',
      hook: '[Detik 0-3] Koper hitam di bawah kursi bergetar sendiri saat kafe sepi.',
      premise: 'Seorang barista menemukan koper bergetar misterius yang tertinggal di bawah meja.',
      conflict: 'Harus memilih membuka koper atau membiarkannya sebelum pemilik kembali.',
    };

    const idea2: Partial<ContentIdea> = {
      title: 'Balapan Melawan Waktu: Deadline Pitching Startup di Jam Macet',
      hook: '[Detik 0-3] Baterai laptop tersisa 3% sementara lift gedung macet di lantai 14.',
      premise: 'Dua founder startup terjebak lift 10 menit sebelum investor luar negeri masuk ke ruang zoom.',
      conflict: 'Koneksi seluler terputus dan mereka harus mempresentasikan prototipe dengan kertas coretan.',
    };

    const similarity = calculateIdeaSimilarity(idea1, idea2);
    expect(similarity).toBeLessThan(0.30);

    const dupCheck = isDuplicateIdea(idea2, [idea1], 0.60);
    expect(dupCheck.isDuplicate).toBe(false);
  });

  it('filters diverse batches and rejects duplicate candidates', () => {
    const candidateA: ContentIdea = {
      id: 'id-1',
      title: 'Misteri Suara Langkah di Studio Rekaman',
      hook: '[Detik 0-3] Mikrofon menangkap bisikan padahal bilik vokal kosong.',
      premise: 'Sound engineer mendengar vokal asing pada track instrumen malam hari.',
      synopsis: 'Eksplorasi studio musik malam.',
      storyBeats: ['B1', 'B2', 'B3', 'B4'],
      conflict: 'Kamera pengawas tidak menunjukkan siapa pun.',
      ending: 'Penyelesaian audio mengejutkan.',
      estimatedDuration: '30-60s',
      visualStyle: 'cinematic_realistic',
      suggestedLocation: 'Studio rekaman',
      localizationNotes: 'Natural',
      creativeRationale: 'Horor audio',
      categoryId: 'mystery-horror',
      saved: false,
      createdAt: new Date().toISOString(),
    };

    // Candidate B is almost identical to A
    const candidateB: ContentIdea = {
      ...candidateA,
      id: 'id-2',
      title: 'Suara Langkah Misterius di Bilik Studio Rekaman',
      hook: '[Detik 0-3] Mikrofon menangkap suara bisikan saat bilik vokal kosong.',
      premise: 'Sound engineer merekam vokal aneh pada rekaman instrumen malam hari.',
    };

    // Candidate C is totally distinct
    const candidateC: ContentIdea = {
      id: 'id-3',
      title: 'Eksperimen Kuliner: Es Krim Rasa Kuah Rawon',
      hook: '[Detik 0-3] Warna hitam pekat kluwek disendok ke atas cone waffle renyah.',
      premise: 'Chef muda menguji batas rasa kuliner lokal dengan dessert eksperimental.',
      synopsis: 'Eksplorasi kuliner berani.',
      storyBeats: ['B1', 'B2', 'B3', 'B4'],
      conflict: 'Kritikus makanan ternama siap mencicipi.',
      ending: 'Reaksi tak terduga kritikus.',
      estimatedDuration: '30-60s',
      visualStyle: 'cinematic_realistic',
      suggestedLocation: 'Dapur resto modern',
      localizationNotes: 'Natural',
      creativeRationale: 'Kuliner',
      categoryId: 'food-imagination',
      saved: false,
      createdAt: new Date().toISOString(),
    };

    const filtered = filterDiverseBatch([candidateA, candidateB, candidateC], 2, 0.60);
    expect(filtered.length).toBe(2);
    expect(filtered.some((i) => i.id === 'id-1')).toBe(true);
    expect(filtered.some((i) => i.id === 'id-3')).toBe(true);
    // Duplicate B was rejected
    expect(filtered.some((i) => i.id === 'id-2')).toBe(false);
  });
});

describe('Creative Diversity Engine — Dimensions & Generator', () => {
  it('provides rich creative dimensions matrix', () => {
    expect(CREATIVE_DIMENSIONS.length).toBeGreaterThanOrEqual(6);
    const angles = getDiverseAngles(5);
    expect(angles.length).toBe(5);

    // All angles in a single slice must be distinct
    const ids = new Set(angles.map((a) => a.id));
    expect(ids.size).toBe(5);
  });

  it('generates the exact requested number of diverse ideas even in offline fallback', async () => {
    const config: IdeaGenerationConfig = {
      categoryId: 'pov-experience',
      platform: 'tiktok',
      duration: '15-30s',
      visualStyle: 'cinematic_realistic',
      contextProfile: DEFAULT_CONTEXT_PROFILE,
      dialogLanguage: 'indonesian',
      trendApproach: 'trend_first',
      ideaCount: 5,
    };

    const results = await generateContentIdeas(config);
    expect(results.length).toBe(5);

    // Check that every idea has unique id and distinct title
    const titles = new Set(results.map((r) => r.title));
    expect(titles.size).toBe(5);

    // Verify non-empty required fields
    for (const idea of results) {
      expect(idea.title.trim().length).toBeGreaterThan(0);
      expect(idea.hook.trim().length).toBeGreaterThan(0);
      expect(idea.premise.trim().length).toBeGreaterThan(0);
      expect(idea.storyBeats.length).toBe(4);
    }
  });

  it('incorporates user custom topic into the generated output', async () => {
    const customTopic = 'Kucing Oyen Pemilik Warung Kopi';
    const config: IdeaGenerationConfig = {
      categoryId: 'pov-experience',
      additionalTheme: customTopic,
      platform: 'tiktok',
      duration: '15-30s',
      visualStyle: 'cinematic_realistic',
      contextProfile: DEFAULT_CONTEXT_PROFILE,
      dialogLanguage: 'indonesian',
      trendApproach: 'trend_first',
      ideaCount: 5,
    };

    const results = await generateContentIdeas(config);
    expect(results.length).toBe(5);
    // At least one idea or all ideas reflect the custom topic
    const hasTopic = results.some((r) => r.title.includes(customTopic) || r.premise.includes(customTopic));
    expect(hasTopic).toBe(true);
  });
});
