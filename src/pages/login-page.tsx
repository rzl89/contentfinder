import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading, user, initialized } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      navigate('/studio', { replace: true });
    }
  }, [initialized, user, navigate]);

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
    if (!validate()) return;

    const { error: authError } = await signIn(email.trim().toLowerCase(), password);

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email atau password salah. Periksa kembali dan coba lagi.');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Cek inbox Anda dan klik link konfirmasi.');
      } else {
        setError(authError.message);
      }
    } else {
      navigate('/studio', { replace: true });
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div className="text-left">
              <span className="text-base font-bold tracking-tight text-white block">TemporaForge AI</span>
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
          Dengan masuk, Anda menyetujui{' '}
          <span className="text-zinc-500">Syarat Layanan</span> TemporaForge AI.
        </p>
      </div>
    </div>
  );
};

