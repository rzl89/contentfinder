import { create } from 'zustand';
import type { PlanTier, BillingCycle, PaymentMethodType, SubscriptionOrder, UserSubscription, TopUpPackage } from '@/types';
import { useAdminStore } from './admin-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ManualActivationRecord {
  id: string;
  emailOrUserId: string;
  planTier: PlanTier;
  status: 'active' | 'expired' | 'revoked';
  activatedAt: string;
  expiresAt: string;
  durationLabel: string;
  notes?: string;
}

export interface BankAccountInfo {
  id: PaymentMethodType;
  name: string;
  accountNumber: string;
  accountHolder: string;
  icon: string;
  instructions: string[];
  category?: 'bank' | 'qris' | 'ewallet' | 'other';
  isActive?: boolean;
  qrImageUrl?: string;
  nmid?: string;
}

export const PAYMENT_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'bca',
    name: 'BCA (Bank Central Asia)',
    accountNumber: (import.meta.env.VITE_PAYMENT_BCA_NO as string) || '8290-8812-9901',
    accountHolder: (import.meta.env.VITE_PAYMENT_BCA_HOLDER as string) || 'TEMPORAFORGE AI / RIZAL',
    icon: '🏦',
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
    instructions: [
      'Buka Livin\' by Mandiri.',
      'Pilih Transfer Rupiah > Rekening Mandiri.',
      'Masukkan nominal transfer TEPAT beserta 3 digit kode unik.',
      'Simpan screenshot resi transaksi.',
    ],
  },
  {
    id: 'qris',
    name: 'QRIS DANA Bisnis (Semua Bank & E-Wallet)',
    accountNumber: (import.meta.env.VITE_PAYMENT_QRIS_NMID as string) || 'NMID: ID1026641496116',
    accountHolder: (import.meta.env.VITE_PAYMENT_QRIS_HOLDER as string) || 'Fixprom, Service',
    icon: '📱',
    category: 'qris',
    isActive: true,
    qrImageUrl: '/qris-fixprom.jpg',
    nmid: 'ID1026641496116',
    instructions: [
      'Buka aplikasi e-wallet (DANA, GoPay, OVO, ShopeePay) atau mobile banking pilihan Anda.',
      'Pindai (Scan) QRIS di layar atau simpan gambar QRIS ke Galeri HP Anda.',
      'Pastikan nama merchant tertera: "Fixprom, Service" (NMID: ID1026641496116).',
      'Input nominal transfer TEPAT beserta 3 digit kode unik.',
      'Simpan bukti transfer / struk pembayaran untuk konfirmasi WhatsApp.',
    ],
  },
  {
    id: 'dana',
    name: 'DANA / GoPay E-Wallet',
    accountNumber: (import.meta.env.VITE_PAYMENT_DANA_NO as string) || '085217975733',
    accountHolder: (import.meta.env.VITE_PAYMENT_DANA_HOLDER as string) || 'RIZAL - TEMPORAFORGE',
    icon: '💳',
    instructions: [
      'Buka aplikasi DANA atau GoPay.',
      'Kirim uang ke nomor HP di atas.',
      'Pastikan nama penerima sesuai sebelum konfirmasi PIN.',
      'Screenshot bukti transfer berhasil.',
    ],
  },
];

