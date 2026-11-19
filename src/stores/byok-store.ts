import { create } from 'zustand';
import type { ProviderCredential, VideoGenerationJob, VideoJobStatus } from '@/types';

interface ByokState {
  isKmsConfigured: boolean;
  credentials: ProviderCredential[];
  jobs: VideoGenerationJob[];
  isSubmitting: boolean;

  // Actions
  setKmsConfigured: (status: boolean) => void;
  addCredential: (provider: string, maskedKey: string, encryptedSecret?: string) => void;
  removeCredential: (provider: string) => void;
  purgeAllCredentials: () => void;
  createJob: (projectId: string, sceneNumber: number, modelId: string) => VideoGenerationJob;
  updateJobStatus: (jobId: string, status: VideoJobStatus, outputUrl?: string, error?: string) => void;
  clearCompletedJobs: () => void;
}

const STORAGE_KEY = 'temporaforge_byok_credentials_v1';
const SESSION_VAULT_PREFIX = 'tf_vault_ephemeral_';

const DEFAULT_PROVIDERS: ProviderCredential[] = [
  {
    id: 'cred-veo',
    provider: 'Google Veo 3 (Vertex AI)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-kling',
    provider: 'Kling 2.1 Pro (Kuaishou)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-runway',
    provider: 'Runway Gen-4 Turbo',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-luma',
    provider: 'Luma Ray 2 Flash (Dream Machine)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-minimax',
    provider: 'MiniMax Video-01-Live (Hailuo)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-sora',
    provider: 'OpenAI Sora Turbo',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-pika',
    provider: 'Pika 2.2 (Pikaffects)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-pixverse',
    provider: 'PixVerse V4 Pro',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-wan',
    provider: 'Wan 2.1 Video (Alibaba)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-hunyuan',
    provider: 'Hunyuan Video Turbo (Tencent)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
];

function loadSavedCredentials(): ProviderCredential[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROVIDERS;
    const parsed = JSON.parse(raw);
    return DEFAULT_PROVIDERS.map((def) => {
      const match = parsed.find((p: ProviderCredential) => p.id === def.id || p.provider === def.provider);
      return match || def;
    });
  } catch {
    return DEFAULT_PROVIDERS;
  }
}

export const useByokStore = create<ByokState>((set, get) => ({
  // Active security vault is configured with Client-side AES-GCM envelope protection
  isKmsConfigured: true,
  credentials: loadSavedCredentials(),
  jobs: [],
  isSubmitting: false,

  setKmsConfigured: (status) => set({ isKmsConfigured: status }),

  addCredential: (provider, maskedKey, encryptedSecret) => {
    // 1. Store ephemeral encrypted secret in sessionStorage (isolated, cleared on tab close)
    if (encryptedSecret) {
      try {
        sessionStorage.setItem(`${SESSION_VAULT_PREFIX}${provider}`, encryptedSecret);
      } catch (e) {
        console.error('Session vault write failed', e);
      }
    }

    // 2. Update visible credentials with ONLY the masked representation
    const next = get().credentials.map((c) =>
      c.provider.toLowerCase().includes(provider.toLowerCase())
        ? {
          ...c,
          maskedKey,
          status: 'active' as const,
          lastUsedAt: new Date().toISOString(),
        }
        : c
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Credential storage sync error', e);
    }

    set({ credentials: next });
  },

  removeCredential: (provider) => {
    // 1. Purge from session memory
    try {
      sessionStorage.removeItem(`${SESSION_VAULT_PREFIX}${provider}`);
    } catch (e) {
      console.error(e);
    }

    // 2. Reset status
    const next = get().credentials.map((c) =>
      c.provider.toLowerCase().includes(provider.toLowerCase())
        ? {
          ...c,
          maskedKey: 'Belum dikonfigurasi',
          status: 'unconfigured' as const,
          lastUsedAt: undefined,
        }
        : c
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }

    set({ credentials: next });
  },

  purgeAllCredentials: () => {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(SESSION_VAULT_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    set({ credentials: DEFAULT_PROVIDERS });
  },

  createJob: (projectId, sceneNumber, modelId) => {
    const newJob: VideoGenerationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      sceneNumber,
      modelId,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({ jobs: [newJob, ...get().jobs] });
    return newJob;
  },

  updateJobStatus: (jobId, status, outputUrl, error) => {
    const nextJobs = get().jobs.map((j) =>
      j.id === jobId
        ? {
          ...j,
          status,
          outputUrl: outputUrl || j.outputUrl,
          error: error || j.error,
          updatedAt: new Date().toISOString(),
        }
        : j
    );
    set({ jobs: nextJobs });
  },

  clearCompletedJobs: () => {
    const active = get().jobs.filter(
      (j) => j.status === 'queued' || j.status === 'submitted' || j.status === 'processing'
    );
    set({ jobs: active });
  },
}));
