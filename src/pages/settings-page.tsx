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
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
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

  const handleApplyPreset = (chosenPreset: ContextProfilePreset) => {
    setPreset(chosenPreset);
    const p = CONTEXT_PRESETS[chosenPreset];
    if (p) {
      setTargetMarket(p.targetMarket);
      setEnvironment(p.environment);
      setVisualStyle(p.visualStyle);
      setDialogLanguage(p.dialogLanguage);
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

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>Pengaturan & Konteks Narasi</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Kelola profil konteks, target audiens, dan preferensi gaya visual default untuk generator ide dan prompt.
        </p>
      </div>

      <BentoTile className="p-6 md:p-8 space-y-6 bg-[#111115] border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan Context Profile Aktif</span>
          </h3>
          <Badge variant="amber">{activeProfile.name}</Badge>
        </div>

        {/* Preset Selector */}
        <Select
          label="Pilih Preset Konteks"
          value={preset}
          onChange={(e) => handleApplyPreset(e.target.value as ContextProfilePreset)}
          options={Object.keys(CONTEXT_PRESETS).map((key) => ({
            value: key,
            label: CONTEXT_PRESETS[key as ContextProfilePreset].name,
          }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Target Market / Audiens Sasaran"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            placeholder="Contoh: Indonesia Urban & Kreator Digital"
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

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Perubahan disimpan langsung ke proyek aktif.
          </span>
          <Button
            variant="primary"
            size="md"
            icon={<Sliders className="w-4 h-4 text-black" />}
            onClick={handleSaveCustomOverrides}
          >
            Simpan Konfigurasi
          </Button>
        </div>
      </BentoTile>
    </div>
  );
};
