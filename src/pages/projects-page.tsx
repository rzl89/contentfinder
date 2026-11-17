import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/project-store';
import { useLanguageStore } from '@/stores/language-store';
import { CONTENT_CATEGORIES, CONTEXT_PRESETS, getLocalizedCategories } from '@/context-engine';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
  Modal,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import {
  FolderKanban,
  Plus,
  Trash2,
  ExternalLink,
  Film,
  Calendar,
} from 'lucide-react';
import type { ContextProfilePreset } from '@/types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguageStore();
  const { projects, currentProject, createProject, setCurrentProject, deleteProject } =
    useProjectStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('time-travel');
  const [newPreset, setNewPreset] = useState<ContextProfilePreset>('indonesia_natural');

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      showToast({ type: 'warning', title: 'Nama Wajib Diisi', message: 'Tuliskan nama proyek Anda.' });
      return;
    }

    const created = createProject(newProjectName, newCategoryId, newPreset);
    setCreateModalOpen(false);
    setNewProjectName('');

    showToast({
      type: 'success',
      title: 'Proyek Berhasil Dibuat',
      message: `Proyek "${created.name}" siap digunakan.`,
    });

    navigate('/prompt-desk');
  };

  const handleOpenProject = (proj: any) => {
    setCurrentProject(proj);
    showToast({
      type: 'info',
      title: 'Proyek Diaktifkan',
      message: `Beralih ke "${proj.name}".`,
    });
    navigate('/prompt-desk');
  };

  const handleDelete = (id: string, name: string) => {
    deleteProject(id);
    showToast({
      type: 'info',
      title: 'Proyek Dihapus',
      message: `Proyek "${name}" telah dihapus dari ruang kerja.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111115] border border-white/10 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-400" />
            <span>{t('Proyek Produksi Saya', 'My Production Projects')}</span>
          </h2>
          <p className="text-xs text-zinc-400">
            {t(
              'Daftar seluruh proyek produksi konten dan naskah storyboard tersimpan.',
              'Manage all your video content ideas and compiled production storyboards.'
            )}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4 text-black" />}
          onClick={() => setCreateModalOpen(true)}
        >
          {t('Buat Proyek Baru', 'Create New Project')}
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <BentoTile className="p-12 text-center space-y-3">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-200">
            {t('Belum Ada Proyek', 'No Projects Yet')}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {t(
              'Mulai dari Idea Studio untuk mencari konsep atau buat proyek kosong langsung dari sini.',
              'Start from Idea Studio to explore concepts or create a blank project directly.'
            )}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="mt-2"
          >
            {t('Buat Proyek Pertama', 'Create First Project')}
          </Button>
        </BentoTile>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isCurrent = currentProject?.id === proj.id;
            return (
              <BentoTile
                key={proj.id}
                className={`p-5 border flex flex-col justify-between space-y-4 transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-[#111115] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant={isCurrent ? 'amber' : 'zinc'}>
                      {isCurrent ? 'Active Project' : 'Project'}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(proj.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{proj.name}</h3>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge variant="blue">{proj.categoryId}</Badge>
                    <Badge variant="emerald">{proj.contextProfile.preset}</Badge>
                    <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                      <Film className="w-3 h-3 text-amber-400" />
                      {proj.scenes?.length || 0} scenes
                    </span>
                  </div>

                  {proj.selectedIdea && (
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-300">
                      <span className="font-semibold text-amber-300 block mb-0.5">
                        Konsep Terpilih:
                      </span>
                      <p className="line-clamp-2">{proj.selectedIdea.premise}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                    onClick={() => handleDelete(proj.id, proj.name)}
                  >
                    Hapus
                  </Button>

                  <Button
                    variant={isCurrent ? 'emerald' : 'secondary'}
                    size="sm"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenProject(proj)}
                  >
                    Buka Editor
                  </Button>
                </div>
              </BentoTile>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Buat Proyek Storyboard Baru"
        subtitle="Inisialisasi ruang kerja adegan dan context engine"
      >
        <div className="space-y-4">
          <Input
            label="Nama Proyek"
            placeholder="Contoh: Seri Waktu Nusantara Ep 1"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />

          <Select
            label={t('Kategori Konten Utama', 'Primary Content Category')}
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            options={getLocalizedCategories(language).map((c) => ({
              value: c.id,
              label: `${c.name} (${c.group})`,
            }))}
          />

          <Select
            label="Context Engine Preset"
            value={newPreset}
            onChange={(e) => setNewPreset(e.target.value as ContextProfilePreset)}
            options={Object.keys(CONTEXT_PRESETS).map((key) => ({
              value: key,
              label: CONTEXT_PRESETS[key as ContextProfilePreset].name,
            }))}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateProject}>
              Buat & Buka Ruang Kerja
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
