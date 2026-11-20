// =============================================================================
//  CONTENT ARCHETYPE ENGINE
//  Injected into categories.ts via re-export from context-engine/index.ts
// =============================================================================

/** Maps each category ID to one of the 4 content archetypes. */
const ARCHETYPE_MAP: Record<string, 'how_to' | 'thought_experiment' | 'commercial' | 'storytelling'> = {
  // ── COMMERCIAL (2) ──
  'product-story': 'commercial',
  'affiliate-marketing': 'commercial',
  // ── HOW-TO (11) ──
  'howto-cooking': 'how_to',
  'howto-diy': 'how_to',
  'howto-survival': 'how_to',
  'howto-repair': 'how_to',
  'howto-home-hacks': 'how_to',
  'howto-gardening': 'how_to',
  'howto-outdoor': 'how_to',
  'howto-science': 'how_to',
  'howto-art': 'how_to',
  'howto-productivity': 'how_to',
  'satisfying-restoration': 'how_to',
  // ── THOUGHT EXPERIMENT / EXPLANATORY (3) ──
  'what-if': 'thought_experiment',
  'educational-facts': 'thought_experiment',
  'mystery-horror': 'thought_experiment',
  // ── STORYTELLING (15) ──
  'scenic-aesthetic': 'storytelling',
  'time-travel': 'storytelling',
  'stickman': 'storytelling',
  'pov-experience': 'storytelling',
  'relatable-animated': 'storytelling',
  'microdrama': 'storytelling',
  'ai-transformation': 'storytelling',
  'miniature-giant': 'storytelling',
  'fantasy-mythology': 'storytelling',
  'kids-animation': 'storytelling',
  'animal-pet': 'storytelling',
  'comedy-meme': 'storytelling',
  'social-relationship': 'storytelling',
  'challenges-journey': 'storytelling',
  'food-imagination': 'storytelling',
};

import type { ContentArchetype, ArchetypeLabels } from '@/types';
export type { ContentArchetype, ArchetypeLabels };

/**
 * Returns the content archetype for a given category ID.
 * Defaults to 'storytelling' for unknown categories.
 */
export function getContentArchetype(categoryId: string): ContentArchetype {
  return (ARCHETYPE_MAP[categoryId] ?? 'storytelling') as ContentArchetype;
}

/** Internal archetype label shape */
interface ArchetypeEntry {
  badge: string; badgeEn: string;
  primaryLabel: string; primaryLabelEn: string;
  secondaryLabel: string; secondaryLabelEn: string;
  beatsLabel: string; beatsLabelEn: string;
  endingLabel: string; endingLabelEn: string;
  description: string; descriptionEn: string;
  colorClass: string;
}

const ARCHETYPE_LABELS: Record<ContentArchetype, ArchetypeEntry> = {
  how_to: {
    badge: 'Tutorial / How-To', badgeEn: 'Tutorial / How-To',
    primaryLabel: 'Tujuan / Hasil Jadi', primaryLabelEn: 'Goal / End Result',
    secondaryLabel: 'Alat & Bahan Kunci', secondaryLabelEn: 'Key Tools & Materials',
    beatsLabel: 'Langkah-Langkah Proses', beatsLabelEn: 'Process Steps',
    endingLabel: 'Hasil Akhir / Transformasi', endingLabelEn: 'Final Result / Transformation',
    description: 'Demonstrasi langkah demi langkah dengan output yang jelas dan visual memuaskan.',
    descriptionEn: 'Step-by-step demonstration with a clear, satisfying visual outcome.',
    colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  thought_experiment: {
    badge: 'Eksplanatori & Sebab-Akibat',
    badgeEn: 'Explanatory & Cause-and-Effect',
    primaryLabel: 'Pernyataan Hipotesis / Kejadian',
    primaryLabelEn: 'Core Hypothesis / Event Statement',
    secondaryLabel: 'Eksplanasi Skenario & Sebab-Akibat',
    secondaryLabelEn: 'Scenario Explanation & Cause-and-Effect',
    beatsLabel: 'Rantai Sebab-Akibat (Kejadian & Kaskade)',
    beatsLabelEn: 'Cause-and-Effect Chain (Events & Cascades)',
    endingLabel: 'Konklusi & Kesimpulan Ilmiah',
    endingLabelEn: 'Conclusion & Scientific Takeaway',
    description: 'Format eksplanatori murni: simulasi kejadian nyata, analisis sebab-akibat multi-disiplin, dan konklusi ilmiah.',
    descriptionEn: 'Pure explanatory format: realistic scenario simulation, interdisciplinary cause-and-effect chains, and scientific conclusions.',
    colorClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  },
  commercial: {
    badge: 'Iklan / Komersial', badgeEn: 'Commercial / Ad',
    primaryLabel: 'Masalah Konsumen', primaryLabelEn: 'Consumer Problem',
    secondaryLabel: 'Solusi & Keunggulan Produk', secondaryLabelEn: 'Product Solution & Benefits',
    beatsLabel: 'Alur Iklan (Commercial Arc)', beatsLabelEn: 'Commercial Arc',
    endingLabel: 'CTA / Ajakan Bertindak', endingLabelEn: 'CTA / Call to Action',
    description: 'Konten komersial high-conversion: Hook → Problem → Produk → Manfaat → CTA.',
    descriptionEn: 'High-conversion commercial: Hook → Problem → Product → Benefit → CTA.',
    colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  storytelling: {
    badge: 'Narasi / Cerita', badgeEn: 'Narrative / Story',
    primaryLabel: 'Premis Cerita', primaryLabelEn: 'Story Premise',
    secondaryLabel: 'Sinopsis Alur', secondaryLabelEn: 'Plot Synopsis',
    beatsLabel: 'Alur Cerita (Story Beats)', beatsLabelEn: 'Story Beats',
    endingLabel: 'Ending / Twist / Payoff', endingLabelEn: 'Ending / Twist / Payoff',
    description: 'Cerita sinematik, komedi, atau animasi dengan arc karakter yang kuat.',
    descriptionEn: 'Cinematic story, comedy, or animation with strong character arc.',
    colorClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
};

/** Returns localized UI labels for a given archetype. */
export function getArchetypeLabels(
  archetype: ContentArchetype,
  lang: 'id' | 'en' = 'id'
): {
  badge: string;
  primaryLabel: string;
  secondaryLabel: string;
  beatsLabel: string;
  endingLabel: string;
  description: string;
  colorClass: string;
} {
  const lbl = ARCHETYPE_LABELS[archetype];
  if (lang === 'en') {
    return {
      badge: lbl.badgeEn,
      primaryLabel: lbl.primaryLabelEn,
      secondaryLabel: lbl.secondaryLabelEn,
      beatsLabel: lbl.beatsLabelEn,
      endingLabel: lbl.endingLabelEn,
      description: lbl.descriptionEn,
      colorClass: lbl.colorClass,
    };
  }
  return {
    badge: lbl.badge,
    primaryLabel: lbl.primaryLabel,
    secondaryLabel: lbl.secondaryLabel,
    beatsLabel: lbl.beatsLabel,
    endingLabel: lbl.endingLabel,
    description: lbl.description,
    colorClass: lbl.colorClass,
  };
}
