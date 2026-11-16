/**
 * ============================================================================
 * FIXPROM CREATIVE DIVERSITY & ANTI-REPETITION ENGINE
 * ============================================================================
 *
 * Provides:
 * 1. Normalized text processing & multi-factor similarity scoring (Jaccard + Levenshtein).
 * 2. Within-batch duplicate filtering & historical anti-repetition detection.
 * 3. Dynamic Creative Dimensions Matrix (Conflicts, POVs, Structures, Tones, Settings).
 * 4. Category-appropriate creative angle assignment.
 */

import type { ContentIdea } from '@/types';

// Common Indonesian stopwords for cleaner token similarity
const ID_STOPWORDS = new Set([
  'yang', 'untuk', 'pada', 'ke', 'para', 'namun', 'menurut', 'antara', 'dia', 'mereka',
  'anda', 'kita', 'aku', 'kamu', 'kami', 'ini', 'itu', 'atau', 'dan', 'dengan', 'adalah',
  'yaitu', 'seperti', 'dalam', 'oleh', 'dari', 'akan', 'bisa', 'ada', 'tidak', 'saat',
  'karena', 'jika', 'bila', 'apabila', 'agar', 'supaya', 'sebuah', 'suatu', 'tersebut'
]);

/**
 * Normalizes text: trims, lowercases, strips punctuation and extra whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into a set of meaningful words (minus stopwords).
 */
export function tokenizeMeaningful(text: string): Set<string> {
  const norm = normalizeText(text);
  const words = norm.split(' ');
  const tokens = new Set<string>();
  for (const w of words) {
    if (w.length > 2 && !ID_STOPWORDS.has(w)) {
      tokens.add(w);
    }
  }
  return tokens;
}

/**
 * Calculates Jaccard similarity coefficient between two token sets.
 * Returns value between 0.0 (no overlap) and 1.0 (identical).
 */
export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }
  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Levenshtein Distance for short string similarity (e.g. titles).
 */
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen > 0 ? (maxLen - distance) / maxLen : 0;
}

/**
 * Multi-factor similarity comparison between two content ideas.
 * Weighted:
 * - Title similarity: 25%
 * - Hook similarity: 35%
 * - Premise + Conflict similarity: 40%
 */
export function calculateIdeaSimilarity(
  ideaA: Partial<ContentIdea>,
  ideaB: Partial<ContentIdea>
): number {
  if (!ideaA || !ideaB) return 0;

  // 1. Title similarity (Levenshtein + Token Jaccard)
  const titleTokensA = tokenizeMeaningful(ideaA.title || '');
  const titleTokensB = tokenizeMeaningful(ideaB.title || '');
  const titleJaccard = calculateJaccardSimilarity(titleTokensA, titleTokensB);
  const titleLev = calculateLevenshteinSimilarity(ideaA.title || '', ideaB.title || '');
  const titleScore = (titleJaccard * 0.6) + (titleLev * 0.4);

  // 2. Hook similarity (Token Jaccard)
  const hookTokensA = tokenizeMeaningful(ideaA.hook || '');
  const hookTokensB = tokenizeMeaningful(ideaB.hook || '');
  const hookScore = calculateJaccardSimilarity(hookTokensA, hookTokensB);

  // 3. Premise & Conflict similarity (Token Jaccard)
  const coreA = `${ideaA.premise || ''} ${ideaA.conflict || ''} ${ideaA.synopsis || ''}`;
  const coreB = `${ideaB.premise || ''} ${ideaB.conflict || ''} ${ideaB.synopsis || ''}`;
  const coreTokensA = tokenizeMeaningful(coreA);
  const coreTokensB = tokenizeMeaningful(coreB);
  const coreScore = calculateJaccardSimilarity(coreTokensA, coreTokensB);

  // Combined weighted score
  return (titleScore * 0.25) + (hookScore * 0.35) + (coreScore * 0.40);
}

/**
 * Checks whether a candidate idea is an effective duplicate of any item in an existing list.
 * Threshold defaults to 0.60 (60% composite similarity).
 */
export function isDuplicateIdea(
  candidate: Partial<ContentIdea>,
  existingList: Partial<ContentIdea>[],
  threshold = 0.60
): { isDuplicate: boolean; matchedIdea?: Partial<ContentIdea>; score: number } {
  for (const existing of existingList) {
    const score = calculateIdeaSimilarity(candidate, existing);
    if (score >= threshold) {
      return { isDuplicate: true, matchedIdea: existing, score };
    }
  }
  return { isDuplicate: false, score: 0 };
}

