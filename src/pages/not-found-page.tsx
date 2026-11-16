import React from 'react';
import { useNavigate } from 'react-router-dom';

// Generic 404 — reveals nothing about admin panel existence
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <div className="text-8xl font-black text-zinc-800 font-mono select-none">404</div>
          <h1 className="text-xl font-bold text-zinc-300">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};
