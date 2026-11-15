import { create } from 'zustand';
import type { PlanTier, BillingCycle, PaymentMethodType, SubscriptionOrder, UserSubscription } from '@/types';

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
    accountNumber: '8290-8812-9901',
    accountHolder: 'TEMPORAFORGE AI / RIZAL',
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
    accountNumber: '1370-0199-8821-2',
    accountHolder: 'TEMPORAFORGE AI / RIZAL',
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
    accountNumber: 'NMID: ID1020268899120',
    accountHolder: 'TEMPORAFORGE CREATIVE STUDIO',
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
    accountNumber: '0812-3456-7890',
    accountHolder: 'RIZAL - TEMPORAFORGE',
    icon: '💳',
    instructions: [
      'Buka aplikasi DANA atau GoPay.',
      'Kirim uang ke nomor HP di atas.',
      'Pastikan nama penerima sesuai sebelum konfirmasi PIN.',
      'Screenshot bukti transfer berhasil.',
    ],
  },
];

export const PRICING_PLANS = {
  trial: {
    name: 'Free Trial (1 Hari)',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Akses penuh seluruh 19 kategori dan generator AI selama 24 jam.',
    features: [
      'Akses penuh 19 Kategori Konten',
      'Context Engine Indonesia Natural (9 Golden Rules)',
      'Generator 5 ide per request',
      'Prompt Compiler Universal, Veo, Kling, Runway, Luma',
      'Character & World Bible Story Studio',
      'QC Engine & Trend Radar',
      'Masa aktif 24 jam sejak pertama dibuka',
    ],
  },
  pro: {
    name: 'Creator Pro',
    monthlyPrice: 59000,
    yearlyPrice: 499000, // ~41.500/bulan (hemat ~30%)
    popular: true,
    description: 'Pilihan utama untuk solo content creator short-form video profesional.',
    features: [
      'Semua fitur Free Trial tanpa batas durasi',
      'Unlimited Ide Konten & Variasi Scene',
      'Story Studio lengkap dengan Continuity Anchors',
      'Ekspor Prompt JSON & TXT tanpa watermark',
      'Trend Radar Live tervalidasi TikTok, Reels & Shorts',
      'Dukungan sinkronisasi Cloud Supabase Database',
      'Customer Support prioritas via WhatsApp',
    ],
  },
  studio: {
    name: 'Studio / Agency',
    monthlyPrice: 149000,
    yearlyPrice: 1290000, // ~107.500/bulan
    description: 'Dirancang untuk tim konten, production house, dan agency periklanan.',
    features: [
      'Semua fitur Creator Pro',
      'Akses BYOK (Bring Your Own Key) Direct Video Generation',
      'KMS Server-Side Secret Envelope Encryption Vault',
      'Multi-Project Batch Exporter (ZIP/JSON)',
      'Custom Context Presets per Client / Brand',
      'Konsultasi alur produksi video AI 1-on-1 via WhatsApp',
    ],
  },
};

interface SubscriptionState {
  subscription: UserSubscription;
  orders: SubscriptionOrder[];
  activeOrder: SubscriptionOrder | null;
  adminWhatsApp: string;

  // Actions
  initializeTrial: () => void;
  createOrder: (planTier: PlanTier, billingCycle: BillingCycle, paymentMethod: PaymentMethodType) => SubscriptionOrder;
  generateWhatsAppLink: (order: SubscriptionOrder) => string;
  cancelActiveOrder: () => void;
  manualUpgradeTier: (tier: PlanTier, expiresAt?: string) => void;
  getRemainingTrialHours: () => number;
  isFeatureAccessible: (feature: 'basic' | 'pro' | 'byok') => boolean;
}

const STORAGE_KEY = 'temporaforge_subscription_store';

function loadInitialState(): { subscription: UserSubscription; orders: SubscriptionOrder[] } {
  const defaultSub: UserSubscription = {
    tier: 'trial',
    status: 'trial',
    trialStartedAt: new Date().toISOString(),
    trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { subscription: defaultSub, orders: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { subscription: defaultSub, orders: [] };
    const parsed = JSON.parse(raw);
    return {
      subscription: parsed.subscription || defaultSub,
      orders: parsed.orders || [],
    };
  } catch {
    return { subscription: defaultSub, orders: [] };
  }
}

function saveState(state: { subscription: UserSubscription; orders: SubscriptionOrder[] }) {
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
  adminWhatsApp: '6281234567890', // Nomor WhatsApp konfirmasi admin

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
      saveState({ subscription: newSub, orders: get().orders });
    }
  },

  createOrder: (planTier, billingCycle, paymentMethod) => {
    const basePrice =
      planTier === 'studio'
        ? billingCycle === 'yearly'
          ? PRICING_PLANS.studio.yearlyPrice
          : PRICING_PLANS.studio.monthlyPrice
        : billingCycle === 'yearly'
        ? PRICING_PLANS.pro.yearlyPrice
        : PRICING_PLANS.pro.monthlyPrice;

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
    saveState({ subscription: get().subscription, orders: newOrders });

    return newOrder;
  },

  generateWhatsAppLink: (order) => {
    const adminWA = get().adminWhatsApp;
    const planName = PRICING_PLANS[order.planTier === 'studio' ? 'studio' : 'pro'].name;
    const cycle = order.billingCycle === 'yearly' ? 'Tahunan (1 Tahun)' : 'Bulanan (1 Bulan)';
    const bank = PAYMENT_ACCOUNTS.find((a) => a.id === order.paymentMethod)?.name || order.paymentMethod.toUpperCase();

    const rawMessage = `Halo Admin TemporaForge AI, saya ingin konfirmasi pembayaran langganan:

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
    saveState({ subscription: updatedSub, orders: get().orders });
  },

  getRemainingTrialHours: () => {
    const { trialEndsAt, tier } = get().subscription;
    if (tier === 'pro' || tier === 'studio') return 9999;
    const remainingMs = new Date(trialEndsAt).getTime() - Date.now();
    if (remainingMs <= 0) return 0;
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));
  },

  isFeatureAccessible: (feature) => {
    const { tier, trialEndsAt } = get().subscription;
    if (tier === 'studio') return true;
    if (tier === 'pro') return feature !== 'byok';
    // Trial check
    const isTrialActive = new Date(trialEndsAt).getTime() > Date.now();
    if (isTrialActive) {
      return feature !== 'byok'; // Trial can access all features except raw BYOK
    }
    return false;
  },
}));
