import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resendConfirmation, loading, user, initialized } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    try {
      const fullHash = typeof window !== 'undefined' ? window.location.hash : '';
      if (fullHash.includes('error=')) {
        const match = fullHash.match(/error_description=([^&]+)/);
        if (match && match[1]) {
          return `Tautan tidak valid atau telah kedaluwarsa: ${decodeURIComponent(match[1].replace(/\+/g, ' '))}`;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(
    () => (location.state as any)?.message || null
  );
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const destination = (location.state as any)?.from?.pathname || '/studio';

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      navigate(destination, { replace: true });
    }
  }, [initialized, user, navigate, destination]);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid';
    if (!password) errors.password = 'Password wajib diisi';
    else if (password.length < 6) errors.password = 'Password minimal 6 karakter';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsEmailUnconfirmed(false);

    if (!validate()) return;

    const { error: authError } = await signIn(email.trim().toLowerCase(), password);

    if (authError) {
      const msg = authError.message || '';
      if (
        msg.includes('Invalid login credentials') ||
        msg.includes('invalid_grant') ||
        msg.includes('Invalid email or password')
      ) {
        setError('Email atau password salah. Periksa kembali dan coba lagi.');
      } else if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
        setError('Email belum dikonfirmasi. Silakan periksa inbox atau spam email Anda.');
        setIsEmailUnconfirmed(true);
      } else if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        setError('Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.');
      } else {
        setError(msg || 'Terjadi kesalahan saat masuk. Coba lagi.');
      }
    } else {
      navigate(destination, { replace: true });
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: 'Masukkan email terlebih dahulu' });
      return;
    }
    setResending(true);
    try {
      const { error: resendErr } = await resendConfirmation(email.trim().toLowerCase());
      if (resendErr) {
        setError(resendErr.message);
      } else {
        setSuccessMessage('Email konfirmasi baru telah dikirim! Cek inbox atau folder spam Anda.');
        setIsEmailUnconfirmed(false);
      }
    } catch (e: any) {
      setError(e.message || 'Gagal mengirim ulang email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center px-4 py-16">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <NavLink to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-500/30 shrink-0">
              <img src="/fixprom-icon.png" alt="Fixprom" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <span className="text-base font-bold tracking-tight text-white block">Fixprom</span>
              <span className="text-[11px] text-zinc-500">Idea & Prompt Studio</span>
            </div>
          </NavLink>
          <div className="pt-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Masuk ke Studio</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Belum punya akun?{' '}
              <NavLink to="/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Daftar gratis
              </NavLink>
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-7 space-y-5 shadow-xl">
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>

              {isEmailUnconfirmed && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Mengirim ulang...' : 'Kirim Ulang Email Konfirmasi'}</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={`w-full bg-[#1a1a22] border rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-[#1a1a22] border rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<LogIn className="w-4 h-4 text-black" />}
              className="w-full"
            >
              Masuk ke Studio
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-zinc-600">
          Dengan masuk, Anda menyetujui Ketentuan Layanan Fixprom.
        </p>
      </div>
    </div>
  );
};
