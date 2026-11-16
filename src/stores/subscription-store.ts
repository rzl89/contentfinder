import { create } from 'zustand';
import type { PlanTier, BillingCycle, PaymentMethodType, SubscriptionOrder, UserSubscription } from '@/types';
import { useAdminStore } from './admin-store';

interface BankAccountInfo {
  id: PaymentMethodType;
  name: string;
  accountNumber: string;
  accountHolder: string;
  icon: string;
  instructions: string[];
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
    name: 'QRIS Semua Pembayaran (GoPay/OVO/Dana/BCA/Shopee)',
    accountNumber: (import.meta.env.VITE_PAYMENT_QRIS_NMID as string) || 'NMID: ID1020268899120',
    accountHolder: (import.meta.env.VITE_PAYMENT_QRIS_HOLDER as string) || 'TEMPORAFORGE CREATIVE STUDIO',
    icon: '📱',
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
    return [
      {
        id: 'bca',
        name: 'BCA (Bank Central Asia)',
        accountNumber: admin.bcaNumber || '8290-8812-9901',
        accountHolder: admin.bcaHolder || 'TEMPORAFORGE AI / RIZAL',
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
        accountNumber: admin.mandiriNumber || '1370-0199-8821-2',
        accountHolder: admin.mandiriHolder || 'TEMPORAFORGE AI / RIZAL',
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
        name: 'QRIS Semua Pembayaran (GoPay/OVO/Dana/BCA/Shopee)',
        accountNumber: admin.qrisNmid || 'NMID: ID1020268899120',
        accountHolder: admin.qrisHolder || 'TEMPORAFORGE CREATIVE STUDIO',
        icon: '📱',
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
        accountNumber: admin.danaNumber || '0812-3456-7890',
        accountHolder: admin.danaHolder || 'RIZAL - TEMPORAFORGE',
        icon: '💳',
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
    description: 'Akses uji coba untuk 3 kategori pilihan dan hingga 3x generate storyboard.',
    features: [
      '3 Kategori Konten Aktif (Time Travel, Stickman, POV)',
      'Batas 3x Generate Storyboard Adegan',
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
      'Semua 19 Kategori Konten Terbuka Penuh',
      'Unlimited Generate Storyboard & Variasi Scene',
      'Akses BYOK (Bring Your Own Key) Direct Video Generation',
      'Story Studio lengkap dengan Continuity Anchors',
      'Ekspor Prompt JSON & TXT tanpa watermark',
      'Compiler Video Prompt Veo 2, Kling 1.5, Runway Gen-3, Luma',
      'Trend Radar Live tervalidasi TikTok, Reels & Shorts',
      'Sinkronisasi Cloud Supabase Database otomatis',
      'Konfirmasi cepat & CS prioritas via WhatsApp',
    ],
  },
};

interface SubscriptionState {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  activeOrder: SubscriptionOrder | null;
  adminWhatsApp: string;
  storyboardGenerationsCount: number;

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
}

const STORAGE_KEY = 'fixprom_subscription_store';

function loadInitialState(): {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  storyboardGenerationsCount: number;
} {
  const defaultSub: UserSubscription = {
    tier: 'trial',
    status: 'trial',
    trialStartedAt: new Date().toISOString(),
    trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { subscription: defaultSub, orders: [], storyboardGenerationsCount: 0 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { subscription: defaultSub, orders: [], storyboardGenerationsCount: 0 };
    const parsed = JSON.parse(raw);
    return {
      subscription: parsed.subscription || defaultSub,
      orders: parsed.orders || [],
      storyboardGenerationsCount: Number(parsed.storyboardGenerationsCount) || 0,
    };
  } catch {
    return { subscription: defaultSub, orders: [], storyboardGenerationsCount: 0 };
  }
}

function saveState(state: {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  storyboardGenerationsCount?: number;
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
  adminWhatsApp: (import.meta.env.VITE_ADMIN_WHATSAPP as string) || '6281234567890', // Nomor WhatsApp konfirmasi admin
  storyboardGenerationsCount: initial.storyboardGenerationsCount,

  initializeTrial: () => {
    const current = get().subscription;
    if (!current.trialStartedAt) {
      const now = Date.now();
      const newSub: UserSubscription = {
        tier: 'trial',
        status: 'trial',
        trialStartedAt: new Date(now).toISOString(),
        trialEndsAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
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
    let adminWA = get().adminWhatsApp;
    try {
      const admin = useAdminStore.getState().settings;
      if (admin?.adminWhatsApp) {
        adminWA = admin.adminWhatsApp;
      }
    } catch {
      // fallback
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
⏰ *Waktu:* ${new Date(order.createdAt).toLocaleString('id-ID')}

Saya lampirkan bukti transfer di chat ini. Mohon segera diaktivasi akun saya. Terima kasih! 🙏`;

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
}));
