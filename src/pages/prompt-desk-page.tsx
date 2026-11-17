import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useProjectStore } from '@/stores/project-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { developStoryFromIdea } from '@/lib/ai-generator';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
  Modal,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { MODEL_CAPABILITIES, getModelCapability } from '@/lib/model-catalog';
import { runQualityControl } from '@/lib/qc-engine';
import {
  compileProjectPrompts,
  exportProductionSheetMarkdown,
  exportProjectJSON,
} from '@/lib/prompt-compiler';
import type { ContentIdea, Scene } from '@/types';
import {
  Copy,
  Download,
  AlertTriangle,
  AlertCircle,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Film,
  Camera,
  ExternalLink,
  Sliders,
  RotateCw,
  Sparkles,
  Zap,
} from 'lucide-react';

const FRAMING_OPTIONS = [
  { value: 'Extreme Close-Up', label: 'Extreme Close-Up (Detail Mata/Objek)' },
  { value: 'Close-Up', label: 'Close-Up (Wajah Penuh)' },
  { value: 'Medium Close-Up', label: 'Medium Close-Up (Dada ke Atas)' },
  { value: 'Medium Shot', label: 'Medium Shot (Pinggang ke Atas)' },
  { value: 'Cowboy Shot', label: 'Cowboy Shot (Lutut ke Atas)' },
  { value: 'Wide Shot', label: 'Wide Shot (Seluruh Badan & Latar)' },
  { value: 'Extreme Wide Shot', label: 'Extreme Wide Shot (Pemandangan Luas)' },
];

const ANGLE_OPTIONS = [
  { value: 'Eye-level', label: 'Eye-Level (Sejajar Mata / Realistis)' },
  { value: 'Low angle', label: 'Low Angle (Dari Bawah / Menegangkan)' },
  { value: 'High angle', label: 'High Angle (Dari Atas / Subjek Rentan)' },
  { value: 'Over-the-shoulder', label: 'Over-The-Shoulder (Dari Balik Bahu)' },
  { value: 'Dutch angle', label: 'Dutch Angle (Miring / Distorsi Dramatis)' },
  { value: "Bird's-eye view", label: "Bird's Eye (Tegak Lurus Langit / Peta)" },
  { value: "Worm's-eye view", label: "Worm's Eye (Menempel di Lantai)" },
];

const MOVEMENT_OPTIONS = [
  { value: 'Static tripod', label: 'Static (Tripod Tanpa Gerakan)' },
  { value: 'Slow push in', label: 'Slow Push In (Maju Perlahan ke Subjek)' },
  { value: 'Pull out', label: 'Pull Out / Zoom Out (Mundur Menjauh)' },
  { value: 'Tracking right', label: 'Tracking Right (Kamera Mengikuti ke Kanan)' },
  { value: 'Tracking left', label: 'Tracking Left (Kamera Mengikuti ke Kiri)' },
  { value: 'Pan left', label: 'Pan Left (Menoleh ke Sisi Kiri)' },
  { value: 'Pan right', label: 'Pan Right (Menoleh ke Sisi Kanan)' },
  { value: 'Tilt up', label: 'Tilt Up (Kamera Mendongak ke Atas)' },
  { value: 'Tilt down', label: 'Tilt Down (Kamera Menunduk ke Bawah)' },
  { value: 'Orbit around subject', label: 'Orbit 360 (Memutar Keliling Subjek)' },
  { value: 'Crane shot down', label: 'Crane / Drone Down (Turun Vertikal)' },
  { value: 'Handheld subtle shake', label: 'Handheld (Goyangan Alami Tangan)' },
];

const TIME_OF_DAY_OPTIONS = [
  { value: 'Golden hour', label: 'Golden Hour (Senja Keemasan Hangat)' },
  { value: 'Blue hour', label: 'Blue Hour (Pendar Dingin Senja/Fajar)' },
  { value: 'Bright midday sunlight', label: 'Siang Terik (Bright Midday)' },
  { value: 'Soft morning light', label: 'Pagi Hari (Soft Morning Light)' },
  { value: 'Overcast diffuse daylight', label: 'Mendung Halus (Overcast)' },
  { value: 'Twilight dusk', label: 'Twilight / Remang Senja' },
  { value: 'Malam hari', label: 'Malam Hari (Interior Lampu Hangat)' },
  { value: 'Midnight city ambient light', label: 'Tengah Malam (Lampu Jalan & Kota)' },
  { value: 'Moody neon lighting', label: 'Moody Neon (Cyberpunk / Lampu Toko)' },
];