export function getPaymentAccounts(): BankAccountInfo[] {
  try {
    const admin = useAdminStore.getState().settings;
    if (admin.customPaymentMethods && Array.isArray(admin.customPaymentMethods) && admin.customPaymentMethods.length > 0) {
      return admin.customPaymentMethods;
    }
    return [
      {
        id: 'bca',
        name: 'BCA (Bank Central Asia)',
        accountNumber: admin.bcaNumber || '8290-8812-9901',
        accountHolder: admin.bcaHolder || 'TEMPORAFORGE AI / RIZAL',
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
        accountNumber: admin.mandiriNumber || '1370-0199-8821-2',
        accountHolder: admin.mandiriHolder || 'TEMPORAFORGE AI / RIZAL',
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
        name: 'QRIS DANA Bisnis (Semua Bank & E-Wallet)',
        accountNumber: admin.qrisNmid || 'NMID: ID1026641496116',
        accountHolder: admin.qrisHolder || 'Fixprom, Service',
        icon: '📱',
        category: 'qris',
        isActive: true,
        qrImageUrl: '/qris-fixprom.jpg',
        nmid: 'ID1026641496116',
        instructions: [
          'Buka aplikasi e-wallet (DANA, GoPay, OVO, ShopeePay) atau mobile banking pilihan Anda.',
          'Pindai (Scan) QRIS di layar atau simpan gambar QRIS ke Galeri HP Anda.',
          'Pastikan nama merchant tertera: "Fixprom, Service" (NMID: ID1026641496116).',
          'Input nominal transfer TEPAT beserta 3 digit kode unik.',
          'Simpan bukti transfer / struk pembayaran untuk konfirmasi WhatsApp.',
        ],
      },
      {
        id: 'dana',
        name: 'DANA / GoPay E-Wallet',
        accountNumber: admin.danaNumber || '085217975733',
        accountHolder: admin.danaHolder || 'RIZAL - TEMPORAFORGE',
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
  } catch {
    return PAYMENT_ACCOUNTS;
  }
}

export const FREE_TRIAL_ALLOWED_CATEGORY_IDS = [
  'time-travel',
  'stickman',
  'pov-experience',
] as const;

export const FREE_TRIAL_MAX_STORYBOARD_GENERATIONS = 3;

export const PRICING_PLANS = {
  trial: {
    name: 'Free Trial (1 Hari)',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Akses uji coba untuk 3 kategori pilihan dengan alokasi 20 kredit AI.',
    features: [
      'Alokasi 20 Kredit AI untuk eksplorasi awal (~4 video lengkap)',
      '3 Kategori Konten Unggulan (Time Travel, Stickman, POV)',
      'Generator ide hook 1-3 detik & story beats',
      'Preview Prompt Compiler (Universal, Kling, Veo 2, Runway)',
      'Character & World Bible Story Studio',
      'Masa aktif 24 jam sejak pertama dibuka',
      'Konektor BYOK & 16 Kategori lainnya khusus Creator Pro',
    ],
  },
  pro: {
    name: 'Creator Pro (Akses Penuh)',
    monthlyPrice: 59000,
    yearlyPrice: 499000, // ~41.500/bulan (hemat ~30%)
    popular: true,
    description: 'Langganan terjangkau untuk kreator video pendek tanpa batasan kuota.',
    features: [
      '350 Kredit AI / bulan (~70 naskah & storyboard video lengkap)',
      'Semua 31 Kategori Konten Terbuka Penuh',
      'Opsi Top-Up Kredit tambahan kapan saja mulai Rp 20.000',
      'Akses BYOK (Bring Your Own Key) Direct Video Generation Tanpa Kuota',
      'Story Studio lengkap dengan Continuity Anchors',
      'Ekspor Prompt JSON & TXT tanpa watermark',
      'Compiler Video Prompt Veo 2, Kling 1.5, Runway Gen-3, Luma',
      'Trend Radar Live tervalidasi TikTok, Reels & Shorts',
      'Sinkronisasi Cloud Supabase Database otomatis',
      'Konfirmasi cepat & CS prioritas via WhatsApp',
    ],
  },
};

export const TOPUP_PACKAGES: TopUpPackage[] = [
  {
    id: 'topup_100',
    name: 'Booster Mini (100 Kredit)',
    credits: 100,
    price: 20000,
    description: 'Cukup untuk ~20 produksi video lengkap atau 100 ide naskah.',
  },
  {
    id: 'topup_300',
    name: 'Booster Pro (300 Kredit)',
    credits: 300,
    price: 50000,
    popular: true,
    description: 'Paket hemat untuk kreator aktif. Cukup untuk ~60 video lengkap.',
  },
];

export interface TokenAuditLog {
  id: string;
  timestamp: string;
  actionName: string;
  creditsDeducted: number;
  balanceAfter: number;
  wordCount?: number;
  isExtended?: boolean;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export function calculateActionCredits(
  action: 'generate_ideas' | 'generate_storyboard' | 'regenerate_storyboard' | 'regenerate_single_scene',
  inputWordCount = 0
): {
  baseCost: number;
  extraCredits: number;
  totalCost: number;
  isExtended: boolean;
  wordCount: number;
} {
  const baseCosts: Record<string, number> = {
    generate_ideas: 1,
    generate_storyboard: 3,
    regenerate_storyboard: 3,
    regenerate_single_scene: 1,
  };

  const baseCost = baseCosts[action] ?? 1;
  const isExtended = inputWordCount > 1000;
  // Setiap 500 kata di atas 1000 kata dikenakan +1 kredit tambahan
  const extraCredits = isExtended ? Math.ceil((inputWordCount - 1000) / 500) : 0;
  const totalCost = baseCost + extraCredits;

  return {
    baseCost,
    extraCredits,
    totalCost,
    isExtended,
    wordCount: inputWordCount,
  };
}

interface SubscriptionState {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  activeOrder: SubscriptionOrder | null;
  adminWhatsApp: string;
  storyboardGenerationsCount: number;
  manualActivations: ManualActivationRecord[];
  auditLogs: TokenAuditLog[];

  // Actions
  initializeTrial: () => void;
  createOrder: (planTier: PlanTier, billingCycle: BillingCycle, paymentMethod: PaymentMethodType) => SubscriptionOrder;
  generateWhatsAppLink: (order: SubscriptionOrder) => string;
  cancelActiveOrder: () => void;
  manualUpgradeTier: (tier: PlanTier, expiresAt?: string) => void;
  getRemainingTrialHours: () => number;
  isFeatureAccessible: (feature: 'basic' | 'pro' | 'byok') => boolean;
  incrementStoryboardCount: () => void;
  canGenerateStoryboard: () => boolean;
  isCategoryAccessible: (categoryId: string) => boolean;
  isByokAccessible: () => boolean;
  deductCredits: (
    amount: number,
    actionName: string,
    metadata?: {
      wordCount?: number;
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
      isExtended?: boolean;
    }
  ) => Promise<{ success: boolean; balance: number; error?: string }>;
  hasSufficientCredits: (required: number) => boolean;
  activateUserSubscription: (
    emailOrUserId: string,
    planTier: PlanTier,
    expiresAt: string,
    durationLabel: string,
    notes?: string
  ) => Promise<{ success: boolean; message: string }>;
  deactivateUserSubscription: (idOrEmail: string) => Promise<{ success: boolean; message: string }>;
  syncSubscriptionWithProfile: (userId?: string) => Promise<void>;
  listUserProfilesFromSupabase: (searchQuery?: string) => Promise<Array<{
    id: string;
    email: string;
    plan_tier: string;
    subscription_status: string;
    credits_balance: number;
    subscription_expires_at: string | null;
    created_at: string;
  }>>;
}

const STORAGE_KEY = 'fixprom_subscription_store';

function loadInitialState(): {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  storyboardGenerationsCount: number;
  manualActivations: ManualActivationRecord[];
  auditLogs: TokenAuditLog[];
} {
  // Check if device previously claimed trial via persistent cookie
  const isTrialUsedOnDevice =
    typeof document !== 'undefined' &&
    document.cookie.includes('__fixprom_trial_claimed=1');

  const defaultSub: UserSubscription = {
    tier: 'free',
    status: isTrialUsedOnDevice ? 'expired' : 'trial',
    trialStartedAt: new Date().toISOString(),
    trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    creditsBalance: isTrialUsedOnDevice ? 0 : 20,
  };

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { subscription: defaultSub, orders: [], storyboardGenerationsCount: 0, manualActivations: [], auditLogs: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { subscription: defaultSub, orders: [], storyboardGenerationsCount: 0, manualActivations: [], auditLogs: [] };
    const parsed = JSON.parse(raw);
    const loadedSub = parsed.subscription || defaultSub;

    // If device is flagged as trial used and sub is still unverified free trial, enforce 0 credits
    if (isTrialUsedOnDevice && loadedSub.tier === 'free' && loadedSub.status === 'trial') {
      loadedSub.creditsBalance = 0;
      loadedSub.status = 'expired';
    }

    return {
      subscription: loadedSub,
      orders: parsed.orders || [],
      storyboardGenerationsCount: Number(parsed.storyboardGenerationsCount) || 0,
      manualActivations: parsed.manualActivations || [],
      auditLogs: parsed.auditLogs || [],
    };
  } catch {
    return { subscription: defaultSub, orders: [], storyboardGenerationsCount: 0, manualActivations: [], auditLogs: [] };
  }
}

function saveState(state: {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  storyboardGenerationsCount?: number;
  manualActivations?: ManualActivationRecord[];
  auditLogs?: TokenAuditLog[];
}) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save subscription state', e);
    }
  }
}

