import { create } from 'zustand';
import type { ProviderCredential, VideoGenerationJob, VideoJobStatus } from '@/types';

interface ByokState {
  isKmsConfigured: boolean;
  credentials: ProviderCredential[];
  jobs: VideoGenerationJob[];
  isSubmitting: boolean;

  // Actions
  addCredential: (provider: string, maskedKey: string) => void;
  removeCredential: (provider: string) => void;
  createJob: (projectId: string, sceneNumber: number, modelId: string) => VideoGenerationJob;
  updateJobStatus: (jobId: string, status: VideoJobStatus, outputUrl?: string, error?: string) => void;
  clearCompletedJobs: () => void;
}

const DEFAULT_PROVIDERS: ProviderCredential[] = [
  {
    id: 'cred-veo',
    provider: 'Google Veo (Vertex AI)',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-kling',
    provider: 'Kling 1.5 Pro',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-runway',
    provider: 'Runway Gen-3',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred-luma',
    provider: 'Luma Dream Machine',
    maskedKey: 'Belum dikonfigurasi',
    status: 'unconfigured',
    createdAt: new Date().toISOString(),
  },
];

export const useByokStore = create<ByokState>((set, get) => ({
  // When KMS / server secret is not set, BYOK vault is in safe unconfigured state
  isKmsConfigured: false,
  credentials: DEFAULT_PROVIDERS,
  jobs: [],
  isSubmitting: false,

  addCredential: (provider, maskedKey) => {
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
    set({ credentials: next });
  },

  removeCredential: (provider) => {
    const next = get().credentials.map((c) =>
      c.provider.toLowerCase().includes(provider.toLowerCase())
        ? {
            ...c,
            maskedKey: 'Belum dikonfigurasi',
            status: 'unconfigured' as const,
          }
        : c
    );
    set({ credentials: next });
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
