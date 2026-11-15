import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscription-store';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { subscription, getRemainingTrialHours } = useSubscriptionStore();
  const remainingHours = getRemainingTrialHours();

  const navItems = [
    {
      to: '/',
      label: 'Content Idea Studio',
      icon: <Lightbulb className="w-4 h-4" />,
      badge: '19 Kategori',
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
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>TemporaForge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400 truncate">Idea & Prompt Studio</p>
            </div>
          )}
        </div>
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
                        : item.badge === 'Pro' || item.badge === 'PRO'
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

      {/* Footer Info Box */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 space-y-2">
          {subscription.tier === 'pro' ? (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Paket CREATOR PRO Aktif</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Akses tanpa batas ke seluruh studio & fitur prompt compiler.
              </p>
            </div>
          ) : remainingHours > 0 ? (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  Free Trial 1 Hari
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                  {remainingHours}j lagi
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Upgrade ke Pro hanya <strong className="text-zinc-200">Rp 59rb/bln</strong> untuk akses selamanya.
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
