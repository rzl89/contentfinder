import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Sparkles,
  Lightbulb,
  FolderKanban,
  TrendingUp,
  Wand2,
  KeyRound,
  Settings,
  ShieldCheck,
  CreditCard,
  Zap,
  LogOut,
  UserCircle2,
} from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAuthStore } from '@/stores/auth-store';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const { subscription, getRemainingTrialHours } = useSubscriptionStore();
  const { user, signOut } = useAuthStore();
  const remainingHours = getRemainingTrialHours();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const navItems = [
    {
      to: '/studio',
      label: 'Content Idea Studio',
      icon: <Lightbulb className="w-4 h-4" />,
      badge: '21 Kategori',
    },
    {
      to: '/projects',
      label: 'My Projects',
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      to: '/trends',
      label: 'Trend Radar',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      to: '/prompt-desk',
      label: 'Prompt Production Desk',
      icon: <Wand2 className="w-4 h-4" />,
    },
    {
      to: '/byok',
      label: 'BYOK Video Connectors',
      icon: <KeyRound className="w-4 h-4" />,
      badge: subscription.tier === 'pro' ? 'Secure' : 'PRO',
    },
    {
      to: '/pricing',
      label: 'Langganan & Paket',
      icon: <CreditCard className="w-4 h-4" />,
      badge:
        subscription.tier === 'pro'
          ? 'Pro'
          : remainingHours > 0
          ? `Trial ${remainingHours}j`
          : 'Habis',
    },
    {
      to: '/settings',
      label: 'Settings & Context',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      className={clsx(
        'h-screen sticky top-0 flex flex-col bg-[#0b0b0e] border-r border-white/5 transition-all duration-200 z-30',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 min-w-0 group hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-amber-500/30 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <img src="/fixprom-icon.png" alt="Fixprom" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Fixprom</span>
              </h1>
              <p className="text-[11px] text-zinc-400 truncate">Idea & Prompt Studio</p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {!collapsed ? 'Menu Studio' : '•••'}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'transition-colors shrink-0',
                    isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded-md font-mono border',
                      item.badge === 'Live'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.badge === 'Secure'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : item.badge === 'Pro' || item.badge === 'PRO' || item.badge === 'Master'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : item.badge === 'Habis'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : String(item.badge).startsWith('Trial')
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-zinc-800 text-zinc-300 border-white/5'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Info + Logout */}
      {!collapsed && user && (
        <div className="px-4 pb-3 border-t border-white/5 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <UserCircle2 className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[11px] text-zinc-400 truncate">{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              title="Keluar"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Info Box */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 space-y-2">
          {subscription.tier === 'pro' ? (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>CREATOR PRO</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-bold">
                  ⚡ {subscription.creditsBalance ?? 350} Kredit
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Akses seluruh 21 studio kategori & prompt compiler.
              </p>
              <NavLink
                to="/pricing"
                className="block text-center text-[11px] font-medium py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors border border-emerald-500/20"
              >
                + Top-Up Kredit
              </NavLink>
            </div>
          ) : remainingHours > 0 ? (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  Free Trial
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300 font-bold">
                  ⚡ {subscription.creditsBalance ?? 20} Kredit
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Upgrade ke Pro hanya <strong className="text-zinc-200">Rp 59rb/bln</strong> (350 Kredit + Semua Fitur).
              </p>
              <NavLink
                to="/pricing"
                className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors shadow"
              >
                Langganan Sekarang
              </NavLink>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-red-400">
                <span>Masa Trial Habis</span>
                <span className="text-[10px] font-mono bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">
                  Expired
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Aktifkan akun Pro hanya <strong className="text-zinc-200">Rp 59rb/bln</strong> untuk lanjut.
              </p>
              <NavLink
                to="/pricing"
                className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors shadow"
              >
                Beli Paket Pro
              </NavLink>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