const WEATHER_OPTIONS = [
  { value: 'Cerah & Jernih', label: 'Cerah & Jernih (Clear Atmosphere)' },
  { value: 'Hujan & Pantulan Aspal Basah', label: 'Hujan & Pantulan Aspal Basah' },
  { value: 'Berkabut & Volumetric Haze', label: 'Berkabut & Volumetric Haze' },
  { value: 'Mendung Berawan', label: 'Mendung Berawan (Cloudy Overcast)' },
  { value: 'Angin Berhembus Kencang', label: 'Angin Berhembus Kencang (Windy)' },
  { value: 'Suasana Temaram Hening', label: 'Suasana Temaram Hening & Gelap' },
];

function buildSelectOptions(presets: { value: string; label: string }[], currentVal?: string) {
  if (!currentVal) return presets;
  const exists = presets.some((p) => p.value.toLowerCase() === currentVal.trim().toLowerCase());
  if (exists) return presets;
  return [{ value: currentVal, label: `${currentVal} (Kustom / AI)` }, ...presets];
}

function formatQCFieldLabel(field: string): string {
  if (field.includes('continuityAnchors')) return 'Konsistensi Karakter';
  if (field.includes('dialogue')) return 'Panjang Dialog';
  if (field.includes('imagePrompt')) return 'Prompt Gambar';
  if (field.includes('videoPrompt')) return 'Prompt Video';
  if (field.includes('location')) return 'Detail Lokasi';
  if (field.includes('sceneCount')) return 'Jumlah Adegan';
  if (field.includes('duplicate')) return 'Nomor Adegan';
  if (field.includes('beatTitle')) return 'Judul Adegan';
  if (field.includes('summary')) return 'Ringkasan Cerita';
  if (field.includes('modelCapability')) return 'Kesesuaian Format AI';
  return 'Tips Kualitas';
}

