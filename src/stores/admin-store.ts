import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface DynamicPaymentMethod {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  icon: string;
  category: 'bank' | 'qris' | 'ewallet' | 'other';
  isActive: boolean;
  instructions: string[];
}

export interface DuitkuConfig {
  isEnabled: boolean;
  environment: 'sandbox' | 'production';
  merchantCode: string;
  apiKey: string;
  sandboxMerchantCode: string;
  sandboxApiKey: string;
  prodMerchantCode: string;
  prodApiKey: string;
  expiryPeriod: number;
}

export const DEFAULT_DUITKU_CONFIG: DuitkuConfig = {
  isEnabled: true,
  environment: 'sandbox',
  merchantCode: '',
  apiKey: '',
  sandboxMerchantCode: '',
  sandboxApiKey: '',
  prodMerchantCode: '',
  prodApiKey: '',
  expiryPeriod: 1440,
};

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
  customPaymentMethods?: DynamicPaymentMethod[];
  duitkuConfig?: DuitkuConfig;
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

  // Dynamic Payment Methods
  fetchPaymentMethods: () => Promise<DynamicPaymentMethod[]>;
  savePaymentMethods: (methods: DynamicPaymentMethod[]) => Promise<void>;
  addPaymentMethod: (method: Omit<DynamicPaymentMethod, 'id'> & { id?: string }) => Promise<void>;
  updatePaymentMethod: (id: string, updated: Partial<DynamicPaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  togglePaymentMethod: (id: string) => Promise<void>;
  resetPaymentMethodsToDefault: () => Promise<void>;

  // Duitku Gateway
  fetchDuitkuConfig: () => Promise<DuitkuConfig>;
  saveDuitkuConfig: (config: Partial<DuitkuConfig>) => Promise<void>;
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

// ─── Default Payment Accounts ────────────────────────────────────────────────
export const DEFAULT_PAYMENT_ACCOUNTS: DynamicPaymentMethod[] = [
  {
    id: 'bca',
    name: 'BCA (Bank Central Asia)',
    accountNumber: (import.meta.env.VITE_PAYMENT_BCA_NO as string) || '8290-8812-9901',
    accountHolder: (import.meta.env.VITE_PAYMENT_BCA_HOLDER as string) || 'TEMPORAFORGE AI / RIZAL',
    icon: '🏦',
    category: 'bank',
    isActive: true,
    instructions: [
      'Buka BCA mobile atau myBCA.',
      'Pilih m-Transfer > Antar Rekening.',
      'Masukkan nomor rekening dan nominal transfer TEPAT beserta 3 digit kode unik.',
      'Simpan bukti transfer / struk untuk konfirmasi WhatsApp.',
    ],
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    accountNumber: (import.meta.env.VITE_PAYMENT_MANDIRI_NO as string) || '1370-0199-8821-2',
    accountHolder: (import.meta.env.VITE_PAYMENT_MANDIRI_HOLDER as string) || 'TEMPORAFORGE AI / RIZAL',
    icon: '🏦',
    category: 'bank',
    isActive: true,
    instructions: [
      'Buka Livin\' by Mandiri.',
      'Pilih Transfer Rupiah > Rekening Mandiri.',
      'Masukkan nominal transfer TEPAT beserta 3 digit kode unik.',
      'Simpan screenshot resi transaksi.',
    ],
  },
  {
    id: 'qris',
    name: 'QRIS Semua Pembayaran (GoPay/OVO/Dana/BCA/Shopee)',
    accountNumber: (import.meta.env.VITE_PAYMENT_QRIS_NMID as string) || 'NMID: ID1020268899120',
    accountHolder: (import.meta.env.VITE_PAYMENT_QRIS_HOLDER as string) || 'TEMPORAFORGE CREATIVE STUDIO',
    icon: '📱',
    category: 'qris',
    isActive: true,
    instructions: [
      'Buka aplikasi e-wallet atau mobile banking favorit Anda.',
      'Pindai (Scan) QRIS yang tertera pada layar.',
      'Input nominal transfer TEPAT sesuai invoice.',
      'Simpan bukti pembayaran berhasil.',
    ],
  },
  {
    id: 'dana',
    name: 'DANA / GoPay E-Wallet',
    accountNumber: (import.meta.env.VITE_PAYMENT_DANA_NO as string) || '0812-3456-7890',
    accountHolder: (import.meta.env.VITE_PAYMENT_DANA_HOLDER as string) || 'RIZAL - TEMPORAFORGE',
    icon: '💳',
    category: 'ewallet',
    isActive: true,
    instructions: [
      'Buka aplikasi DANA atau GoPay.',
      'Kirim uang ke nomor HP di atas.',
      'Pastikan nama penerima sesuai sebelum konfirmasi PIN.',
      'Screenshot bukti transfer berhasil.',
    ],
  },
];

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
  customPaymentMethods: DEFAULT_PAYMENT_ACCOUNTS,
  duitkuConfig: DEFAULT_DUITKU_CONFIG,
};

