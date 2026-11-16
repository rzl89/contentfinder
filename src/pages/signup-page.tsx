import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading, user, initialized } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      navigate('/studio', { replace: true });
    }
  }, [initialized, user, navigate]);

  const passwordStrength = (p: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['', 'Lemah', 'Cukup', 'Baik', 'Kuat'];
    const colors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400'];
    return { score, label: labels[score] || '', color: colors[score] || '' };
  };

  const strength = password ? passwordStrength(password) : { score: 0, label: '', color: '' };

  const validate = (): boolean => {
    const errors: { email?: string; password?: string; confirm?: string } = {};
    if (!email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid';
    if (!password) errors.password = 'Password wajib diisi';
    else if (password.length < 6) errors.password = 'Password minimal 6 karakter';
    if (!confirmPassword) errors.confirm = 'Konfirmasi password wajib diisi';
    else if (password !== confirmPassword) errors.confirm = 'Password tidak cocok';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    const { error: authError, session } = await signUp(email.trim().toLowerCase(), password);

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.');
      } else {
        setError(authError.message);
      }
    } else if (session) {
      // Auto-confirmed or active session
      navigate('/studio', { replace: true });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Cek Email Anda</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Link konfirmasi dikirim ke{' '}
              <span className="text-zinc-200 font-medium">{email}</span>.
              Klik link di email untuk mengaktifkan akun, lalu login.
            </p>
          </div>
          <div className="p-4 bg-[#0f0f13] border border-white/10 rounded-xl text-xs text-zinc-400 text-left space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>Cek folder <strong className="text-zinc-200">Spam</strong> jika tidak masuk inbox</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>Link berlaku selama <strong className="text-zinc-200">24 jam</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>Belum dapat email? Tunggu 2-3 menit</span>
            </div>
          </div>
          <NavLink
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
          >
            Ke Halaman Login
          </NavLink>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-white tracking-tight">Buat Akun Gratis</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Sudah punya akun?{' '}
              <NavLink to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Masuk di sini
              </NavLink>
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-7 space-y-5 shadow-xl">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
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
              {fieldErrors.email && <p className="text-[11px] text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
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
              {/* Strength indicator */}
              {password && (
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.score
                            ? strength.score <= 1
                              ? 'bg-red-500'
                              : strength.score === 2
                              ? 'bg-orange-500'
                              : strength.score === 3
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-medium ${strength.color}`}>{strength.label}</span>
                </div>
              )}
              {fieldErrors.password && <p className="text-[11px] text-red-400">{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined }));
                  }}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  className={`w-full bg-[#1a1a22] border rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all ${
                    fieldErrors.confirm
                      ? 'border-red-500/50 focus:border-red-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-500/40 focus:border-emerald-500/60'
                      : 'border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword === password && !fieldErrors.confirm && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Password cocok
                </p>
              )}
              {fieldErrors.confirm && <p className="text-[11px] text-red-400">{fieldErrors.confirm}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<UserPlus className="w-4 h-4 text-black" />}
              className="w-full"
            >
              Daftar & Aktifkan Akun
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-zinc-600">
          Trial 24 jam gratis setelah email dikonfirmasi. Tanpa kartu kredit.
        </p>
      </div>
    </div>
  );
};

