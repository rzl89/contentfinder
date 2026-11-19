import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  ShieldCheck,
  Zap,
  Calendar,
  KeyRound,
  Edit3,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useLanguageStore } from '@/stores/language-store';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export const UserProfileMenu: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, language } = useLanguageStore();
  const { user, profile, signOut, updateDisplayName, updatePassword } = useAuthStore();
  const { subscription, getRemainingTrialHours } = useSubscriptionStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const remainingHours = getRemainingTrialHours();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Kreator';
  const initial = displayName.charAt(0).toUpperCase();
  const credits = subscription.creditsBalance ?? (subscription.tier === 'pro' ? 350 : 20);

  // Format joined date
  const joinedDate = profile?.created_at || user.created_at;
  const formattedJoinedDate = joinedDate
    ? new Date(joinedDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  const handleOpenEditName = () => {
    setNewName(displayName);
    setFormError(null);
    setIsOpen(false);
    setIsEditNameOpen(true);
  };

  const handleOpenChangePassword = () => {
    setNewPassword('');
    setConfirmPassword('');
    setFormError(null);
    setIsOpen(false);
    setIsChangePasswordOpen(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError(t('Nama tampilan tidak boleh kosong.', 'Display name cannot be empty.'));
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const { error } = await updateDisplayName(newName.trim());
    setIsSubmitting(false);

    if (error) {
      setFormError(error.message || t('Gagal memperbarui nama tampilan.', 'Failed to update display name.'));
    } else {
      showToast({
        type: 'success',
        title: t('Profil Diperbarui', 'Profile Updated'),
        message: t('Nama tampilan berhasil disimpan.', 'Display name successfully saved.'),
      });
      setIsEditNameOpen(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setFormError(t('Kata sandi minimal 6 karakter.', 'Password must be at least 6 characters.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError(t('Konfirmasi kata sandi tidak cocok.', 'Password confirmation does not match.'));
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const { error } = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (error) {
      setFormError(error.message || t('Gagal memperbarui kata sandi.', 'Failed to update password.'));
    } else {
      showToast({
        type: 'success',
        title: t('Kata Sandi Diperbarui', 'Password Updated'),
        message: t('Kata sandi baru berhasil disimpan.', 'New password successfully saved.'),
      });
      setIsChangePasswordOpen(false);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/', { replace: true });
    showToast({
      type: 'info',
      title: t('Sesi Selesai', 'Session Ended'),
      message: t('Anda telah keluar dari akun.', 'You have been signed out.'),
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl transition-all duration-150 group border',
          isOpen
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t('Menu Profil & Akun', 'Profile & Account Menu')}
      >
        <div className="relative">
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-inner border transition-all',
              subscription.tier === 'pro'
                ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/30 text-amber-300 border-amber-500/50'
                : 'bg-zinc-800 text-zinc-300 border-white/10 group-hover:border-amber-500/30'
            )}
          >
            {initial}
          </div>
          {subscription.tier === 'pro' && (
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-black rounded-full flex items-center justify-center shadow-md ring-2 ring-[#0b0b0e]"
              title="Creator Pro"
            >
              <Crown className="w-2.5 h-2.5 fill-black" />
            </span>
          )}
        </div>

        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {subscription.tier === 'pro'
              ? 'Pro'
              : remainingHours > 0
                ? `${t('Trial', 'Trial')} ${remainingHours}j`
                : t('Habis', 'Expired')}
          </span>
        </div>

        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180 text-amber-400'
          )}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#111115] border border-white/10 shadow-2xl z-50 p-2 animate-fade-in backdrop-blur-xl"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header Card: User Info */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base uppercase shrink-0 border shadow-lg',
                  subscription.tier === 'pro'
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-200 border-white/10'
                )}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                  {subscription.tier === 'pro' && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {subscription.tier === 'pro' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      CREATOR PRO
                    </span>
                  ) : remainingHours > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                      FREE TRIAL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                      TRIAL HABIS
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Credit Summary */}
            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {t('Sisa Kredit AI:', 'Remaining Credits:')}
              </span>
              <span className="font-mono font-bold text-amber-300">
                {credits} {t('Kredit', 'Credits')}
              </span>
            </div>

            {/* Joined Date */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-zinc-400" />
                {t('Bergabung sejak:', 'Joined:')}
              </span>
              <span className="font-medium text-zinc-300">{formattedJoinedDate}</span>
            </div>
          </div>

          {/* Action List */}
          <div className="py-2 space-y-1">
            <button
              type="button"
              onClick={handleOpenEditName}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('Ubah Nama Tampilan', 'Edit Display Name')}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenChangePassword}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{t('Ganti Kata Sandi', 'Change Password')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/pricing');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('Langganan & Paket', 'Plans & Pricing')}</span>
              </span>
              {subscription.tier !== 'pro' && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Upgrade
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{t('Pengaturan Model AI', 'AI Model Settings')}</span>
            </button>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>{t('Keluar dari Akun', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Ubah Nama Tampilan */}
      <Modal
        isOpen={isEditNameOpen}
        onClose={() => setIsEditNameOpen(false)}
        title={t('Ubah Nama Tampilan', 'Edit Display Name')}
        subtitle={t('Nama ini akan tampil di seluruh antarmuka studio Anda.', 'This name appears across your studio interface.')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveName} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              {t('Nama Tampilan Baru', 'New Display Name')}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: Rizal Studio"
              maxLength={50}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditNameOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t('Batal', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50 shadow-md shadow-amber-500/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('Menyimpan...', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('Simpan Perubahan', 'Save Changes')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Ganti Kata Sandi */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title={t('Ganti Kata Sandi', 'Change Password')}
        subtitle={t('Gunakan kata sandi baru yang kuat minimal 6 karakter.', 'Use a strong password of at least 6 characters.')}
        maxWidth="md"
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              {t('Kata Sandi Baru', 'New Password')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              {t('Konfirmasi Kata Sandi Baru', 'Confirm New Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              minLength={6}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t('Batal', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50 shadow-md shadow-amber-500/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('Memperbarui...', 'Updating...')}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{t('Ubah Kata Sandi', 'Update Password')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