export const PromptDeskPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    projects,
    currentProject,
    createProject,
    setCurrentProject,
    updateScene,
    setScenes,
    setQCResult,
    setTargetModel,
  } = useProjectStore();
  const {
    subscription,
    hasSufficientCredits,
    deductCredits,
    incrementStoryboardCount,
  } = useSubscriptionStore();

  const [activeModelId, setActiveModelId] = useState<string>(
    currentProject?.targetModel || 'universal-neutral'
  );
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown');
  const [exportContent, setExportContent] = useState('');
  const [isRegeneratingStoryboard, setIsRegeneratingStoryboard] = useState(false);
  const [isRegeneratingScene, setIsRegeneratingScene] = useState(false);

  // Auto-connect first project if no active project is currently selected
  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject]);

  const scenes = currentProject?.scenes || [];
  const currentScene = scenes[selectedSceneIndex] || null;
  const activeModel = getModelCapability(activeModelId);

  // Auto-run QC when scenes or model change
  const sceneCount = scenes.length;
  useEffect(() => {
    if (scenes.length > 0) {
      const qc = runQualityControl({
        scenes,
        targetModelId: activeModelId,
      });
      setQCResult(qc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneCount, activeModelId, setQCResult]);

  const handleModelChange = (modelId: string) => {
    setActiveModelId(modelId);
    setTargetModel(modelId);
    showToast({
      type: 'info',
      title: 'Target Model Diperbarui',
      message: `Prompt disesuaikan dengan kapabilitas ${getModelCapability(modelId).displayName}`,
    });
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      type: 'success',
      title: 'Tersalin ke Clipboard!',
      message: `${label} siap ditempel di AI generator.`,
    });
  };

  const handleCopyAllImagePrompts = () => {
    if (!currentProject || scenes.length === 0) return;
    const compiled = compileProjectPrompts(currentProject, activeModelId);
    const text = compiled
      .map((s) => `// Scene ${s.sceneNumber}: ${s.beatTitle}\n${s.imagePrompt}`)
      .join('\n\n');
    handleCopyText(text, 'Semua Image Prompts');
  };

  const handleCopyAllVideoPrompts = () => {
    if (!currentProject || scenes.length === 0) return;
    const compiled = compileProjectPrompts(currentProject, activeModelId);
    const text = compiled
      .map((s) => `// Scene ${s.sceneNumber}: ${s.beatTitle}\n${s.videoPrompt}`)
      .join('\n\n');
    handleCopyText(text, 'Semua Video Prompts');
  };

  const handleOpenExport = (format: 'markdown' | 'json') => {
    if (!currentProject) {
      showToast({ type: 'warning', title: 'Belum Ada Proyek Aktif', message: 'Buat proyek terlebih dahulu.' });
      return;
    }
    setExportFormat(format);
    if (format === 'markdown') {
      setExportContent(exportProductionSheetMarkdown(currentProject));
    } else {
      setExportContent(exportProjectJSON(currentProject));
    }
    setExportModalOpen(true);
  };

  const handleDownloadFile = () => {
    const filename = `${currentProject?.name.toLowerCase().replace(/\s+/g, '_') || 'fixprom_project'}.${
      exportFormat === 'markdown' ? 'md' : 'json'
    }`;
    const blob = new Blob([exportContent], {
      type: exportFormat === 'markdown' ? 'text/markdown;charset=utf-8' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      type: 'success',
      title: 'File Berhasil Diunduh',
      message: `Tersimpan sebagai ${filename}`,
    });
  };

  const handleAddScene = () => {
    try {
      let project = currentProject;
      if (!project) {
        if (projects.length > 0) {
          project = projects[0];
          setCurrentProject(project);
        } else {
          project = createProject('Proyek Video Baru', 'time-travel', 'indonesia_natural');
          setCurrentProject(project);
        }
      }

      const activeScenes = project.scenes || [];
      const nextNum = activeScenes.length + 1;
      const env = project.contextProfile?.environment || 'urban';

      const newScene: Scene = {
        id: `scene_${Date.now()}_${nextNum}`,
        projectId: project.id,
        sceneNumber: nextNum,
        beatTitle: `Scene ${nextNum}: New Beat`,
        purpose: 'Melanjutkan perkembangan cerita',
        summary: 'Deskripsi adegan baru...',
        location: {
          environmentType: env,
          description: 'Latar tempat adegan',
          timeOfDay: 'Daytime',
          weather: 'Clear',
        },
        characterActions: 'Karakter melakukan tindakan utama.',
        props: [],
        camera: {
          shot: 'Medium Shot',
          angle: 'Eye-level',
          movement: 'Slow tracking',
          framing: 'Rule of thirds',
        },
        lighting: 'Natural ambient lighting',
        continuityAnchors: [],
        imagePrompt: 'Cinematic wide shot of the environment with dramatic lighting and natural textures.',
        videoPrompt: 'Camera slowly tracks forward into the scene with natural cinematic motion.',
        negativePrompt: 'blurry, distorted, low quality',
        locked: false,
      };

      setScenes([...activeScenes, newScene]);
      setSelectedSceneIndex(activeScenes.length);
      showToast({
        type: 'success',
        title: 'Adegan Ditambahkan',
        message: `Scene ${nextNum} berhasil dibuat.`,
      });
    } catch (err: any) {
      console.error('Failed to add scene:', err);
      showToast({
        type: 'error',
        title: 'Gagal Menambah Adegan',
        message: err?.message || 'Terjadi gangguan saat membuat adegan.',
      });
    }
  };

  const handleDeleteScene = (sceneNum: number) => {
    if (scenes.length <= 1) {
      showToast({ type: 'warning', title: 'Minimal 1 Adegan', message: 'Tidak dapat menghapus adegan terakhir.' });
      return;
    }
    const filtered = scenes.filter((s) => s.sceneNumber !== sceneNum);
    // Renumber sequentially
    const renumbered = filtered.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    setScenes(renumbered);
    setSelectedSceneIndex(Math.max(0, selectedSceneIndex - 1));
    showToast({
      type: 'info',
      title: 'Adegan Dihapus',
      message: `Adegan telah dinomori ulang secara berurutan.`,
    });
  };

  const getIdeaContext = (): ContentIdea => {
    if (currentProject?.selectedIdea) {
      return currentProject.selectedIdea;
    }
    return {
      id: `idea_${currentProject?.id || 'proj'}_${Date.now()}`,
      categoryId: currentProject?.categoryId || 'time-travel',
      title: currentProject?.name || 'Proyek Video Pendek',
      hook: currentProject?.scenes[0]?.summary || 'Hook pembuka visual dramatis 1-3 detik...',
      premise: currentProject?.name || 'Premis cerita video pendek',
      synopsis: currentProject?.scenes.map((s) => s.summary).join(' ') || 'Sinopsis alur video.',
      storyBeats: currentProject?.scenes.map((s) => s.beatTitle) || ['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4'],
      conflict: 'Eskalasi ketegangan dan dilema utama dalam cerita.',
      ending: currentProject?.scenes[currentProject.scenes.length - 1]?.summary || 'Payoff akhir cerita.',
      estimatedDuration: '30-60s',
      visualStyle: 'cinematic_realistic',
      suggestedLocation: currentProject?.scenes[0]?.location?.description || 'Indonesia',
      localizationNotes: 'Adaptasi kontekstual natural Indonesia.',
      creativeRationale: 'Format visual dirancang untuk retensi audiens tinggi.',
      saved: true,
      createdAt: new Date().toISOString(),
    };
  };

  const handleRegenerateStoryboard = async () => {
    if (!currentProject) {
      showToast({
        type: 'warning',
        title: 'Belum Ada Proyek Aktif',
        message: 'Silakan buka atau buat proyek terlebih dahulu di Idea Studio.',
      });
      return;
    }

    if (!hasSufficientCredits(3)) {
      showToast({
        type: 'warning',
        title: 'Kredit AI Tidak Mencukupi (Butuh 3 Kredit)',
        message: 'Regenerasi storyboard membutuhkan 3 Kredit AI. Silakan Top-Up kredit atau perpanjang paket Creator Pro.',
      });
      navigate('/pricing');
      return;
    }

    setIsRegeneratingStoryboard(true);
    try {
      const idea = getIdeaContext();
      const developed = await developStoryFromIdea(
        idea,
        Math.max(4, scenes.length),
        activeModelId,
        'indonesian'
      );

      // If user locked certain scenes, preserve them!
      const mergedScenes = developed.scenes.map((newScene, idx) => {
        const existing = scenes[idx];
        if (existing && existing.locked) {
          return existing;
        }
        return newScene;
      });

      useProjectStore.getState().updateCurrentProject({
        characters: developed.characters,
        worldBible: developed.worldBible,
        scenes: mergedScenes,
      });

      incrementStoryboardCount();
      await deductCredits(3, 'regenerate_storyboard');

      const lockedCount = scenes.filter((s) => s.locked).length;
      showToast({
        type: 'success',
        title: 'Storyboard Berhasil Digenerate Ulang!',
        message:
          lockedCount > 0
            ? `Variasi alur baru diterapkan (${lockedCount} adegan terkunci tetap dipertahankan). (-3 Kredit AI)`
            : 'Variasi 4 adegan baru dan character bible telah dirancang ulang. (-3 Kredit AI)',
      });
      setSelectedSceneIndex(0);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Regenerasi Storyboard',
        message: err.message || 'Terjadi gangguan saat memproses AI regenerasi.',
      });
    } finally {
      setIsRegeneratingStoryboard(false);
    }
  };

  const handleRegenerateCurrentScene = async () => {
    if (!currentScene || !currentProject) return;

    if (currentScene.locked) {
      showToast({
        type: 'warning',
        title: 'Adegan Sedang Terkunci',
        message: 'Klik tombol "Locked" untuk membuka kunci adegan ini sebelum melakukan regenerasi.',
      });
      return;
    }

    if (!hasSufficientCredits(1)) {
      showToast({
        type: 'warning',
        title: 'Kredit AI Tidak Mencukupi (Butuh 1 Kredit)',
        message: 'Regenerasi 1 adegan membutuhkan 1 Kredit AI. Silakan Top-Up kredit Anda.',
      });
      navigate('/pricing');
      return;
    }

    setIsRegeneratingScene(true);
    try {
      const idea = getIdeaContext();
      const developed = await developStoryFromIdea(
        idea,
        scenes.length,
        activeModelId,
        'indonesian'
      );

      const candidate = developed.scenes[selectedSceneIndex] || developed.scenes[0];

      updateScene(currentScene.sceneNumber, {
        beatTitle: candidate.beatTitle,
        purpose: candidate.purpose,
        summary: candidate.summary,
        location: candidate.location,
        characterActions: candidate.characterActions,
        camera: candidate.camera,
        lighting: candidate.lighting,
        dialogue: candidate.dialogue,
        narration: candidate.narration,
        imagePrompt: candidate.imagePrompt,
        videoPrompt: candidate.videoPrompt,
      });

      await deductCredits(1, 'regenerate_single_scene');

      showToast({
        type: 'success',
        title: `Scene #${currentScene.sceneNumber} Berhasil Diregenerasi!`,
        message: 'Prompt visual, sinematografi, dan alur adegan diperbarui. (-1 Kredit AI)',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Regenerasi Adegan',
        message: err.message || 'Terjadi gangguan saat memproses AI.',
      });
    } finally {
      setIsRegeneratingScene(false);
    }
  };

  const qc = currentProject?.qcResult;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111115] border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>Prompt Production Desk</span>
            </h2>
            <Badge variant="amber">{scenes.length} Adegan</Badge>
            {currentProject?.name && (
              <span
                className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 truncate max-w-[220px]"
                title={currentProject.name}
              >
                📁 {currentProject.name}
              </span>
            )}
            {qc && (
              <Badge
                variant={
                  qc.overallStatus === 'PASS'
                    ? 'emerald'
                    : qc.overallStatus === 'REVIEW'
                    ? 'amber'
                    : 'red'
                }
              >
                {qc.overallStatus === 'PASS'
                  ? 'Naskah Siap ✅'
                  : qc.overallStatus === 'REVIEW'
                  ? 'Ada Saran Naskah 💡'
                  : 'Perlu Perbaikan ⚠️'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Poles dan kelola naskah video Anda per adegan. Prompt otomatis dirancang siap pakai untuk generator AI video pilihan Anda.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Credit Balance Indicator */}
          <NavLink
            to="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-colors shadow-sm mr-1"
            title="Klik untuk melihat kuota kredit atau Top-Up"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Saldo: {subscription.creditsBalance ?? (subscription.tier === 'pro' ? 350 : 20)} Kredit</span>
          </NavLink>

          {/* Regenerate Storyboard Button */}
          <Button
            variant="secondary"
            size="sm"
            loading={isRegeneratingStoryboard}
            icon={<RotateCw className="w-3.5 h-3.5 text-amber-400" />}
            onClick={handleRegenerateStoryboard}
            title="Generate ulang seluruh 4 adegan dengan ide saat ini (-3 Kredit AI)"
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
          >
            Buat Ulang Storyboard (3 Kredit)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyAllImagePrompts}
            title="Salin seluruh teks prompt gambar ke clipboard"
          >
            Salin Semua Gambar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyAllVideoPrompts}
            title="Salin seluruh teks prompt video ke clipboard"
          >
            Salin Semua Video
          </Button>
          <Button
            variant="emerald"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleOpenExport('markdown')}
            title="Unduh dokumen naskah lengkap (Markdown/TXT)"
          >
            Unduh Naskah
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Sliders className="w-3.5 h-3.5" />}
            onClick={() => handleOpenExport('json')}
            title="Ekspor data teknis untuk backup atau pengembang"
            className="text-zinc-400 hover:text-zinc-200"
          >
            Ekspor JSON
          </Button>
        </div>
      </div>

      {/* Model Selector & Capability Inspector Bar */}
      <BentoTile className="p-4 bg-[#14141c] border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-300 shrink-0">
            Target Generator AI Video:
          </span>
          <div className="w-72">
            <Select
              value={activeModelId}
              onChange={(e) => handleModelChange(e.target.value)}
              options={MODEL_CAPABILITIES.map((m) => ({
                value: m.modelId,
                label: m.displayName,
              }))}
            />
          </div>
        </div>

        {/* Verified Capability Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-zinc-300">
            <span className="text-zinc-500">Fitur Suara:</span>
            <span
              className={
                activeModel.dialogueLipSync === true
                  ? 'text-emerald-400 font-semibold'
                  : activeModel.dialogueLipSync === false
                  ? 'text-amber-400'
                  : 'text-zinc-400'
              }
            >
              {activeModel.dialogueLipSync === true
                ? 'Didukung Native 🔊'
                : activeModel.dialogueLipSync === false
                ? 'Dubbing Terpisah 🎙️'
                : 'Format Netral'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-zinc-300">
            <span className="text-zinc-500">Estimasi Durasi:</span>
            <span className="font-mono text-zinc-300">
              {activeModel.supportedDurations.join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="font-medium text-[11px]">
              Status: Terverifikasi Aktif (Nov 2026) ⚡
            </span>
          </div>

          {activeModel.documentationUrl && (
            <a
              href={activeModel.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-zinc-400 hover:text-amber-400 transition-colors"
              title="Panduan Resmi Vendor AI"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </BentoTile>

      {/* QC Status Alert Box if issues exist */}
      {qc && qc.issues.length > 0 && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            qc.overallStatus === 'FAIL'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          {qc.overallStatus === 'FAIL' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1.5 text-xs">
            <div className="font-semibold text-sm">
              💡 Tips Pengoptimalan Naskah ({qc.issues.length} Saran)
            </div>
            <ul className="space-y-1.5 text-zinc-300">
              {qc.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold shrink-0 mt-0.5">
                    {formatQCFieldLabel(issue.field)}
                  </span>
                  <div>
                    <span>{issue.message}</span>
                    {issue.suggestion && (
                      <span className="text-amber-300 block text-[11px] mt-0.5">
                        💡 Saran: {issue.suggestion}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Storyboard Deck Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scene Thumbnails / Deck Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-semibold text-zinc-200">Alur Storyboard</h3>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddScene}
            >
              Tambah Adegan
            </Button>
          </div>

          {scenes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#111115] border border-dashed border-white/10 text-center space-y-3">
              <Film className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">
                Belum ada adegan. Klik tombol di atas untuk menambah adegan baru, atau rancang ide lengkap di Idea Studio.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddScene}
                className="w-full justify-center"
              >
                Buat Adegan Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {scenes.map((scene, idx) => {
                const isSelected = selectedSceneIndex === idx;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setSelectedSceneIndex(idx)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-[#111115] border-white/8 hover:border-white/20 hover:bg-[#16161c]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        SCENE {scene.sceneNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        {scene.locked ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Unlock className="w-3 h-3 text-zinc-600" />
                        )}
                      </div>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-200 mt-1 line-clamp-1">
                      {scene.beatTitle}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {scene.summary}
                    </p>
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>{scene.camera.shot}</span>
                      <span className="truncate max-w-[120px]">{scene.location.timeOfDay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Structured Scene Editor */}
        <div className="lg:col-span-8">
          {currentScene ? (
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              {/* Scene Top Action Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Scene #{currentScene.sceneNumber}
                  </span>
                  <h3 className="text-base font-bold text-white">{currentScene.beatTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={isRegeneratingScene}
                    icon={<RotateCw className="w-3.5 h-3.5 text-amber-400" />}
                    onClick={handleRegenerateCurrentScene}
                    title="Generate variasi baru untuk adegan ini saja (-1 Kredit AI)"
                    className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs"
                  >
                    Regenerate Scene (1 Kredit)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={currentScene.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                    onClick={() =>
                      updateScene(currentScene.sceneNumber, { locked: !currentScene.locked })
                    }
                  >
                    {currentScene.locked ? 'Locked' : 'Unlocked'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDeleteScene(currentScene.sceneNumber)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>

              {/* Core Narrative Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Judul Beat (Beat Title)"
                  value={currentScene.beatTitle}
                  onChange={(e) =>
                    updateScene(currentScene.sceneNumber, { beatTitle: e.target.value })
                  }
                />
                <Input
                  label="Tujuan Naratif (Purpose)"
                  value={currentScene.purpose}
                  onChange={(e) =>
                    updateScene(currentScene.sceneNumber, { purpose: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 tracking-wide block">
                  Ringkasan Adegan (Scene Summary)
                </label>
                <textarea
                  className="w-full rounded-xl bg-[#0c0c10] border border-white/10 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  rows={2}
                  value={currentScene.summary}
                  onChange={(e) =>
                    updateScene(currentScene.sceneNumber, { summary: e.target.value })
                  }
                />
              </div>

              {/* Location & Camera Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                {/* Location */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                    📍 Lokasi & Lingkungan
                  </span>
                  <Input
                    label="Deskripsi Tempat"
                    value={currentScene.location.description}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, {
                        location: { ...currentScene.location, description: e.target.value },
                      })
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select
                      label="Waktu Pencahayaan"
                      value={currentScene.location.timeOfDay}
                      options={buildSelectOptions(TIME_OF_DAY_OPTIONS, currentScene.location.timeOfDay)}
                      onChange={(e) =>
                        updateScene(currentScene.sceneNumber, {
                          location: { ...currentScene.location, timeOfDay: e.target.value },
                        })
                      }
                    />
                    <Select
                      label="Cuaca & Suasana"
                      value={currentScene.location.weather}
                      options={buildSelectOptions(WEATHER_OPTIONS, currentScene.location.weather)}
                      onChange={(e) =>
                        updateScene(currentScene.sceneNumber, {
                          location: { ...currentScene.location, weather: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Camera */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
                    🎥 Sinematografi & Kamera
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select
                      label="Framing Shot"
                      value={currentScene.camera.shot}
                      options={buildSelectOptions(FRAMING_OPTIONS, currentScene.camera.shot)}
                      onChange={(e) =>
                        updateScene(currentScene.sceneNumber, {
                          camera: { ...currentScene.camera, shot: e.target.value },
                        })
                      }
                    />
                    <Select
                      label="Sudut Kamera"
                      value={currentScene.camera.angle}
                      options={buildSelectOptions(ANGLE_OPTIONS, currentScene.camera.angle)}
                      onChange={(e) =>
                        updateScene(currentScene.sceneNumber, {
                          camera: { ...currentScene.camera, angle: e.target.value },
                        })
                      }
                    />
                  </div>
                  <Select
                    label="Gerakan Kamera (Movement)"
                    value={currentScene.camera.movement}
                    options={buildSelectOptions(MOVEMENT_OPTIONS, currentScene.camera.movement)}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, {
                        camera: { ...currentScene.camera, movement: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Dialogue & Narration */}
              <div className="space-y-3">
                {/* Voice style hint from character bible */}
                {currentProject?.characters?.[0]?.voiceStyle && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-300 text-xs mt-0.5">🎙️</span>
                    <div>
                      <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                        Karakter Suara — {currentProject.characters[0].name}
                      </span>
                      <p className="text-xs text-purple-200/80 mt-0.5 leading-relaxed">
                        {currentProject.characters[0].voiceStyle}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="💬 Dialog Kanonis (Bahasa Indonesia)"
                    placeholder="Kalimat dialog persis yang diucapkan karakter..."
                    value={currentScene.dialogue || ''}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, { dialogue: e.target.value })
                    }
                  />
                  <Input
                    label="Narasi Voiceover (Opsional)"
                    placeholder="Teks narasi pendukung..."
                    value={currentScene.narration || ''}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, { narration: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Final Compiled Prompts (English Technical) */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                {/* Friendly Educational Guidance for Laypeople */}
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200/90 flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">💡</span>
                  <div className="space-y-1 leading-relaxed">
                    <span className="font-semibold text-blue-300 block">Panduan Cepat Salin Prompt AI:</span>
                    <p className="text-[11px] text-zinc-300">
                      Teks prompt di bawah ini disusun otomatis dalam <strong>Bahasa Inggris teknis</strong> karena generator AI video & gambar (seperti Midjourney, Kling, Veo, Runway, Sora) menghasilkan visual terbaik dengan bahasa Inggris. Anda cukup klik tombol <strong>Copy</strong> lalu tempel pada aplikasi AI pilihan Anda.
                    </p>
                  </div>
                </div>

                {/* Image Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>📸 Prompt Gambar (Salin ke Midjourney / Flux / Leonardo)</span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Copy className="w-3 h-3" />}
                      onClick={() => handleCopyText(currentScene.imagePrompt, `Prompt Gambar Adegan ${currentScene.sceneNumber}`)}
                    >
                      Copy
                    </Button>
                  </div>
                  <textarea
                    className="w-full rounded-xl bg-[#0c0c10] border border-white/10 p-3 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-amber-500"
                    rows={3}
                    value={currentScene.imagePrompt}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, { imagePrompt: e.target.value })
                    }
                  />
                </div>

                {/* Video Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      <span>🎥 Prompt Video (Salin ke {activeModel.displayName})</span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Copy className="w-3 h-3" />}
                      onClick={() => handleCopyText(currentScene.videoPrompt, `Prompt Video Adegan ${currentScene.sceneNumber}`)}
                    >
                      Copy
                    </Button>
                  </div>
                  <textarea
                    className="w-full rounded-xl bg-[#0c0c10] border border-white/10 p-3 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-emerald-500"
                    rows={3}
                    value={currentScene.videoPrompt}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, { videoPrompt: e.target.value })
                    }
                  />
                </div>

                {/* Negative Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-red-400 tracking-wide flex items-center gap-1.5">
                      <span>🚫 Negative Prompt (Pembersih Cacat & Distorsi Visual)</span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Copy className="w-3 h-3" />}
                      onClick={() =>
                        handleCopyText(
                          currentScene.negativePrompt,
                          `Negative Prompt Adegan ${currentScene.sceneNumber}`
                        )
                      }
                    >
                      Copy
                    </Button>
                  </div>
                  <input
                    className="w-full rounded-xl bg-[#0c0c10] border border-white/10 px-3.5 py-2 font-mono text-xs text-zinc-400 focus:outline-none focus:border-red-500"
                    value={currentScene.negativePrompt}
                    onChange={(e) =>
                      updateScene(currentScene.sceneNumber, { negativePrompt: e.target.value })
                    }
                  />
                </div>
              </div>
            </BentoTile>
          ) : (
            <BentoTile className="p-12 text-center text-zinc-500 space-y-4">
              <Film className="w-12 h-12 text-zinc-600 mx-auto opacity-60" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-300">Belum Ada Adegan yang Dipilih</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Pilih salah satu nomor adegan dari panel kiri, atau klik tombol di bawah untuk membuat adegan baru langsung di storyboard.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddScene}
              >
                Tambah Adegan Baru
              </Button>
            </BentoTile>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={exportFormat === 'markdown' ? 'Export Production Sheet (Markdown/TXT)' : 'Export Project JSON'}
        subtitle="Data bersih tanpa kredensial atau token rahasia"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs text-zinc-400 font-mono">
              Ukuran teks: {exportContent.length} karakter
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() => handleCopyText(exportContent, 'Data Ekspor')}
              >
                Salin Semua
              </Button>
              <Button
                variant="emerald"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleDownloadFile}
              >
                Unduh File
              </Button>
            </div>
          </div>

          <textarea
            readOnly
            className="w-full h-80 rounded-xl bg-[#0c0c10] border border-white/10 p-4 font-mono text-xs text-zinc-300 leading-relaxed focus:outline-none"
            value={exportContent}
          />
        </div>
      </Modal>
    </div>
  );
};
