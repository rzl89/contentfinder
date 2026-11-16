import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CONTENT_CATEGORIES,
  getCategoryById,
  CONTEXT_PRESETS,
} from '@/context-engine';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useProjectStore } from '@/stores/project-store';
import {
  useSubscriptionStore,
  FREE_TRIAL_MAX_STORYBOARD_GENERATIONS,
} from '@/stores/subscription-store';
import { generateContentIdeas, developStoryFromIdea } from '@/lib/ai-generator';
import type {
  ContentIdea,
  Platform,
  DurationRange,
  VisualStyle,
  ContextProfilePreset,
  DialogLanguage,
  TrendApproach,
} from '@/types';
import {
  Sparkles,
  Search,
  ArrowRight,
  Layers,
  Wand2,
  Clock,
  Compass,
  CheckCircle2,
  Info,
  Tv,
  Lock,
  Copy,
  Check,
} from 'lucide-react';

export const IdeaStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { currentProject, createProject } = useProjectStore();
  const {
    subscription,
    isCategoryAccessible,
    canGenerateStoryboard,
    incrementStoryboardCount,
    storyboardGenerationsCount,
  } = useSubscriptionStore();

  const routeState = (location.state || {}) as { categoryId?: string; topic?: string };

  // Search & filter for categories
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  // Generator form state — initialized from route state or current project if available
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    if (routeState.categoryId && isCategoryAccessible(routeState.categoryId)) {
      return routeState.categoryId;
    }
    if (currentProject?.categoryId && isCategoryAccessible(currentProject.categoryId)) {
      return currentProject.categoryId;
    }
    return 'time-travel';
  });

  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [duration, setDuration] = useState<DurationRange>('30-60s');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('cinematic_realistic');
  const [contextPreset, setContextPreset] = useState<ContextProfilePreset>('indonesia_natural');
  const [dialogLanguage, setDialogLanguage] = useState<DialogLanguage>('indonesian');
  const [trendApproach, setTrendApproach] = useState<TrendApproach>('trend_first');
  const [additionalTheme, setAdditionalTheme] = useState(routeState.topic || '');
  const [targetAudience, setTargetAudience] = useState('Audiens muda & kreator konten digital');
  const [ideaCount, setIdeaCount] = useState<5 | 10>(5);

  // Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [developingIdeaId, setDevelopingIdeaId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeCategory = getCategoryById(selectedCategoryId) || CONTENT_CATEGORIES[0];
  const validSubcatId = activeCategory.subcategories.some((s) => s.id === selectedSubcatId)
    ? selectedSubcatId
    : activeCategory.subcategories[0]?.id || '';

  const categoryGroups = [
    'all',
    'Storytelling & Entertainment',
    'Visual & AI Creativity',
    'Education, Facts & Mystery',
    'Social & Short-form Formats',
  ];

  const filteredCategories = CONTENT_CATEGORIES.filter((cat) => {
    const matchGroup = selectedGroupId === 'all' || cat.group === selectedGroupId;
    const matchSearch =
      categorySearch === '' ||
      cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      cat.description.toLowerCase().includes(categorySearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  const handleCopyHook = async (idea: ContentIdea) => {
    try {
      await navigator.clipboard.writeText(idea.hook);
      setCopiedKey(`hook_${idea.id}`);
      showToast({
        type: 'info',
        title: 'Hook Tersalin',
        message: 'Hook 1-3 detik berhasil disalin ke clipboard.',
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyFullIdea = async (idea: ContentIdea) => {
    try {
      const formatted = `=== ${idea.title.toUpperCase()} ===
Format: ${idea.visualStyle} | Durasi: ${idea.estimatedDuration}
Kategori: ${activeCategory.name}

🎣 HOOK:
${idea.hook}

📖 PREMIS:
${idea.premise}

📝 SINOPSIS:
${idea.synopsis}

🎬 STORY BEATS:
${idea.storyBeats.map((b) => `• ${b}`).join('\n')}

⚡ ENDING / PAYOFF:
${idea.ending}

📍 LOKASI & SETTING:
${idea.suggestedLocation}

🇮🇩 CATATAN LOKALISASI:
${idea.localizationNotes}`;

      await navigator.clipboard.writeText(formatted);
      setCopiedKey(`full_${idea.id}`);
      showToast({
        type: 'info',
        title: 'Ide Lengkap Tersalin',
        message: 'Seluruh struktur ide dan story beats berhasil disalin.',
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleGenerateIdeas = async () => {
    // Check Free Trial category access
    if (!isCategoryAccessible(selectedCategoryId)) {
      showToast({
        type: 'warning',
        title: 'Fitur Eksklusif Creator Pro',
        message: `Fitur ini eksklusif Creator Pro — Rp 59rb/bln. Kategori "${activeCategory.name}" terbuka penuh di paket Creator Pro.`,
      });
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateContentIdeas({
        projectId: currentProject?.id,
        categoryId: selectedCategoryId,
        subcategoryId: validSubcatId,
        platform,
        duration,
        visualStyle,
        contextProfile: CONTEXT_PRESETS[contextPreset],
        dialogLanguage,
        trendApproach,
        additionalTheme: additionalTheme.trim(),
        targetAudience: targetAudience.trim(),
        ideaCount,
      });

      setIdeas(generated);
      showToast({
        type: 'success',
        title: `${generated.length} Ide Berhasil Dihasilkan!`,
        message: `Kategori: ${activeCategory.name} dengan profil ${CONTEXT_PRESETS[contextPreset].name}.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Menghasilkan Ide',
        message: err.message || 'Terjadi kesalahan pada engine generator.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDevelopIdea = async (idea: ContentIdea) => {
    // Check Free Trial Storyboard quota limit (max 3x)
    if (!canGenerateStoryboard()) {
      showToast({
        type: 'warning',
        title: 'Batas Trial Tercapai (3/3)',
        message:
          'Fitur ini eksklusif Creator Pro — Rp 59rb/bln. Anda telah mencapai batas 3x generate storyboard di paket Free Trial.',
      });
      navigate('/pricing');
      return;
    }

    setDevelopingIdeaId(idea.id);
    try {
      // 1. Ensure project exists or create one
      let proj = currentProject;
      if (!proj) {
        proj = createProject(idea.title, idea.categoryId, contextPreset);
      }

      // 2. Generate Storyboard scenes, Character Bible & World Bible with model & language alignment
      const targetModel = proj?.targetModel || 'universal-neutral';
      const developed = await developStoryFromIdea(idea, 4, targetModel, dialogLanguage);

      // 3. Save to store atomically (overwriting old scenes & characters from previous storyboard)
      useProjectStore.getState().updateCurrentProject({
        name: idea.title,
        categoryId: idea.categoryId,
        selectedIdea: idea,
        characters: developed.characters,
        worldBible: developed.worldBible,
        scenes: developed.scenes,
      });

      // 4. Increment trial usage counter
      incrementStoryboardCount();

      showToast({
        type: 'success',
        title: 'Storyboard Siap di Production Desk!',
        message: 'Karakter, World Bible, dan 4 adegan telah disusun lengkap.',
      });

      // 5. Navigate to Prompt Desk
      navigate('/prompt-desk');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Menyusun Storyboard',
        message: err.message,
      });
    } finally {
      setDevelopingIdeaId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#14141c] via-[#101015] to-[#14141c] border border-white/10 shadow-2xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Content Idea Studio — 19 Creative Frameworks</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Eksplorasi Ide Konten & Narasi Video Pendek
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pilih dari 19 kategori dengan creative logic spesifik, kunci konteks Indonesia natural tanpa stereotip, dan kembangkan ide menjadi storyboard adegan siap prompt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="emerald"
            size="md"
            icon={<Wand2 className="w-4 h-4" />}
            onClick={() => {
              const el = document.getElementById('idea-generator-form');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Mulai Buat Ide
          </Button>
        </div>
      </div>

      {/* 1. Category Selection Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>1. Pilih Kategori Konten ({CONTENT_CATEGORIES.length} Kategori)</span>
              </h3>
              {subscription.tier !== 'pro' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-medium text-amber-300">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Free Trial: 3 Kategori Aktif • Kuota Storyboard: {storyboardGenerationsCount}/{FREE_TRIAL_MAX_STORYBOARD_GENERATIONS}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {subscription.tier === 'pro'
                ? 'Seluruh 19 kategori terbuka dengan creative framework dan hook style spesifik.'
                : 'Free Trial membuka 3 kategori unggulan. Upgrade ke Creator Pro untuk membuka seluruh 19 kategori.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Cari kategori..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                icon={<Search className="w-3.5 h-3.5" />}
              />
            </div>
          </div>
        </div>

        {/* Category Group Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoryGroups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroupId(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedGroupId === g
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              {g === 'all' ? 'Semua Kategori' : g}
            </button>
          ))}
        </div>

        {/* Pro Banner for Free Trial Users */}
        {subscription.tier !== 'pro' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-amber-300">Fitur ini eksklusif Creator Pro — Rp 59rb/bln.</strong> Akses seluruh 19 kategori konten, kuota storyboard tanpa batas, dan BYOK video generation.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/pricing')}
              className="shrink-0"
            >
              Upgrade Creator Pro
            </Button>
          </div>
        )}

        {/* 19 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1 pr-2">
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const isAccessible = isCategoryAccessible(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (!isAccessible) {
                    showToast({
                      type: 'warning',
                      title: 'Fitur Eksklusif Creator Pro',
                      message: `Fitur ini eksklusif Creator Pro — Rp 59rb/bln. Kategori "${cat.name}" terbuka penuh di paket Creator Pro.`,
                    });
                    return;
                  }
                  setSelectedCategoryId(cat.id);
                  setSelectedSubcatId(cat.subcategories[0]?.id || '');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  !isAccessible
                    ? 'bg-[#0f0f13] border-white/5 opacity-70 hover:opacity-100 hover:border-amber-500/30'
                    : isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
                    : 'bg-[#111115] border-white/8 hover:border-white/20 hover:bg-[#16161c]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-semibold text-zinc-200 line-clamp-1">
                      {cat.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    {!isAccessible && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 shrink-0">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{cat.subcategories.length} subkategori</span>
                  <span className="font-mono text-amber-400/80">{cat.group.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Active Category Creative Logic Inspector */}
      <BentoTile className="p-5 border-amber-500/20 bg-gradient-to-b from-[#14141c] to-[#0e0e12]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-amber-400">{activeCategory.name}</h4>
              <Badge variant="amber">{activeCategory.group}</Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{activeCategory.description}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Durasi rekomendasi: {activeCategory.suggestedDuration.join(', ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Creative Framework</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {activeCategory.creativeFramework}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              <span>Hook Style (0-3s)</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {activeCategory.hookStyle}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Panduan Konteks Indonesia</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {activeCategory.indonesiaGuidance || 'Universal / adaptif tanpa stereotip berlebihan.'}
            </p>
          </div>
        </div>
      </BentoTile>

      {/* 3. Studio Production Parameters Form */}
      <section id="idea-generator-form" className="space-y-4">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span>2. Konfigurasi Parameter Produksi Konten</span>
        </h3>

        <BentoTile className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subcategory */}
            <Select
              label="Subkategori"
              value={selectedSubcatId || activeCategory.subcategories[0]?.id}
              onChange={(e) => setSelectedSubcatId(e.target.value)}
              options={activeCategory.subcategories.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />

            {/* Target Platform */}
            <Select
              label="Target Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              options={[
                { value: 'tiktok', label: 'TikTok (9:16 Vertical)' },
                { value: 'instagram_reels', label: 'Instagram Reels (9:16)' },
                { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)' },
                { value: 'facebook_reels', label: 'Facebook Reels' },
                { value: 'multi_platform', label: 'Multi-Platform Universal' },
              ]}
            />

            {/* Target Duration */}
            <Select
              label="Target Durasi"
              value={duration}
              onChange={(e) => setDuration(e.target.value as DurationRange)}
              options={[
                { value: '10-15s', label: '10–15 Detik (Ultra Fast Hook)' },
                { value: '15-30s', label: '15–30 Detik (Standard Viral)' },
                { value: '30-60s', label: '30–60 Detik (Deep Narrative)' },
                { value: '1-3min', label: '1–3 Menit (Mini Story / Series)' },
              ]}
            />

            {/* Visual Style */}
            <Select
              label="Gaya Visual"
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
              options={[
                { value: 'cinematic_realistic', label: 'Cinematic Realistic (Default)' },
                { value: '3d_animation', label: '3D Animation High-Detail' },
                { value: '2d_animation', label: '2D Hand-drawn Animation' },
                { value: 'stickman', label: 'Stickman Minimalist Animation' },
                { value: 'anime', label: 'Modern Anime / Makoto Shinkai Style' },
                { value: 'stylized', label: 'Stylized Pixar / 3D Character' },
                { value: 'surreal_fantasy', label: 'Surreal / Fantasy Ethereal' },
                { value: 'minimalist_faceless', label: 'Minimalist Faceless Aesthetic' },
              ]}
            />

            {/* Context Profile */}
            <Select
              label="Context Engine Profile"
              value={contextPreset}
              onChange={(e) => setContextPreset(e.target.value as ContextProfilePreset)}
              options={[
                { value: 'indonesia_natural', label: 'Indonesia Natural (Default)' },
                { value: 'indonesia_urban', label: 'Indonesia Urban (Kota Modern)' },
                { value: 'indonesia_rural', label: 'Indonesia Rural (Alam & Asri)' },
                { value: 'global_neutral', label: 'Global Neutral (Universal)' },
                { value: 'southeast_asia', label: 'Southeast Asia (ASEAN)' },
                { value: 'fantasy_custom', label: 'Fantasy / Custom World' },
              ]}
            />

            {/* Dialogue Language */}
            <Select
              label="Bahasa Dialog & Narasi"
              value={dialogLanguage}
              onChange={(e) => setDialogLanguage(e.target.value as DialogLanguage)}
              options={[
                { value: 'indonesian', label: 'Bahasa Indonesia (Natural Santai)' },
                { value: 'english', label: 'English' },
                { value: 'javanese', label: 'Bahasa Jawa' },
                { value: 'sundanese', label: 'Bahasa Sunda' },
                { value: 'mixed', label: 'Campuran / Code-switching' },
                { value: 'none', label: 'Tanpa Dialog (Hanya Teks/Audio)' },
              ]}
            />

            {/* Trend Approach */}
            <Select
              label="Pendekatan Tren"
              value={trendApproach}
              onChange={(e) => setTrendApproach(e.target.value as TrendApproach)}
              options={[
                { value: 'trend_first', label: 'Trend-First (Adaptasi Pola Terverifikasi)' },
                { value: 'topic_first', label: 'Topic-First (Fokus Substansi Subjek)' },
                { value: 'evergreen', label: 'Evergreen (Daya Tahan Jangka Panjang)' },
                { value: 'hybrid', label: 'Hybrid (Pola Tren + Pesan Bermakna)' },
              ]}
            />

            {/* Idea Count */}
            <Select
              label="Jumlah Ide yang Dihasilkan"
              value={ideaCount.toString()}
              onChange={(e) => setIdeaCount(Number(e.target.value) as 5 | 10)}
              options={[
                { value: '5', label: '5 Pilihan Ide Terkurasi' },
                { value: '10', label: '10 Pilihan Ide Lengkap' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Tema Tambahan / Kata Kunci Khusus (Opsional)"
              placeholder="Contoh: kopi senja, rahasia arsip tua, artificial intelligence..."
              value={additionalTheme}
              onChange={(e) => setAdditionalTheme(e.target.value)}
            />
            <Input
              label="Target Audiens"
              placeholder="Contoh: Gen-Z pekerja kantoran, pecinta sejarah, penonton curious..."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="text-xs text-zinc-400">
              Profil aktif: <span className="text-amber-400 font-medium">{CONTEXT_PRESETS[contextPreset].name}</span>. Prompt teknis otomatis berbahasa Inggris.
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={isGenerating}
              icon={<Sparkles className="w-5 h-5 text-black" />}
              onClick={handleGenerateIdeas}
              className="w-full sm:w-auto"
            >
              Hasilkan {ideaCount} Ide Sekarang
            </Button>
          </div>
        </BentoTile>
      </section>

      {/* Informative loading state while Fixprom AI produces diverse ideas */}
      {isGenerating && (
        <BentoTile className="p-8 border-amber-500/30 bg-[#111115] text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-100">
              Fixprom AI Sedang Merancang {ideaCount} Ide Kreatif
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Menerapkan creative angle berbeda (hook unik, eskalasi konflik, latar) serta menyaring duplikasi untuk memastikan setiap ide segar.
            </p>
          </div>
        </BentoTile>
      )}

      {/* 4. Generated Ideas Results Section */}
      {ideas.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Hasil Eksplorasi: {ideas.length} Ide Konten</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pilih ide terbaik untuk dikembangkan menjadi Character Bible, World Bible, dan adegan Storyboard.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {ideas.map((idea, idx) => (
              <BentoTile
                key={idea.id}
                className="p-6 border-white/10 hover:border-amber-500/30 space-y-4 bg-[#111115]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        #{idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-zinc-100">{idea.title}</h4>
                      <Badge variant="zinc">{idea.estimatedDuration}</Badge>
                      <Badge variant="blue">{idea.visualStyle.replace(/_/g, ' ')}</Badge>
                      {idea.trendEvidence && (
                        <Badge variant="emerald">Trend-Inspired</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={copiedKey === `hook_${idea.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      onClick={() => handleCopyHook(idea)}
                    >
                      {copiedKey === `hook_${idea.id}` ? 'Hook Tersalin' : 'Salin Hook'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={copiedKey === `full_${idea.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      onClick={() => handleCopyFullIdea(idea)}
                    >
                      {copiedKey === `full_${idea.id}` ? 'Ide Tersalin' : 'Salin Ide'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={developingIdeaId === idea.id}
                      icon={<ArrowRight className="w-4 h-4 text-black" />}
                      onClick={() => handleDevelopIdea(idea)}
                    >
                      Kembangkan ke Storyboard
                    </Button>
                  </div>
                </div>

                {/* Hook Callout Box */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-400 block mb-0.5">
                    🎣 Hook 1-3 Detik Pertama:
                  </span>
                  <p className="text-zinc-200 italic font-mono">{idea.hook}</p>
                </div>

                {/* Synopsis & Premise */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 font-semibold">Premis Inti: </span>
                    <span className="text-zinc-200">{idea.premise}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold">Sinopsis Singkat: </span>
                    <span className="text-zinc-300 leading-relaxed">{idea.synopsis}</span>
                  </div>
                </div>

                {/* Story Beats */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-xs font-semibold text-zinc-300 block">
                    Alur Cerita (Story Beats):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {idea.storyBeats.map((beat, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-zinc-300 text-[11px]"
                      >
                        {beat}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflict, Payoff, Location & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-white/5">
                  <div className="p-2.5 rounded-lg bg-[#14141a] space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                      Ending / Payoff
                    </span>
                    <p className="text-zinc-300 text-[11px]">{idea.ending}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#14141a] space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
                      Saran Lokasi & Setting
                    </span>
                    <p className="text-zinc-300 text-[11px]">{idea.suggestedLocation}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#14141a] space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                      Catatan Lokalisasi
                    </span>
                    <p className="text-zinc-300 text-[11px]">{idea.localizationNotes}</p>
                  </div>
                </div>
              </BentoTile>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
