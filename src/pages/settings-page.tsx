import React, { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useLanguageStore } from '@/stores/language-store';
import { MODEL_CAPABILITIES, getModelCapability } from '@/lib/model-catalog';
import {
  BentoTile,
  Button,
  Badge,
  Select,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import {
  Cpu,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Sparkles,
  Film,
  Camera,
  Info,
  Layers,
  Zap,
} from 'lucide-react';
import type { VisualStyle, Platform, DurationRange, DialogLanguage } from '@/types';

const STUDIO_PREFS_KEY = 'fixprom_user_studio_prefs';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguageStore();
  const { currentProject, setTargetModel, updateCurrentProject } = useProjectStore();

  // Load saved preferences or fallbacks
  const savedPrefs = (() => {
    try {
      const raw = localStorage.getItem(STUDIO_PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [activeModelId, setActiveModelId] = useState<string>(() => {
    return currentProject?.targetModel || savedPrefs?.defaultModelId || 'universal-neutral';
  });

  const [defaultVisualStyle, setDefaultVisualStyle] = useState<VisualStyle>(() => {
    return savedPrefs?.defaultVisualStyle || 'cinematic_realistic';
  });

  const [defaultPlatform, setDefaultPlatform] = useState<Platform>(() => {
    return savedPrefs?.defaultPlatform || 'tiktok';
  });

  const [defaultDuration, setDefaultDuration] = useState<DurationRange>(() => {
    return savedPrefs?.defaultDuration || '10s';
  });

  const [defaultDialogLanguage, setDefaultDialogLanguage] = useState<DialogLanguage>(() => {
    return savedPrefs?.defaultDialogLanguage || 'indonesian';
  });

  const selectedModel = getModelCapability(activeModelId);

  const handleSaveSettings = () => {
    const prefs = {
      defaultModelId: activeModelId,
      defaultVisualStyle,
      defaultPlatform,
      defaultDuration,
      defaultDialogLanguage,
    };

    try {
      localStorage.setItem(STUDIO_PREFS_KEY, JSON.stringify(prefs));
      window.dispatchEvent(new CustomEvent('fixprom:studio-prefs-updated', { detail: prefs }));
    } catch (e) {
      console.warn('Could not save studio prefs to localStorage', e);
    }

    // Apply to active project if present
    setTargetModel(activeModelId);
    if (currentProject) {
      updateCurrentProject({
        targetModel: activeModelId,
      });
    }

    showToast({
      type: 'success',
      title: t('Pengaturan Model AI Disimpan!', 'AI Model Settings Saved!'),
      message: t(
        `Target model bawaan disetel ke "${selectedModel.displayName}". Format prompt akan otomatis diselaraskan.`,
        `Default target model set to "${selectedModel.displayName}". Prompt format will be synchronized.`
      ),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>{t('Pengaturan Model AI (AI Video Generator)', 'AI Model Settings')}</span>
        </h2>
        <p className="text-xs text-zinc-400">
          {t(
            'Sesuaikan target model AI video pilihan Anda agar seluruh output prompt, sintaks kamera, dan rasio aspek otomatis terformat sesuai dokumentasi teknis vendor.',
            'Customize your target AI video model so all prompt outputs, camera syntax, and aspect ratios match vendor documentation.'
          )}
        </p>
      </div>

      {/* Primary Clarification Banner — Fixprom is Prompt Preparation Studio, not a renderer */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#16161f] to-amber-500/5 border border-amber-500/25 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
          <Info className="w-4 h-4 shrink-0" />
          <span>Fixprom adalah AI Storyboard & Prompt Preparation Studio</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          <strong>Penting untuk dipahami:</strong> Fixprom <u>bukanlah</u> layanan untuk me-render atau men-generate file video/gambar secara langsung. Kami tidak memungut biaya langganan API video yang mahal.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Pemilihan model AI di bawah diperuntukkan bagi Anda yang ingin langsung mendapatkan prompt naskah presisi tanpa perlu repot login atau mempelajari sintaks teknis masing-masing model secara manual. Fixprom menyusun struktur storyboard, 9-panel image grid, dan video prompt 10 detik yang sudah disesuaikan dengan dokumentasi vendor, sehingga Anda tinggal menyalin (<em>copy-paste</em>) ke generator AI video yang Anda miliki.
        </p>
      </div>

      {/* Target Model Selector & Capability Inspector */}
      <BentoTile className="p-6 md:p-8 space-y-6 bg-[#111115] border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Target Vendor AI Video Generator Utama</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Pilih model AI yang rutin Anda gunakan untuk memproduksi video.
            </p>
          </div>
          <Badge variant="amber">{selectedModel.provider}</Badge>
        </div>

        {/* Model Dropdown */}
        <div>
          <Select
            label="Pilih Target Model AI Video"
            value={activeModelId}
            onChange={(e) => setActiveModelId(e.target.value)}
            options={MODEL_CAPABILITIES.map((m) => ({
              value: m.modelId,
              label: m.displayName,
            }))}
          />
        </div>

        {/* Dynamic Model Capability Inspector Card */}
        <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">
                {selectedModel.displayName}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Provider: {selectedModel.provider}
              </span>
            </div>
            {selectedModel.documentationUrl && (
              <a
                href={selectedModel.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                <span>Dokumentasi Vendor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* Durasi Native */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
              <span className="text-zinc-400 text-[11px] block">Durasi yang Didukung:</span>
              <span className="text-zinc-200 font-semibold font-mono">
                {selectedModel.supportedDurations.join(', ')}
              </span>
            </div>

            {/* Resolusi & Rasio */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
              <span className="text-zinc-400 text-[11px] block">Rasio Aspek & Resolusi:</span>
              <span className="text-zinc-200 font-semibold font-mono">
                {selectedModel.resolutions.join(', ')} • {selectedModel.aspectRatios.join(', ')}
              </span>
            </div>

            {/* Dukungan Audio / Lip-Sync */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
              <span className="text-zinc-400 text-[11px] block">Dukungan Audio / Lip-Sync:</span>
              <span
                className={`font-semibold ${
                  selectedModel.dialogueLipSync === true
                    ? 'text-emerald-400'
                    : selectedModel.dialogueLipSync === false
                    ? 'text-amber-400'
                    : 'text-zinc-300'
                }`}
              >
                {selectedModel.dialogueLipSync === true
                  ? 'Native Lip-Sync 🔊'
                  : selectedModel.dialogueLipSync === false
                  ? 'External Audio Pipeline 🎙️'
                  : 'Universal Format'}
              </span>
            </div>
          </div>

          {/* Syntax Note */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs space-y-1">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Format Prompt Otomatis Fixprom untuk Model Ini:</span>
            </span>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {(activeModelId === 'kling-1-5' || activeModelId === 'kling-2-1') &&
                'Prompt video akan otomatis diawali dengan format tag pergerakan kamera [Camera: <movement>] dan parameter multi-angle referensi karakter/wajah.'}
              {(activeModelId === 'google-veo-2' || activeModelId === 'google-veo-3') &&
                'Prompt visual dioptimalkan untuk tekstur optik fotorealistik 4K, contact sheet 9-panel dengan gutter putih bersih, dan sinkronisasi audio native.'}
              {(activeModelId === 'runway-gen3-alpha' || activeModelId === 'runway-gen4-turbo') &&
                'Prompt video dioptimalkan untuk motion vectors kontinu, fluid camera paths, continuous dynamic vectors, dan transisi mulus.'}
              {(activeModelId === 'luma-dream-machine' || activeModelId === 'luma-ray2-flash') &&
                'Prompt video diformat dengan dynamic camera motion controls dan instruksi pencahayaan volumetrik yang koheren.'}
              {(activeModelId === 'minimax-hailuo' || activeModelId === 'minimax-video-01-live') &&
                'Prompt visual difokuskan pada detail ekspresi mikro wajah manusia, subjek hidup, dan pergerakan sinematik natural.'}
              {(activeModelId === 'openai-sora' || activeModelId === 'openai-sora-turbo') &&
                'Prompt video mencakup instruksi fisika spasial 3D dunia nyata, kontinuitas objek multi-frame, dan sound design layer Foley.'}
              {(activeModelId === 'pika-2-0' || activeModelId === 'pika-2-2') &&
                'Prompt video dioptimalkan untuk timing dinamis, efek kamera terfokus -camera -motion -fps, dan Pikaffects.'}
              {(activeModelId === 'pixverse-v3' || activeModelId === 'pixverse-v4') &&
                'Prompt visual disesuaikan untuk konsistensi karakter multi-scene, 4K UHD, dan referensi gaya visual.'}
              {(activeModelId === 'tencent-hunyuan' || activeModelId === 'hunyuan-turbo') &&
                'Prompt video disusun secara deskriptif mendalam dengan struktur narasi visual kaya detail temporal.'}
              {activeModelId === 'wan-2-1' &&
                'Prompt video dioptimalkan untuk Alibaba Wan 2.1 dengan master cinematography, konsistensi visual tinggi, dan text-to-audio format.'}
              {activeModelId === 'universal-neutral' &&
                'Prompt disusun dengan bahasa sinematografi universal berstandar studio (Shot, Angle, Movement, Lighting, Color Palette) yang dapat digunakan pada generator AI video manapun.'}
            </p>
          </div>
        </div>

        {/* Studio Default Preferences (Auto-Fill for Idea Studio) */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Preferensi Default Studio (Auto-Fill)</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Nilai-nilai ini akan otomatis terpilih di formulir pembuatan naskah untuk mempercepat pekerjaan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Visual Style */}
            <Select
              label="Default Gaya Visual"
              value={defaultVisualStyle}
              onChange={(e) => setDefaultVisualStyle(e.target.value as VisualStyle)}
              options={[
                { value: 'cinematic_realistic', label: '01 — Ultra Photorealistic Cinematic' },
                { value: 'anime_ghibli', label: '02 — Studio Ghibli Anime' },
                { value: '3d_animation', label: '03 — 3D Cartoon Animation' },
                { value: '2d_cartoon', label: '04 — 2D Cartoon (Flat colors, bold outlines)' },
                { value: 'anime', label: '05 — Modern Anime (Shonen style)' },
                { value: 'claymation', label: '06 — Stop-motion / Claymation' },
                { value: '3d_product_commercial', label: '07 — Glossy 3D Product Commercial (Studio look)' },
                { value: 'vintage_35mm', label: '08 — Vintage Retro 35mm Film' },
                { value: 'neon_music_video', label: '09 — Neon Stylized Music-Video Look' },
                { value: 'documentary_realism', label: '10 — Documentary Realism' },
                { value: 'stickman', label: 'Stickman Minimalist Animation (Viral Spec)' },
                { value: 'stylized', label: 'Stylized Pixar / 3D Character' },
                { value: 'surreal_fantasy', label: 'Surreal / Fantasy Ethereal' },
                { value: 'minimalist_faceless', label: 'Minimalist Faceless Aesthetic' },
              ]}
            />

            {/* Default Target Platform / Aspek Rasio */}
            <Select
              label="Default Target Platform & Aspek Rasio"
              value={defaultPlatform}
              onChange={(e) => setDefaultPlatform(e.target.value as Platform)}
              options={[
                { value: 'tiktok', label: 'TikTok (9:16 Vertical)' },
                { value: 'instagram_reels', label: 'Instagram Reels (9:16)' },
                { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)' },
                { value: 'multi_platform', label: 'YouTube / Widescreen (16:9 Landscape)' },
                { value: 'facebook_reels', label: 'Facebook / Feed Square (1:1)' },
              ]}
            />

            {/* Default Duration */}
            <Select
              label="Default Durasi Video (Detik)"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(e.target.value as DurationRange)}
              options={[
                { value: '10s', label: '10 Detik (Google Flow & Storyboard Master)' },
                { value: '5s', label: '5 Detik (Ultra Micro Hook)' },
                { value: '15s', label: '15 Detik (TikTok & Reels Standar Viral)' },
                { value: '30s', label: '30 Detik (Story Hook & Eskalasi)' },
                { value: '60s', label: '60 Detik (Alur Cerita Mendalam)' },
                { value: '90s', label: '90 Detik (Mini Movie / Drama)' },
                { value: '1-3min', label: '1–3 Menit (Story Series Panjang)' },
              ]}
            />

            {/* Default Dialogue Language */}
            <Select
              label="Default Bahasa Dialog & Narasi"
              value={defaultDialogLanguage}
              onChange={(e) => setDefaultDialogLanguage(e.target.value as DialogLanguage)}
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
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-500">
            Perubahan preferensi model AI akan otomatis diterapkan pada proyek aktif Anda.
          </span>
          <Button
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4 text-black" />}
            onClick={handleSaveSettings}
            className="font-bold shadow-lg shadow-amber-500/20"
          >
            Simpan Konfigurasi Model AI
          </Button>
        </div>
      </BentoTile>
    </div>
  );
};
