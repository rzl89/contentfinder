import type { ContextProfile, ContextProfilePreset } from '@/types';

/**
 * ============================================================================
 * DEFAULT CONTEXT PROFILE — INDONESIA NATURAL
 * ============================================================================
 *
 * Sembilan Aturan Wajib Context Engine:
 * 1. Jangan menganggap semua cerita harus berlatar Jakarta.
 * 2. Jangan memasukkan motor, warung, pasar, gang, rumah sederhana, atau simbol lokal secara acak ke setiap cerita.
 * 3. Pilih lingkungan berdasarkan kebutuhan narasi. Mixed berarti pilihan lingkungan beragam, bukan semua scene harus ganti tempat.
 * 4. Jika pengguna memilih lokasi/daerah spesifik, gunakan detail daerah itu hanya jika relevan dan dapat dipertanggungjawabkan.
 * 5. Jangan menggeneralisasi budaya, kelas sosial, pekerjaan, keluarga, agama, atau kebiasaan seluruh orang Indonesia.
 * 6. Jangan menebak etnisitas atau atribut sensitif seseorang dari foto. Analisis foto hanya boleh mendeskripsikan ciri visual yang tampak dan relevan seperti rambut, pakaian, aksesori, pose, dan warna.
 * 7. Cerita fiksi, sejarah, fantasi, atau futuristik boleh memakai latar non-Indonesia jika diperlukan. Bahasa dan target audiens tetap mengikuti project profile.
 * 8. Profil konteks bisa di-override per proyek dan per scene. Instruksi khusus pengguna memiliki prioritas tertinggi.
 * 9. Context Engine harus aktif dari tahap ide sampai prompt final, bukan baru ditambahkan di akhir.
 */

export const DEFAULT_CONTEXT_PROFILE: ContextProfile = {
  id: 'indonesia-natural-default',
  name: 'Indonesia Natural (Default)',
  targetMarket: 'Indonesia',
  environment: 'mixed',
  visualStyle: 'cinematic_realistic',
  dialogLanguage: 'indonesian',
  captionLanguage: 'indonesian',
  promptLanguage: 'en',
  preset: 'indonesia_natural',
  localization: {
    region: 'Indonesia (Campuran Urban, Suburban, Rural, Natural)',
    culturalNotes: [
      'Gunakan konteks lokal secara natural dan elegan, bukan karikatur atau stereotip.',
      'Hindari memasukkan warung, motor, gang sempit kecuali relevan secara naratif.',
      'Variasi latar dapat berupa ruang publik modern, alam terbuka, kafe, kantor, atau rumah tinggal sesuai kebutuhan adegan.',
      'Gaya percakapan santai, realistis, dan menggunakan Bahasa Indonesia percakapan yang wajar.',
    ],
    namingConvention: 'Nama Indonesia kontemporer umum (misal: Dimas, Rian, Maya, Sarah, Nadia)',
    currency: 'IDR (Rp)',
    typicalLandscapes: ['Urban skyline', 'Suburban green streets', 'Highland hills', 'Coastal breeze', 'Modern interiors'],
  },
};

