import React, { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useLanguageStore } from '@/stores/language-store';
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
  const { language, t } = useLanguageStore();
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
        title: t('Preset Konteks Diterapkan', 'Context Preset Applied'),
        message: t(
          `Proyek beralih ke profil "${p.name}".`,
          `Project switched to "${p.name}" profile.`
        ),
      });
    }
  };

  const handleSaveCustomOverrides = () => {
    if (!currentProject) {
      showToast({
        type: 'warning',
        title: t('Belum Ada Proyek Aktif', 'No Active Project'),
        message: t('Buat proyek terlebih dahulu.', 'Please create a project first.'),
      });
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
      title: t('Pengaturan Konteks Disimpan', 'Context Settings Saved'),
      message: t(
        'Perubahan akan diterapkan pada setiap generasi ide dan prompt berikutnya.',
        'Changes will be applied to upcoming ideation and prompt generations.'
      ),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>{t('Pengaturan & Konteks Narasi', 'Settings & Cultural Context')}</span>
        </h2>
        <p className="text-xs text-zinc-400">
          {t(
            'Kelola profil konteks, target audiens, dan preferensi gaya visual default untuk generator ide dan prompt.',
            'Manage context profiles, target audiences, and default visual style preferences for ideation and prompt compiling.'
          )}
        </p>
      </div>

      <BentoTile className="p-6 md:p-8 space-y-6 bg-[#111115] border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t('Pengaturan Context Profile Aktif', 'Active Context Profile Settings')}</span>
          </h3>
          <Badge variant="amber">{activeProfile.name}</Badge>
        </div>

        {/* Preset Selector */}
        <Select
          label={t('Pilih Preset Konteks', 'Select Context Preset')}
          value={preset}
          onChange={(e) => handleApplyPreset(e.target.value as ContextProfilePreset)}
          options={Object.keys(CONTEXT_PRESETS).map((key) => ({
            value: key,
            label: CONTEXT_PRESETS[key as ContextProfilePreset].name,
          }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label={t('Target Market / Audiens Sasaran', 'Target Market / Audience')}
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            placeholder={t(
              'Contoh: Indonesia Urban & Kreator Digital',
              'e.g. Urban Creators & Digital Nomads'
            )}
          />

          <Select
            label={t('Default Environment / Lokasi', 'Default Environment')}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
            options={[
              { value: 'mixed', label: t('Mixed / Campuran Seimbang', 'Balanced Mixed') },
              { value: 'urban', label: t('Urban (Kota Modern)', 'Urban (Modern City)') },
              { value: 'suburban', label: t('Suburban (Pinggiran Kota)', 'Suburban') },
              { value: 'rural', label: t('Rural (Pedesaan)', 'Rural / Countryside') },
              { value: 'natural', label: t('Natural / Lanskap Alam', 'Nature / Outdoors') },
              { value: 'indoor', label: t('Indoor / Interior Ruangan', 'Indoor / Interior') },
              { value: 'historical', label: t('Historical / Sejarah', 'Historical') },
              { value: 'fantasy', label: t('Fantasy / Dunia Imajinasi', 'Fantasy') },
            ]}
          />

          <Select
            label={t('Default Gaya Visual', 'Default Visual Style')}
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
            options={[
              { value: 'cinematic_realistic', label: t('Sinematik Realistis', 'Cinematic Realistic') },
              { value: '3d_animation', label: t('Animasi 3D', '3D Animation') },
              { value: '2d_animation', label: t('Animasi 2D', '2D Animation') },
              { value: 'stickman', label: t('Animasi Stickman', 'Stickman Animation') },
              { value: 'anime', label: t('Gaya Anime', 'Anime Style') },
              { value: 'stylized', label: t('Stylized 3D', 'Stylized 3D') },
            ]}
          />

          <Select
            label={t('Bahasa Dialog & Narasi', 'Dialogue & Narration Language')}
            value={dialogLanguage}
            onChange={(e) => setDialogLanguage(e.target.value as DialogLanguage)}
            options={[
              { value: 'indonesian', label: t('Bahasa Indonesia (Natural Santai)', 'Indonesian (Natural Casual)') },
              { value: 'english', label: t('Bahasa Inggris (English)', 'English') },
              { value: 'javanese', label: t('Bahasa Jawa', 'Javanese') },
              { value: 'sundanese', label: t('Bahasa Sunda', 'Sundanese') },
              { value: 'mixed', label: t('Campuran / Code-switching', 'Mixed / Code-switching') },
              { value: 'none', label: t('Tanpa Dialog (Hanya Visual & Audio SFX)', 'No Dialogue (Visual & SFX Only)') },
            ]}
          />
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {t('Perubahan disimpan langsung ke proyek aktif.', 'Changes are saved directly to the active project.')}
          </span>
          <Button
            variant="primary"
            size="md"
            icon={<Sliders className="w-4 h-4 text-black" />}
            onClick={handleSaveCustomOverrides}
          >
            {t('Simpan Konfigurasi', 'Save Configuration')}
          </Button>
        </div>
      </BentoTile>
    </div>
  );
};
