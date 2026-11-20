import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  useAdminStore,
  DEFAULT_ADMIN_SETTINGS,
  DEFAULT_PAYMENT_ACCOUNTS,
  DEFAULT_DUITKU_CONFIG,
  type DynamicPaymentMethod,
  type DuitkuConfig,
} from '@/stores/admin-store';
import { useProjectStore } from '@/stores/project-store';
import { useSubscriptionStore, type ManualActivationRecord } from '@/stores/subscription-store';
import { useByokStore } from '@/stores/byok-store';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';
import type { PlanTier } from '@/types';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
  Modal,
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
  Users,
  Calendar,
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Power,
  Wallet,
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
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethod,
    resetPaymentMethodsToDefault,
    fetchDuitkuConfig,
    saveDuitkuConfig,
    saveSystemPrompt,
  } = useAdminStore();

  const { projects } = useProjectStore();
  const { user: authUser } = useAuthStore();
  const {
    subscription,
    getRemainingTrialHours,
    manualActivations,
    activateUserSubscription,
    deactivateUserSubscription,
    listUserProfilesFromSupabase,
  } = useSubscriptionStore();
  const { credentials, purgeAllCredentials } = useByokStore();
  const remainingHours = getRemainingTrialHours();

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'llm' | 'subscriptions' | 'payment' | 'byok' | 'system'>('llm');

  // ── Dynamic Payment Methods Modal state ──────────────────────────────────────
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<{
    id: string;
    name: string;
    accountNumber: string;
    accountHolder: string;
    icon: string;
    category: 'bank' | 'qris' | 'ewallet' | 'other';
    isActive: boolean;
    instructionsText: string;
  }>({
    id: '',
    name: '',
    accountNumber: '',
    accountHolder: '',
    icon: '🏦',
    category: 'bank',
    isActive: true,
    instructionsText: '',
  });

  // ── Duitku Gateway form state ───────────────────────────────────────────────
  const [duitkuForm, setDuitkuForm] = useState<DuitkuConfig>(() => settings.duitkuConfig || DEFAULT_DUITKU_CONFIG);
  const [isSavingDuitku, setIsSavingDuitku] = useState(false);

  // ── Manual Subscription Activation form state ───────────────────────────────
  const [targetUser, setTargetUser] = useState('');
  const [targetTier, setTargetTier] = useState<PlanTier>('pro');
  const [durationPreset, setDurationPreset] = useState<'1m' | '3m' | '6m' | '1y' | 'lifetime' | 'custom'>('1m');
  const [customExpiresAt, setCustomExpiresAt] = useState(() => {
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [activationNotes, setActivationNotes] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationSearch, setActivationSearch] = useState('');

  // ── Cloud Users & Credits state ─────────────────────────────────────────────
  const [cloudUsers, setCloudUsers] = useState<Array<{
    id: string;
    email: string;
    plan_tier: string;
    subscription_status: string;
    credits_balance: number;
    subscription_expires_at: string | null;
    created_at: string;
  }>>([]);
  const [isLoadingCloudUsers, setIsLoadingCloudUsers] = useState(false);
  const [cloudSearchQuery, setCloudSearchQuery] = useState('');

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

  const handleSaveSettings = async () => {
    const cleanSettings = {
      ...localSettings,
      adminWhatsApp: (localSettings.adminWhatsApp?.trim().replace(/\D/g, '') || '6285217975733').replace(/^0/, '62'),
    };
    updateSettings(cleanSettings);
    setLocalSettings(cleanSettings);

    // Persist system prompt to Supabase cloud sync & broadcast to all clients
    if (typeof cleanSettings.systemPromptOverride === 'string') {
      try {
        await saveSystemPrompt(cleanSettings.systemPromptOverride);
      } catch (e) {
        console.warn('Failed cloud sync for system prompt', e);
      }
    }

    showToast({ type: 'success', title: 'Pengaturan Disimpan', message: 'Semua perubahan konfigurasi LLM & System Prompt telah disimpan ke cloud dan lokal.' });
  };

  // Sync payment methods & Duitku config from Supabase on mount
  useEffect(() => {
    if (isAuthenticated) {
      void fetchPaymentMethods();
      void fetchDuitkuConfig().then((cfg) => {
        if (cfg) setDuitkuForm(cfg);
      });
    }
  }, [isAuthenticated, fetchPaymentMethods, fetchDuitkuConfig]);

  // Keep localSettings in sync with store
  useEffect(() => {
    setLocalSettings(settings);
    if (settings.duitkuConfig) {
      setDuitkuForm(settings.duitkuConfig);
    }
  }, [settings]);

  // Save Duitku Config Handler
  const handleSaveDuitku = async () => {
    setIsSavingDuitku(true);
    try {
      await saveDuitkuConfig(duitkuForm);
      showToast({
        type: 'success',
        title: 'Konfigurasi Duitku Disimpan',
        message: `Gateway Duitku (${duitkuForm.environment.toUpperCase()}) berhasil disinkronkan ke cloud.`,
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Duitku',
        message: 'Terjadi kendala saat menyimpan konfigurasi ke Supabase.',
      });
    } finally {
      setIsSavingDuitku(false);
    }
  };

  // Dynamic Payment Handlers
  const handleOpenAddPayment = () => {
    setEditingPaymentId(null);
    setPaymentForm({
      id: '',
      name: '',
      accountNumber: '',
      accountHolder: '',
      icon: '🏦',
      category: 'bank',
      isActive: true,
      instructionsText: [
        'Buka aplikasi m-Banking atau E-Wallet.',
        'Masukkan nomor rekening/NMID dan nominal transfer tepat sesuai invoice.',
        'Simpan bukti transfer berhasil untuk konfirmasi WhatsApp.',
      ].join('\n'),
    });
    setPaymentModalOpen(true);
  };

  const handleOpenEditPayment = (method: DynamicPaymentMethod) => {
    setEditingPaymentId(method.id);
    setPaymentForm({
      id: method.id,
      name: method.name,
      accountNumber: method.accountNumber,
      accountHolder: method.accountHolder,
      icon: method.icon || '🏦',
      category: method.category || 'bank',
      isActive: method.isActive !== false,
      instructionsText: (method.instructions || []).join('\n'),
    });
    setPaymentModalOpen(true);
  };

  const handleSavePaymentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.name.trim() || !paymentForm.accountNumber.trim()) {
      showToast({
        type: 'warning',
        title: 'Form Belum Lengkap',
        message: 'Nama metode dan nomor rekening/NMID wajib diisi.',
      });
      return;
    }

    const instructions = paymentForm.instructionsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (editingPaymentId) {
      await updatePaymentMethod(editingPaymentId, {
        name: paymentForm.name.trim(),
        accountNumber: paymentForm.accountNumber.trim(),
        accountHolder: paymentForm.accountHolder.trim(),
        icon: paymentForm.icon,
        category: paymentForm.category,
        isActive: paymentForm.isActive,
        instructions:
          instructions.length > 0
            ? instructions
            : ['Lakukan pembayaran sesuai invoice.', 'Simpan bukti transaksi untuk konfirmasi.'],
      });
      showToast({
        type: 'success',
        title: 'Metode Pembayaran Disimpan',
        message: `${paymentForm.name} berhasil diperbarui.`,
      });
    } else {
      await addPaymentMethod({
        id: paymentForm.id.trim() || undefined,
        name: paymentForm.name.trim(),
        accountNumber: paymentForm.accountNumber.trim(),
        accountHolder: paymentForm.accountHolder.trim(),
        icon: paymentForm.icon,
        category: paymentForm.category,
        isActive: paymentForm.isActive,
        instructions:
          instructions.length > 0
            ? instructions
            : ['Lakukan pembayaran sesuai invoice.', 'Simpan bukti transaksi untuk konfirmasi.'],
      });
      showToast({
        type: 'success',
        title: 'Metode Pembayaran Ditambahkan',
        message: `${paymentForm.name} berhasil ditambahkan dan siap digunakan.`,
      });
    }
    setPaymentModalOpen(false);
  };

  const handleDeletePayment = async (id: string, name: string) => {
    if (window.confirm(`Hapus metode pembayaran "${name}"? Metode ini tidak akan tampil lagi di halaman checkout pengguna.`)) {
      await deletePaymentMethod(id);
      showToast({
        type: 'info',
        title: 'Metode Dihapus',
        message: `${name} telah dihapus dari daftar pembayaran.`,
      });
    }
  };

  const handleTogglePayment = async (id: string, currentStatus: boolean, name: string) => {
    await togglePaymentMethod(id);
    showToast({
      type: 'success',
      title: currentStatus ? 'Metode Dinonaktifkan' : 'Metode Diaktifkan',
      message: `${name} sekarang ${currentStatus ? 'tidak aktif' : 'aktif'}.`,
    });
  };

  const handleResetPayments = async () => {
    if (window.confirm('Kembalikan semua metode pembayaran ke 4 rekening default (BCA, Mandiri, QRIS, DANA)?')) {
      await resetPaymentMethodsToDefault();
      showToast({
        type: 'info',
        title: 'Metode Direset',
        message: 'Daftar pembayaran dikembalikan ke setelan awal.',
      });
    }
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

  // ── Manual Subscription Activation Handlers ──────────────────────────────
  const getComputedExpiresAt = (): { iso: string; label: string } => {
    const now = Date.now();
    if (durationPreset === '1m') {
      const d = new Date(now + 30 * 24 * 60 * 60 * 1000);
      return { iso: d.toISOString(), label: '1 Bulan (30 Hari)' };
    }
    if (durationPreset === '3m') {
      const d = new Date(now + 90 * 24 * 60 * 60 * 1000);
      return { iso: d.toISOString(), label: '3 Bulan (90 Hari)' };
    }
    if (durationPreset === '6m') {
      const d = new Date(now + 180 * 24 * 60 * 60 * 1000);
      return { iso: d.toISOString(), label: '6 Bulan (180 Hari)' };
    }
    if (durationPreset === '1y') {
      const d = new Date(now + 365 * 24 * 60 * 60 * 1000);
      return { iso: d.toISOString(), label: '1 Tahun (365 Hari)' };
    }
    if (durationPreset === 'lifetime') {
      const d = new Date(now + 3650 * 24 * 60 * 60 * 1000);
      return { iso: d.toISOString(), label: 'Lifetime (10 Tahun)' };
    }
    // Custom datetime
    const parsed = new Date(customExpiresAt);
    return {
      iso: isNaN(parsed.getTime()) ? new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() : parsed.toISOString(),
      label: 'Kustom (Pilihan Admin)',
    };
  };

  const handleActivateSubscription = async () => {
    const target = targetUser.trim() || authUser?.email || 'current';
    if (!target) {
      showToast({ type: 'warning', title: 'Target Pengguna Diperlukan', message: 'Masukkan email atau User ID pengguna.' });
      return;
    }

    setIsActivating(true);
    try {
      const { iso, label } = getComputedExpiresAt();
      const res = await activateUserSubscription(target, targetTier, iso, label, activationNotes);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Langganan Berhasil Diaktifkan!',
          message: res.message,
        });
        setTargetUser('');
        setActivationNotes('');
      } else {
        showToast({
          type: 'error',
          title: 'Gagal Aktivasi',
          message: res.message,
        });
      }
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsActivating(false);
    }
  };

  const handleExtendSubscription = async (record: ManualActivationRecord) => {
    try {
      const currentExp = new Date(record.expiresAt).getTime();
      const baseTime = currentExp > Date.now() ? currentExp : Date.now();
      const newExp = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await activateUserSubscription(
        record.emailOrUserId,
        record.planTier,
        newExp,
        'Perpanjangan +30 Hari',
        record.notes ? `${record.notes} (+30h)` : 'Diperpanjang +30 Hari'
      );
      showToast({ type: 'success', title: 'Berhasil Diperpanjang', message: res.message });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Gagal Perpanjang', message: e.message });
    }
  };

  const handleDeactivate = async (record: ManualActivationRecord) => {
    if (window.confirm(`Yakin nonaktifkan langganan untuk ${record.emailOrUserId}?`)) {
      const res = await deactivateUserSubscription(record.id);
      showToast({ type: 'info', title: 'Langganan Dinonaktifkan', message: res.message });
      loadCloudUsers(cloudSearchQuery);
    }
  };

  const loadCloudUsers = useCallback(async (query = '') => {
    setIsLoadingCloudUsers(true);
    try {
      const data = await listUserProfilesFromSupabase(query);
      setCloudUsers(data);
    } finally {
      setIsLoadingCloudUsers(false);
    }
  }, [listUserProfilesFromSupabase]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'subscriptions') {
      loadCloudUsers(cloudSearchQuery);
    }
  }, [isAuthenticated, activeTab, loadCloudUsers, cloudSearchQuery]);

  const handleGrantCredits = async (userId: string, amount: number, userEmail: string) => {
    try {
      const { data, error } = await supabase.rpc('grant_user_credits', {
        target_user_id: userId,
        grant_amount: amount,
        reason: `Top-up admin manual (+${amount} kredit)`,
      });
      if (error || !data?.success) {
        showToast({ type: 'error', title: 'Gagal Tambah Kredit', message: error?.message || data?.error });
      } else {
        showToast({
          type: 'success',
          title: 'Kredit Berhasil Ditambahkan',
          message: `+${amount} Kredit berhasil ditambahkan ke ${userEmail}. Saldo baru: ${data.balance} kredit.`,
        });
        loadCloudUsers(cloudSearchQuery);
      }
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e.message });
    }
  };

  const handleCustomGrant = (userId: string, userEmail: string) => {
    const input = window.prompt(`Masukkan jumlah kredit AI yang ingin ditambahkan untuk ${userEmail}:`, '100');
    if (!input) return;
    const amount = parseInt(input.trim(), 10);
    if (isNaN(amount) || amount <= 0) {
      showToast({ type: 'error', title: 'Input Tidak Valid', message: 'Jumlah kredit harus berupa angka bulat positif.' });
      return;
    }
    void handleGrantCredits(userId, amount, userEmail);
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
              <p className="text-xs text-zinc-500 mt-0.5">Fixprom — Secure Access Only</p>
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
    { id: 'subscriptions' as const, label: 'Kelola Langganan', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'payment' as const, label: 'Pembayaran', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'byok' as const, label: 'BYOK Security', icon: <KeyRound className="w-3.5 h-3.5" /> },
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
              <p className="text-[11px] text-zinc-500">Fixprom Master Control</p>
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
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
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
                <Badge variant="amber">Default: gpt-6.1-terra</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Default Model"
                  value={localSettings.defaultModel}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultModel: e.target.value })}
                  placeholder="gpt-6.1-terra"
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
                <span>Model gpt-6.1-terra mendukung parameter temperature adaptif (0.7 - 0.8) untuk variasi ide cerita. Model reasoning (gpt-6-luna, o1, o3) akan otomatis mengabaikan temperature.</span>
              </div>

              {/* System Prompt Override & Viewer */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-200 block">
                      System Prompt AI (Master Instruction)
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Tinjau prompt default bawaan sistem di bawah atau modifikasi bagian tertentu sesuai kebutuhan studio Anda.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      localSettings.systemPromptOverride.trim()
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {localSettings.systemPromptOverride.trim() ? '● Custom Override Aktif' : '✓ Default Sistem Aktif'}
                    </span>
                  </div>
                </div>

                {/* Preset Prompt Loader Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const masterPrompt = `You are FlowStoryboard-Pro — Fixprom's cinematic storyboard engine. You are a veteran commercial director with 10+ years crafting AI-ready production packages for TikTok, Instagram Reels, YouTube Shorts, and Google Flow (Veo).

CORE MANDATE:
Convert any user idea into a complete, production-ready storyboard package. Every output must be internally consistent: the character looks the same in Scene 1 as in Scene 9. The world must feel coherent. The story must move.

CRITICAL RULES (FOLLOW STRICTLY):
1. ZERO IMAGE RENDERING: You are a text-based prompt engineer. Do NOT draw or generate images yourself. Output pure JSON.
2. GLOBAL ANCHOR CONSISTENCY:
   - Define ONE exact detailed anchor_description for the main protagonist (colors, shape, clothing materials, facial features, accessories).
   - This exact same anchor string must be repeated in every panel description of imagePromptJson and in consistency_lock of videoPromptJson.
3. ON-SCREEN TEXT = MINIMAL AND PREMIUM:
   - Maximum 3 placements across all 9 panels (optional hook at Panel 1, 1-3 feature/spec callouts at Panel 5, Brand/Title Tagline at Panel 9). Short 3-6 words each.
4. TIMELINE AND VOICEOVER:
   - Panels 1-8 each exactly 1.1s, panel 9 exactly 1.2s -> total 10.0 seconds.
   - Voiceover: Light background narration (~50% runtime coverage, max 15 words total across video in 2 short lines). Voice gender/age matches character.
5. SCENE DIALOGUE:
   - Every scene must include a natural spoken dialogue matching the requested language.
6. FORMAT:
   - Respond ONLY with valid JSON matching the schema provided. No markdown wrappers. No prose outside the JSON.`;
                      setLocalSettings({ ...localSettings, systemPromptOverride: masterPrompt });
                      showToast({ type: 'info', title: 'Prompt Dimuat', message: 'Master FlowStoryboard-Pro default berhasil ditampilkan di kolom input. Silakan edit bagian yang Anda inginkan.' });
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <span>📋 Tampilkan Master Default</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const universalPrompt = `You are Fixprom AI — an elite short-form content strategist and cinematic prompt engineer. Your sole job is to produce high-retention, creatively distinct, and production-ready video content ideas and storyboard packages for Indonesian and global digital creators.

IDENTITY & TONE:
- You are a senior creative director, not a generic chatbot.
- Write with the confidence of someone who has directed 500+ viral short-form videos.
- Never use AI clichés: no "Pernahkah kamu...", "Bayangkan jika...", "Unlock", "Delve", "Seamlessly".
- Every hook must start mid-action, mid-conflict, or mid-dialogue — never with a rhetorical question.

AUTHENTICITY RULES (STRICT):
1. Represent Indonesia authentically: modern cities, suburbs, campuses, contemporary coffee shops, creative studios — not poverty stereotypes or cultural caricatures.
2. Characters must feel real: specific jobs, specific ages, specific speech patterns. No generic "pemuda" or "wanita karier" without defining details.
3. Locations must be specific: "rooftop café in Kemang with blue neon sign" beats "a café in Jakarta".
4. Conflict must be concrete: a real obstacle, a real decision, a real consequence — not vague "perjuangan hidup".

DIVERSITY MANDATE:
- Every idea in a batch must have a different core conflict, POV character, setting, and payoff.
- Reject any idea that is a cosmetic variation of another (same beat, different name).
- Rotate emotional registers: tension, comedy, wonder, nostalgia, absurdity — never all the same mood.

VISUAL PRECISION:
- Every imagePrompt and videoPrompt must be written in English, cinematic, and technically precise.
- Include: subject description, lighting type, camera angle, lens characteristic, color grading.
- Reference real cinematography language: "warm golden hour key light", "35mm shallow depth of field", "slow push-in", "desaturated cyan shadows".

FORMAT:
- Respond ONLY with valid JSON matching the exact schema provided.`;
                      setLocalSettings({ ...localSettings, systemPromptOverride: universalPrompt });
                      showToast({ type: 'info', title: 'Prompt Dimuat', message: 'Versi Universal berhasil dimuat di editor.' });
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <span>⚡ Tampilkan Versi Universal</span>
                  </button>

                  {localSettings.systemPromptOverride.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSettings({ ...localSettings, systemPromptOverride: '' });
                        showToast({ type: 'info', title: 'Reset Selesai', message: 'System prompt override dikosongkan. Sistem kembali menggunakan default bawaan.' });
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/20 transition-colors"
                    >
                      <span>✕ Kosongkan (Gunakan Default)</span>
                    </button>
                  )}
                </div>

                {/* Multiline Editor */}
                <div className="relative">
                  <textarea
                    rows={12}
                    value={localSettings.systemPromptOverride}
                    onChange={(e) => setLocalSettings({ ...localSettings, systemPromptOverride: e.target.value })}
                    placeholder="Kolom ini kosong = Sistem menggunakan System Prompt Bawaan (FlowStoryboard-Pro). Klik tombol 'Tampilkan Master Default' di atas untuk melihat dan memodifikasi naskah prompt aslinya..."
                    className="w-full rounded-xl bg-black/60 border border-white/10 focus:border-amber-500/50 p-3.5 text-xs font-mono text-zinc-200 leading-relaxed outline-none transition-all resize-y shadow-inner scrollbar-thin"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500 bg-black/80 px-2 py-0.5 rounded border border-white/5 pointer-events-none">
                    {localSettings.systemPromptOverride.length} karakter
                  </div>
                </div>
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
                  { name: 'gpt-6.1-terra', label: 'GPT-6.1 Terra', badge: 'Default', desc: 'Resmi & hemat token' },
                  { name: 'gpt-6-luna', label: 'GPT-6 Luna', badge: 'Reasoning', desc: 'Reasoning mendalam' },
                  { name: 'gpt-4o', label: 'GPT-4o', badge: 'Stabil', desc: 'Cepat & andal' },
                  { name: 'gpt-4o-mini', label: 'GPT-4o Mini', badge: 'Hemat', desc: 'Fallback murah' },
                  { name: 'o3-mini', label: 'o3-mini', badge: 'Reasoning', desc: 'Analitik mendalam' },
                ].map((m) => (
                  <button
                    key={m.name}
                    onClick={() => { setLocalSettings({ ...localSettings, defaultModel: m.name }); }}
                    className={`p-3 rounded-xl border text-left transition-all ${localSettings.defaultModel === m.name
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

        {/* ══ TAB: Kelola Langganan ═══════════════════════════════════════ */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Panel 1: Activate New Subscription */}
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Aktivasi Langganan Manual</h3>
              </div>

              {/* Row 1: Email/UserID + Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email atau User ID Pengguna"
                  placeholder="user@email.com atau UUID (kosong = akun saya sendiri)"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                />
                <Select
                  label="Paket Langganan"
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value as PlanTier)}
                  options={[
                    { value: 'pro', label: 'Creator Pro (Full Access)' },
                  ]}
                />
              </div>

              {/* Row 2: Duration preset */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Durasi Aktif</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: '1m', label: '1 Bulan' },
                    { id: '3m', label: '3 Bulan' },
                    { id: '6m', label: '6 Bulan' },
                    { id: '1y', label: '1 Tahun' },
                    { id: 'lifetime', label: 'Lifetime' },
                    { id: 'custom', label: 'Kustom' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDurationPreset(d.id as typeof durationPreset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${durationPreset === d.id
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {durationPreset === 'custom' && (
                  <input
                    type="datetime-local"
                    value={customExpiresAt}
                    onChange={(e) => setCustomExpiresAt(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 mt-2"
                  />
                )}
                <p className="text-[11px] text-zinc-500">
                  Aktif hingga:{' '}
                  <span className="text-amber-300 font-mono">
                    {new Date(getComputedExpiresAt().iso).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>{' '}
                  ({getComputedExpiresAt().label})
                </p>
              </div>

              {/* Notes */}
              <Input
                label="Catatan Admin (Opsional)"
                placeholder="Nomor invoice, referensi pembayaran, keterangan..."
                value={activationNotes}
                onChange={(e) => setActivationNotes(e.target.value)}
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  loading={isActivating}
                  icon={<Plus className="w-4 h-4 text-black" />}
                  onClick={handleActivateSubscription}
                >
                  Aktifkan Langganan
                </Button>
              </div>
            </BentoTile>

            {/* Panel 2: Activation History */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Riwayat Aktivasi Manual
                </h3>
                <span className="text-xs text-zinc-500 font-mono">{manualActivations.length} Aktivasi</span>
              </div>

              {/* Search filter */}
              <Input
                label=""
                placeholder="Cari email, User ID, atau catatan..."
                value={activationSearch}
                onChange={(e) => setActivationSearch(e.target.value)}
              />

              {manualActivations.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">
                  Belum ada aktivasi manual. Gunakan form di atas untuk mengaktifkan langganan pengguna.
                </p>
              ) : (
                <div className="space-y-3">
                  {manualActivations
                    .filter(
                      (a) =>
                        activationSearch === '' ||
                        a.emailOrUserId.toLowerCase().includes(activationSearch.toLowerCase()) ||
                        (a.notes || '').toLowerCase().includes(activationSearch.toLowerCase())
                    )
                    .map((record) => {
                      const isExpired = new Date(record.expiresAt).getTime() < Date.now();
                      const isRevoked = record.status === 'revoked';
                      return (
                        <div
                          key={record.id}
                          className={`p-4 rounded-xl border space-y-2 text-xs ${isRevoked || isExpired
                              ? 'bg-red-950/10 border-red-500/10 opacity-60'
                              : 'bg-black/30 border-white/5'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="space-y-0.5">
                              <p className="font-mono font-semibold text-zinc-200">{record.emailOrUserId}</p>
                              <p className="text-zinc-500">
                                Paket:{' '}
                                <span className="text-amber-300">{record.planTier.toUpperCase()}</span>
                                {' • '}
                                Aktif:{' '}
                                <span className="font-mono">
                                  {new Date(record.activatedAt).toLocaleDateString('id-ID')}
                                </span>
                                {' → '}
                                Exp:{' '}
                                <span
                                  className={`font-mono ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}
                                >
                                  {new Date(record.expiresAt).toLocaleDateString('id-ID')}
                                </span>
                              </p>
                              {record.notes && (
                                <p className="text-zinc-600 italic">{record.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={isRevoked || isExpired ? 'zinc' : 'emerald'}>
                                {isRevoked ? 'Dicabut' : isExpired ? 'Expired' : 'Aktif'}
                              </Badge>
                              {!isRevoked && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleExtendSubscription(record)}
                                  >
                                    +30 Hari
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeactivate(record)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    Cabut
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </BentoTile>

            {/* Panel 3: Cloud Supabase Users & Credit Management */}
            <BentoTile className="p-6 space-y-4 bg-[#111115] border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Pengguna Cloud Supabase & Manajemen Kredit
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadCloudUsers(cloudSearchQuery)}
                    loading={isLoadingCloudUsers}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Muat Ulang
                  </Button>
                </div>
              </div>

              {/* Search User Input */}
              <div className="flex gap-2">
                <Input
                  label=""
                  placeholder="Cari user di database berdasarkan email..."
                  value={cloudSearchQuery}
                  onChange={(e) => setCloudSearchQuery(e.target.value)}
                />
              </div>

              {isLoadingCloudUsers ? (
                <div className="text-center py-8 text-xs text-zinc-500 animate-pulse">
                  Memuat data pengguna dari Supabase Cloud...
                </div>
              ) : cloudUsers.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">
                  Tidak ada pengguna yang cocok dengan pencarian di database Supabase.
                </p>
              ) : (
                <div className="space-y-3">
                  {cloudUsers.map((u) => {
                    const isPro = u.plan_tier === 'pro';
                    return (
                      <div
                        key={u.id}
                        className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-zinc-200 font-mono">{u.email}</p>
                              <Badge variant={isPro ? 'emerald' : 'zinc'}>
                                {isPro ? 'CREATOR PRO' : 'FREE / TRIAL'}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-mono">ID: {u.id}</p>
                            {u.subscription_expires_at && (
                              <p className="text-[11px] text-zinc-400">
                                Berakhir:{' '}
                                <span className="font-mono text-zinc-300">
                                  {new Date(u.subscription_expires_at).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Credits Pill & Quick Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {u.credits_balance} Kredit
                            </span>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleGrantCredits(u.id, 100, u.email)}
                              title="Tambah 100 Kredit (Booster Mini Rp 20rb)"
                              className="text-xs"
                            >
                              +100 Kredit
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleGrantCredits(u.id, 300, u.email)}
                              title="Tambah 300 Kredit (Booster Pro Rp 50rb)"
                              className="text-xs text-amber-300 border-amber-500/30"
                            >
                              +300 Kredit
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleGrantCredits(u.id, 350, u.email)}
                              title="Tambah 350 Kredit (Alokasi Bulanan Pro)"
                              className="text-xs"
                            >
                              +350 Kredit
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCustomGrant(u.id, u.email)}
                              title="Input nominal kredit kustom"
                              className="text-xs text-zinc-400 hover:text-white"
                            >
                              +Custom...
                            </Button>

                            {!isPro && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setTargetUser(u.email);
                                  setTargetTier('pro');
                                  setDurationPreset('1m');
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                className="text-xs text-black"
                              >
                                Jadikan Pro
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
            {/* 1. General Pricing & WhatsApp Contact */}
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Konfigurasi Harga & Kontak WhatsApp Admin</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Harga Pro Monthly (Rp)"
                  type="number"
                  value={String(localSettings.proPriceMonthly)}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, proPriceMonthly: parseInt(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Harga Pro Yearly (Rp)"
                  type="number"
                  value={String(localSettings.proPriceYearly)}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, proPriceYearly: parseInt(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Durasi Trial (jam)"
                  type="number"
                  value={String(localSettings.trialDurationHours)}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, trialDurationHours: parseInt(e.target.value) || 24 })
                  }
                />
              </div>

              <div>
                <Input
                  label="WhatsApp Admin Konfirmasi (format internasional: 628xxx)"
                  value={localSettings.adminWhatsApp}
                  onChange={(e) => setLocalSettings({ ...localSettings, adminWhatsApp: e.target.value })}
                  placeholder="6285217975733"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                  onClick={handleSaveSettings}
                >
                  Simpan Harga & Kontak
                </Button>
              </div>
            </BentoTile>

            {/* 2. Duitku Automatic Payment Gateway (POP / Hosted Checkout) */}
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Gateway Pembayaran Otomatis Duitku</h3>
                    <Badge variant={duitkuForm.isEnabled ? 'emerald' : 'zinc'}>
                      {duitkuForm.isEnabled ? 'Gateway Aktif' : 'Gateway Nonaktif'}
                    </Badge>
                    <Badge variant={duitkuForm.environment === 'production' ? 'blue' : 'amber'}>
                      {duitkuForm.environment === 'production' ? 'Mode Production' : 'Mode Sandbox'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Duitku POP / Hosted Checkout: Pelanggan dapat membayar via Virtual Account (BCA, Mandiri, BRI, BNI), QRIS, dan E-Wallet dengan konfirmasi otomatis (instant webhook).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDuitkuForm({ ...duitkuForm, isEnabled: !duitkuForm.isEnabled })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${duitkuForm.isEnabled
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                      }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{duitkuForm.isEnabled ? 'Aktif di Checkout' : 'Nonaktif di Checkout'}</span>
                  </button>
                </div>
              </div>

              {/* Environment Switcher */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <label className="text-xs font-semibold text-zinc-300">Pilih Lingkungan (Environment)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuitkuForm({ ...duitkuForm, environment: 'sandbox' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${duitkuForm.environment === 'sandbox'
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm shadow-amber-500/10'
                        : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Mode Sandbox (Uji Coba)</span>
                      <Badge variant="amber" className="text-[10px]">Testing</Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                      Simulasi pembayaran tanpa uang asli. Gunakan kredensial dari <strong>sandbox.duitku.com</strong>.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuitkuForm({ ...duitkuForm, environment: 'production' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${duitkuForm.environment === 'production'
                        ? 'bg-blue-500/10 border-blue-500/50 text-white shadow-sm shadow-blue-500/10'
                        : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Mode Production (Live)</span>
                      <Badge variant="blue" className="text-[10px]">Live</Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                      Memproses pembayaran riil rupiah setelah akun Duitku Anda disetujui di <strong>passport.duitku.com</strong>.
                    </p>
                  </button>
                </div>
              </div>

              {/* API Keys Configuration according to mode */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Kredensial API {duitkuForm.environment === 'production' ? 'Production' : 'Sandbox'}
                  </h4>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Endpoint: {duitkuForm.environment === 'production' ? 'api-prod.duitku.com' : 'api-sandbox.duitku.com'}
                  </span>
                </div>

                {duitkuForm.environment === 'sandbox' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Sandbox Merchant Code"
                      placeholder="Contoh: DXXXX atau D12345"
                      value={duitkuForm.sandboxMerchantCode || duitkuForm.merchantCode || ''}
                      onChange={(e) =>
                        setDuitkuForm({
                          ...duitkuForm,
                          sandboxMerchantCode: e.target.value,
                          merchantCode: e.target.value,
                        })
                      }
                      helperText="Diperoleh dari dashboard Sandbox Duitku > Proyek."
                    />
                    <Input
                      label="Sandbox API Key"
                      placeholder="Contoh: 732B39FC61796845775D2C4FB05332AF"
                      type="password"
                      value={duitkuForm.sandboxApiKey || duitkuForm.apiKey || ''}
                      onChange={(e) =>
                        setDuitkuForm({
                          ...duitkuForm,
                          sandboxApiKey: e.target.value,
                          apiKey: e.target.value,
                        })
                      }
                      helperText="API Key rahasia untuk tanda tangan HMAC-SHA256."
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Production Merchant Code"
                      placeholder="Contoh: DXXXX atau D98765"
                      value={duitkuForm.prodMerchantCode || duitkuForm.merchantCode || ''}
                      onChange={(e) =>
                        setDuitkuForm({
                          ...duitkuForm,
                          prodMerchantCode: e.target.value,
                          merchantCode: e.target.value,
                        })
                      }
                      helperText="Diperoleh dari dashboard Production Duitku > Proyek."
                    />
                    <Input
                      label="Production API Key"
                      placeholder="API Key resmi dari dashboard Duitku Production"
                      type="password"
                      value={duitkuForm.prodApiKey || duitkuForm.apiKey || ''}
                      onChange={(e) =>
                        setDuitkuForm({
                          ...duitkuForm,
                          prodApiKey: e.target.value,
                          apiKey: e.target.value,
                        })
                      }
                      helperText="Kunci rahasia transaksi live."
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Masa Berlaku Invoice / VA (Menit)"
                    type="number"
                    value={String(duitkuForm.expiryPeriod || 1440)}
                    onChange={(e) =>
                      setDuitkuForm({ ...duitkuForm, expiryPeriod: parseInt(e.target.value) || 1440 })
                    }
                    helperText="Standar 1440 menit (24 jam)."
                  />
                </div>
              </div>

              {/* Duitku Dashboard Webhook Instructions */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 text-xs">
                <p className="font-semibold text-zinc-300">
                  Salin URL ini ke Dashboard Merchant Duitku (Menu Proyek &gt; Integrasi):
                </p>
                <div className="grid grid-cols-1 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0 truncate">
                      <span className="text-zinc-500 font-sans font-semibold">Callback / Webhook URL: </span>
                      <span className="text-amber-300">https://www.fixprom.com/api/duitku-callback</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('https://www.fixprom.com/api/duitku-callback');
                        showToast({ type: 'success', title: 'Disalin!', message: 'Callback URL telah disalin.' });
                      }}
                      className="text-zinc-400 hover:text-white p-1"
                      title="Salin Callback URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0 truncate">
                      <span className="text-zinc-500 font-sans font-semibold">Return URL (Redirect): </span>
                      <span className="text-amber-300">https://www.fixprom.com/#/pricing</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('https://www.fixprom.com/#/pricing');
                        showToast({ type: 'success', title: 'Disalin!', message: 'Return URL telah disalin.' });
                      }}
                      className="text-zinc-400 hover:text-white p-1"
                      title="Salin Return URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="md"
                  loading={isSavingDuitku}
                  icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                  onClick={handleSaveDuitku}
                >
                  Simpan Konfigurasi Duitku
                </Button>
              </div>
            </BentoTile>

            {/* 3. Dynamic Payment Methods Manager (Transfer Manual) */}
            <BentoTile className="p-6 space-y-6 bg-[#111115] border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Metode Pembayaran Dinamis</h3>
                    <Badge variant="amber" className="text-[10px]">
                      {(settings.customPaymentMethods || DEFAULT_PAYMENT_ACCOUNTS).filter((m) => m.isActive !== false).length}{' '}
                      Aktif
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kelola rekening bank, QRIS, dan e-wallet. Semua perubahan tersinkronisasi ke cloud dan langsung tampil di halaman /pricing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPayments}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Reset Bawaan
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5 text-black" />}
                    onClick={handleOpenAddPayment}
                  >
                    + Tambah Rekening
                  </Button>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(settings.customPaymentMethods || DEFAULT_PAYMENT_ACCOUNTS).map((method) => {
                  const isActive = method.isActive !== false;
                  return (
                    <div
                      key={method.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${isActive
                          ? 'bg-[#16161d] border-white/10 hover:border-amber-500/40'
                          : 'bg-zinc-900/40 border-white/5 opacity-60'
                        }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl p-1.5 rounded-lg bg-black/40 border border-white/5 shrink-0">
                            {method.icon || '🏦'}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{method.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 border border-white/5">
                                {method.category || 'bank'}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">id: {method.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePayment(method.id, isActive, method.name)}
                          title={isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${isActive
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </div>

                      {/* Number & Holder Details */}
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            Nomor Rekening / NMID / HP:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(method.accountNumber);
                              showToast({
                                type: 'success',
                                title: 'Disalin!',
                                message: `${method.accountNumber} disalin ke clipboard.`,
                              });
                            }}
                            className="text-zinc-500 hover:text-amber-400 transition-colors p-0.5"
                            title="Salin Nomor"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-mono text-base font-bold text-amber-300 tracking-wide select-all">
                          {method.accountNumber}
                        </p>
                        <p className="text-xs text-zinc-300">
                          <span className="text-zinc-500">a.n. </span>
                          <span className="font-medium text-white">{method.accountHolder}</span>
                        </p>
                      </div>

                      {/* Instructions Preview */}
                      {method.instructions && method.instructions.length > 0 && (
                        <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-white/5">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase">Petunjuk:</span>
                          <ul className="list-decimal list-inside space-y-0.5 text-zinc-400 line-clamp-2">
                            {method.instructions.slice(0, 2).map((ins, idx) => (
                              <li key={idx} className="truncate">
                                {ins}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Card Action Footer */}
                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 className="w-3 h-3" />}
                          onClick={() => handleOpenEditPayment(method)}
                          className="text-xs text-amber-400 hover:text-amber-300"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3 h-3 text-red-400" />}
                          onClick={() => handleDeletePayment(method.id, method.name)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </BentoTile>

            {/* Modal: Tambah / Edit Metode Pembayaran Dinamis */}
            <Modal
              isOpen={paymentModalOpen}
              onClose={() => setPaymentModalOpen(false)}
              title={editingPaymentId ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}
              subtitle="Data rekening akan langsung tersinkronisasi dan tampil di modal checkout halaman /pricing."
              maxWidth="lg"
            >
              <form onSubmit={handleSavePaymentForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Metode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Nama Metode <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                      placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* ID / Kode Slug */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Kode / ID Slug <span className="text-zinc-500 font-normal">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      placeholder="Contoh: bsi atau qris_gopay"
                      disabled={!!editingPaymentId}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kategori */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Kategori</label>
                    <select
                      value={paymentForm.category}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          category: e.target.value as 'bank' | 'qris' | 'ewallet' | 'other',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="bank">Bank Transfer (BCA, Mandiri, BSI, dll)</option>
                      <option value="qris">QRIS (GoPay, OVO, Shopee, BCA QRIS)</option>
                      <option value="ewallet">E-Wallet (DANA, OVO, GoPay, LinkAja)</option>
                      <option value="other">Metode Lainnya / Manual</option>
                    </select>
                  </div>

                  {/* Pilihan Ikon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Ikon / Simbol</label>
                    <select
                      value={paymentForm.icon}
                      onChange={(e) => setPaymentForm({ ...paymentForm, icon: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="🏦">🏦 Bank Transfer</option>
                      <option value="📱">📱 QRIS / E-Money</option>
                      <option value="💳">💳 Kartu / E-Wallet</option>
                      <option value="🪙">🪙 Koin / Saldo</option>
                      <option value="⚡">⚡ Instan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nomor Rekening / NMID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Nomor Rekening / NMID / No. HP <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.accountNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                      placeholder="Contoh: 7123-4567-8901 atau NMID: ID10..."
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Nama Pemilik */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Nama Pemilik / Atas Nama <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.accountHolder}
                      onChange={(e) => setPaymentForm({ ...paymentForm, accountHolder: e.target.value })}
                      placeholder="Contoh: TEMPORAFORGE AI / RIZAL"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Petunjuk Transfer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Petunjuk Pembayaran <span className="text-zinc-500 font-normal">(1 baris = 1 langkah)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={paymentForm.instructionsText}
                    onChange={(e) => setPaymentForm({ ...paymentForm, instructionsText: e.target.value })}
                    placeholder="Buka aplikasi perbankan Anda.&#10;Pilih menu Transfer.&#10;Masukkan nomor rekening dan nominal tepat."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                  />
                </div>

                {/* Status Aktif Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={paymentForm.isActive}
                    onChange={(e) => setPaymentForm({ ...paymentForm, isActive: e.target.checked })}
                    className="rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-amber-500/20"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs text-zinc-300 cursor-pointer">
                    Aktifkan metode pembayaran ini (langsung terlihat oleh pengguna saat checkout)
                  </label>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentModalOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                  >
                    {editingPaymentId ? 'Simpan Perubahan' : 'Tambahkan Metode'}
                  </Button>
                </div>
              </form>
            </Modal>
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