/**
 * Filter an array of candidate ideas to select only distinct, non-duplicate ideas.
 */
export function filterDiverseBatch(
  candidates: ContentIdea[],
  targetCount: number,
  threshold = 0.60
): ContentIdea[] {
  const accepted: ContentIdea[] = [];

  for (const candidate of candidates) {
    if (accepted.length >= targetCount) break;

    const { isDuplicate } = isDuplicateIdea(candidate, accepted, threshold);
    if (!isDuplicate) {
      accepted.push(candidate);
    }
  }

  return accepted;
}

// ─── CREATIVE DIMENSION MATRIX ───────────────────────────────────────────────

export interface CreativeDimension {
  id: string;
  name: string;
  angleDescription: string;
  hookPattern: string;
  conflictType: string;
}

export const CREATIVE_DIMENSIONS: CreativeDimension[] = [
  {
    id: 'in-media-res',
    name: 'Aksi Tengah Konflik (In Media Res)',
    angleDescription: 'Adegan dimulai persis di momen krisis/klimaks tanpa basa-basi pembuka.',
    hookPattern: 'Detik 0 langsung menampilkan konfrontasi atau kepanikan yang sedang memuncak.',
    conflictType: 'Krisis waktu nyata yang harus diselesaikan dalam hitungan detik.'
  },
  {
    id: 'absurd-reversal',
    name: 'Pembalikan Ekspektasi / Ironi Kontras',
    angleDescription: 'Situasi tampak normal atau seram namun berbelok 180 derajat ke hal yang tak terduga.',
    hookPattern: 'Premis awal meyakinkan penonton ke satu arah sebelum twist tajam di detik ke-10.',
    conflictType: 'Kesenjangan antara asumsi karakter dengan realitas kocak/ironis.'
  },
  {
    id: 'first-person-immersion',
    name: 'POV Sensorik Orang Pertama',
    angleDescription: 'Kamera bertindak sebagai mata karakter utama dengan interaksi fisik langsung.',
    hookPattern: 'Tangan karakter berinteraksi dengan benda atau orang lain dari sudut mata sendiri.',
    conflictType: 'Tekanan psikologis langsung yang dirasakan sudut pandang orang pertama.'
  },
  {
    id: 'documentary-investigation',
    name: 'Investigasi / Temuan Fakta Tak Biasa',
    angleDescription: 'Gaya liputan investigatif atau observasi rahasia yang menguak anomali.',
    hookPattern: 'Visual bukti nyata atau dokumen janggal yang belum pernah diketahui publik.',
    conflictType: 'Pertarungan membuktikan kebenaran tersembunyi melawan penyangkalan.'
  },
  {
    id: 'social-tension',
    name: 'Friksi Relasional & Norma Sosial',
    angleDescription: 'Dilema etika atau gesekan interpersonal yang sangat dekat dengan kehidupan sehari-hari.',
    hookPattern: 'Percakapan tenang yang tiba-tiba membeku karena satu kalimat tajam.',
    conflictType: 'Dilema antara menjaga perasaan orang lain atau menegakkan batas pribadi.'
  },
  {
    id: 'surreal-ordinary',
    name: 'Elemen Surealis dalam Keseharian',
    angleDescription: 'Satu aturan dunia nyata dilanggar di tengah kehidupan biasa yang realistis.',
    hookPattern: 'Benda biasa yang bertindak di luar hukum fisika dengan reaksi natural orang sekitar.',
    conflictType: 'Tokoh harus menyembunyikan keajaiban aneh dari tatapan publik normal.'
  },
  {
    id: 'race-against-clock',
    name: 'Hitung Mundur Taruhan Tinggi (Countdown)',
    angleDescription: 'Setiap detik visual berdetak menuju konsekuensi besar yang tak terhindarkan.',
    hookPattern: 'Tampilan jam atau indikator fisik yang menunjukkan sisa waktu genting.',
    conflictType: 'Tuntutan menyelesaikan tugas rumit sebelum batas waktu berakhir.'
  }
];

/**
 * Returns a randomized, distinct slice of creative dimensions for a generation batch.
 */
export function getDiverseAngles(count: number): CreativeDimension[] {
  const shuffled = [...CREATIVE_DIMENSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