export const CONTEXT_PRESETS: Record<ContextProfilePreset, ContextProfile> = {
  indonesia_natural: { ...DEFAULT_CONTEXT_PROFILE },
  indonesia_urban: {
    id: 'indonesia-urban',
    name: 'Indonesia Urban',
    targetMarket: 'Indonesia',
    environment: 'urban',
    visualStyle: 'cinematic_realistic',
    dialogLanguage: 'indonesian',
    captionLanguage: 'indonesian',
    promptLanguage: 'en',
    preset: 'indonesia_urban',
    localization: {
      region: 'Kota-kota Besar Indonesia (Jakarta, Surabaya, Bandung, Medan, Makassar)',
      culturalNotes: [
        'Nuansa perkotaan dinamis: gedung perkantoran, kafe modern, transportasi publik MRT/LRT, apartemen.',
        'Dialog kasual urban kontemporer, santun namun lugas.',
      ],
      namingConvention: 'Nama urban populer',
      currency: 'IDR (Rp)',
      typicalLandscapes: ['Modern office corridors', 'Coffee shop patios', 'Transit stations', 'Rooftop lounges'],
    },
  },
  indonesia_rural: {
    id: 'indonesia-rural',
    name: 'Indonesia Rural',
    targetMarket: 'Indonesia',
    environment: 'rural',
    visualStyle: 'cinematic_realistic',
    dialogLanguage: 'indonesian',
    captionLanguage: 'indonesian',
    promptLanguage: 'en',
    preset: 'indonesia_rural',
    localization: {
      region: 'Pedesaan & Daerah Indonesia (Jawa, Bali, Sumatera, Sulawesi)',
      culturalNotes: [
        'Nuansa alam pedesaan, perkebunan, perbukitan, atau pesisir yang tenang dan asri.',
        'Hindari romantisisasi kemiskinan; fokus pada kehangatan komunitas, ketenangan lanskap, dan kearifan lokal.',
      ],
      namingConvention: 'Nama daerah khas bersahaja',
      currency: 'IDR (Rp)',
      typicalLandscapes: ['Terraced rice fields', 'Quiet rural lanes', 'Mountain footpaths', 'Breezy coastal villages'],
    },
  },
  global_neutral: {
    id: 'global-neutral',
    name: 'Global Neutral',
    targetMarket: 'Global',
    environment: 'mixed',
    visualStyle: 'cinematic_realistic',
    dialogLanguage: 'english',
    captionLanguage: 'english',
    promptLanguage: 'en',
    preset: 'global_neutral',
    localization: {
      region: 'International / Universal',
      culturalNotes: [
        'Latar dan karakter yang mudah dipahami oleh audiens global dari berbagai negara.',
        'Gaya visual universal tanpa kekhasan etnis atau regional yang membatasi.',
      ],
      namingConvention: 'Universal names (Alex, Jordan, Liam, Emma, Maya)',
      currency: 'USD ($)',
      typicalLandscapes: ['Metropolitan streets', 'Modern minimalist homes', 'Natural scenic parks', 'Studio settings'],
    },
  },
  southeast_asia: {
    id: 'southeast-asia',
    name: 'Southeast Asia',
    targetMarket: 'Southeast Asia (ASEAN)',
    environment: 'mixed',
    visualStyle: 'cinematic_realistic',
    dialogLanguage: 'mixed',
    captionLanguage: 'english',
    promptLanguage: 'en',
    preset: 'southeast_asia',
    localization: {
      region: 'Kawasan Asia Tenggara Tropis',
      culturalNotes: [
        'Karakteristik tropis, arsitektur tropis kontemporer, perpaduan tradisi dan modernitas Asia Tenggara.',
      ],
      namingConvention: 'Regional ASEAN names',
      currency: 'Regional',
      typicalLandscapes: ['Tropical modern streets', 'Lush botanical gardens', 'Bustling night markets', 'Coastal bays'],
    },
  },
  fantasy_custom: {
    id: 'fantasy-custom',
    name: 'Fantasy / Custom World',
    targetMarket: 'Global',
    environment: 'fantasy',
    visualStyle: 'surreal_fantasy',
    dialogLanguage: 'none',
    captionLanguage: 'english',
    promptLanguage: 'en',
    preset: 'fantasy_custom',
    localization: {
      region: 'Dunia Imajinasi / Fiksi Bebas',
      culturalNotes: [
        'Bebas dari aturan dunia nyata, fokus pada logika dunia imajiner yang dibangun.',
        'Nuansa sinematik fantastis, mistis, atau futuristik spekulatif.',
      ],
      namingConvention: 'Fantasy / Sci-Fi archetype names',
      currency: 'Fictional',
      typicalLandscapes: ['Floating islands', 'Crystalline caves', 'Neon monoliths', 'Ethereal nebulae'],
    },
  },
};
