import React, { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { CONTEXT_PRESETS, DEFAULT_CONTEXT_PROFILE } from '@/context-engine';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import {
  Settings,
  ShieldCheck,
  Globe,
  Sliders,
  BookOpen,
  Database,
  KeyRound,
} from 'lucide-react';
import { getSupabaseConfig, setSupabaseCredentials } from '@/lib/supabase';
import type { ContextProfilePreset, EnvironmentType, VisualStyle, DialogLanguage } from '@/types';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { currentProject, updateCurrentProject } = useProjectStore();

  const activeProfile = currentProject?.contextProfile || DEFAULT_CONTEXT_PROFILE;

  const [preset, setPreset] = useState<ContextProfilePreset>(activeProfile.preset);
  const [targetMarket, setTargetMarket] = useState(activeProfile.targetMarket);
  const [environment, setEnvironment] = useState<EnvironmentType>(activeProfile.environment);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(activeProfile.visualStyle);
  const [dialogLanguage, setDialogLanguage] = useState<DialogLanguage>(activeProfile.dialogLanguage);

  const supabaseConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url);
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState('');

  const handleSaveSupabase = () => {
    if (!supabaseAnonKeyInput.trim() && !supabaseConfig.isConfigured) {
      showToast({ type: 'warning', title: 'Anon Key Kosong', message: 'Masukkan Supabase Anon Key proyek Anda.' });
      return;
    }
    setSupabaseCredentials(supabaseUrl, supabaseAnonKeyInput.trim());
    showToast({
      type: 'success',
      title: 'Koneksi Supabase Disimpan',
      message: `Proyek tersinkronisasi ke project_ref: ${supabaseConfig.projectRef}`,
    });
  };

  const handleApplyPreset = (chosenPreset: ContextProfilePreset) => {
    setPreset(chosenPreset);
    const p = CONTEXT_PRESETS[chosenPreset];
    setTargetMarket(p.targetMarket);
    setEnvironment(p.environment);
    setVisualStyle(p.visualStyle);
    setDialogLanguage(p.dialogLanguage);

    if (currentProject) {
      updateCurrentProject({ contextProfile: p });
      showToast({
        type: 'success',
        title: 'Preset Konteks Diterapkan',
        message: `Proyek beralih ke profil "${p.name}".`,
      });
    }
  };

  const handleSaveCustomOverrides = () => {
    if (!currentProject) {
      showToast({ type: 'warning', title: 'Belum Ada Proyek Aktif', message: 'Buat proyek terlebih dahulu.' });
      return;
    }

    const updated = {
      ...activeProfile,
      targetMarket,
      environment,
      visualStyle,
      dialogLanguage,
      preset,
    };

    updateCurrentProject({ contextProfile: updated });
    showToast({
      type: 'success',
      title: 'Pengaturan Konteks Disimpan',
      message: 'Perubahan akan diterapkan pada setiap generasi ide dan prompt berikutnya.',
    });
  };

  const goldenRules = [
    'Jangan menganggap semua cerita harus berlatar Jakarta.',
    'Jangan memasukkan motor, warung, pasar, gang, rumah sederhana, atau simbol lokal secara acak ke setiap cerita.',
    'Pilih lingkungan berdasarkan kebutuhan narasi. Mixed berarti pilihan lingkungan beragam, bukan semua scene harus ganti tempat.',
    'Jika pengguna memilih lokasi/daerah spesifik, gunakan detail daerah itu hanya jika relevan dan dapat dipertanggungjawabkan.',
    'Jangan menggeneralisasi budaya, kelas sosial, pekerjaan, keluarga, agama, atau kebiasaan seluruh orang Indonesia.',
    'Jangan menebak etnisitas atau atribut sensitif seseorang dari foto. Analisis foto hanya boleh mendeskripsikan ciri visual yang tampak dan relevan seperti rambut, pakaian, aksesori, pose, dan warna.',
    'Cerita fiksi, sejarah, fantasi, atau futuristik boleh memakai latar non-Indonesia jika diperlukan. Bahasa dan target audiens tetap mengikuti project profile.',
    'Profil konteks bisa di-override per proyek dan per scene. Instruksi khusus pengguna memiliki prioritas tertinggi.',
    'Context Engine harus aktif dari tahap ide sampai prompt final, bukan baru ditambahkan di akhir.',
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 shadow-xl space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>Settings & Context Engine Governance</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Kelola profil konteks lokal, arsitektur tata kelola otentisitas budaya, dan preferensi prompt generator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context Settings Form */}
        <div className="lg:col-span-7 space-y-4">
          <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Pengaturan Context Profile Aktif</span>
              </h3>
              <Badge variant="amber">{activeProfile.name}</Badge>
            </div>

            {/* Preset Selector */}
            <Select
              label="Pilih Preset Global"
              value={preset}
              onChange={(e) => handleApplyPreset(e.target.value as ContextProfilePreset)}
              options={Object.keys(CONTEXT_PRESETS).map((key) => ({
                value: key,
                label: CONTEXT_PRESETS[key as ContextProfilePreset].name,
              }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Market"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
              />

              <Select
                label="Default Environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
                options={[
                  { value: 'mixed', label: 'Mixed / Campuran Seimbang' },
                  { value: 'urban', label: 'Urban (Kota Modern)' },
                  { value: 'suburban', label: 'Suburban' },
                  { value: 'rural', label: 'Rural (Pedesaan)' },
                  { value: 'natural', label: 'Natural / Lanskap Alam' },
                  { value: 'indoor', label: 'Indoor / Interior' },
                  { value: 'historical', label: 'Historical' },
                  { value: 'fantasy', label: 'Fantasy' },
                ]}
              />

              <Select
                label="Default Visual Style"
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                options={[
                  { value: 'cinematic_realistic', label: 'Cinematic Realistic' },
                  { value: '3d_animation', label: '3D Animation' },
                  { value: '2d_animation', label: '2D Animation' },
                  { value: 'stickman', label: 'Stickman Animation' },
                  { value: 'anime', label: 'Anime Style' },
                  { value: 'stylized', label: 'Stylized 3D' },
                ]}
              />

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
                  { value: 'none', label: 'Tanpa Dialog' },
                ]}
              />
            </div>

            {/* Cultural notes box */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <span className="font-semibold text-amber-300 block">
                Catatan Lokalisasi & Budaya Tersemat:
              </span>
              <ul className="space-y-1 text-zinc-300">
                {activeProfile.localization.culturalNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                icon={<Sliders className="w-4 h-4 text-black" />}
                onClick={handleSaveCustomOverrides}
              >
                Simpan & Terapkan Konteks
              </Button>
            </div>
          </BentoTile>

          {/* Supabase Database Cloud Persistence Card */}
          <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Supabase Cloud Database Persistence
                </h3>
              </div>
              <Badge variant={supabaseConfig.isConfigured ? 'emerald' : 'zinc'}>
                {supabaseConfig.isConfigured ? 'Connected' : 'Project Ref Configured'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Target Project Ref:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {supabaseConfig.projectRef}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Database Endpoint:</span>
                <span className="font-mono text-zinc-300 text-[11px]">
                  {supabaseConfig.url}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Anon Key Status:</span>
                <span className="font-mono text-zinc-300 text-[11px]">
                  {supabaseConfig.anonKeyMasked}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <Input
                label="Supabase Project URL"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
              <Input
                type="password"
                label="Supabase Publishable / Anon Key"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseAnonKeyInput}
                onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                helperText="Masukkan anon key untuk sinkronisasi cloud real-time antar perangkat."
              />

              <div className="flex justify-end pt-1">
                <Button
                  variant="emerald"
                  size="sm"
                  icon={<KeyRound className="w-3.5 h-3.5" />}
                  onClick={handleSaveSupabase}
                >
                  Hubungkan Database Supabase
                </Button>
              </div>
            </div>
          </BentoTile>
        </div>

        {/* Right Column: 9 Golden Rules Reference */}
        <div className="lg:col-span-5 space-y-4">
          <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-100">
                9 Golden Rules of Context Authenticity
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {goldenRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs"
                >
                  <span className="font-mono text-amber-400 font-bold shrink-0 mt-0.5">
                    0{idx + 1}.
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">{rule}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sembilan aturan ini otomatis diinjeksi ke setiap prompt AI LLM.</span>
            </div>
          </BentoTile>
        </div>
      </div>
    </div>
  );
};
