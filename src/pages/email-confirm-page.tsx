import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, MailCheck, ArrowRight } from 'lucide-react';

/**
 * Shown after clicking the email confirmation link from Supabase.
 * Supabase redirects to /#/login after confirmation,
 * but this page handles /auth/confirm as a friendly fallback.
 */
export const EmailConfirmPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30">
              <img src="/fixprom-icon.png" alt="Fixprom" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-white">Fixprom</span>
          </div>
          <h1 className="text-xl font-bold text-white">Email Dikonfirmasi!</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Akun Anda aktif. Silakan login untuk mulai menggunakan studio.
          </p>
        </div>

        <NavLink
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
        >
          Masuk ke Studio
          <ArrowRight className="w-4 h-4" />
        </NavLink>

        <NavLink to="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors block">
          ← Kembali ke beranda
        </NavLink>
      </div>
    </div>
  );
};
