import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdminStore, DEFAULT_ADMIN_SETTINGS } from '@/stores/admin-store';
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
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Shield,
  XCircle,
  ChevronRight,
} from 'lucide-react';

const PIN_SALT = 'temporaforge_salt_v1';
const PIN_HASH_KEY = 'temporaforge_admin_pin_hash_v2';
const DEFAULT_PIN_HASH = '7af3c32180c6309402473ca09c997b9327646b5e8c20b13e312ca04b6a943f7b';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

async function computeHash(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin + PIN_SALT);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredHash(): string {
  try { return localStorage.getItem(PIN_HASH_KEY) || DEFAULT_PIN_HASH; }
  catch { return DEFAULT_PIN_HASH; }
}

// ─── Admin Panel — Completely separate from main AppLayout ────────────────────
export const AdminPanelPage: React.FC = () => {
  const { showToast } = useToast();
  const {
    isAuthenticated,
    logout,
    checkSession,
    refreshSession,
    updateSettings,
    resetToDefaults,
    settings,
    failedAttempts,
    lockedUntil,
    sessionExpiresAt,
  } = useAdminStore();

  const { projects } = useProjectStore();
  const { subscription, getRemainingTrialHours } = useSubscriptionStore();
  const { credentials, purgeAllCredentials } = useByokStore();
  const remainingHours = getRemainingTrialHours();

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'llm' | 'byok' | 'payment' | 'system'>('llm');

  // ── Settings form state ──────────────────────────────────────────────────────
  const [localSettings, setLocalSettings] = useState(settings);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPinForChange, setCurrentPinForChange] = useState('');

  // ── Session timer ───────────────────────────────────────────────────────────
  const [sessionLeft, setSessionLeft] = useState<number>(0);
  const activityRef = useRef<number>(0);

  // Track activity to refresh session
  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      const now = Date.now();
      if (now - activityRef.current > 60_000) { // throttle: refresh max every 1 min
        activityRef.current = now;
        refreshSession();
      }
    }
  }, [isAuthenticated, refreshSession]);

  // Session countdown & check
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const valid = checkSession();
      if (!valid) {
        showToast({ type: 'warning', title: 'Sesi Berakhir', message: 'Anda telah logout otomatis karena tidak aktif.' });
        return;
      }
      if (sessionExpiresAt) {
        setSessionLeft(Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000)));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession, sessionExpiresAt, showToast]);

  // Activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isAuthenticated, handleActivity]);

  // ── Lockout timer ──
  const [lockLeft, setLockLeft] = useState<number>(0);
  useEffect(() => {
    if (!lockedUntil) return;
    const update = () => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockLeft(left);
      if (left <= 0) clearInterval(interval);
    };
    const interval = setInterval(update, 1000);
    const timeout = setTimeout(update, 0);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [lockedUntil]);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!pinInput.trim()) {
      setLoginError('Masukkan PIN Anda.');
      return;
    }
    if (lockedUntil && Date.now() < lockedUntil) {
      const currentLeft = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLoginError(`Akun dikunci. Coba lagi dalam ${currentLeft} detik.`);
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    const inputHash = await computeHash(pinInput);
    const storedHash = getStoredHash();

    if (inputHash === storedHash) {
      // Update store state directly
      const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
      try { sessionStorage.setItem('temporaforge_admin_session_v1', JSON.stringify({ expiresAt })); } catch { /* noop */ }
      try { localStorage.setItem('temporaforge_admin_attempts_v1', JSON.stringify({ failedAttempts: 0, lockedUntil: null })); } catch { /* noop */ }
      useAdminStore.setState({ isAuthenticated: true, sessionExpiresAt: expiresAt, failedAttempts: 0, lockedUntil: null });
      setSessionLeft(Math.floor(SESSION_TIMEOUT_MS / 1000));
      setPinInput('');
    } else {
      const newAttempts = failedAttempts + 1;
      const newLocked = newAttempts >= 5 ? Date.now() + 10 * 60 * 1000 : null;
      try { localStorage.setItem('temporaforge_admin_attempts_v1', JSON.stringify({ failedAttempts: newAttempts, lockedUntil: newLocked })); } catch { /* noop */ }
      useAdminStore.setState({ failedAttempts: newAttempts, lockedUntil: newLocked });
      if (newLocked) {
        setLockLeft(10 * 60);
        setLoginError(`PIN salah ${newAttempts}x. Akun dikunci 10 menit.`);
      } else {
        setLoginError(`PIN salah. Sisa percobaan: ${5 - newAttempts}x`);
      }
      setPinInput('');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    logout();
    setPinInput('');
    setLoginError('');
    showToast({ type: 'info', title: 'Logged Out', message: 'Sesi admin telah diakhiri.' });
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    showToast({ type: 'success', title: 'Pengaturan Disimpan', message: 'Semua perubahan telah disimpan.' });
  };

  const handleChangePin = async () => {
    if (!currentPinForChange || !newPin || !confirmPin) {
      showToast({ type: 'error', title: 'Error', message: 'Semua field PIN harus diisi.' });
      return;
    }
    if (newPin !== confirmPin) {
      showToast({ type: 'error', title: 'PIN Tidak Cocok', message: 'PIN baru dan konfirmasi berbeda.' });
      return;
    }
    if (newPin.length < 6) {
      showToast({ type: 'error', title: 'PIN Terlalu Pendek', message: 'PIN minimal 6 digit.' });
      return;
    }

    // Verify current PIN
    const inputHash = await computeHash(currentPinForChange);
    const storedHash = getStoredHash();

    if (inputHash !== storedHash) {
      showToast({ type: 'error', title: 'PIN Lama Salah', message: 'PIN saat ini tidak cocok.' });
      return;
    }

    // Hash new PIN and save
    const newHash = await computeHash(newPin);
    try { localStorage.setItem(PIN_HASH_KEY, newHash); } catch { /* noop */ }

    setCurrentPinForChange('');
    setNewPin('');
    setConfirmPin('');
    showToast({ type: 'success', title: 'PIN Diubah', message: 'PIN admin berhasil diperbarui.' });
  };

  // ── Format session time ───────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // isLocked derived from lockLeft state (already updated via interval) — no Date.now() at render
  const isLocked = lockLeft > 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-zinc-500 mt-0.5">TemporaForge — Secure Access Only</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            {isLocked ? (
              <div className="space-y-3 text-center">
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 space-y-2">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <p className="text-sm font-semibold text-red-300">Akun Dikunci Sementara</p>
                  <p className="text-xs text-zinc-400">
                    Terlalu banyak percobaan gagal. Coba lagi dalam:
                  </p>
                  <div className="text-2xl font-mono font-bold text-red-400">{formatTime(lockLeft)}</div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    PIN Admin
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setLoginError('');
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                      placeholder="••••••"
                      maxLength={12}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-mono tracking-widest placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginError && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {loginError}
                    </p>
                  )}
                </div>

                {failedAttempts > 0 && failedAttempts < 5 && (
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Percobaan: {failedAttempts}/5. Setelah 5x, akun dikunci 10 menit.
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLogin}
                  disabled={loginLoading || !pinInput}
                  className="w-full"
                  icon={loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                >
                  {loginLoading ? 'Memverifikasi...' : 'Masuk Admin Panel'}
                </Button>
              </>
            )}

            <p className="text-[11px] text-zinc-600 text-center">
              Akses terbatas. Aktivitas dimonitor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN PANEL (authenticated)
  // ═══════════════════════════════════════════════════════════════════════════
  const tabs = [
    { id: 'llm' as const, label: 'AI & Model LLM', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'byok' as const, label: 'BYOK Security', icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: 'payment' as const, label: 'Pembayaran', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'system' as const, label: 'Sistem', icon: <Layers className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100" onClick={handleActivity}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0b0b0e]/95 backdrop-blur border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Admin Panel</h1>
              <p className="text-[11px] text-zinc-500">TemporaForge Master Control</p>
            </div>
            <Badge variant="amber">MASTER</Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Session timer */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Sesi: <span className={`font-mono font-semibold ${sessionLeft < 300 ? 'text-red-400' : 'text-emerald-400'}`}>{formatTime(sessionLeft)}</span></span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0b0b0e] border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ══ TAB: LLM Config ══════════════════════════════════════════════ */}
        {activeTab === 'llm' && (
          <div className="space-y-6">
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  Konfigurasi Model AI / LLM
                </h3>
                <Badge variant="amber">Default: gpt-6-luna</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Default Model"
                  value={localSettings.defaultModel}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultModel: e.target.value })}
                  placeholder="gpt-6-luna"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={localSettings.temperature}
                    onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Presisi (0)</span>
                    <span className="text-amber-400 font-mono font-bold">{localSettings.temperature.toFixed(2)}</span>
                    <span>Kreatif (2)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Model reasoning (gpt-6-luna, o1, o3) tidak mendukung parameter temperature. Sistem akan otomatis mengabaikan temperature untuk model tersebut.</span>
              </div>

              <div>
                <Input
                  label="System Prompt Override (opsional)"
                  value={localSettings.systemPromptOverride}
                  onChange={(e) => setLocalSettings({ ...localSettings, systemPromptOverride: e.target.value })}
                  placeholder="Override sistem prompt default AI... (kosongkan untuk default)"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="md" icon={<CheckCircle2 className="w-4 h-4 text-black" />} onClick={handleSaveSettings}>
                  Simpan Konfigurasi LLM
                </Button>
              </div>
            </BentoTile>

            {/* Model presets */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Model Presets Cepat
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'gpt-6-luna', label: 'GPT-6 Luna', badge: 'Default', desc: 'Reasoning terbaik' },
                  { name: 'gpt-4o', label: 'GPT-4o', badge: 'Stabil', desc: 'Cepat & andal' },
                  { name: 'gpt-4o-mini', label: 'GPT-4o Mini', badge: 'Hemat', desc: 'Fallback murah' },
                  { name: 'o3-mini', label: 'o3-mini', badge: 'Reasoning', desc: 'Analitik mendalam' },
                ].map((m) => (
                  <button
                    key={m.name}
                    onClick={() => { setLocalSettings({ ...localSettings, defaultModel: m.name }); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      localSettings.defaultModel === m.name
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{m.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-white/5">{m.badge}</span>
                    </div>
                    <p className="text-[11px] opacity-70">{m.desc}</p>
                  </button>
                ))}
              </div>
            </BentoTile>
          </div>
        )}

        {/* ══ TAB: BYOK Security ══════════════════════════════════════════ */}
        {activeTab === 'byok' && (
          <div className="space-y-6">
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  BYOK — Bring Your Own Key
                </h3>
                <Badge variant={localSettings.byokEnabled ? 'emerald' : 'zinc'}>
                  {localSettings.byokEnabled ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Status BYOK</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLocalSettings({ ...localSettings, byokEnabled: true })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${localSettings.byokEnabled ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-black/30 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Unlock className="w-3.5 h-3.5" /> Aktif
                    </button>
                    <button
                      onClick={() => setLocalSettings({ ...localSettings, byokEnabled: false })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${!localSettings.byokEnabled ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-black/30 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Lock className="w-3.5 h-3.5" /> Nonaktif
                    </button>
                  </div>
                </div>

                <Select
                  label="Mode Enkripsi"
                  value={localSettings.byokEncryptionMode}
                  onChange={(e) => setLocalSettings({ ...localSettings, byokEncryptionMode: e.target.value as 'client_aes_gcm' | 'kms_vault' })}
                  options={[
                    { value: 'client_aes_gcm', label: 'Client-side AES-256-GCM (Default)' },
                    { value: 'kms_vault', label: 'KMS Vault (Enterprise)' },
                  ]}
                />
              </div>

              {/* Security info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, title: 'AES-256-GCM', desc: 'Enkripsi end-to-end client-side' },
                  { icon: <Radio className="w-4 h-4 text-blue-400" />, title: 'Zero-Knowledge', desc: 'Server tidak pernah melihat key' },
                  { icon: <Clock className="w-4 h-4 text-amber-400" />, title: 'Session Vault', desc: 'Key hilang saat browser ditutup' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2.5">
                    {item.icon}
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{item.title}</p>
                      <p className="text-[11px] text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active credentials summary */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Credentials Aktif</span>
                  <span className="font-mono text-amber-400">{credentials.length} provider</span>
                </div>
                {credentials.length > 0 ? (
                  <div className="space-y-1">
                    {credentials.map((cred) => (
                      <div key={cred.provider} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
                        <span className="text-zinc-400">{cred.provider}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Tersimpan (Terenkripsi)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-600">Belum ada credentials tersimpan.</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  onClick={() => {
                    if (window.confirm('Yakin hapus SEMUA credentials BYOK? Tindakan ini tidak bisa dibatalkan.')) {
                      purgeAllCredentials();
                      showToast({ type: 'success', title: 'Credentials Dihapus', message: 'Semua BYOK credentials telah dipurge.' });
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Purge Semua Credentials
                </Button>
                <Button variant="primary" size="md" icon={<CheckCircle2 className="w-4 h-4 text-black" />} onClick={handleSaveSettings}>
                  Simpan Konfigurasi BYOK
                </Button>
              </div>
            </BentoTile>
          </div>
        )}

        {/* ══ TAB: Payment ════════════════════════════════════════════════ */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Konfigurasi Harga & Pembayaran</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Harga Pro Monthly (Rp)"
                  type="number"
                  value={String(localSettings.proPriceMonthly)}
                  onChange={(e) => setLocalSettings({ ...localSettings, proPriceMonthly: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="Harga Pro Yearly (Rp)"
                  type="number"
                  value={String(localSettings.proPriceYearly)}
                  onChange={(e) => setLocalSettings({ ...localSettings, proPriceYearly: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="Durasi Trial (jam)"
                  type="number"
                  value={String(localSettings.trialDurationHours)}
                  onChange={(e) => setLocalSettings({ ...localSettings, trialDurationHours: parseInt(e.target.value) || 24 })}
                />
              </div>

              <div>
                <Input
                  label="WhatsApp Admin (format: 628xxx)"
                  value={localSettings.adminWhatsApp}
                  onChange={(e) => setLocalSettings({ ...localSettings, adminWhatsApp: e.target.value })}
                  placeholder="6281234567890"
                />
              </div>

              {/* BCA */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">BCA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Nomor Rekening BCA" value={localSettings.bcaNumber} onChange={(e) => setLocalSettings({ ...localSettings, bcaNumber: e.target.value })} />
                  <Input label="Nama Pemilik BCA" value={localSettings.bcaHolder} onChange={(e) => setLocalSettings({ ...localSettings, bcaHolder: e.target.value })} />
                </div>
              </div>

              {/* Mandiri */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mandiri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Nomor Rekening Mandiri" value={localSettings.mandiriNumber} onChange={(e) => setLocalSettings({ ...localSettings, mandiriNumber: e.target.value })} />
                  <Input label="Nama Pemilik Mandiri" value={localSettings.mandiriHolder} onChange={(e) => setLocalSettings({ ...localSettings, mandiriHolder: e.target.value })} />
                </div>
              </div>

              {/* QRIS & DANA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">QRIS</h4>
                  <Input label="NMID" value={localSettings.qrisNmid} onChange={(e) => setLocalSettings({ ...localSettings, qrisNmid: e.target.value })} />
                  <Input label="Nama QRIS" value={localSettings.qrisHolder} onChange={(e) => setLocalSettings({ ...localSettings, qrisHolder: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">DANA</h4>
                  <Input label="Nomor DANA" value={localSettings.danaNumber} onChange={(e) => setLocalSettings({ ...localSettings, danaNumber: e.target.value })} />
                  <Input label="Nama DANA" value={localSettings.danaHolder} onChange={(e) => setLocalSettings({ ...localSettings, danaHolder: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="md" icon={<CheckCircle2 className="w-4 h-4 text-black" />} onClick={handleSaveSettings}>
                  Simpan Pengaturan Pembayaran
                </Button>
              </div>
            </BentoTile>
          </div>
        )}

        {/* ══ TAB: System ═════════════════════════════════════════════════ */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Status */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Radio className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Status Sistem</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Model Aktif', value: settings.defaultModel, color: 'text-amber-400' },
                  { label: 'Status Langganan', value: subscription.tier === 'pro' ? 'Creator Pro' : remainingHours > 0 ? `Trial (${remainingHours}j)` : 'Expired', color: subscription.tier === 'pro' ? 'text-emerald-400' : 'text-amber-400' },
                  { label: 'Total Proyek', value: `${projects.length} proyek`, color: 'text-zinc-200' },
                  { label: 'BYOK Status', value: settings.byokEnabled ? 'Aktif' : 'Nonaktif', color: settings.byokEnabled ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Enkripsi Mode', value: settings.byokEncryptionMode, color: 'text-blue-400' },
                  { label: 'BYOK Credentials', value: `${credentials.length} provider`, color: 'text-zinc-200' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className={`font-semibold font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </BentoTile>

            {/* Change PIN */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Ubah PIN Admin</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="PIN Saat Ini"
                  type="password"
                  value={currentPinForChange}
                  onChange={(e) => setCurrentPinForChange(e.target.value)}
                  placeholder="••••••"
                />
                <Input
                  label="PIN Baru (min. 6 digit)"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••••"
                />
                <Input
                  label="Konfirmasi PIN Baru"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="primary" size="md" icon={<ShieldCheck className="w-4 h-4 text-black" />} onClick={handleChangePin}>
                  Update PIN Admin
                </Button>
              </div>
            </BentoTile>

            {/* Danger Zone */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-red-500/10">
              <div className="flex items-center gap-2 pb-3 border-b border-red-500/10">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-300">Danger Zone</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-red-300">Reset Pengaturan Admin</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Kembalikan semua pengaturan ke nilai default pabrik. PIN tidak berubah.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<RefreshCw className="w-3.5 h-3.5 text-red-400" />}
                    onClick={() => {
                      if (window.confirm('Reset semua pengaturan admin ke default? Tindakan ini tidak bisa dibatalkan.')) {
                        resetToDefaults();
                        setLocalSettings(DEFAULT_ADMIN_SETTINGS);
                        showToast({ type: 'info', title: 'Reset Berhasil', message: 'Pengaturan dikembalikan ke default.' });
                      }
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Reset ke Default
                  </Button>
                </div>
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-red-300">Logout Paksa</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Akhiri sesi admin dan hapus session storage.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<LogOut className="w-3.5 h-3.5 text-red-400" />}
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300"
                  >
                    Logout Sekarang
                  </Button>
                </div>
              </div>
            </BentoTile>

            {/* Quick actions */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Navigasi Cepat</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Ke Dashboard', href: '#/' },
                  { label: 'Settings', href: '#/settings' },
                  { label: 'BYOK', href: '#/byok' },
                  { label: 'Pricing', href: '#/pricing' },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-black/30 border border-white/5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/15 transition-all"
                  >
                    {link.label}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </BentoTile>
          </div>
        )}
      </main>
    </div>
  );
};
