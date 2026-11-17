import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { BentoTile } from '@/components/ui/bento-tile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useLanguageStore } from '@/stores/language-store';
import {
  useSubscriptionStore,
  PRICING_PLANS,
  TOPUP_PACKAGES,
  getPaymentAccounts,
} from '@/stores/subscription-store';
import type { BillingCycle, PlanTier, PaymentMethodType, SubscriptionOrder } from '@/types';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguageStore();
  const {
    subscription,
    activeOrder,
    createOrder,
    generateWhatsAppLink,
    cancelActiveOrder,
    getRemainingTrialHours,
  } = useSubscriptionStore();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('bca');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<SubscriptionOrder | null>(activeOrder);

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

  const paymentAccounts = getPaymentAccounts();
  const selectedAccountInfo = paymentAccounts.find((a) => a.id === selectedPayment) || paymentAccounts[0];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
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
          title={t('Instruksi Pembayaran & Konfirmasi', 'Payment Instructions & Confirmation')}
        >
          <div className="space-y-5 text-sm">
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
                {paymentAccounts.map((account) => (
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
                    <span className="truncate">{account.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details Box */}
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
        </Modal>
      )}
    </div>
  );
};
