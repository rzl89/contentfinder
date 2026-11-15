import { create } from 'zustand';
import type {
  Project,
  ContentIdea,
  CharacterBible,
  WorldBible,
  Scene,
  QCResult,
  ContextProfilePreset,
  ContextProfile,
} from '@/types';
import { resolveContextProfile } from '@/context-engine';
import { syncProjectToSupabase, deleteProjectFromSupabase } from '@/lib/supabase';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;

  // Actions
  createProject: (
    name: string,
    categoryId: string,
    preset?: ContextProfilePreset,
    overrides?: Partial<ContextProfile>
  ) => Project;
  setCurrentProject: (project: Project | null) => void;
  updateCurrentProject: (updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setSelectedIdea: (idea: ContentIdea) => void;
  addCharacter: (character: Omit<CharacterBible, 'id' | 'projectId'>) => void;
  updateCharacter: (id: string, updates: Partial<CharacterBible>) => void;
  removeCharacter: (id: string) => void;
  updateWorldBible: (updates: Partial<WorldBible>) => void;
  setScenes: (scenes: Scene[]) => void;
  updateScene: (sceneNumber: number, updates: Partial<Scene>) => void;
  setQCResult: (result: QCResult) => void;
  setTargetModel: (modelId: string) => void;
}

const STORAGE_KEY = 'temporaforge_projects_v1';

function loadProjectsFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse projects from storage', e);
    return [];
  }
}

function persistProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to storage', e);
  }
}

const initialProjects = loadProjectsFromStorage();

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: initialProjects,
  currentProject: initialProjects.length > 0 ? initialProjects[0] : null,
  isLoading: false,

  createProject: (name, categoryId, preset = 'indonesia_natural', overrides) => {
    const resolvedProfile = resolveContextProfile(preset, overrides);
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: 'user_local_owner',
      name: name.trim() || 'Untitled Content Project',
      categoryId,
      contextProfile: resolvedProfile,
      characters: [],
      scenes: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextProjects = [newProject, ...get().projects];
    persistProjects(nextProjects);

    // Sync to Supabase in background
    syncProjectToSupabase(newProject);

    set({
      projects: nextProjects,
      currentProject: newProject,
    });

    return newProject;
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  updateCurrentProject: (updates) => {
    const current = get().currentProject;
    if (!current) return;

    const updated: Project = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const nextProjects = get().projects.map((p) => (p.id === updated.id ? updated : p));
    persistProjects(nextProjects);

    // Sync to Supabase in background
    syncProjectToSupabase(updated);

    set({
      currentProject: updated,
      projects: nextProjects,
    });
  },

  deleteProject: (id) => {
    const nextProjects = get().projects.filter((p) => p.id !== id);
    persistProjects(nextProjects);

    // Delete from Supabase in background
    deleteProjectFromSupabase(id);

    const current = get().currentProject;
    set({
      projects: nextProjects,
      currentProject: current?.id === id ? (nextProjects[0] ?? null) : current,
    });
  },

  setSelectedIdea: (idea) => {
    const current = get().currentProject;
    if (!current) return;

    get().updateCurrentProject({
      selectedIdea: idea,
      categoryId: idea.categoryId,
    });
  },

  addCharacter: (charData) => {
    const current = get().currentProject;
    if (!current) return;

    const newChar: CharacterBible = {
      ...charData,
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: current.id,
    };

    get().updateCurrentProject({
      characters: [...current.characters, newChar],
    });
  },

  updateCharacter: (id, updates) => {
    const current = get().currentProject;
    if (!current) return;

    const nextChars = current.characters.map((c) => (c.id === id ? { ...c, ...updates } : c));
    get().updateCurrentProject({ characters: nextChars });
  },

  removeCharacter: (id) => {
    const current = get().currentProject;
    if (!current) return;

    const nextChars = current.characters.filter((c) => c.id !== id);
    get().updateCurrentProject({ characters: nextChars });
  },

  updateWorldBible: (updates) => {
    const current = get().currentProject;
    if (!current) return;

    const baseWorld = current.worldBible || {
      id: `wb_${Date.now()}`,
      projectId: current.id,
      name: `${current.name} World`,
      environmentType: current.contextProfile.environment,
      description: 'Dunia cerita yang dibangun dengan konsistensi visual.',
      timeOfDay: 'Siang hari natural',
      weather: 'Cerah berawan',
      props: [],
      rules: ['Patuhi konsistensi pencahayaan', 'Patuhi batasan teknologi era'],
      moodAndTone: 'Cinematic, engaging, authentic',
      colorPalette: ['#1A1A24', '#F59E0B', '#10B981'],
    };

    get().updateCurrentProject({
      worldBible: { ...baseWorld, ...updates },
    });
  },

  setScenes: (scenes) => {
    get().updateCurrentProject({ scenes });
  },

  updateScene: (sceneNumber, updates) => {
    const current = get().currentProject;
    if (!current) return;

    const nextScenes = current.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, ...updates } : s
    );

    get().updateCurrentProject({ scenes: nextScenes });
  },

  setQCResult: (result) => {
    get().updateCurrentProject({ qcResult: result });
  },

  setTargetModel: (modelId) => {
    get().updateCurrentProject({ targetModel: modelId });
  },
}));
