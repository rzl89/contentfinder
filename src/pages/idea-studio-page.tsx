import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  CONTENT_CATEGORIES,
  getCategoryById,
  getLocalizedCategories,
  CONTEXT_PRESETS,
} from '@/context-engine';
import { MODEL_CAPABILITIES } from '@/lib/model-catalog';
import { VISUAL_STYLES, getVisualStyleById } from '@/lib/visual-styles-catalog';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
  Modal,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useProjectStore } from '@/stores/project-store';
import { useSubscriptionStore, calculateActionCredits } from '@/stores/subscription-store';
import { useLanguageStore } from '@/stores/language-store';
import { generateContentIdeas, developStoryFromIdea } from '@/lib/ai-generator';
import type {
  ContentIdea,
  Platform,
  DurationRange,
  VisualStyle,
  ContextProfilePreset,
  DialogLanguage,
} from '@/types';
import {
  Sparkles,
  Search,
  ArrowRight,
  Layers,
  Wand2,
  Clock,
  CheckCircle2,
  Info,
  Lock,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Crown,
} from 'lucide-react';

export const IdeaStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { language, t } = useLanguageStore();
  const { currentProject, createProject } = useProjectStore();
  const {
    subscription,
    isCategoryAccessible,
    incrementStoryboardCount,
    hasSufficientCredits,
    deductCredits,
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

  const savedStudioPrefs = (() => {
    try {
      const raw = localStorage.getItem('fixprom_user_studio_prefs');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [ideaMode, setIdeaMode] = useState<'ai_generate' | 'manual_input'>('ai_generate');
  const [storyboardType, setStoryboardType] = useState<'clip' | 'ad'>('clip');
  const [productBrandName, setProductBrandName] = useState<string>('');
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>(() => savedStudioPrefs?.defaultPlatform || 'tiktok');
  const [duration, setDuration] = useState<DurationRange>(() => savedStudioPrefs?.defaultDuration || '10s');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(() => savedStudioPrefs?.defaultVisualStyle || 'cinematic_realistic');
  const [contextPreset, setContextPreset] = useState<ContextProfilePreset>('indonesia_natural');
  const [dialogLanguage, setDialogLanguage] = useState<DialogLanguage>(() => savedStudioPrefs?.defaultDialogLanguage || 'indonesian');
  const [additionalTheme, setAdditionalTheme] = useState(routeState.topic || '');
  const [ideaCount, setIdeaCount] = useState<number>(5);
  const [targetModel, setTargetModel] = useState<string>(
    () => currentProject?.targetModel || savedStudioPrefs?.defaultModelId || 'universal-neutral'
  );

  // Two-way reactive sync: listen to settings updates from Settings page or external events
  useEffect(() => {
    const handlePrefsUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (detail.defaultModelId) setTargetModel(detail.defaultModelId);
        if (detail.defaultVisualStyle) setVisualStyle(detail.defaultVisualStyle);
        if (detail.defaultPlatform) setPlatform(detail.defaultPlatform);
        if (detail.defaultDuration) setDuration(detail.defaultDuration);
        if (detail.defaultDialogLanguage) setDialogLanguage(detail.defaultDialogLanguage);
      }
    };
    window.addEventListener('fixprom:studio-prefs-updated', handlePrefsUpdated);
    return () => {
      window.removeEventListener('fixprom:studio-prefs-updated', handlePrefsUpdated);
    };
  }, []);

  // Sync when currentProject changes
  useEffect(() => {
    if (currentProject?.targetModel) {
      setTargetModel(currentProject.targetModel);
    }
  }, [currentProject?.id, currentProject?.targetModel]);

  // Instant Two-Way Handlers: automatically save parameter modifications to project & studio prefs
  const handleTargetModelChange = (newModelId: string) => {
    setTargetModel(newModelId);
    useProjectStore.getState().updateCurrentProject({ targetModel: newModelId });
    try {
      const raw = localStorage.getItem('fixprom_user_studio_prefs');
      const current = raw ? JSON.parse(raw) : {};
      const updated = { ...current, defaultModelId: newModelId };
      localStorage.setItem('fixprom_user_studio_prefs', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('fixprom:studio-prefs-updated', { detail: updated }));
    } catch (e) {
      console.warn('Could not auto-save target model preference', e);
    }
  };

  const handleVisualStyleChange = (style: VisualStyle) => {
    setVisualStyle(style);
    try {
      const raw = localStorage.getItem('fixprom_user_studio_prefs');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('fixprom_user_studio_prefs', JSON.stringify({ ...current, defaultVisualStyle: style }));
    } catch {}
  };

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    try {
      const raw = localStorage.getItem('fixprom_user_studio_prefs');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('fixprom_user_studio_prefs', JSON.stringify({ ...current, defaultPlatform: p }));
    } catch {}
  };

  const handleDurationChange = (d: DurationRange) => {
    setDuration(d);
    try {
      const raw = localStorage.getItem('fixprom_user_studio_prefs');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('fixprom_user_studio_prefs', JSON.stringify({ ...current, defaultDuration: d }));
    } catch {}
  };

  const handleDialogLanguageChange = (l: DialogLanguage) => {
    setDialogLanguage(l);
    try {
      const raw = localStorage.getItem('fixprom_user_studio_prefs');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('fixprom_user_studio_prefs', JSON.stringify({ ...current, defaultDialogLanguage: l }));
    } catch {}
  };

  // Visual gallery modal state
  const [isVisualGalleryOpen, setIsVisualGalleryOpen] = useState(false);

  // Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [developingIdeaId, setDevelopingIdeaId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const localizedCategories = getLocalizedCategories(language);
  const activeCategory = getCategoryById(selectedCategoryId, language) || localizedCategories[0];
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

  const filteredCategories = localizedCategories.filter((cat) => {
    const matchGroup = selectedGroupId === 'all' || cat.group === selectedGroupId || (cat.groupEn && cat.groupEn === selectedGroupId);
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

    const inputWords = additionalTheme.trim().split(/\s+/).filter(Boolean).length;
    const baseCost = 1;
    const creditCalculation = calculateActionCredits('generate_ideas', inputWords);
    const ideaCreditsCost = creditCalculation.isExtended ? baseCost + creditCalculation.extraCredits : baseCost;

    // Check Credits
    if (!hasSufficientCredits(ideaCreditsCost)) {
      showToast({
        type: 'warning',
        title: t('Pemberitahuan Kuota Akun', 'Account Quota Notice'),
        message: t(
          'Halo! Kuota Free Trial untuk perangkat atau jaringan internet ini sebelumnya telah digunakan. Silakan upgrade ke Creator Pro untuk menggunakan seluruh fitur studio kreatif tanpa batas.',
          'Hello! The Free Trial quota for this device or network was previously claimed. Please upgrade to Creator Pro to unlock and use all studio features.'
        ),
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
        trendApproach: 'trend_first',
        additionalTheme: additionalTheme.trim(),
        targetAudience: 'Audiens umum & kreator konten digital',
        ideaCount,
        storyboardType,
        ideaMode,
        productBrandName: productBrandName.trim(),
        targetModel,
        creativeFramework: activeCategory.creativeFramework,
        hookStyle: activeCategory.hookStyle,
        globalGuidance: activeCategory.globalGuidance,
      });

      setIdeas(generated);

      // Deduct credits atomically with token/wordCount metadata for admin logging
      await deductCredits(ideaCreditsCost, 'generate_ideas', {
        wordCount: inputWords,
        isExtended: creditCalculation.isExtended,
      });

      showToast({
        type: 'success',
        title: `${generated.length} Ide Berhasil Dihasilkan!`,
        message: `Kategori: ${activeCategory.name} dengan profil ${CONTEXT_PRESETS[contextPreset].name}. (-${ideaCreditsCost} Kredit AI)`,
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
    const ideaWords = `${idea.title} ${idea.hook} ${idea.premise} ${idea.synopsis}`.split(/\s+/).filter(Boolean).length;
    const creditCalculation = calculateActionCredits('generate_storyboard', ideaWords);
    const storyboardCost = creditCalculation.totalCost;

    // Check Credits
    if (!hasSufficientCredits(storyboardCost)) {
      showToast({
        type: 'warning',
        title: t('Pemberitahuan Kuota Akun', 'Account Quota Notice'),
        message: t(
          'Halo! Kuota Free Trial untuk perangkat atau jaringan internet ini sebelumnya telah digunakan. Silakan upgrade ke Creator Pro untuk menggunakan seluruh fitur studio kreatif tanpa batas.',
          'Hello! The Free Trial quota for this device or network was previously claimed. Please upgrade to Creator Pro to unlock and use all studio features.'
        ),
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
      const isAdOrAffiliate =
        idea.categoryId === 'affiliate-marketing' ||
        idea.categoryId === 'product-story';
      const sceneCount = isAdOrAffiliate ? 9 : 8;
      const activeModel = targetModel || proj?.targetModel || savedStudioPrefs?.defaultModelId || 'universal-neutral';
      const developed = await developStoryFromIdea(
        idea,
        sceneCount,
        activeModel,
        dialogLanguage,
        {
          platform,
          visualStyle,
          duration,
          storyboardType,
          productBrandName: productBrandName.trim(),
          targetAudience: 'Audiens umum & kreator konten digital',
          customTopic: additionalTheme.trim(),
          creativeFramework: idea.creativeFramework || activeCategory.creativeFramework,
          hookStyle: idea.hookStyle || activeCategory.hookStyle,
          globalGuidance: idea.globalGuidance || activeCategory.globalGuidance,
        }
      );

      // 3. Save to store atomically (overwriting old scenes & characters from previous storyboard)
      useProjectStore.getState().updateCurrentProject({
        name: idea.title,
        categoryId: idea.categoryId,
        targetModel: activeModel,
        platform,
        selectedIdea: {
          ...idea,
          platform,
          visualStyle,
          estimatedDuration: duration,
          storyboardType,
          productBrandName: productBrandName.trim(),
          targetModel: activeModel,
        },
        creativeFramework: idea.creativeFramework || activeCategory.creativeFramework,
        hookStyle: idea.hookStyle || activeCategory.hookStyle,
        globalGuidance: idea.globalGuidance || activeCategory.globalGuidance,
        characters: developed.characters,
        worldBible: developed.worldBible,
        scenes: developed.scenes,
        masterStoryboardImagePrompt: developed.imagePromptJson,
        masterStoryboardVideoPrompt: developed.videoPromptJson,
        storyboardPlanSummary: developed.planSummary,
        storyboardValidationReport: developed.validationReport,
      });

      // 4. Increment usage counter & deduct credits with audit metadata
      incrementStoryboardCount();
      await deductCredits(storyboardCost, 'generate_storyboard', {
        wordCount: ideaWords,
        isExtended: creditCalculation.isExtended,
      });

      showToast({
        type: 'success',
        title: 'Storyboard Siap di Production Desk!',
        message: `${isAdOrAffiliate ? '9-Panel Commercial Grid' : '8-Panel Infographic Storyboard'}, Video Prompt, dan Karakter telah siap diproduksi. (-${storyboardCost} Kredit AI)`,
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

  const handleDevelopManualIdea = async () => {
    const userPromptText = additionalTheme.trim();
    if (!userPromptText) {
      showToast({
        type: 'warning',
        title: 'Naskah / Ide Masih Kosong',
        message: 'Silakan tuliskan naskah cerita, ide adegan, atau konsep iklan produk Anda.',
      });
      return;
    }

    const inputWords = userPromptText.split(/\s+/).filter(Boolean).length;
    const creditCalculation = calculateActionCredits('generate_storyboard', inputWords);
    const storyboardCost = creditCalculation.totalCost;

    if (!hasSufficientCredits(storyboardCost)) {
      showToast({
        type: 'warning',
        title: t('Pemberitahuan Kuota Akun', 'Account Quota Notice'),
        message: t(
          'Halo! Kuota Free Trial untuk perangkat atau jaringan internet ini sebelumnya telah digunakan. Silakan upgrade ke Creator Pro untuk menggunakan seluruh fitur studio kreatif tanpa batas.',
          'Hello! The Free Trial quota for this device or network was previously claimed. Please upgrade to Creator Pro to unlock and use all studio features.'
        ),
      });
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedTitle =
        storyboardType === 'ad' && productBrandName.trim()
          ? `${productBrandName.trim()} Commercial`
          : userPromptText.slice(0, 50) + (userPromptText.length > 50 ? '...' : '');

      const manualIdea: ContentIdea = {
        id: `idea_manual_${Date.now()}`,
        title: generatedTitle,
        hook: `[Detik 0-3] Pembuka visual: ${userPromptText.slice(0, 80)}`,
        premise: userPromptText,
        synopsis: userPromptText,
        storyBeats: [
          'Beat 1 (Hook): Kejadian tak terduga langsung menghentikan scroll penonton.',
          'Beat 2 (Eskalasi): Situasi berkembang rumit dengan konflik atau adegan produk utama.',
          'Beat 3 (Puncak/Climax): Momen paling memukau dan bernilai tinggi.',
          'Beat 4 (Payoff/End Card): Resolusi kuat atau call to action yang berkesan.',
        ],
        conflict: 'Tantangan visual narasi utama',
        ending: 'Penyelesaian cerita atau call-to-action berkesan',
        estimatedDuration: duration,
        visualStyle,
        suggestedLocation: 'Latar sinematik terkurasi sesuai arahan ide',
        localizationNotes: 'Format universal FlowStoryboard-Pro',
        creativeRationale: `Storyboard mandiri: ${storyboardType === 'ad' ? 'Product Commercial' : 'Cinematic Clip'}`,
        storyboardType,
        categoryId: activeCategory.id,
        platform,
        productBrandName: productBrandName.trim(),
        targetModel: targetModel || 'universal-neutral',
        targetAudience: 'Audiens umum & kreator konten digital',
        saved: true,
        creativeFramework: activeCategory.creativeFramework,
        hookStyle: activeCategory.hookStyle,
        globalGuidance: activeCategory.globalGuidance,
        createdAt: new Date().toISOString(),
      };

      let proj = currentProject;
      if (!proj) {
        proj = createProject(generatedTitle, activeCategory.id, contextPreset);
      }

      const isAdOrAffiliate =
        activeCategory.id === 'affiliate-marketing' ||
        activeCategory.id === 'product-story';
      const sceneCount = isAdOrAffiliate ? 9 : 8;
      const activeModel = targetModel || proj?.targetModel || savedStudioPrefs?.defaultModelId || 'universal-neutral';
      const developed = await developStoryFromIdea(
        manualIdea,
        sceneCount,
        activeModel,
        dialogLanguage,
        {
          platform,
          visualStyle,
          duration,
          storyboardType,
          productBrandName: productBrandName.trim(),
          targetAudience: 'Audiens umum & kreator konten digital',
          customTopic: userPromptText,
          creativeFramework: activeCategory.creativeFramework,
          hookStyle: activeCategory.hookStyle,
          globalGuidance: activeCategory.globalGuidance,
        }
      );

      useProjectStore.getState().updateCurrentProject({
        name: generatedTitle,
        categoryId: activeCategory.id,
        targetModel: activeModel,
        platform,
        selectedIdea: manualIdea,
        creativeFramework: activeCategory.creativeFramework,
        hookStyle: activeCategory.hookStyle,
        globalGuidance: activeCategory.globalGuidance,
        characters: developed.characters,
        worldBible: developed.worldBible,
        scenes: developed.scenes,
        masterStoryboardImagePrompt: developed.imagePromptJson,
        masterStoryboardVideoPrompt: developed.videoPromptJson,
        storyboardPlanSummary: developed.planSummary,
        storyboardValidationReport: developed.validationReport,
      });

      incrementStoryboardCount();
      await deductCredits(storyboardCost, 'generate_storyboard', {
        wordCount: inputWords,
        isExtended: creditCalculation.isExtended,
      });

      showToast({
        type: 'success',
        title: 'Storyboard Berhasil Disusun!',
        message: `${isAdOrAffiliate ? '9-Panel Commercial Grid' : '8-Panel Infographic Storyboard'} dan Video Prompt telah siap. (-${storyboardCost} Kredit AI)`,
      });

      navigate('/prompt-desk');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Menyusun Storyboard',
        message: err.message || 'Terjadi kesalahan pada engine storyboard.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isAdOrAffiliateCategory =
    activeCategory.id === 'affiliate-marketing' ||
    activeCategory.id === 'product-story' ||
    storyboardType === 'ad';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#14141c] via-[#101015] to-[#14141c] border border-white/10 shadow-2xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Content Idea Studio — 21 Creative Frameworks</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t('Eksplorasi Ide Konten & Narasi Video Pendek', 'Short-Form Content Ideas & Storytelling Studio')}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t(
              'Pilih dari 21 kategori dengan creative logic spesifik, kunci konteks Indonesia natural tanpa stereotip, dan kembangkan ide menjadi storyboard adegan siap prompt.',
              'Select from 21 specialized short-form categories, ground narrative context with natural cultural personas, and develop ideas into multi-scene storyboards.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/pricing"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-colors shadow-sm"
            title={t('Klik untuk melihat kuota kredit atau beli paket', 'Click to view credit balance or plans')}
          >
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>
              {t('Saldo:', 'Balance:')} {subscription.creditsBalance ?? (subscription.tier === 'pro' ? 350 : 20)}{' '}
              {t('Kredit', 'Credits')}
            </span>
          </NavLink>
          <Button
            variant="emerald"
            size="md"
            icon={<Wand2 className="w-4 h-4" />}
            onClick={() => {
              const el = document.getElementById('idea-generator-form');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('Mulai Buat Ide', 'Generate Ideas')}
          </Button>
        </div>
      </div>

      {/* Polite Account Quota Notice Banner for secondary / exhausted trial accounts */}
      {subscription.tier === 'free' && (subscription.status === 'expired' || (subscription.creditsBalance ?? 0) <= 0) && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                {t('Pemberitahuan Kuota Free Trial', 'Free Trial Notice')}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                {t(
                  'Halo! Kuota Free Trial untuk perangkat atau jaringan internet ini sebelumnya telah digunakan oleh akun pertama Anda. Agar dapat mulai mengeksplorasi dan menggunakan seluruh fitur studio kreatif tanpa batas, silakan upgrade akun Anda ke Creator Pro.',
                  'Hello! The Free Trial quota for this device or internet network was previously claimed by your primary account. To start exploring and generating creative content without limits, please upgrade your account to Creator Pro.'
                )}
              </p>
            </div>
          </div>
          <NavLink
            to="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-semibold shrink-0 transition-all shadow-md shadow-amber-500/20"
          >
            <Crown className="w-3.5 h-3.5" />
            {t('Upgrade ke Creator Pro', 'Upgrade to Creator Pro')}
          </NavLink>
        </div>
      )}

      {/* 1. Category Selection Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>
                  {t('1. Pilih Kategori Konten', '1. Select Content Category')} ({CONTENT_CATEGORIES.length}{' '}
                  {t('Kategori', 'Categories')})
                </span>
              </h3>
              {subscription.tier !== 'pro' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-medium text-amber-300">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Free Trial: 3 Kategori Aktif • Saldo: {subscription.creditsBalance ?? 20} Kredit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Creator Pro: 21 Kategori Aktif • Saldo: {subscription.creditsBalance ?? 350} Kredit
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {subscription.tier === 'pro'
                ? 'Seluruh 21 kategori terbuka dengan creative framework dan hook style spesifik.'
                : 'Free Trial membuka 3 kategori unggulan. Upgrade ke Creator Pro untuk membuka seluruh 21 kategori.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder={t('Cari kategori...', 'Search categories...')}
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
              {g === 'all' ? t('Semua Kategori', 'All Categories') : g}
            </button>
          ))}
        </div>

        {/* Pro Banner for Free Trial Users */}
        {subscription.tier !== 'pro' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-amber-300">Fitur ini eksklusif Creator Pro — Rp 59rb/bln.</strong> Akses seluruh 21 kategori konten, kuota storyboard tanpa batas, dan BYOK video generation.
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
                  <span>{cat.subcategories.length} {t('subkategori', 'subcategories')}</span>
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
      </BentoTile>

      {/* 3. Studio Production Parameters Form */}
      <section id="idea-generator-form" className="space-y-4">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span>2. Konfigurasi Parameter Produksi Konten</span>
        </h3>

        <BentoTile className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Metode Pembuatan Ide */}
            <Select
              label="Metode Pembuatan Ide"
              value={ideaMode}
              onChange={(e) => setIdeaMode(e.target.value as 'ai_generate' | 'manual_input')}
              options={[
                { value: 'ai_generate', label: '✨ Digenerate oleh AI (Eksplorasi Ide Terkurasi)' },
                { value: 'manual_input', label: '✍️ Buat Sendiri (Langsung Susun Storyboard)' },
              ]}
            />

            {/* 2. Tipe Storyboard */}
            <Select
              label="Tipe Storyboard"
              value={storyboardType}
              onChange={(e) => setStoryboardType(e.target.value as 'clip' | 'ad')}
              options={[
                { value: 'clip', label: '🎬 Movie, Drama, or Animated Clip' },
                { value: 'ad', label: '🏷️ Product Ad / Commercial' },
              ]}
            />

            {/* 3. Gaya Visual dengan Preview Thumbnail & Galeri Contoh */}
            <div className="space-y-1.5">
              <Select
                label="Gaya Visual"
                value={visualStyle}
                onChange={(e) => handleVisualStyleChange(e.target.value as VisualStyle)}
                options={VISUAL_STYLES.map((v) => ({
                  value: v.id,
                  label: v.name,
                }))}
              />
              {(() => {
                const cur = getVisualStyleById(visualStyle);
                return (
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                    <img
                      src={cur.sampleImageUrl}
                      alt={cur.name}
                      className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-zinc-200 truncate">
                          {cur.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsVisualGalleryOpen(true)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline shrink-0 font-medium"
                        >
                          Lihat Contoh 🖼️
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 leading-tight">
                        {cur.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 4. Target Platform / Aspek Rasio */}
            <Select
              label="Target Platform"
              value={platform}
              onChange={(e) => handlePlatformChange(e.target.value as Platform)}
              options={[
                { value: 'tiktok', label: 'TikTok (9:16 Vertical)' },
                { value: 'instagram_reels', label: 'Instagram Reels (9:16)' },
                { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)' },
                { value: 'multi_platform', label: 'YouTube / Widescreen (16:9 Landscape)' },
                { value: 'facebook_reels', label: 'Facebook / Feed Square (1:1)' },
              ]}
            />

            {/* 5. Durasi Video (Detik) */}
            <Select
              label="Durasi Video (Detik)"
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value as DurationRange)}
              options={[
                { value: '10s', label: '10 Detik (Optimized for Omni Flesh / Google Flow)' },
                { value: '15s', label: '15 Detik (Optimized for Seedance / Short-Form)' },
                { value: '5s', label: '5 Detik (Ultra Micro Hook)' },
                { value: '30s', label: '30 Detik (Story Hook & Eskalasi)' },
                { value: '60s', label: '60 Detik (Alur Cerita Mendalam)' },
                { value: '90s', label: '90 Detik (Mini Movie / Drama)' },
                { value: '1-3min', label: '1–3 Menit (Story Series Panjang)' },
              ]}
            />

            {/* 6. Bahasa Dialog & Narasi */}
            <Select
              label="Bahasa Dialog & Narasi"
              value={dialogLanguage}
              onChange={(e) => handleDialogLanguageChange(e.target.value as DialogLanguage)}
              options={[
                { value: 'indonesian', label: 'Bahasa Indonesia (Natural Santai)' },
                { value: 'english', label: 'English' },
                { value: 'javanese', label: 'Bahasa Jawa' },
                { value: 'sundanese', label: 'Bahasa Sunda' },
                { value: 'mixed', label: 'Campuran / Code-switching' },
                { value: 'none', label: 'Tanpa Dialog (Ambient SFX / Musik)' },
              ]}
            />
          </div>

          {/* Baris ke-3: Grid 2 Kolom Seimbang [Jumlah Ide yang Dihasilkan] & [Target Model AI] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ideaMode === 'ai_generate' ? (
              <Select
                label="Jumlah Ide yang Dihasilkan"
                value={ideaCount.toString()}
                onChange={(e) => setIdeaCount(Number(e.target.value))}
                options={[
                  { value: '1', label: '1 Ide Spesifik (Cepat & Fokus)' },
                  { value: '2', label: '2 Pilihan Ide (Perbandingan A/B)' },
                  { value: '3', label: '3 Pilihan Ide Terkurasi' },
                  { value: '4', label: '4 Pilihan Ide Variatif' },
                  { value: '5', label: '5 Pilihan Ide Lengkap (Standar)' },
                ]}
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2.5 text-xs text-zinc-400">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Mode Buat Sendiri aktif: Langsung menyusun{' '}
                  {isAdOrAffiliateCategory ? '9-panel commercial storyboard grid' : '8-panel infographic storyboard'}.
                </span>
              </div>
            )}

            <Select
              label="Target Model AI (Format Prompt Video)"
              value={targetModel}
              onChange={(e) => handleTargetModelChange(e.target.value)}
              options={MODEL_CAPABILITIES.map((m) => ({
                value: m.modelId,
                label: m.modelId === 'universal-neutral' ? `${m.displayName} • Default` : m.displayName,
              }))}
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-0.5">
            <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
            <span>
              Format prompt, parameter kamera, dan metadata adegan otomatis disesuaikan dengan engine yang dipilih.
            </span>
          </div>

          {/* Kolom Opsional Khusus Product Ad */}
          {storyboardType === 'ad' && (
            <div className="pt-1">
              <Input
                label="Nama Produk / Brand (Opsional)"
                placeholder="Contoh: Lumina Smart Glasses, Kopi Senja, GlowSkin Hydrating Serum..."
                value={productBrandName}
                onChange={(e) => setProductBrandName(e.target.value)}
              />
            </div>
          )}


          <div className="pt-1">
            <Input
              label={
                ideaMode === 'manual_input'
                  ? 'Ide Cerita / Naskah Klip / Konsep Iklan Anda (Wajib)'
                  : 'Ide Cerita, Tema, atau Kata Kunci (Opsional)'
              }
              placeholder={
                ideaMode === 'manual_input'
                  ? `Tuliskan alur cerita lengkap, adegan demi adegan, atau konsep produk Anda. AI akan langsung menyusun ${isAdOrAffiliateCategory ? '9-panel commercial storyboard' : '8-panel infographic storyboard'}...`
                  : 'Contoh: Stickman menemukan portal rahasia di lukisan kuno, rahasia teknologi AI, kedai kopi senja...'
              }
              value={additionalTheme}
              onChange={(e) => setAdditionalTheme(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="space-y-1.5 text-xs">
              <div className="text-zinc-400">
                Engine: <span className="text-amber-400 font-medium">{isAdOrAffiliateCategory ? 'FlowStoryboard-Pro Master (9-Panel Grid)' : 'AI Playbook Master (8-Panel Infographic)'}</span>. Prompt teknis visual otomatis siap pakai.
              </div>
              <div className="inline-flex items-center gap-2 text-[11px] text-amber-300 font-mono bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>
                  Biaya aksi: <strong>{ideaMode === 'manual_input' ? '3 Kredit AI' : '1 Kredit AI'}</strong> • Saldo Anda: <strong>{subscription.creditsBalance ?? (subscription.tier === 'pro' ? 350 : 20)} Kredit</strong>
                </span>
              </div>
            </div>

            {ideaMode === 'manual_input' ? (
              <Button
                variant="primary"
                size="lg"
                loading={isGenerating}
                icon={<ArrowRight className="w-5 h-5 text-black" />}
                onClick={handleDevelopManualIdea}
                className="w-full sm:w-auto font-bold shadow-lg shadow-amber-500/20"
              >
                Langsung Susun Storyboard (3 Kredit)
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                loading={isGenerating}
                icon={<Sparkles className="w-5 h-5 text-black" />}
                onClick={handleGenerateIdeas}
                className="w-full sm:w-auto font-bold shadow-lg shadow-amber-500/20"
              >
                {t(
                  `Hasilkan ${ideaCount} Ide Sekarang (1 Kredit)`,
                  `Generate ${ideaCount} Ideas Now (1 Credit)`
                )}
              </Button>
            )}
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
              {t(`Fixprom AI Sedang Merancang ${ideaCount} Ide Kreatif`, `Fixprom AI is Crafting ${ideaCount} Creative Ideas`)}
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {t(
                'Menerapkan creative angle berbeda (hook unik, eskalasi konflik, latar) serta menyaring duplikasi untuk memastikan setiap ide segar.',
                'Applying diverse creative angles (unique hooks, conflict escalation, settings) and filtering duplicates to ensure fresh concepts.'
              )}
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
                <span>
                  {t(`Hasil Eksplorasi: ${ideas.length} Ide Konten`, `Exploration Results: ${ideas.length} Content Ideas`)}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {t(
                  'Pilih ide terbaik untuk dikembangkan menjadi Character Bible, World Bible, dan adegan Storyboard.',
                  'Select the best idea to expand into Character Bible, World Bible, and Storyboard scenes.'
                )}
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
                      {copiedKey === `hook_${idea.id}` ? t('Hook Tersalin', 'Hook Copied') : t('Salin Hook', 'Copy Hook')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={copiedKey === `full_${idea.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      onClick={() => handleCopyFullIdea(idea)}
                    >
                      {copiedKey === `full_${idea.id}` ? t('Ide Tersalin', 'Idea Copied') : t('Salin Ide', 'Copy Idea')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={developingIdeaId === idea.id}
                      icon={<ArrowRight className="w-4 h-4 text-black" />}
                      onClick={() => handleDevelopIdea(idea)}
                      title={t(
                        `Susun ${isAdOrAffiliateCategory ? '9 adegan commercial grid' : '8 adegan infographic storyboard'}, character bible, dan video prompt (-3 Kredit AI)`,
                        `Generate ${isAdOrAffiliateCategory ? '9 commercial storyboard scenes' : '8 infographic storyboard scenes'}, character bible, and video prompt (-3 AI Credits)`
                      )}
                    >
                      {t('Kembangkan ke Storyboard (3 Kredit)', 'Develop to Storyboard (3 Credits)')}
                    </Button>
                  </div>
                </div>

                {/* Hook Callout Box */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-400 block mb-0.5">
                    {t('🎣 Hook 1-3 Detik Pertama:', '🎣 First 1-3s Hook:')}
                  </span>
                  <p className="text-zinc-200 italic font-mono">{idea.hook}</p>
                </div>

                {/* Synopsis & Premise */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 font-semibold">{t('Premis Inti: ', 'Core Premise: ')}</span>
                    <span className="text-zinc-200">{idea.premise}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-semibold">{t('Sinopsis Singkat: ', 'Brief Synopsis: ')}</span>
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

      {/* Modal Galeri Referensi Gaya Visual AI */}
      <Modal
        isOpen={isVisualGalleryOpen}
        onClose={() => setIsVisualGalleryOpen(false)}
        title="Galeri Referensi Gaya Visual AI"
        subtitle="14 pilihan estetika visual untuk storyboard video Anda. Klik salah satu untuk memilih langsung."
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto p-1 pr-2">
          {VISUAL_STYLES.map((style) => {
            const isSelected = visualStyle === style.id;
            return (
              <div
                key={style.id}
                onClick={() => {
                  handleVisualStyleChange(style.id as VisualStyle);
                  setIsVisualGalleryOpen(false);
                }}
                className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/40'
                    : 'bg-[#111115] border-white/10 hover:border-white/25 hover:bg-[#16161c]'
                }`}
              >
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                    <img
                      src={style.sampleImageUrl}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-black/80 text-amber-300 border border-white/10">
                      {style.category}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-amber-500 text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100 line-clamp-1">{style.name}</h5>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {style.description}
                    </p>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono truncate max-w-[130px]">
                    {style.promptKeywords.split(',')[0]}
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {isSelected ? 'Terpilih ✓' : 'Pilih Gaya'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
