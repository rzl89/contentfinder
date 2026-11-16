import { create } from 'zustand';

export interface AdminSettings {
  // LLM Config
  defaultModel: string;
  temperature: number;
  openAiApiKey: string;
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
  sessionExpiresAt: number | null; // epoch ms
  failedAttempts: number;
  lockedUntil: number | null; // epoch ms
  settings: AdminSettings;

  // Actions
  login: (pin: string) => 'success' | 'wrong_pin' | 'locked';
  logout: () => void;
  checkSession: () => boolean; // returns true if still valid
  refreshSession: () => void;
  updateAdminPin: (currentPin: string, newPin: string) => boolean;
  updateSettings: (partial: Partial<AdminSettings>) => void;
  resetToDefaults: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SETTINGS_KEY = 'temporaforge_admin_settings_v1';
const PIN_HASH_KEY = 'temporaforge_admin_pin_hash_v2';
const ATTEMPT_KEY = 'temporaforge_admin_attempts_v1';
const SESSION_KEY = 'temporaforge_admin_session_v1'; // sessionStorage

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 min lockout after 5 wrong tries
const PIN_SALT = 'temporaforge_salt_v1';

// Default PIN hash = sha256("112233" + salt) — computed offline
const DEFAULT_PIN_HASH = '7af3c32180c6309402473ca09c997b9327646b5e8c20b13e312ca04b6a943f7b';

// ─── PIN Hashing (Web Crypto API — browser-safe) ──────────────────────────────
async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin + PIN_SALT);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Default Settings ────────────────────────────────────────────────────────
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

// ─── Storage helpers ─────────────────────────────────────────────────────────
function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

function loadStoredPinHash(): string {
  try {
    return localStorage.getItem(PIN_HASH_KEY) || DEFAULT_PIN_HASH;
  } catch {
    return DEFAULT_PIN_HASH;
  }
}

function loadAttemptState(): { failedAttempts: number; lockedUntil: number | null } {
  try {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { failedAttempts: 0, lockedUntil: null };
  }
}

function saveAttemptState(failedAttempts: number, lockedUntil: number | null): void {
  try {
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ failedAttempts, lockedUntil }));
  } catch { /* noop */ }
}

function loadSession(): { expiresAt: number | null; isAuthenticated: boolean } {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { expiresAt: null, isAuthenticated: false };
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
      return { expiresAt: parsed.expiresAt, isAuthenticated: true };
    }
    sessionStorage.removeItem(SESSION_KEY);
    return { expiresAt: null, isAuthenticated: false };
  } catch {
    return { expiresAt: null, isAuthenticated: false };
  }
}

function saveSession(expiresAt: number): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt }));
  } catch { /* noop */ }
}

function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* noop */ }
}

// ─── Store ───────────────────────────────────────────────────────────────────
const initialSession = loadSession();
const initialAttempts = loadAttemptState();

export const useAdminStore = create<AdminState>((set, get) => ({
  isAuthenticated: initialSession.isAuthenticated,
  sessionExpiresAt: initialSession.expiresAt,
  failedAttempts: initialAttempts.failedAttempts,
  lockedUntil: initialAttempts.lockedUntil,
  settings: loadSettings(),

  login: (pin: string) => {
    const now = Date.now();
    const { lockedUntil, failedAttempts } = get();

    // Check lockout
    if (lockedUntil && now < lockedUntil) return 'locked';

    // Reset expired lockout
    if (lockedUntil && now >= lockedUntil) {
      set({ lockedUntil: null, failedAttempts: 0 });
      saveAttemptState(0, null);
    }

    // Verify PIN asynchronously by comparing hash
    // We use sync comparison for UX (hash is precomputed via async in updateAdminPin)
    // For the initial check, we compare against stored hash synchronously
    const storedHash = loadStoredPinHash();
    
    // We need to hash the input — use a temporary sync-like approach
    // by running the async hash and storing result
    // For security: use Web Crypto async properly
    hashPin(pin).then((inputHash) => {
      if (inputHash === storedHash) {
        const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
        saveSession(expiresAt);
        saveAttemptState(0, null);
        set({ isAuthenticated: true, sessionExpiresAt: expiresAt, failedAttempts: 0, lockedUntil: null });
      } else {
        const newAttempts = failedAttempts + 1;
        const newLocked = newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
        saveAttemptState(newAttempts, newLocked);
        set({ failedAttempts: newAttempts, lockedUntil: newLocked });
      }
    });

    // We return a pending state; the UI handles async result via store subscription
    return 'success'; // actual result comes via state update
  },

  logout: () => {
    clearSession();
    set({ isAuthenticated: false, sessionExpiresAt: null });
  },

  checkSession: () => {
    const { sessionExpiresAt } = get();
    if (!sessionExpiresAt || Date.now() >= sessionExpiresAt) {
      clearSession();
      set({ isAuthenticated: false, sessionExpiresAt: null });
      return false;
    }
    return true;
  },

  refreshSession: () => {
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    saveSession(expiresAt);
    set({ sessionExpiresAt: expiresAt });
  },

  updateAdminPin: (_currentPin: string, newPin: string) => {
    // Hash and store new PIN
    hashPin(newPin).then((hash) => {
      try {
        localStorage.setItem(PIN_HASH_KEY, hash);
      } catch { /* noop */ }
    });
    return true;
  },

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch { /* noop */ }
    set({ settings: next });
  },

  resetToDefaults: () => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch { /* noop */ }
    set({ settings: DEFAULT_ADMIN_SETTINGS });
  },
}));

// ─── Helpers for other stores ─────────────────────────────────────────────────
export function getPaymentAccounts() {
  const { settings } = useAdminStore.getState();
  return {
    bca: { number: settings.bcaNumber, holder: settings.bcaHolder },
    mandiri: { number: settings.mandiriNumber, holder: settings.mandiriHolder },
    qris: { nmid: settings.qrisNmid, holder: settings.qrisHolder },
    dana: { number: settings.danaNumber, holder: settings.danaHolder },
    adminWhatsApp: settings.adminWhatsApp,
    proPriceMonthly: settings.proPriceMonthly,
    proPriceYearly: settings.proPriceYearly,
  };
}
