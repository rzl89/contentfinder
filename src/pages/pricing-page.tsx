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
      title: 'Disalin ke Clipboard!',
      message: `${label} berhasil disalin.`,
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
          Monetisasi & Langganan Kreator
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Investasi Terjangkau untuk Konten Video AI Berkualitas
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Mulai dengan <strong>Free Trial 24 Jam</strong> untuk mencoba 3 kategori unggulan dan storyboard studio. Lanjutkan dengan langganan terjangkau mulai 
          dari <strong>Rp 59.000 / bulan</strong> tanpa kartu kredit rumit — bayar via QRIS, BCA, Mandiri, atau E-Wallet.
        </p>

        {/* Current User Status Banner */}
        <div className="pt-2">
          {isPaidActive ? (
            <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Paket Anda: <strong>{subscription.tier.toUpperCase()}</strong> (Aktif) • Saldo: <strong>{subscription.creditsBalance ?? 350} Kredit AI</strong></span>
            </div>
          ) : isTrialActive ? (
            <div className="inline-flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Masa Free Trial: Sisa <strong>~{remainingHours} Jam</strong> • Saldo: <strong>{subscription.creditsBalance ?? 20} Kredit AI</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-300 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Masa Trial Anda Telah Berakhir. Upgrade untuk terus memproduksi konten tanpa batas.</span>
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
            Bayar Bulanan
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-amber-500 text-black shadow-md font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Bayar Tahunan</span>
            <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Hemat 30%
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
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Tahap Coba</span>
              <Badge variant="zinc">
                1 Hari Penuh
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{PRICING_PLANS.trial.name}</h3>
            <p className="text-xs text-gray-400 mb-6">{PRICING_PLANS.trial.description}</p>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-white">Rp 0</span>
              <span className="text-gray-400 text-xs ml-1">/ 24 jam pertama</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 mb-6">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Fitur Eksplorasi:</p>
              {PRICING_PLANS.trial.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <Check className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant={isTrialActive ? 'primary' : 'secondary'}
            disabled={isPaidActive || !isTrialActive}
            onClick={() => navigate('/studio')}
            className="w-full text-xs border-white/10"
          >
            {isPaidActive
              ? 'Paket Pro Aktif'
              : isTrialActive
              ? 'Buka Studio Sekarang (Trial Aktif)'
              : 'Trial Kadaluwarsa'}
          </Button>
        </BentoTile>

        {/* Tier 2: Creator Pro (POPULAR) */}
        <BentoTile className="flex flex-col justify-between border-amber-500/50 bg-gradient-to-b from-card to-amber-950/20 relative shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/30 p-6 sm:p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3 fill-black" />
              Paling Populer
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Akses Penuh</span>
              <Badge variant="amber">
                Creator Pro
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{PRICING_PLANS.pro.name}</h3>
            <p className="text-xs text-gray-400 mb-6">{PRICING_PLANS.pro.description}</p>

            <div className="mb-6">
              {billingCycle === 'monthly' ? (
                <div>
                  <span className="text-4xl font-extrabold text-white">Rp 59.000</span>
                  <span className="text-gray-400 text-xs ml-1">/ bulan</span>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-extrabold text-white">Rp 499.000</span>
                  <span className="text-gray-400 text-xs ml-1">/ tahun</span>
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                    Setara ~Rp 41.500 / bulan (Hemat Rp 209.000)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 mb-6">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Semua Fitur Termasuk:</p>
              {PRICING_PLANS.pro.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                  <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleSelectPlan('pro')}
            className="w-full py-3 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20"
          >
            {billingCycle === 'yearly'
              ? 'Pilih Paket Creator Pro (Rp 499rb/thn)'
              : 'Pilih Paket Creator Pro (Rp 59rb/bln)'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </BentoTile>
      </div>

      {/* Top-Up Credit Boosters */}
      <div className="max-w-4xl mx-auto space-y-4 pt-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Kredit Tambahan (Add-on)</span>
          </div>
          <h3 className="text-lg font-bold text-white">Butuh Tambahan Kuota? Paket Top-Up Booster</h3>
          <p className="text-xs text-gray-400">
            Kredit tambahan tidak memiliki masa kedaluwarsa. Bisa digunakan kapan saja saat kuota bulanan Anda menipis.
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
                  <span className="text-sm font-bold text-white">{pkg.name}</span>
                  {pkg.popular && <Badge variant="amber">Populer</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-300">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-gray-400">/ sekali beli</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{pkg.description}</p>
                <div className="text-[11px] text-zinc-300 space-y-1 bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono">
                  <p>⚡ {pkg.credits} Kredit AI langsung masuk saldo</p>
                  <p>✓ Berlaku selamanya tanpa hangus</p>
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
                  Beli {pkg.name} via WhatsApp
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
            <h4 className="text-xs font-bold text-white">Keamanan Kredensial</h4>
            <p className="text-[11px] text-gray-400">Semua data dan kunci terlindungi enkripsi AES-256 client-side.</p>
          </div>
        </div>
        <div className="bg-field/60 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Pembayaran Lokal Indonesia</h4>
            <p className="text-[11px] text-gray-400">Transfer bank nasional, QRIS, GoPay, OVO, & DANA tanpa kartu kredit.</p>
          </div>
        </div>
        <div className="bg-field/60 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Aktivasi Cepat 5-15 Menit</h4>
            <p className="text-[11px] text-gray-400">Konfirmasi langsung ke WhatsApp admin dan akun aktif seketika.</p>
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
          title="Instruksi Pembayaran & Konfirmasi"
        >
          <div className="space-y-5 text-sm">
            {/* Invoice Summary Box */}
            <div className="bg-field border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-white/5">
                <span>Nomor Invoice:</span>
                <span className="font-mono text-white font-semibold">{currentOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300">Paket Dipilih:</span>
                <span className="text-white font-semibold">
                  {PRICING_PLANS.pro.name} (
                  {currentOrder.billingCycle === 'yearly' ? '1 Tahun' : '1 Bulan'})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300">Harga Paket:</span>
                <span className="text-gray-300">Rp {currentOrder.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 flex items-center gap-1">
                  Kode Unik Verifikasi:
                  <span className="text-[10px] bg-amber-500/20 px-1 rounded text-amber-300">Otomatis</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">+{currentOrder.uniqueCode}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10 font-bold">
                <span className="text-white">Total Transfer Tepat:</span>
                <span className="text-emerald-400 text-base font-mono">
                  Rp {currentOrder.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Pilih Rekening / Metode Pembayaran:</label>
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
                  Salin
                </Button>
              </div>

              {/* Transfer Steps */}
              <div className="space-y-1.5 pt-3 border-t border-white/5 text-[11px] text-gray-400">
                <p className="font-semibold text-gray-300">Petunjuk Transfer:</p>
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
                Konfirmasi Pembayaran via WhatsApp
              </a>
              <p className="text-[11px] text-center text-gray-400">
                Setelah transfer, klik tombol di atas untuk mengirim bukti transfer ke WhatsApp admin. Akun Anda akan diaktifkan dalam hitungan menit!
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