// ─── Storage helpers ─────────────────────────────────────────────────────────
function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADMIN_SETTINGS,
      ...parsed,
      customPaymentMethods:
        parsed.customPaymentMethods && Array.isArray(parsed.customPaymentMethods) && parsed.customPaymentMethods.length > 0
          ? parsed.customPaymentMethods
          : DEFAULT_ADMIN_SETTINGS.customPaymentMethods,
      duitkuConfig: {
        ...DEFAULT_DUITKU_CONFIG,
        ...(parsed.duitkuConfig || {}),
      },
    };
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

  fetchPaymentMethods: async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'payment_accounts')
        .single();
      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        const methods = data.value as DynamicPaymentMethod[];
        get().updateSettings({ customPaymentMethods: methods });
        return methods;
      }
    } catch (e) {
      console.warn('Failed to fetch remote payment accounts', e);
    }
    const current = get().settings.customPaymentMethods || DEFAULT_PAYMENT_ACCOUNTS;
    return current;
  },

  savePaymentMethods: async (methods: DynamicPaymentMethod[]) => {
    // Also keep legacy fields in sync if bca, mandiri, qris, or dana are present
    const legacyUpdates: Partial<AdminSettings> = { customPaymentMethods: methods };
    const bca = methods.find((m) => m.id === 'bca');
    if (bca) {
      legacyUpdates.bcaNumber = bca.accountNumber;
      legacyUpdates.bcaHolder = bca.accountHolder;
    }
    const mandiri = methods.find((m) => m.id === 'mandiri');
    if (mandiri) {
      legacyUpdates.mandiriNumber = mandiri.accountNumber;
      legacyUpdates.mandiriHolder = mandiri.accountHolder;
    }
    const qris = methods.find((m) => m.id === 'qris');
    if (qris) {
      legacyUpdates.qrisNmid = qris.accountNumber;
      legacyUpdates.qrisHolder = qris.accountHolder;
    }
    const dana = methods.find((m) => m.id === 'dana');
    if (dana) {
      legacyUpdates.danaNumber = dana.accountNumber;
      legacyUpdates.danaHolder = dana.accountHolder;
    }

    get().updateSettings(legacyUpdates);

    // Persist to Supabase system_settings
    try {
      await supabase.from('system_settings').upsert({
        key: 'payment_accounts',
        value: methods,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to persist payment accounts to Supabase', e);
    }
  },

  addPaymentMethod: async (method) => {
    const current = get().settings.customPaymentMethods || [...DEFAULT_PAYMENT_ACCOUNTS];
    const slug = (
      method.id ||
      method.name.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      `pay_${Date.now()}`
    ).trim();

    const newEntry: DynamicPaymentMethod = {
      id: slug,
      name: method.name.trim(),
      accountNumber: method.accountNumber.trim(),
      accountHolder: method.accountHolder.trim(),
      icon: method.icon || '🏦',
      category: method.category || 'bank',
      isActive: method.isActive !== undefined ? method.isActive : true,
      instructions:
        method.instructions && method.instructions.length > 0
          ? method.instructions
          : [
              `Lakukan pembayaran ke ${method.name} sesuai nominal invoice.`,
              'Simpan bukti transfer/pembayaran berhasil untuk konfirmasi WhatsApp.',
            ],
    };

    const updated = [...current.filter((m) => m.id !== slug), newEntry];
    await get().savePaymentMethods(updated);
  },

  updatePaymentMethod: async (id, updated) => {
    const current = get().settings.customPaymentMethods || [...DEFAULT_PAYMENT_ACCOUNTS];
    const next = current.map((m) => (m.id === id ? { ...m, ...updated } : m));
    await get().savePaymentMethods(next);
  },

  deletePaymentMethod: async (id) => {
    const current = get().settings.customPaymentMethods || [...DEFAULT_PAYMENT_ACCOUNTS];
    const next = current.filter((m) => m.id !== id);
    await get().savePaymentMethods(next);
  },

  togglePaymentMethod: async (id) => {
    const current = get().settings.customPaymentMethods || [...DEFAULT_PAYMENT_ACCOUNTS];
    const next = current.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m));
    await get().savePaymentMethods(next);
  },

  resetPaymentMethodsToDefault: async () => {
    await get().savePaymentMethods([...DEFAULT_PAYMENT_ACCOUNTS]);
  },

  fetchDuitkuConfig: async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'duitku_config')
        .maybeSingle();

      if (!error && data && data.value) {
        const remote = data.value as DuitkuConfig;
        const merged: DuitkuConfig = { ...DEFAULT_DUITKU_CONFIG, ...remote };
        get().updateSettings({ duitkuConfig: merged });
        return merged;
      }
    } catch (e) {
      console.warn('Failed to fetch duitku_config from Supabase', e);
    }
    return get().settings.duitkuConfig || DEFAULT_DUITKU_CONFIG;
  },

  saveDuitkuConfig: async (configUpdate) => {
    const current = get().settings.duitkuConfig || DEFAULT_DUITKU_CONFIG;
    const merged: DuitkuConfig = { ...current, ...configUpdate };

    get().updateSettings({ duitkuConfig: merged });

    try {
      await supabase.from('system_settings').upsert({
        key: 'duitku_config',
        value: merged,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to persist duitku_config to Supabase', e);
    }
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
    list: settings.customPaymentMethods || DEFAULT_PAYMENT_ACCOUNTS,
  };
}
