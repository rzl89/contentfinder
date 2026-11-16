import React, { useState } from 'react';
import { useAdminStore } from '@/stores/admin-store';
import { useProjectStore } from '@/stores/project-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useByokStore } from '@/stores/byok-store';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Bot,
  CreditCard,
  Sliders,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Zap,
  Radio,
  Layers,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { showToast } = useToast();
  const {
    isAuthenticated,
    login,
    logout,
    settings,
    updateSettings,
    updateAdminPin,
    resetToDefaults,
  } = useAdminStore();

  const { projects } = useProjectStore();
  const { subscription, manualUpgradeTier } = useSubscriptionStore();
  const { isKmsConfigured, setKmsConfigured, credentials, purgeAllCredentials } = useByokStore();

  // Login PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'ai' | 'byok' | 'payment' | 'system'>('ai');

  // Change PIN modal state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  // AI Test state
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  // Form states initialized from admin settings
  const [formModel, setFormModel] = useState(settings.defaultModel || 'gpt-6-luna');
  const [formApiKey, setFormApiKey] = useState(settings.openAiApiKey || '');
  const [formTemp, setFormTemp] = useState(settings.temperature || 0.75);

  const [formBcaNo, setFormBcaNo] = useState(settings.bcaNumber);
  const [formBcaHolder, setFormBcaHolder] = useState(settings.bcaHolder);
  const [formMandiriNo, setFormMandiriNo] = useState(settings.mandiriNumber);
  const [formMandiriHolder, setFormMandiriHolder] = useState(settings.mandiriHolder);
  const [formQrisNmid, setFormQrisNmid] = useState(settings.qrisNmid);
  const [formQrisHolder, setFormQrisHolder] = useState(settings.qrisHolder);
  const [formDanaNo, setFormDanaNo] = useState(settings.danaNumber);
  const [formDanaHolder, setFormDanaHolder] = useState(settings.danaHolder);
  const [formWhatsApp, setFormWhatsApp] = useState(settings.adminWhatsApp);
  const [formProPrice, setFormProPrice] = useState(settings.proPriceMonthly || 59000);
  const [formTrialHours, setFormTrialHours] = useState(settings.trialDurationHours || 24);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(pinInput);
    if (success) {
      setPinError(false);
      setPinInput('');
      showToast({
        type: 'success',
        title: 'Akses Admin Diterima',
        message: 'Selamat datang di Master Admin Control Panel.',
      });
    } else {
      setPinError(true);
      showToast({
        type: 'error',
        title: 'PIN Salah',
        message: 'PIN admin tidak valid. Gunakan PIN default (admin123).',
      });
    }
  };

  const handleSaveAiConfig = () => {
    updateSettings({
      defaultModel: formModel,
      openAiApiKey: formApiKey,
      temperature: Number(formTemp),
    });
    showToast({
      type: 'success',
      title: 'Pengaturan AI Diperbarui',
      message: `Model default diset ke "${formModel}".`,
    });
  };

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          customApiKey: formApiKey || undefined,
          payload: { model: formModel },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiTestResult(`Sukses! Model aktif: ${data.modelUsed}. Respon: "${data.raw?.message || 'OK'}"`);
        showToast({
          type: 'success',
          title: 'Koneksi AI Berhasil',
          message: `Terhubung via ${data.modelUsed}`,
        });
      } else {
        throw new Error(data.message || data.error || 'Uji koneksi gagal');
      }
    } catch (err: any) {
      setAiTestResult(`Error: ${err.message}`);
      showToast({
        type: 'error',
        title: 'Gagal Uji Koneksi',
        message: err.message,
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleSavePaymentConfig = () => {
    updateSettings({
      bcaNumber: formBcaNo,
      bcaHolder: formBcaHolder,
      mandiriNumber: formMandiriNo,
      mandiriHolder: formMandiriHolder,
      qrisNmid: formQrisNmid,
      qrisHolder: formQrisHolder,
      danaNumber: formDanaNo,
      danaHolder: formDanaHolder,
      adminWhatsApp: formWhatsApp,
      proPriceMonthly: Number(formProPrice),
      trialDurationHours: Number(formTrialHours),
    });

    showToast({
      type: 'success',
      title: 'Rekening & Harga Disimpan',
      message: 'Perubahan nomor rekening dan harga langsung aktif di halaman Langganan.',
    });
  };

  const handleUpdatePin = () => {
    if (newPin.trim().length < 4) {
      showToast({ type: 'warning', title: 'PIN Terlalu Pendek', message: 'Minimal 4 digit angka/karakter.' });
      return;
    }
    updateAdminPin('', newPin.trim());
    setIsChangingPin(false);
    setNewPin('');
    showToast({
      type: 'success',
      title: 'PIN Master Berhasil Diubah',
      message: 'Gunakan PIN baru ini saat login kembali.',
    });
  };

  // 1. PIN GATE VIEW IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-[#111115] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Master Admin Control Gate</h2>
            <p className="text-xs text-zinc-400">
              Akses khusus pengelola aplikasi untuk mengatur model AI (GPT-6 Luna), kunci API, proteksi BYOK, dan nomor rekening pembayaran.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              label="Master Admin PIN"
              placeholder="Masukkan PIN (default: admin123)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              error={pinError ? 'PIN salah. Silakan coba lagi.' : undefined}
              helperText="Default PIN sistem adalah: admin123"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              icon={<Unlock className="w-4 h-4 text-black" />}
            >
              Buka Panel Admin
            </Button>
          </form>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-500 text-center">
            🔐 Halaman ini dilindungi otentikasi sesi privat.
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED MASTER ADMIN PANEL VIEW
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#14141c] via-[#101015] to-[#14141c] border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Master Admin Panel</h2>
              <Badge variant="amber">Sesi Aktif</Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Kontrol penuh engine AI (GPT-6 Luna), protokol BYOK, langganan kreator, dan data rekening.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Lock className="w-3.5 h-3.5" />}
            onClick={() => setIsChangingPin(!isChangingPin)}
          >
            Ganti PIN
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={logout}
          >
            Keluar Admin
          </Button>
        </div>
      </div>

      {/* Change PIN Box if toggled */}
      {isChangingPin && (
        <BentoTile className="p-5 border-amber-500/30 bg-[#16161e] space-y-3">
          <h4 className="text-xs font-bold text-amber-300">Ubah Master Admin PIN</h4>
          <div className="flex items-center gap-3 max-w-md">
            <Input
              type="password"
              placeholder="Masukkan PIN baru..."
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <Button variant="primary" size="sm" onClick={handleUpdatePin}>
              Simpan PIN
            </Button>
          </div>
        </BentoTile>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ai'
              ? 'bg-amber-500 text-black shadow-lg font-bold'
              : 'bg-[#111115] text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Model AI & LLM (GPT-6 Luna)</span>
        </button>

        <button
          onClick={() => setActiveTab('byok')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'byok'
              ? 'bg-amber-500 text-black shadow-lg font-bold'
              : 'bg-[#111115] text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan & Proteksi BYOK</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'payment'
              ? 'bg-amber-500 text-black shadow-lg font-bold'
              : 'bg-[#111115] text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Rekening Bank & Harga Paket</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'system'
              ? 'bg-amber-500 text-black shadow-lg font-bold'
              : 'bg-[#111115] text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Status Sistem & Proyek</span>
        </button>
      </div>

      {/* TAB 1: AI MODEL & LLM CONFIGURATION */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Konfigurasi Model LLM Default</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Model default saat ini disetel ke <strong className="text-amber-400">gpt-6-luna</strong> dengan sistem fallback cerdas.
                </p>
              </div>
              <Badge variant="emerald">Live Gateway Connected</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Target Default AI Model"
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                options={[
                  { value: 'gpt-6-luna', label: 'gpt-6-luna (Rekomendasi Utama — Ultra Cepat & Akurat)' },
                  { value: 'gpt-4o', label: 'gpt-4o (Omni High Reasoning)' },
                  { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Hemat Token & Cepat)' },
                  { value: 'custom', label: 'Model Kustom Lainnya...' },
                ]}
              />

              {formModel === 'custom' && (
                <Input
                  label="Nama Model Kustom"
                  placeholder="Contoh: gpt-5, o1-mini..."
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                />
              )}

              <Input
                label="Override Server OpenAI API Key (Opsional)"
                type="password"
                placeholder="sk-proj-•••••••• (Kosongkan jika menggunakan env Vercel)"
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                helperText="Secara default, aplikasi membaca OPENAI_API_KEY yang sudah Anda set di Vercel."
              />

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Kreativitas / Temperature: {formTemp}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={formTemp}
                  onChange={(e) => setFormTemp(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] text-zinc-500">
                  Nilai 0.75 ideal untuk variasi ide hook video pendek yang fresh namun tetap logis.
                </span>
              </div>
            </div>

            {/* Test Connection Result Box */}
            {aiTestResult && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs font-mono text-zinc-200">
                {aiTestResult}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button
                variant="secondary"
                size="sm"
                loading={isTestingAi}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleTestAiConnection}
              >
                Uji Koneksi AI Sekarang
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                onClick={handleSaveAiConfig}
              >
                Terapkan Pengaturan AI
              </Button>
            </div>
          </BentoTile>
        </div>
      )}

      {/* TAB 2: BYOK SECURITY GOVERNANCE */}
      {activeTab === 'byok' && (
        <div className="space-y-6">
          <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Protokol Keamanan BYOK (Bring Your Own Key)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Pengendalian keamanan saat pengguna menghubungkan API key pihak ketiga (Veo, Kling, Runway, Luma).
                </p>
              </div>
              <Badge variant={isKmsConfigured ? 'emerald' : 'amber'}>
                {isKmsConfigured ? 'KMS Enforced' : 'Standby'}
              </Badge>
            </div>

            {/* Security Architecture Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Knowledge Storage</span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Kunci API tidak pernah disimpan secara utuh atau terbuka di penyimpanan publik. Tampilan hanya merender karakter masking (contoh: <code className="text-zinc-300 font-mono">sk-live-••••ABCD</code>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Ephemeral Session Memory</span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Payload rahasia diisolasi dalam session memory browser terpisah yang otomatis terhapus saat tab ditutup atau saat pengguna mengklik revoke key.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Radio className="w-4 h-4" />
                  <span>Strict Endpoint Allowlisting</span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Request hanya dapat dikirim ke host vendor resmi (Google Vertex, Kling AI, RunwayML, Luma AI) untuk mencegah serangan Server-Side Request Forgery (SSRF).
                </p>
              </div>
            </div>

            {/* Toggle KMS Status */}
            <div className="p-4 rounded-xl bg-field border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Status Master Vault KMS
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isKmsConfigured
                    ? 'Vault aktif. Pengguna diizinkan menghubungkan kunci API mereka dengan proteksi tingkat tinggi.'
                    : 'Vault nonaktif. Input kunci ditutup untuk mencegah risiko penyimpanan yang belum terverifikasi.'}
                </span>
              </div>
              <Button
                variant={isKmsConfigured ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  setKmsConfigured(!isKmsConfigured);
                  showToast({
                    type: 'info',
                    title: 'Status Vault Diubah',
                    message: `Vault kini ${!isKmsConfigured ? 'Aktif' : 'Nonaktif'}.`,
                  });
                }}
              >
                {isKmsConfigured ? 'Nonaktifkan Vault' : 'Aktifkan Vault KMS'}
              </Button>
            </div>

            {/* Purge All Keys Action */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-red-300 block">
                  Purge / Hapus Seluruh Kredensial Pengguna Lokal
                </span>
                <span className="text-[11px] text-zinc-400">
                  Menghapus seketika seluruh kunci yang terdaftar di perangkat browser ini untuk audit keamanan.
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  purgeAllCredentials();
                  showToast({
                    type: 'success',
                    title: 'Seluruh Kunci Dihapus',
                    message: 'Memori sesi telah dibersihkan tanpa jejak.',
                  });
                }}
              >
                Purge All Keys
              </Button>
            </div>
          </BentoTile>
        </div>
      )}

      {/* TAB 3: PAYMENT & BANK ACCOUNTS */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Pengaturan Rekening Pembayaran & Paket</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Data yang Anda simpan di sini akan langsung tampil pada modal transfer pembayaran pengguna.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nomor WhatsApp Admin Konfirmasi"
                  placeholder="Contoh: 6281234567890 (Gunakan format 62)"
                  value={formWhatsApp}
                  onChange={(e) => setFormWhatsApp(e.target.value)}
                  helperText="Tautan konfirmasi transfer di checkout akan otomatis mengarah ke WA ini."
                />

                <Input
                  label="Harga Creator Pro (Bulanan)"
                  type="number"
                  value={formProPrice.toString()}
                  onChange={(e) => setFormProPrice(Number(e.target.value))}
                  helperText="Rupiah (Contoh: 59000)"
                />

                <Input
                  label="Durasi Free Trial (Jam)"
                  type="number"
                  value={formTrialHours.toString()}
                  onChange={(e) => setFormTrialHours(Number(e.target.value))}
                  helperText="Default: 24 jam (1 hari)"
                />
              </div>

              <div className="pt-2 border-t border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Rincian Rekening Bank & E-Wallet
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BCA */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🏦 Bank Central Asia (BCA)</span>
                    </span>
                    <Input
                      label="Nomor Rekening BCA"
                      value={formBcaNo}
                      onChange={(e) => setFormBcaNo(e.target.value)}
                    />
                    <Input
                      label="Atas Nama (Holder)"
                      value={formBcaHolder}
                      onChange={(e) => setFormBcaHolder(e.target.value)}
                    />
                  </div>

                  {/* Mandiri */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🏦 Bank Mandiri</span>
                    </span>
                    <Input
                      label="Nomor Rekening Mandiri"
                      value={formMandiriNo}
                      onChange={(e) => setFormMandiriNo(e.target.value)}
                    />
                    <Input
                      label="Atas Nama (Holder)"
                      value={formMandiriHolder}
                      onChange={(e) => setFormMandiriHolder(e.target.value)}
                    />
                  </div>

                  {/* QRIS */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>📱 QRIS Nasional (GoPay/OVO/ShopeePay)</span>
                    </span>
                    <Input
                      label="NMID QRIS / ID Merchant"
                      value={formQrisNmid}
                      onChange={(e) => setFormQrisNmid(e.target.value)}
                    />
                    <Input
                      label="Nama Merchant Terdaftar"
                      value={formQrisHolder}
                      onChange={(e) => setFormQrisHolder(e.target.value)}
                    />
                  </div>

                  {/* DANA */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>💳 DANA / GoPay Number</span>
                    </span>
                    <Input
                      label="Nomor HP DANA"
                      value={formDanaNo}
                      onChange={(e) => setFormDanaNo(e.target.value)}
                    />
                    <Input
                      label="Nama Akun DANA"
                      value={formDanaHolder}
                      onChange={(e) => setFormDanaHolder(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                onClick={handleSavePaymentConfig}
              >
                Simpan & Aktifkan Rekening
              </Button>
            </div>
          </BentoTile>
        </div>
      )}

      {/* TAB 4: SYSTEM METRICS & LOCAL SUBSCRIPTION MANAGEMENT */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Ringkasan Sistem & Kontrol Pengguna</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 text-xs">Total Proyek Lokal:</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {projects.length} Proyek
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 text-xs">Status Akun Browser Ini:</span>
                <div className="text-lg font-bold text-amber-400">
                  {subscription.tier.toUpperCase()} ({subscription.status})
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 text-xs">Konektor BYOK Aktif:</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {credentials.filter((c) => c.status === 'active').length} / {credentials.length}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-field border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Upgrade Manual Akun ke CREATOR PRO (Akses Instan)
                </span>
                <span className="text-[11px] text-zinc-400">
                  Gunakan tombol ini untuk menguji atau memberikan status Pro tanpa menunggu transfer bank.
                </span>
              </div>
              <Button
                variant="emerald"
                size="sm"
                icon={<Zap className="w-3.5 h-3.5" />}
                onClick={() => {
                  manualUpgradeTier('pro');
                  showToast({
                    type: 'success',
                    title: 'Akun Di-upgrade!',
                    message: 'Status saat ini: CREATOR PRO aktif 30 hari.',
                  });
                }}
              >
                Jadikan Akun Pro
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-field border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Reset Seluruh Pengaturan Admin ke Default
                </span>
                <span className="text-[11px] text-zinc-400">
                  Mengembalikan model LLM, PIN admin, dan data rekening ke konfigurasi standar awal.
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetToDefaults();
                  showToast({
                    type: 'info',
                    title: 'Pengaturan Direset',
                    message: 'Seluruh konfigurasi kembali ke nilai default.',
                  });
                }}
              >
                Reset ke Default
              </Button>
            </div>
          </BentoTile>
        </div>
      )}
    </div>
  );
};