const initial = loadInitialState();

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: initial.subscription,
  orders: initial.orders,
  activeOrder: null,
  adminWhatsApp: (import.meta.env.VITE_ADMIN_WHATSAPP as string) || '6285217975733', // Nomor WhatsApp konfirmasi admin
  storyboardGenerationsCount: initial.storyboardGenerationsCount,
  manualActivations: initial.manualActivations,
  auditLogs: initial.auditLogs || [],

  initializeTrial: () => {
    const current = get().subscription;
    if (!current.trialStartedAt) {
      const now = Date.now();
      const newSub: UserSubscription = {
        tier: 'free',
        status: 'trial',
        trialStartedAt: new Date(now).toISOString(),
        trialEndsAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
        creditsBalance: 20,
      };
      set({ subscription: newSub });
      saveState({
        subscription: newSub,
        orders: get().orders,
        storyboardGenerationsCount: get().storyboardGenerationsCount,
      });
    }
  },

  createOrder: (planTier, billingCycle, paymentMethod) => {
    let basePrice =
      billingCycle === 'yearly'
        ? PRICING_PLANS.pro.yearlyPrice
        : PRICING_PLANS.pro.monthlyPrice;

    try {
      const admin = useAdminStore.getState().settings;
      if (admin) {
        basePrice = billingCycle === 'yearly' ? admin.proPriceYearly : admin.proPriceMonthly;
      }
    } catch {
      // fallback to static pricing
    }

    // Generate 3 digit unique code (e.g. 100 - 999) for easy transfer verification
    const uniqueCode = Math.floor(Math.random() * 899) + 100;
    const totalAmount = basePrice + uniqueCode;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `TF-INV-${dateStr}-${randomId}`;

    const newOrder: SubscriptionOrder = {
      invoiceNumber,
      planTier,
      billingCycle,
      amount: basePrice,
      uniqueCode,
      totalAmount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const newOrders = [newOrder, ...get().orders];
    set({
      orders: newOrders,
      activeOrder: newOrder,
    });
    saveState({
      subscription: get().subscription,
      orders: newOrders,
      storyboardGenerationsCount: get().storyboardGenerationsCount,
    });

    return newOrder;
  },

  generateWhatsAppLink: (order) => {
    let adminWA = get().adminWhatsApp || '6285217975733';
    try {
      const admin = useAdminStore.getState().settings;
      if (admin?.adminWhatsApp) {
        adminWA = admin.adminWhatsApp;
      }
    } catch {
      // fallback
    }

    let cleanWA = adminWA.replace(/\\D/g, '');
    if (cleanWA.startsWith('0')) {
      cleanWA = '62' + cleanWA.slice(1);
    } else if (!cleanWA.startsWith('62')) {
      cleanWA = '62' + cleanWA;
    }

    const planName = PRICING_PLANS.pro.name;
    const cycle = order.billingCycle === 'yearly' ? 'Tahunan (1 Tahun)' : 'Bulanan (1 Bulan)';
    const accounts = getPaymentAccounts();
    const bank = accounts.find((a) => a.id === order.paymentMethod)?.name || order.paymentMethod.toUpperCase();

    const rawMessage = `Halo Admin Fixprom, saya ingin konfirmasi pembayaran langganan:

🧾 *Nomor Invoice:* ${order.invoiceNumber}
📦 *Paket:* ${planName} (${cycle})
💳 *Metode:* ${bank}
💰 *Total Transfer:* Rp ${order.totalAmount.toLocaleString('id-ID')} (Termasuk kode unik: ${order.uniqueCode})
â° *Waktu:* ${new Date(order.createdAt).toLocaleString('id-ID')}

Saya lampirkan bukti transfer di chat ini. Mohon segera diaktivasi akun saya. Terima kasih! 🙏`;

    return `https://wa.me/${adminWA}?text=${encodeURIComponent(rawMessage)}`;
  },

  cancelActiveOrder: () => {
    set({ activeOrder: null });
  },

  manualUpgradeTier: (tier, expiresAt) => {
    const updatedSub: UserSubscription = {
      tier,
      status: 'active',
      trialStartedAt: get().subscription.trialStartedAt,
      trialEndsAt: get().subscription.trialEndsAt,
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    set({
      subscription: updatedSub,
      activeOrder: null,
    });
    saveState({
      subscription: updatedSub,
      orders: get().orders,
      storyboardGenerationsCount: get().storyboardGenerationsCount,
    });
  },

  getRemainingTrialHours: () => {
    const { trialEndsAt, tier } = get().subscription;
    if (tier === 'pro') return 9999;
    const remainingMs = new Date(trialEndsAt).getTime() - Date.now();
    if (remainingMs <= 0) return 0;
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));
  },

  isFeatureAccessible: (feature) => {
    const { tier, trialEndsAt } = get().subscription;
    if (tier === 'pro') return true;
    // BYOK is locked for free trial
    if (feature === 'byok') return false;
    // Trial check: 24 jam akses dasar
    const isTrialActive = new Date(trialEndsAt).getTime() > Date.now();
    return isTrialActive;
  },

  incrementStoryboardCount: () => {
    const newCount = get().storyboardGenerationsCount + 1;
    set({ storyboardGenerationsCount: newCount });
    saveState({
      subscription: get().subscription,
      orders: get().orders,
      storyboardGenerationsCount: newCount,
    });
  },

  canGenerateStoryboard: () => {
    const { tier } = get().subscription;
    if (tier === 'pro') return true;
    return get().storyboardGenerationsCount < FREE_TRIAL_MAX_STORYBOARD_GENERATIONS;
  },

  isCategoryAccessible: (categoryId: string) => {
    const { tier } = get().subscription;
    if (tier === 'pro') return true;
    return (FREE_TRIAL_ALLOWED_CATEGORY_IDS as readonly string[]).includes(categoryId);
  },

  isByokAccessible: () => {
    return get().subscription.tier === 'pro';
  },

  deductCredits: async (
    amount: number,
    actionName: string,
    metadata?: {
      wordCount?: number;
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
      isExtended?: boolean;
    }
  ) => {
    const currentBal = get().subscription.creditsBalance ?? (get().subscription.tier === 'pro' ? 350 : 20);
    if (currentBal < amount) {
      return { success: false, balance: currentBal, error: 'INSUFFICIENT_CREDITS' };
    }

    const logEntry: TokenAuditLog = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionName,
      creditsDeducted: amount,
      balanceAfter: currentBal - amount,
      wordCount: metadata?.wordCount,
      isExtended: metadata?.isExtended,
      promptTokens: metadata?.promptTokens,
      completionTokens: metadata?.completionTokens,
      totalTokens: metadata?.totalTokens,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('deduct_user_credits', {
          deduct_amount: amount,
          action_name: actionName,
        });

        if (!error && data && data.success) {
          const newBal = data.balance;
          logEntry.balanceAfter = newBal;
          const updatedLogs = [logEntry, ...(get().auditLogs || [])].slice(0, 100);
          set((state) => ({
            subscription: { ...state.subscription, creditsBalance: newBal },
            auditLogs: updatedLogs,
          }));
          saveState({
            subscription: get().subscription,
            orders: get().orders,
            storyboardGenerationsCount: get().storyboardGenerationsCount,
            manualActivations: get().manualActivations,
            auditLogs: updatedLogs,
          });
          return { success: true, balance: newBal };
        }
      } catch (err) {
        console.warn('Supabase credit deduction warning:', err);
      }
    }

    // Local fallback for guest or offline mode
    const newBal = Math.max(0, currentBal - amount);
    logEntry.balanceAfter = newBal;
    const updatedLogs = [logEntry, ...(get().auditLogs || [])].slice(0, 100);
    set((state) => ({
      subscription: { ...state.subscription, creditsBalance: newBal },
      auditLogs: updatedLogs,
    }));
    saveState({
      subscription: get().subscription,
      orders: get().orders,
      storyboardGenerationsCount: get().storyboardGenerationsCount,
      manualActivations: get().manualActivations,
      auditLogs: updatedLogs,
    });
    return { success: true, balance: newBal };
  },

  hasSufficientCredits: (required: number) => {
    const bal = get().subscription.creditsBalance ?? (get().subscription.tier === 'pro' ? 350 : 20);
    return bal >= required;
  },

  activateUserSubscription: async (emailOrUserId, planTier, expiresAt, durationLabel, notes) => {
    const trimmedTarget = emailOrUserId.trim();
    if (!trimmedTarget) {
      return { success: false, message: 'Email atau User ID wajib diisi.' };
    }

    const newRecord: ManualActivationRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emailOrUserId: trimmedTarget,
      planTier,
      status: 'active',
      activatedAt: new Date().toISOString(),
      expiresAt,
      durationLabel,
      notes: notes?.trim() || undefined,
    };

    // 1. Update local activations registry
    const updatedActivations = [
      newRecord,
      ...get().manualActivations.filter(
        (a) => a.emailOrUserId.toLowerCase() !== trimmedTarget.toLowerCase()
      ),
    ];

    set({ manualActivations: updatedActivations });

    // 2. Check if target is current session or current user
    let isCurrentSession =
      trimmedTarget.toLowerCase() === 'current' ||
      trimmedTarget.toLowerCase() === 'me' ||
      trimmedTarget === '';

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      if (
        currentUser &&
        (currentUser.email?.toLowerCase() === trimmedTarget.toLowerCase() ||
          currentUser.id === trimmedTarget)
      ) {
        isCurrentSession = true;
      }
    } catch {
      // ignore
    }

    if (isCurrentSession) {
      const updatedSub: UserSubscription = {
        tier: planTier,
        status: 'active',
        trialStartedAt: get().subscription.trialStartedAt,
        trialEndsAt: get().subscription.trialEndsAt,
        expiresAt,
        creditsBalance: planTier === 'pro' ? 350 : 20,
      };
      set({ subscription: updatedSub, activeOrder: null });
      saveState({
        subscription: updatedSub,
        orders: get().orders,
        storyboardGenerationsCount: get().storyboardGenerationsCount,
        manualActivations: updatedActivations,
      });
    } else {
      saveState({
        subscription: get().subscription,
        orders: get().orders,
        storyboardGenerationsCount: get().storyboardGenerationsCount,
        manualActivations: updatedActivations,
      });
    }

    // 3. Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('admin_activate_subscription_by_email', {
          target_email: trimmedTarget,
          new_tier: planTier,
          expires_at: expiresAt,
        });

        if (error) {
          console.warn('Supabase admin RPC warning:', error.message);
          return {
            success: true,
            message: `Aktivasi lokal berhasil untuk ${trimmedTarget}. (Catatan Cloud: ${error.message})`,
          };
        }

        if (data && !data.success) {
          return {
            success: true,
            message: `Aktivasi lokal berhasil. Cloud: ${data.message || 'Disimpan secara lokal'}`,
          };
        }
      } catch (err: any) {
        console.warn('Failed cloud activation RPC:', err);
      }
    }

    const tierName = planTier === 'pro' ? 'Creator Pro' : planTier.toUpperCase();
    return {
      success: true,
      message: `Paket ${tierName} berhasil diaktifkan untuk ${trimmedTarget} hingga ${new Date(expiresAt).toLocaleDateString('id-ID')}.`,
    };
  },

  deactivateUserSubscription: async (idOrEmail) => {
    const target = idOrEmail.toLowerCase();
    const updated = get().manualActivations.map((a) =>
      a.id === idOrEmail || a.emailOrUserId.toLowerCase() === target
        ? { ...a, status: 'revoked' as const }
        : a
    );
    set({ manualActivations: updated });

    // Check if current user is affected
    let affectsCurrent = false;
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      if (
        currentUser &&
        (currentUser.email?.toLowerCase() === target || currentUser.id === idOrEmail)
      ) {
        affectsCurrent = true;
      }
    } catch {
      // ignore
    }

    if (affectsCurrent || get().subscription.tier === 'pro') {
      const reverted: UserSubscription = {
        tier: 'free',
        status: 'expired',
        trialStartedAt: get().subscription.trialStartedAt,
        trialEndsAt: get().subscription.trialEndsAt,
      };
      set({ subscription: reverted });
    }

    saveState({
      subscription: get().subscription,
      orders: get().orders,
      storyboardGenerationsCount: get().storyboardGenerationsCount,
      manualActivations: updated,
    });

    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('admin_activate_subscription_by_email', {
          target_email: idOrEmail,
          new_tier: 'free',
          expires_at: new Date(Date.now() - 1000).toISOString(),
        });
      } catch {
        // ignore
      }
    }

    return { success: true, message: `Langganan untuk ${idOrEmail} telah dinonaktifkan.` };
  },

  syncSubscriptionWithProfile: async (userId?: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      let uid = userId;
      let email: string | undefined;
      if (!uid) {
        const { data: authData } = await supabase.auth.getUser();
        uid = authData.user?.id;
        email = authData.user?.email;
      }
      if (!uid) return;

      // ── 1. Supabase DB is the source of truth ────────────────────────────
      // Always read from DB first so admin activations take effect immediately.
      // Check Supabase profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan_tier, subscription_status, subscription_expires_at, credits_balance')
        .eq('id', uid)
        .single();

      if (!error && profile) {
        if (
          profile.plan_tier === 'pro' &&
          profile.subscription_status === 'active' &&
          profile.subscription_expires_at &&
          new Date(profile.subscription_expires_at).getTime() > Date.now()
        ) {
          const activeSub: UserSubscription = {
            tier: 'pro',
            status: 'active',
            expiresAt: profile.subscription_expires_at,
            creditsBalance: profile.credits_balance ?? 350,
            trialStartedAt: get().subscription.trialStartedAt || new Date().toISOString(),
            trialEndsAt: get().subscription.trialEndsAt || new Date().toISOString(),
          };
          set({ subscription: activeSub });
          saveState({
            subscription: activeSub,
            orders: get().orders,
            storyboardGenerationsCount: get().storyboardGenerationsCount,
            manualActivations: get().manualActivations,
          });
          return;
        } else if (
          profile.subscription_expires_at &&
          new Date(profile.subscription_expires_at).getTime() <= Date.now()
        ) {
          const expiredSub: UserSubscription = {
            tier: 'free',
            status: 'expired',
            expiresAt: profile.subscription_expires_at,
            creditsBalance: profile.credits_balance ?? 0,
            trialStartedAt: get().subscription.trialStartedAt || new Date().toISOString(),
            trialEndsAt: get().subscription.trialEndsAt || new Date().toISOString(),
          };
          set({ subscription: expiredSub });
          saveState({
            subscription: expiredSub,
            orders: get().orders,
            storyboardGenerationsCount: get().storyboardGenerationsCount,
            manualActivations: get().manualActivations,
          });
          return;
        } else {
          // Free tier or trial account — sync credits and status from DB
          const isExpired = profile.subscription_status === 'expired' || (profile.credits_balance ?? 0) <= 0;
          const updatedSub: UserSubscription = {
            ...get().subscription,
            tier: 'free',
            status: isExpired ? 'expired' : 'trial',
            creditsBalance: profile.credits_balance ?? (isExpired ? 0 : 20),
          };
          set({ subscription: updatedSub });
          saveState({
            subscription: updatedSub,
            orders: get().orders,
            storyboardGenerationsCount: get().storyboardGenerationsCount,
            manualActivations: get().manualActivations,
          });
        }
      }

      // ── 2. Fallback to local manualActivations if offline or DB record empty ──
      if (email) {
        const manual = get().manualActivations.find(
          (m) =>
            m.emailOrUserId.toLowerCase() === email?.toLowerCase() &&
            m.status === 'active' &&
            new Date(m.expiresAt).getTime() > Date.now()
        );
        if (manual) {
          const activeSub: UserSubscription = {
            tier: manual.planTier,
            status: 'active',
            expiresAt: manual.expiresAt,
            trialStartedAt: get().subscription.trialStartedAt || new Date().toISOString(),
            trialEndsAt: get().subscription.trialEndsAt || new Date().toISOString(),
          };
          set({ subscription: activeSub });
          saveState({
            subscription: activeSub,
            orders: get().orders,
            storyboardGenerationsCount: get().storyboardGenerationsCount,
            manualActivations: get().manualActivations,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to sync subscription with profile:', e);
    }
  },

  listUserProfilesFromSupabase: async (searchQuery = '') => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase.rpc('admin_list_user_profiles', {
        search_query: searchQuery,
        limit_count: 30,
      });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },
}));

