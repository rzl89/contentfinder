import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  Zap,
  Sparkles,
  Clock,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  RefreshCw,
  Download,
  QrCode,
} from 'lucide-react';
import { BentoTile } from '@/components/ui/bento-tile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminStore } from '@/stores/admin-store';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';
import {
  useSubscriptionStore,
  PRICING_PLANS,
  TOPUP_PACKAGES,
  getPaymentAccounts,
} from '@/stores/subscription-store';
import type { BillingCycle, PlanTier, PaymentMethodType, SubscriptionOrder } from '@/types';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { language, t } = useLanguageStore();
  const { fetchPaymentMethods, fetchDuitkuConfig } = useAdminStore();
  const { user, profile } = useAuthStore();
  const {
    subscription,
    activeOrder,
    createOrder,
    generateWhatsAppLink,
    cancelActiveOrder,
    getRemainingTrialHours,
    syncSubscriptionWithProfile,
  } = useSubscriptionStore();

  const duitkuConfig = useAdminStore((s) => s.settings.duitkuConfig);
  // TEMP: Duitku merchant account is pending verification — lock gateway until approved.
  // Set DUITKU_PENDING_VERIFICATION to false once merchant verification is complete.
  const DUITKU_PENDING_VERIFICATION = true;
  const isDuitkuEnabled = !DUITKU_PENDING_VERIFICATION && duitkuConfig?.isEnabled !== false;

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('qris');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<SubscriptionOrder | null>(activeOrder);

  // Duitku Checkout State
  const [checkoutMode, setCheckoutMode] = useState<'duitku' | 'manual'>(isDuitkuEnabled ? 'duitku' : 'manual');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerName, setCustomerName] = useState(profile?.display_name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessingDuitku, setIsProcessingDuitku] = useState(false);

  // Return status from Duitku redirect
  const [returnStatus, setReturnStatus] = useState<{
    type: 'success' | 'pending' | 'failed' | null;
    orderId: string | null;
    message: string;
  }>({ type: null, orderId: null, message: '' });
  const [isCheckingReturnStatus, setIsCheckingReturnStatus] = useState(false);

  // Sync dynamic payment methods and Duitku config on mount
  useEffect(() => {
    void fetchPaymentMethods();
    void fetchDuitkuConfig();
  }, [fetchPaymentMethods, fetchDuitkuConfig]);

  // Keep customer form synced with user
  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if (profile?.display_name && !customerName) {
      setCustomerName(profile.display_name);
    }
  }, [user, profile, customerEmail, customerName]);

  // Inspect return URL for Duitku
  const checkDuitkuStatus = useCallback(
    async (orderId: string) => {
      setIsCheckingReturnStatus(true);
      try {
        const { data, error } = await supabase.rpc('check_duitku_order_status', {
          p_invoice_number: orderId,
        });

        if (!error && data && data.found) {
          if (data.status === 'paid') {
            setReturnStatus({
              type: 'success',
              orderId,
              message: 'Pembayaran Duitku telah berhasil diverifikasi! Akun Anda aktif sebagai Creator Pro.',
            });
            await syncSubscriptionWithProfile(user?.id);
          } else {
            setReturnStatus({
              type: 'pending',
              orderId,
              message: 'Transaksi tercatat dan sedang menunggu pelunasan dari Duitku.',
            });
          }
        } else {
          setReturnStatus({
            type: 'pending',
            orderId,
            message: 'Memeriksa pembayaran Duitku...',
          });
        }
      } catch {
        // non-fatal
      } finally {
        setIsCheckingReturnStatus(false);
      }
    },
    [syncSubscriptionWithProfile, user?.id]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    const orderIdParam = params.get('orderId');

    if (statusParam === 'duitku_return' && orderIdParam) {
      void checkDuitkuStatus(orderIdParam);
    }
  }, [location.search, checkDuitkuStatus]);

  const remainingHours = getRemainingTrialHours();
  const isTrialActive = subscription.status === 'trial' && remainingHours > 0;
  const isPaidActive = subscription.status === 'active' && subscription.tier === 'pro';

  const handleSelectPlan = (tier: PlanTier) => {
    const order = createOrder(tier, billingCycle, selectedPayment);
    setCurrentOrder(order);
    setIsCheckoutOpen(true);
  };

  const handleCopyAccount = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      type: 'success',
      title: t('Disalin ke Clipboard!', 'Copied to Clipboard!'),
      message: t(`${label} berhasil disalin.`, `${label} successfully copied.`),
    });
  };

  const handlePayWithDuitku = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      showToast({
        type: 'error',
        title: 'Email Diperlukan',
        message: 'Masukkan alamat email yang valid untuk konfirmasi invoice dan aktivasi akun.',
      });
      return;
    }

    const price = billingCycle === 'yearly' ? PRICING_PLANS.pro.yearlyPrice : PRICING_PLANS.pro.monthlyPrice;
    setIsProcessingDuitku(true);

    try {
      const res = await fetch('/api/duitku-create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier: 'pro',
          billingCycle,
          amount: price,
          userEmail: customerEmail.trim().toLowerCase(),
          userName: customerName.trim() || 'Pelanggan Fixprom',
          userId: user?.id || null,
          phoneNumber: customerPhone.trim() || '081234567890',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.paymentUrl) {
        showToast({
          type: 'error',
          title: 'Gagal Membuat Tagihan Duitku',
          message: data.message || 'Terjadi kendala saat menghubungkan ke Duitku. Silakan coba metode manual.',
        });
        setIsProcessingDuitku(false);
        return;
      }

      showToast({
        type: 'success',
        title: 'Mengarahkan ke Duitku...',
        message: 'Membuka halaman pembayaran aman Duitku.',
      });

      // Redirect to Duitku POP / checkout page
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Koneksi Terputus',
        message: err.message || 'Gagal memanggil endpoint Duitku. Silakan coba lagi atau gunakan opsi manual.',
      });
      setIsProcessingDuitku(false);
    }
  };

  const paymentAccounts = getPaymentAccounts();
  const activeAccounts = paymentAccounts.filter((a) => a.isActive !== false);
  const selectedAccountInfo =
    activeAccounts.find((a) => a.id === selectedPayment) || activeAccounts[0] || paymentAccounts[0];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Duitku Return Status Banner */}
      {returnStatus.type && (
        <div
          className={`max-w-3xl mx-auto p-4 rounded-2xl border transition-all ${
            returnStatus.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {returnStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              )}
              <div>
                <h4 className="text-sm font-bold text-white">
                  {returnStatus.type === 'success'
                    ? t('Pembayaran Berhasil Diverifikasi!', 'Payment Successfully Verified!')
                    : t('Menunggu Konfirmasi Duitku', 'Awaiting Duitku Confirmation')}
                </h4>
                <p className="text-xs text-zinc-300 mt-0.5">{returnStatus.message}</p>
                {returnStatus.orderId && (
                  <p className="text-[11px] font-mono text-zinc-400 mt-1">
                    Invoice: <span className="text-amber-300">{returnStatus.orderId}</span>
                  </p>
                )}
              </div>
            </div>

            {returnStatus.type === 'pending' && returnStatus.orderId && (
              <Button
                size="sm"
                variant="secondary"
                loading={isCheckingReturnStatus}
                onClick={() => returnStatus.orderId && checkDuitkuStatus(returnStatus.orderId)}
                className="text-xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {t('Cek Lagi', 'Refresh')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="amber" className="px-3 py-1 bg-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400 inline" />
          {t('Monetisasi & Langganan Kreator', 'Creator Plans & Pricing')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('Investasi Terjangkau untuk Konten Video AI Berkualitas', 'Affordable Investment for High-Retention AI Video Content')}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          {t(
            'Mulai dengan Free Trial 24 Jam untuk mencoba 3 kategori unggulan dan storyboard studio. Lanjutkan dengan langganan terjangkau mulai dari Rp 59.000 / bulan tanpa kartu kredit rumit — bayar via QRIS, BCA, Mandiri, atau E-Wallet.',
            'Start with a 24-hour Free Trial to explore 3 featured categories and the storyboard studio. Continue with plans starting at Rp 59,000 / month with instant QRIS, BCA, and Mandiri activation.'
          )}
        </p>

        {/* Current User Status Banner */}
        <div className="pt-2">
          {isPaidActive ? (
            <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {t('Paket Anda:', 'Your Plan:')} <strong>{subscription.tier.toUpperCase()}</strong> ({t('Aktif', 'Active')}) • {t('Saldo:', 'Balance:')} <strong>{subscription.creditsBalance ?? 350} {t('Kredit AI', 'AI Credits')}</strong>
              </span>
            </div>
          ) : isTrialActive ? (
            <div className="inline-flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                {t('Masa Free Trial: Sisa', 'Free Trial Remaining:')} <strong>~{remainingHours} {t('Jam', 'Hours')}</strong> • {t('Saldo:', 'Balance:')} <strong>{subscription.creditsBalance ?? 20} {t('Kredit AI', 'AI Credits')}</strong>
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-300 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{t('Masa Trial Anda Telah Berakhir. Upgrade untuk terus memproduksi konten tanpa batas.', 'Your Free Trial has expired. Upgrade to keep producing unlimited storyboards.')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-field p-1 rounded-xl border border-white/10 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              billingCycle === 'monthly'
                ? 'bg-amber-500 text-black shadow-md font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('Bayar Bulanan', 'Monthly Billing')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-amber-500 text-black shadow-md font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{t('Bayar Tahunan', 'Yearly Billing')}</span>
            <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              {t('Hemat 30%', 'Save 30%')}
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid - Clean 2-Tier Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Tier 1: Free Trial */}
        <BentoTile className="flex flex-col justify-between border-white/10 bg-card/60 backdrop-blur-sm p-6 sm:p-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                {t('Tahap Coba', 'Free Exploration')}
              </span>
              <Badge variant="zinc">
                {t('1 Hari Penuh', 'Full 24 Hours')}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {t(PRICING_PLANS.trial.name, 'Free Trial (1 Day)')}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              {t(
                PRICING_PLANS.trial.description,
                'Trial access for 3 selected categories with 20 AI credits allocation.'
              )}
            </p>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-white">Rp 0</span>
              <span className="text-gray-400 text-xs ml-1">
                {t('/ 24 jam pertama', '/ first 24 hours')}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 mb-6">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {t('Fitur Eksplorasi:', 'Included Trial Features:')}
              </p>
              {PRICING_PLANS.trial.features.map((f, i) => {
                const enFeatures = [
                  '20 AI Credits allocation (~4 complete video storyboards)',
                  '3 Featured Content Categories (Time Travel, Stickman, POV)',
                  '1-3s Viral hook & story beats generator',
                  'Prompt Compiler Preview (Universal, Kling, Veo 2, Runway)',
                  'Character & World Bible Story Studio',
                  'Active for 24 hours from initial signup',
                  'BYOK Connector & 18 other categories exclusive to Creator Pro',
                ];
                return (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>{language === 'en' ? enFeatures[i] || f : f}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            variant={isTrialActive ? 'primary' : 'secondary'}
            disabled={isPaidActive || !isTrialActive}
            onClick={() => navigate('/studio')}
            className="w-full text-xs border-white/10"
          >
            {isPaidActive
              ? t('Paket Pro Aktif', 'Pro Plan Active')
              : isTrialActive
              ? t('Buka Studio Sekarang (Trial Aktif)', 'Open Studio Now (Trial Active)')
              : t('Trial Kedaluwarsa', 'Trial Expired')}
          </Button>
        </BentoTile>

        {/* Tier 2: Creator Pro (POPULAR) */}
        <BentoTile className="flex flex-col justify-between border-amber-500/50 bg-gradient-to-b from-card to-amber-950/20 relative shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/30 p-6 sm:p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3 fill-black" />
              {t('Paling Populer', 'Most Popular')}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                {t('Akses Penuh', 'Full Access')}
              </span>
              <Badge variant="amber">
                Creator Pro
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {t(PRICING_PLANS.pro.name, 'Creator Pro (Full Access)')}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              {t(
                PRICING_PLANS.pro.description,
                'Affordable subscription for high-volume video creators with zero limits.'
              )}
            </p>

            <div className="mb-6">
              {billingCycle === 'monthly' ? (
                <div>
                  <span className="text-4xl font-extrabold text-white">Rp 59.000</span>
                  <span className="text-gray-400 text-xs ml-1">{t('/ bulan', '/ month')}</span>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-extrabold text-white">Rp 499.000</span>
                  <span className="text-gray-400 text-xs ml-1">{t('/ tahun', '/ year')}</span>
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                    {t(
                      'Setara ~Rp 41.500 / bulan (Hemat Rp 209.000)',
                      'Equivalent to ~Rp 41,500 / month (Save Rp 209,000)'
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 mb-6">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                {t('Semua Fitur Termasuk:', 'All Pro Features Included:')}
              </p>
              {PRICING_PLANS.pro.features.map((f, i) => {
                const enProFeatures = [
                  '350 AI Credits / month (~70 full video scripts & storyboards)',
                  'All 21 Content Categories Unlocked',
                  'Top-Up credit boosters available anytime from Rp 20,000',
                  'BYOK (Bring Your Own Key) Direct Video Generation with zero credit limits',
                  'Complete Story Studio with Continuity Anchors',
                  'Clean Prompt JSON & TXT Export without watermarks',
                  'Prompt Compiler for Veo 2, Kling 1.5/2.0, Runway Gen-3, Luma Ray 2',
                  'Live Verified Trend Radar for TikTok, Reels & Shorts',
                  'Automatic Supabase Cloud Database sync',
                  'Priority WhatsApp creator support & swift activation',
                ];
                return (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                    <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{language === 'en' ? enProFeatures[i] || f : f}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            onClick={() => handleSelectPlan('pro')}
            className="w-full py-3 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20"
          >
            {billingCycle === 'yearly'
              ? t('Pilih Paket Creator Pro (Rp 499rb/thn)', 'Select Creator Pro (Rp 499k/yr)')
              : t('Pilih Paket Creator Pro (Rp 59rb/bln)', 'Select Creator Pro (Rp 59k/mo)')}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </BentoTile>
      </div>

      {/* Top-Up Credit Boosters */}
      <div className="max-w-4xl mx-auto space-y-4 pt-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{t('Kredit Tambahan (Add-on)', 'Credit Boosters (Add-on)')}</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {t('Butuh Tambahan Kuota? Paket Top-Up Booster', 'Need Extra Credits? Top-Up Booster Packs')}
          </h3>
          <p className="text-xs text-gray-400">
            {t(
              'Kredit tambahan tidak memiliki masa kedaluwarsa. Bisa digunakan kapan saja saat kuota bulanan Anda menipis.',
              'Add-on credits never expire. Use them whenever your monthly subscription quota is running low.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOPUP_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                pkg.popular
                  ? 'bg-gradient-to-br from-card to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-card/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {t(
                      pkg.name,
                      pkg.id === 'topup_100' ? 'Booster Mini (100 Credits)' : 'Booster Pro (300 Credits)'
                    )}
                  </span>
                  {pkg.popular && <Badge variant="amber">{t('Populer', 'Popular')}</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-300">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-gray-400">{t('/ sekali beli', '/ one-time')}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t(
                    pkg.description,
                    pkg.id === 'topup_100'
                      ? 'Enough for ~20 complete video storyboards or 100 script ideas.'
                      : 'Best value for high-volume creators. Enough for ~60 complete video storyboards.'
                  )}
                </p>
                <div className="text-[11px] text-zinc-300 space-y-1 bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono">
                  <p>
                    {t(
                      `⚡ ${pkg.credits} Kredit AI langsung masuk saldo`,
                      `⚡ ${pkg.credits} AI Credits added instantly to balance`
                    )}
                  </p>
                  <p>
                    {t('✓ Berlaku selamanya tanpa hangus', '✓ Valid forever, never expires')}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5">
                <a
                  href={`https://wa.me/${useSubscriptionStore.getState().adminWhatsApp}?text=${encodeURIComponent(
                    `Halo Admin Fixprom, saya ingin membeli ${pkg.name} seharga Rp ${pkg.price.toLocaleString(
                      'id-ID'
                    )} untuk akun saya. Mohon petunjuk pembayarannya.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-500 transition-all text-zinc-200"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  {t(`Beli ${pkg.name} via WhatsApp`, `Purchase ${pkg.name} via WhatsApp`)}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Payment Trust Guarantee */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div className="bg-field/60 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">{t('Keamanan Kredensial', 'Credential Security')}</h4>
            <p className="text-[11px] text-gray-400">
              {t(
                'Semua data dan kunci terlindungi enkripsi AES-256 client-side.',
                'All API keys and sensitive credentials protected by client-side AES-256 encryption.'
              )}
            </p>
          </div>
        </div>
        <div className="bg-field/60 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">{t('Pembayaran Fleksibel & Mudah', 'Instant & Direct Payments')}</h4>
            <p className="text-[11px] text-gray-400">
              {t(
                'Transfer bank nasional, QRIS, GoPay, OVO, & DANA tanpa kartu kredit.',
                'National banks (BCA, Mandiri), instant QRIS, and e-wallets without complex cards.'
              )}
            </p>
          </div>
        </div>
        <div className="bg-field/60 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">{t('Aktivasi Cepat 5-15 Menit', 'Swift Activation (5-15 Mins)')}</h4>
            <p className="text-[11px] text-gray-400">
              {t(
                'Konfirmasi langsung ke WhatsApp admin dan akun aktif seketika.',
                'Direct confirmation via admin WhatsApp and instant account upgrade.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && currentOrder && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            cancelActiveOrder();
          }}
          title={t('Pilihan Metode Pembayaran & Checkout', 'Payment Method & Checkout')}
        >
          <div className="space-y-5 text-sm">
            {/* Duitku Coming Soon Notice */}
            {DUITKU_PENDING_VERIFICATION && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-300">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[12px] text-amber-200">
                    {t('Pembayaran Otomatis (Duitku) — Segera Hadir', 'Auto Payment (Duitku) — Coming Soon')}
                  </p>
                  <p className="text-[11px] text-amber-400/80 leading-relaxed">
                    {t(
                      'Verifikasi merchant Duitku sedang diproses. Gunakan Transfer Manual di bawah untuk saat ini — konfirmasi lewat WhatsApp.',
                      'Duitku merchant verification is in progress. Use Manual Transfer below for now — confirm via WhatsApp.'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Mode Selector Tabs (Duitku vs Manual) */}
            {isDuitkuEnabled && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setCheckoutMode('duitku')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    checkoutMode === 'duitku'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{t('Otomatis (Duitku)', 'Automatic (Duitku)')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutMode('manual')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    checkoutMode === 'manual'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('Transfer Manual', 'Manual Transfer')}</span>
                </button>
              </div>
            )}

            {/* ═══ TAB 1: DUITKU AUTOMATIC GATEWAY ═══ */}
            {checkoutMode === 'duitku' && isDuitkuEnabled ? (
              <div className="space-y-4">
                {/* Plan Summary */}
                <div className="bg-field border border-white/10 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-white/5">
                    <span>{t('Paket Langganan:', 'Subscription Plan:')}</span>
                    <span className="font-semibold text-white">
                      {PRICING_PLANS.pro.name} (
                      {billingCycle === 'yearly' ? t('1 Tahun', '1 Year') : t('1 Bulan', '1 Month')})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-1 font-bold">
                    <span className="text-white">{t('Total Pembayaran:', 'Total Amount:')}</span>
                    <span className="text-amber-400 text-lg font-mono">
                      Rp{' '}
                      {(billingCycle === 'yearly'
                        ? PRICING_PLANS.pro.yearlyPrice
                        : PRICING_PLANS.pro.monthlyPrice
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('Aktivasi Otomatis Seketika (Tanpa perlu kirim bukti transfer)', 'Instant Auto-Activation (No manual receipts needed)')}</span>
                  </div>
                </div>

                {/* Supported Payment Channels Badges */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                    {t('Metode yang Didukung di Portal Duitku:', 'Channels Supported in Duitku Portal:')}
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
                      BCA VA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
                      Mandiri VA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
                      BRI VA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
                      BNI VA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
                      Permata VA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                      QRIS Semua Bank / E-Wallet
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
                      OVO / ShopeePay / DANA
                    </span>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3">
                  <Input
                    label={t('Email Akun (Konfirmasi & Aktivasi)*', 'Account Email (Confirmation & Activation)*')}
                    type="email"
                    placeholder="email@anda.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    helperText={t('Pastikan sesuai dengan email akun login Anda.', 'Make sure it matches your logged-in account email.')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label={t('Nama Pemesan', 'Customer Name')}
                      placeholder="Nama Lengkap"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                      label={t('Nomor HP / WhatsApp', 'Phone Number')}
                      placeholder="081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-black font-bold flex items-center justify-center gap-2"
                    loading={isProcessingDuitku}
                    onClick={handlePayWithDuitku}
                  >
                    <span>{t('Lanjut ke Pembayaran Duitku', 'Proceed to Duitku Payment')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-[11px] text-zinc-400 text-center">
                    {t(
                      'Anda akan diarahkan ke laman pembayaran resmi Duitku untuk memilih metode bayar.',
                      'You will be redirected to the official Duitku portal to choose your payment method.'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              /* ═══ TAB 2: MANUAL TRANSFER (FALLBACK) ═══ */
              <div className="space-y-5">
                {/* Invoice Summary Box */}
                <div className="bg-field border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-white/5">
                    <span>{t('Nomor Invoice:', 'Invoice Number:')}</span>
                    <span className="font-mono text-white font-semibold">{currentOrder.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{t('Paket Dipilih:', 'Selected Plan:')}</span>
                    <span className="text-white font-semibold">
                      {PRICING_PLANS.pro.name} (
                      {currentOrder.billingCycle === 'yearly' ? t('1 Tahun', '1 Year') : t('1 Bulan', '1 Month')})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{t('Harga Paket:', 'Plan Price:')}</span>
                    <span className="text-gray-300">Rp {currentOrder.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-400 flex items-center gap-1">
                      {t('Kode Unik Verifikasi:', 'Unique Verification Code:')}
                      <span className="text-[10px] bg-amber-500/20 px-1 rounded text-amber-300">
                        {t('Otomatis', 'Auto')}
                      </span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">+{currentOrder.uniqueCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10 font-bold">
                    <span className="text-white">{t('Total Transfer Tepat:', 'Exact Transfer Amount:')}</span>
                    <span className="text-emerald-400 text-base font-mono">
                      Rp {currentOrder.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">
                    {t('Pilih Rekening / Metode Pembayaran:', 'Select Payment Method / Account:')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {activeAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedPayment(account.id);
                          if (currentOrder) {
                            currentOrder.paymentMethod = account.id;
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center gap-2 ${
                          selectedPayment === account.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                            : 'border-white/10 bg-field text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{account.icon}</span>
                        <span className="truncate">{account.name.split(' (')[0] || account.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Details Box */}
                {selectedAccountInfo.category === 'qris' || selectedAccountInfo.id === 'qris' ? (
                  <div className="bg-field border border-amber-500/25 rounded-xl p-4 space-y-4">
                    {/* QRIS Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>QRIS DANA Bisnis</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                              ASPI / GPN
                            </span>
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {t('BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay & Semua Bank', 'BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay & All Banks')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedAccountInfo.qrImageUrl || '/qris-fixprom.jpg'}
                        download="qris-fixprom.jpg"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-all shrink-0"
                        title={t('Unduh QRIS untuk diunggah dari galeri aplikasi bank', 'Download QRIS to upload from mobile banking gallery')}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('Unduh QR', 'Download QR')}</span>
                      </a>
                    </div>

                    {/* QR Preview Frame */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <div className="bg-white p-2.5 rounded-xl shadow-xl shadow-black/70 shrink-0 max-w-[170px] w-full text-center">
                        <img
                          src={selectedAccountInfo.qrImageUrl || '/qris-fixprom.jpg'}
                          alt="QRIS Fixprom, Service"
                          className="w-full h-auto rounded object-contain mx-auto"
                        />
                        <p className="text-[9px] text-zinc-800 font-mono font-bold mt-1.5 pt-1 border-t border-zinc-200">
                          NMID: ID1026641496116
                        </p>
                      </div>

                      <div className="space-y-2.5 text-xs flex-1 w-full">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                            {t('Merchant Resmi', 'Official Merchant')}
                          </p>
                          <p className="text-sm font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            Fixprom, Service
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                            {t('National Merchant ID (NMID)', 'National Merchant ID (NMID)')}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs font-semibold text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded border border-white/5">
                              ID1026641496116
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount('ID1026641496116', 'NMID QRIS')}
                              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-0.5 font-medium"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{t('Salin', 'Copy')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Security Verification Reassurance */}
                        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                          <p className="font-semibold flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {t('Pencegahan Penipuan & Keamanan', 'Fraud Prevention & Security')}
                          </p>
                          <p className="text-emerald-400/90 text-[10px] leading-relaxed">
                            {t(
                              'Sebelum memasukkan PIN transaksi, pastikan nama penerima di aplikasi Anda muncul sebagai "Fixprom, Service".',
                              'Before entering your PIN, verify that the recipient name on your screen matches "Fixprom, Service".'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-1.5 pt-1 text-[11px] text-gray-400">
                      <p className="font-semibold text-gray-300">{t('Cara Membayar via QRIS:', 'How to Pay via QRIS:')}</p>
                      {selectedAccountInfo.instructions.map((step, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">{idx + 1}.</span>
                          <span>{step}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-field border border-amber-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-gray-400">{selectedAccountInfo.name}</p>
                        <p className="font-mono text-base font-bold text-amber-400 tracking-wide mt-0.5">
                          {selectedAccountInfo.accountNumber}
                        </p>
                        <p className="text-[11px] text-gray-300 mt-0.5">a.n. {selectedAccountInfo.accountHolder}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopyAccount(selectedAccountInfo.accountNumber, selectedAccountInfo.name)}
                        className="text-xs border-white/10 hover:border-amber-500"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        {t('Salin', 'Copy')}
                      </Button>
                    </div>

                    {/* Transfer Steps */}
                    <div className="space-y-1.5 pt-3 border-t border-white/5 text-[11px] text-gray-400">
                      <p className="font-semibold text-gray-300">{t('Petunjuk Transfer:', 'Transfer Steps:')}</p>
                      {selectedAccountInfo.instructions.map((step, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">{idx + 1}.</span>
                          <span>{step}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button: Confirm to WhatsApp */}
                <div className="space-y-2 pt-2">
                  <a
                    href={generateWhatsAppLink(currentOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 text-sm"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    {t('Konfirmasi Pembayaran via WhatsApp', 'Confirm Payment via WhatsApp')}
                  </a>
                  <p className="text-[11px] text-center text-gray-400">
                    {t(
                      'Setelah transfer, klik tombol di atas untuk mengirim bukti transfer ke WhatsApp admin. Akun Anda akan diaktifkan dalam hitungan menit!',
                      'After transferring, click the button above to send proof of payment to admin WhatsApp. Your account will be activated within minutes!'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
