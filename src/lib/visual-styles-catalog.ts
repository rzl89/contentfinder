export interface VisualStyleItem {
  id: string;
  name: string;
  category: 'Cinematic' | 'Animation' | 'Artistic' | 'Commercial' | 'Stylized';
  description: string;
  promptKeywords: string;
  sampleImageUrl: string;
}

export const VISUAL_STYLES: VisualStyleItem[] = [
  {
    id: 'cinematic_realistic',
    name: '01 — Ultra Photorealistic Cinematic',
    category: 'Cinematic',
    description: 'Pencahayaan sinematik dramatis 35mm, kedalaman ruang dangkal (bokeh), tekstur realistis, dan grading warna film layar lebar.',
    promptKeywords: '35mm anamorphic lens, shallow depth of field, photorealistic 8k, cinematic dramatic lighting, film grain, balanced color grading',
    sampleImageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'anime_ghibli',
    name: '02 — Studio Ghibli Anime',
    category: 'Animation',
    description: 'Palet cat air lembut, langit biru berawan tebal, dedaunan hijau subur, dan kehangatan ilustrasi tangan bernuansa nostalgia.',
    promptKeywords: 'Studio Ghibli style, lush watercolor landscape, painted anime background, soft sunlight, nostalgic atmosphere, hand-drawn aesthetic',
    sampleImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3d_animation',
    name: '03 — 3D Cartoon Animation',
    category: 'Animation',
    description: 'Karakter 3D animasi modern ala Pixar & DreamWorks, ekspresi wajah dinamis, pencahayaan lembut, dan material bertekstur halus.',
    promptKeywords: 'Pixar 3D animation style, cute character render, subsurface scattering, octane render, soft ambient lighting, vibrant colorful palette',
    sampleImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2d_cartoon',
    name: '04 — 2D Cartoon (Flat colors, bold outlines)',
    category: 'Animation',
    description: 'Garis luar (outline) tegas tebal, bidang warna solid tanpa gradasi berlebihan, gaya komik modern dan kartun TV kontemporer.',
    promptKeywords: '2D flat cartoon illustration, bold black outlines, solid vibrant colors, clean comic book style, minimalist shading',
    sampleImageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'anime',
    name: '05 — Modern Anime (Shonen style)',
    category: 'Animation',
    description: 'Gaya animasi Jepang modern bertempo cepat, kontras bayangan cel-shaded tajam, aksen aura energi, dan sudut kamera dinamis.',
    promptKeywords: 'Modern shonen anime key visual, crisp cel shading, dynamic action angle, sharp line art, atmospheric particles, vibrant saturation',
    sampleImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'claymation',
    name: '06 — Stop-motion / Claymation',
    category: 'Stylized',
    description: 'Tekstur lilin lempung (clay) nyata dengan bekas sidik jari halus, pencahayaan studio fisik miniatur, dan nuansa animasi stop-motion klasik.',
    promptKeywords: 'Claymation stop-motion aesthetic, handmade plasticine texture, tactile fingerprints on clay, miniature studio lighting, depth of field',
    sampleImageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3d_product_commercial',
    name: '07 — Glossy 3D Product Commercial (Studio look)',
    category: 'Commercial',
    description: 'Visual komersial iklan premium, pencahayaan softbox studio reflektif, podium marmer/akrilik, cipratan cairan atau partikel mewah.',
    promptKeywords: 'Commercial studio product photography, clean reflections, glossy 3D render, luxury podium, rim light, floating micro-particles, 8k UHD',
    sampleImageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vintage_35mm',
    name: '08 — Vintage Retro 35mm Film',
    category: 'Cinematic',
    description: 'Grain film organik khas Kodak Portra, saturasi hangat retro tahun 70/80-an, flare lensa alami, dan nuansa rekaman kamera analog.',
    promptKeywords: 'Vintage 35mm analog photograph, Kodak Portra 400 grain, warm golden retro tones, natural light leak, authentic vintage film look',
    sampleImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'neon_music_video',
    name: '09 — Neon Stylized Music-Video Look',
    category: 'Stylized',
    description: 'Pencahayaan neon kontras tinggi (cyan, magenta, amber), asap kabut panggung, pantulan basah, dan atmosfer video klip pop/elektronik.',
    promptKeywords: 'Cyberpunk neon glow, dual-tone cyan and magenta rim light, volumetric fog, wet asphalt reflections, stylized music video aesthetics',
    sampleImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'documentary_realism',
    name: '10 — Documentary Realism',
    category: 'Cinematic',
    description: 'Cahaya alami apa adanya tanpa tata rias berlebih, komposisi kamera jurnalisme lapangan, tekstur asli tanpa filter buatan.',
    promptKeywords: 'Documentary style realism, natural ambient sunlight, unedited candid composition, gritty authentic textures, photojournalism',
    sampleImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stickman',
    name: 'Stickman Minimalist Animation (Viral Spec)',
    category: 'Stylized',
    description: 'Karakter figur stik sederhana bergaris putih bersih di atas latar gelap, efek coretan kartun lucu, dan ekspresi cepat yang viral di medsos.',
    promptKeywords: 'Minimalist white stickman figure on dark background, playful cartoon doodle elements, high contrast clean lines, viral comedic short-form format',
    sampleImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stylized',
    name: 'Stylized Pixar / 3D Character',
    category: 'Animation',
    description: 'Desain karakter 3D proporsional menggemaskan, mata ekspresif besar, rambut bertekstur lembut, dan pencahayaan hangat penuh emosi.',
    promptKeywords: 'Stylized whimsical 3D character, oversized expressive eyes, soft hair shaders, Disney Pixar inspired, warm golden rim lighting',
    sampleImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'surreal_fantasy',
    name: 'Surreal / Fantasy Ethereal',
    category: 'Artistic',
    description: 'Dunia fantasi magis dengan partikel bercahaya (bioluminescent), pulau melayang, warna pastel mimpi, dan atmosfer magis tak terbatas.',
    promptKeywords: 'Surreal fantasy world, ethereal bioluminescent glow, floating mystical elements, dreamy pastel mist, enchanted cinematic landscape',
    sampleImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'minimalist_faceless',
    name: 'Minimalist Faceless Aesthetic',
    category: 'Stylized',
    description: 'Siluet elegan tanpa detail wajah yang rumit, palet warna monokrom atau tanah (earth-tone), memberi kesan misterius dan modern.',
    promptKeywords: 'Minimalist faceless human silhouette, aesthetic earth-tone palette, clean modern composition, soft diffuse shadows, elegant simplicity',
    sampleImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  },
];

export function getVisualStyleById(id: string): VisualStyleItem {
  return VISUAL_STYLES.find((v) => v.id === id) || VISUAL_STYLES[0];
}
