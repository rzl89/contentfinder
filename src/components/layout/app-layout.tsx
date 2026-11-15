import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Menu, X, Sparkles, Globe } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentProject = useProjectStore((s) => s.currentProject);

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
              <span className="text-xs text-zinc-400 hidden sm:inline">Active Project:</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[200px] truncate">
                  {currentProject?.name || 'Untitled Production Project'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Indonesia Natural Engine</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-mono">
              <span>BYOK: Client-Safe</span>
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
