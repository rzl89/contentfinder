import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Layers,
  Zap,
  Film,
  Camera,
  Compass,
  Sliders,
  TrendingUp,
  CreditCard,
  Check,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionStore } from '@/stores/subscription-store';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { subscription, getRemainingTrialHours } = useSubscriptionStore();
  const remainingHours = getRemainingTrialHours();

  // Interactive Demo state: comparison between standard AI slop and TemporaForge prompt
  const [activeTab, setActiveTab] = useState<'temporaforge' | 'generic'>('temporaforge');
  const [copied, setCopied] = useState(false);

  const samplePrompt = {
    temporaforge: {
      model: 'Kling 1.5 Pro / Google Veo 2',
      camera: 'Tracking forward, 35mm anamorphic, f/2.0, eye-level',
      lighting: 'Volumetric golden hour with soft rim light',
      subject:
        'Rian Adiputra (26, Indonesian male, neat undercut, charcoal overshirt jacket, brown leather wristwatch) walks through a contemporary Bandung cafe corridor toward an illuminated terrace. Natural physics, fabric folds react to forward motion, authentic skin pore texture.',
      negative:
        'blurry, plastic skin, oversaturated, deformed hands, extra fingers, mutated limbs, text artifacts, watermark, low quality, glitch',
      audio: 'Ambient cafe background audio, distant acoustic guitar (post-dub dialogue: "Tunggu, kamu lihat itu?")',
    },
    generic: {
      model: 'AI Prompt Biasa (Generic Slop)',
      camera: 'Tidak terdefinisi (kamera acak)',
      lighting: 'Hyperrealistic, 8k, octane render, unreal engine 5, masterpiece, glowing light',
      subject:
        'A handsome Indonesian man in futuristic Jakarta street, highly detailed face, walking, trending on artstation, cinematic beauty, dramatic atmosphere.',
      negative: 'bad quality, worst quality',
      audio: 'Tidak ada arahan audio atau lip-sync.',
    },
  };

  const handleCopyPrompt = () => {
    const text =
      activeTab === 'temporaforge'
        ? `[Camera: ${samplePrompt.temporaforge.camera}] Subject: ${samplePrompt.temporaforge.subject} Lighting: ${samplePrompt.temporaforge.lighting}. Negative: ${samplePrompt.temporaforge.negative}`
        : samplePrompt.generic.subject;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="sticky top-0 z-50 bg-[#06060a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>TemporaForge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-zinc-500 leading-none">Studio Ide & Prompt Video AI</p>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            <a href="#demo" className="hover:text-zinc-200 transition-colors">Contoh Prompt</a>
            <a href="#fitur" className="hover:text-zinc-200 transition-colors">Fitur Studio</a>
            <a href="#kategori" className="hover:text-zinc-200 transition-colors">19 Kategori</a>
            <a href="#harga" className="hover:text-zinc-200 transition-colors">Harga</a>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              to="/pricing"
              className="hidden sm:inline-flex items-center text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 transition-colors"
            >
              Langganan
            </NavLink>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/studio')}
              icon={<ArrowRight className="w-3.5 h-3.5 text-black" />}
            >
              Buka Studio Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* â”€â”€ Hero Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle ambient lighting backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Context Engine & Multi-Model Video Prompt Compiler</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Ide Konten & Prompt Video AI yang{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Siap Masuk Studio Produksi
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Hentikan prompt video acak yang menghasilkan visual plastik dan karakter bermutasi.
            Dari premis cerita lokal yang autentik hingga storyboard 4 adegan dengan parameter optik kamera untuk Kling 1.5, Google Veo 2, dan Runway Gen-3.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/studio')}
              icon={<ArrowRight className="w-4 h-4 text-black" />}
              className="w-full sm:w-auto"
            >
              Mulai Susun Ide Sekarang
            </Button>

            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              Lihat Perbandingan Prompt
            </a>
          </div>

          {/* Social proof metric chips â€” truthful and concrete */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">19</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Kategori Konten Pendek</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">4 Model</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Kling, Veo 2, Runway, Luma</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-emerald-400">3 Detik</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Hook Retensi Terverifikasi</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-blue-400">AES-256</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Enkripsi Kunci BYOK di Browser</div>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Interactive Prompt Comparison Demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="demo" className="px-6 py-16 bg-[#0b0b0e] border-y border-white/5">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bukan Prompt AI Sembarangan. Ini Bahasa Sutradara.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Perhatikan perbedaan antara prompt AI generik yang boros token vs prompt terstruktur TemporaForge yang dipahami engine AI video.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('temporaforge')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'temporaforge'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Prompt TemporaForge (Director-Grade)
              </button>
              <button
                onClick={() => setActiveTab('generic')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'generic'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Prompt AI Biasa (Slop Klise)
              </button>
            </div>
          </div>

          {/* Prompt card */}
          <div className="rounded-2xl bg-[#111115] border border-white/10 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    activeTab === 'temporaforge'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {samplePrompt[activeTab].model}
                </span>
                <span className="text-xs text-zinc-500">Scene 1 / Detik 0-3 Hook</span>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-black/40 border border-white/5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Prompt'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                  Gerakan Kamera & Lensa
                </span>
                <p className="p-3 rounded-lg bg-black/40 border border-white/5 text-zinc-200">
                  {samplePrompt[activeTab].camera}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                  Prompt Video (Subject & Kinematika Fisik)
                </span>
                <p className="p-3 rounded-lg bg-black/40 border border-white/5 text-amber-200/90 leading-relaxed">
                  {samplePrompt[activeTab].subject}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                    Negative Prompt (Anti-Slop Filter)
                  </span>
                  <p className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-red-300/80 text-[11px]">
                    {samplePrompt[activeTab].negative}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                    Instruksi Audio & Lip-Sync
                  </span>
                  <p className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-blue-300/80 text-[11px]">
                    {samplePrompt[activeTab].audio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Feature Bento Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="fitur" className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Arsitektur Studio Konten yang Bekerja
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Empat pilar yang menghubungkan kreativitas lokal Anda ke generator video AI kelas industri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tile 1: Context Engine */}
          <div className="md:col-span-7 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Context Engine & 9 Golden Rules</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Menghilangkan stereotip malas pada AI. Dialog dapat dipilih dalam Bahasa Indonesia santai, Jawa, Sunda, atau Inggris. Latar cerita dirancang natural tanpa memaksakan warung atau motor jika cerita tidak membutuhkannya.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Preset Tersedia:</span>
              <span className="text-amber-400">Indonesia Natural, Urban Modern, Nusantara Misteri</span>
            </div>
          </div>

          {/* Tile 2: Vendor Model Compiler */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multi-Model Syntax Compiler</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tiap generator video punya format berbeda. TemporaForge mengonversi storyboard Anda ke format perintah kamera Kling (<code className="text-amber-300 font-mono">[Camera: ...]</code>), Veo 2, Runway Gen-3, atau Luma Dream Machine secara otomatis.
              </p>
            </div>
          </div>

          {/* Tile 3: Consistency Bibles */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Character & World Bible Consistency</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Karakter mengunci 3 anchor fisik kanonis (warna jaket, jam tangan, gaya rambut) agar bentuk wajah dan pakaian tidak bermutasi saat berganti adegan di AI video.
              </p>
            </div>
          </div>

          {/* Tile 4: BYOK Security */}
          <div className="md:col-span-7 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Client-side BYOK Security (AES-256-GCM)</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Jika Anda ingin memakai API key AI Anda sendiri, kredensial disimpan terenkripsi di browser Anda via Web Crypto API. Server kami menerapkan zero-knowledge architecture: key Anda tidak pernah singgah di database kami.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero-knowledge client vault & ephemeral session purge</span>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ 19 Categories Showcase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="kategori" className="px-6 py-16 bg-[#0b0b0e] border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                19 Format Konten Berdaya Retensi Tinggi
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Kategori terkurasi dari format video pendek dengan performa tervalidasi di TikTok dan Reels.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/studio')}
              icon={<ArrowRight className="w-3.5 h-3.5 text-zinc-400" />}
            >
              Buka Semua di Studio
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {[
              { title: 'Time Travel & Masa Lalu', desc: 'Kontras era historis vs modern' },
              { title: 'POV Kamera Tersembunyi', desc: 'Sudut pandang mikro benda mati' },
              { title: 'Transformasi Ruang 360Â°', desc: 'Evolusi lokasi dalam satu adegan' },
              { title: 'Micro-Documentary Misteri', desc: 'Fakta aneh dan arsip sejarah' },
              { title: 'Dua Pilihan Hidup Ekstrem', desc: 'Dilema moral interaktif penonton' },
              { title: 'Evolusi Objek & Desain', desc: 'Metamorfosis bentuk per dekade' },
              { title: 'Sketsa Satir Kantor Modern', desc: 'Relatable humor tempat kerja' },
              { title: "Eksperimen 'Bagaimana Jika'", desc: 'Simulasi skenario alternatif' },
              { title: 'Misteri Arsip Nusantara', desc: 'Cerita rakyat berbasis arkeologi' },
              { title: 'Sinematik Stickman Dramatik', desc: 'Aksi koreografi minimalis' },
              { title: 'Loop Video Sempurna', desc: 'Ending yang menyatu ke detik 0' },
              { title: 'Eksplorasi Skala Mikro/Makro', desc: 'Zoom tak berujung sel ke galaksi' },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#111115] border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group"
                onClick={() => navigate('/studio')}
              >
                <div className="font-semibold text-zinc-200 group-hover:text-amber-300 transition-colors">
                  {cat.title}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Pricing Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="harga" className="px-6 py-20 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Harga Terbuka Tanpa Jebakan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Mulai gratis dengan trial 24 jam. Upgrade kapan saja saat proyek Anda berkembang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Free Trial */}
          <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Trial Akses Penuh
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Rp 0</span>
                  <span className="text-xs text-zinc-500">/ 24 jam</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Uji coba seluruh fitur studio tanpa perlu kartu kredit.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-white/5">
                {[
                  '19 kategori konten short-form',
                  'Akses Prompt Production Desk',
                  'Simpan hingga 3 proyek aktif',
                  'Ekspor storyboard Markdown & JSON',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/studio')}
              className="w-full"
            >
              Mulai Trial Sekarang
            </Button>
          </div>

          {/* Plan 2: Creator Pro (Featured) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#18181f] to-[#111115] border-2 border-amber-500/40 space-y-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
              Pilihan Kreator
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Creator Pro
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Rp 59.000</span>
                  <span className="text-xs text-zinc-400">/ bulan</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Untuk konten kreator harian yang memproduksi video di TikTok, Reels, & Shorts.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-white/5">
                {[
                  'Semua fitur pada paket Free Trial',
                  'Proyek tidak terbatas',
                  'Radar Tren Real-Time tanpa batas',
                  'Konektor BYOK Video Vault aman',
                  'Format ekspor semua vendor model AI',
                  'Penyimpanan cloud database privat',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium text-zinc-100">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/pricing')}
              className="w-full"
            >
              Aktifkan Creator Pro
            </Button>
          </div>

          {/* Plan 3: Creator Yearly */}
          <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Tahunan (Hemat 30%)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Hemat Rp 209rb
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Rp 499.000</span>
                  <span className="text-xs text-zinc-500">/ tahun</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Solusi hemat bagi studio kreatif dan produser video independen.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-white/5">
                {[
                  'Semua fitur Creator Pro selama 1 tahun',
                  'Prioritas update prompt model video baru',
                  'Konsultasi alur kerja studio via WhatsApp',
                  'Garansi aktivasi langsung via QRIS/BCA',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/pricing')}
              className="w-full"
            >
              Pilih Paket Tahunan
            </Button>
          </div>
        </div>
      </section>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="border-t border-white/5 px-6 py-12 bg-[#06060a] text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-extrabold">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-bold text-zinc-300">TemporaForge AI</span>
              <p className="text-[11px] text-zinc-600">Short-form Video Prompt & Context Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <NavLink to="/studio" className="hover:text-zinc-300 transition-colors">Buka Studio</NavLink>
            <NavLink to="/pricing" className="hover:text-zinc-300 transition-colors">Langganan</NavLink>
            <NavLink to="/byok" className="hover:text-zinc-300 transition-colors">Konektor BYOK</NavLink>
            <a
              href="https://github.com/rzl89/contentfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] text-zinc-600">
            Â© {new Date().getFullYear()} TemporaForge AI. Built for Indonesian creators.
          </div>
        </div>
      </footer>
    </div>
  );
};

