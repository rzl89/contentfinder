import { create } from 'zustand';

export interface AdminSettings {
  // LLM Config
  defaultModel: string;
  temperature: number;
  openAiApiKey: string; // Stored if admin overrides or configured via server
  systemPromptOverride: string;

  // BYOK Security Config
  byokEnabled: boolean;
  byokEncryptionMode: 'client_aes_gcm' | 'kms_vault';
  allowedProviders: string[];

  // Payment & Subscription Config
  trialDurationHours: number;
  proPriceMonthly: number;
  proPriceYearly: number;
  adminWhatsApp: string;
  bcaNumber: string;
  bcaHolder: string;
  mandiriNumber: string;
  mandiriHolder: string;
  qrisNmid: string;
  qrisHolder: string;
  danaNumber: string;
  danaHolder: string;
}

interface AdminState {
  isAuthenticated: boolean;
  adminPin: string;
  settings: AdminSettings;

  // Actions
  login: (pin: string) => boolean;
  logout: () => void;
  updateAdminPin: (newPin: string) => void;
  updateSettings: (partial: Partial<AdminSettings>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'temporaforge_admin_settings_v1';
const PIN_STORAGE_KEY = 'temporaforge_admin_pin_v1';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  defaultModel: 'gpt-6-luna',
  temperature: 0.75,
  openAiApiKey: '',
  systemPromptOverride: '',

  byokEnabled: true,
  byokEncryptionMode: 'client_aes_gcm',
  allowedProviders: ['Google Veo', 'Kling 1.5 Pro', 'Runway Gen-3', 'Luma Dream Machine'],

  trialDurationHours: 24,
  proPriceMonthly: 59000,
  proPriceYearly: 499000,
  adminWhatsApp: (import.meta.env.VITE_ADMIN_WHATSAPP as string) || '6281234567890',
  bcaNumber: (import.meta.env.VITE_PAYMENT_BCA_NO as string) || '8290-8812-9901',
  bcaHolder: (import.meta.env.VITE_PAYMENT_BCA_HOLDER as string) || 'TEMPORAFORGE AI / RIZAL',
  mandiriNumber: (import.meta.env.VITE_PAYMENT_MANDIRI_NO as string) || '1370-0199-8821-2',
  mandiriHolder: (import.meta.env.VITE_PAYMENT_MANDIRI_HOLDER as string) || 'TEMPORAFORGE AI / RIZAL',
  qrisNmid: (import.meta.env.VITE_PAYMENT_QRIS_NMID as string) || 'NMID: ID1020268899120',
  qrisHolder: (import.meta.env.VITE_PAYMENT_QRIS_HOLDER as string) || 'TEMPORAFORGE CREATIVE STUDIO',
  danaNumber: (import.meta.env.VITE_PAYMENT_DANA_NO as string) || '0812-3456-7890',
  danaHolder: (import.meta.env.VITE_PAYMENT_DANA_HOLDER as string) || 'RIZAL - TEMPORAFORGE',
};

function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

function loadPin(): string {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || 'admin123';
  } catch {
    return 'admin123';
  }
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isAuthenticated: false,
  adminPin: loadPin(),
  settings: loadSettings(),

  login: (pin: string) => {
    if (pin === get().adminPin) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  updateAdminPin: (newPin: string) => {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
    } catch (e) {
      console.error(e);
    }
    set({ adminPin: newPin });
  },

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    set({ settings: next });
  },

  resetToDefaults: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    set({ settings: DEFAULT_ADMIN_SETTINGS });
  },
}));
