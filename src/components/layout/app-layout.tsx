import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Menu, X, Sparkles, Globe, Zap } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useLanguageStore } from '@/stores/language-store';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguageStore();
  const currentProject = useProjectStore((s) => s.currentProject);
  const subscription = useSubscriptionStore((s) => s.subscription);

  return (
    <div className="min-h-screen flex bg-[#09090b] text-zinc-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#0b0b0e] h-full shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0b0b0e]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 hidden sm:inline">
                {t('Proyek Aktif:', 'Active Project:')}
              </span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[200px] truncate">
                  {currentProject?.name || t('Proyek Produksi Baru', 'Untitled Production Project')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Credit Balance Badge */}
            <NavLink
              to="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold text-amber-300 transition-colors shadow-sm"
              title={t('Sisa Kredit AI Anda — Klik untuk Isi Ulang', 'Your AI Credits Balance — Click to Top Up')}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {subscription.creditsBalance ?? (subscription.tier === 'pro' ? 350 : 20)}{' '}
                {t('Kredit', 'Credits')}
              </span>
            </NavLink>

            {/* Language Switcher (ID / EN) */}
            <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
                title="Bahasa Indonesia"
              >
                <span>ID</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
                title="English"
              >
                <span>EN</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
