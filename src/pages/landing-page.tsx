import React, { useState, useEffect } from 'react';
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
  Eye,
  UserCircle2,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useAdminStore } from '@/stores/admin-store';
import { useLanguageStore } from '@/stores/language-store';
import { CONTENT_CATEGORIES, getLocalizedCategories } from '@/context-engine';

interface LandingPageProps {
  scrollToSection?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ scrollToSection }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchPricingConfig } = useAdminStore();
  const { proPriceMonthly = 59000, proPriceYearly = 499000 } = useAdminStore((s) => s.settings);

  // Dynamic pricing calculations
  const monthlyEquivalent = Math.round(proPriceYearly / 12);
  const yearlySavings = (proPriceMonthly * 12) - proPriceYearly;
  const discountPct = Math.max(1, Math.round((yearlySavings / (proPriceMonthly * 12)) * 100));
  const { language, setLanguage, t } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync pricing config on mount
  useEffect(() => {
    void fetchPricingConfig();
  }, [fetchPricingConfig]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (scrollToSection) {
      const timer = setTimeout(() => {
        scrollTo(scrollToSection);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [scrollToSection]);

  // Interactive Demo state: comparison between standard AI slop and Fixprom prompt
  const [activeTab, setActiveTab] = useState<'fixprom' | 'generic'>('fixprom');
  const [copied, setCopied] = useState(false);

  const samplePrompt = {
    fixprom: {
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
      model: t('AI Prompt Biasa (Generic Slop)', 'Generic AI Prompt (Slop)'),
      camera: t('Tidak terdefinisi (kamera acak)', 'Undefined (random camera angle)'),
      lighting: 'Hyperrealistic, 8k, octane render, unreal engine 5, masterpiece, glowing light',
      subject:
        'A handsome Indonesian man in futuristic Jakarta street, highly detailed face, walking, trending on artstation, cinematic beauty, dramatic atmosphere.',
      negative: 'bad quality, worst quality',
      audio: t('Tidak ada arahan audio atau lip-sync.', 'No audio or lip-sync direction.'),
    },
  };

  const handleCopyPrompt = () => {
    const text =
      activeTab === 'fixprom'
        ? `[Camera: ${samplePrompt.fixprom.camera}] Subject: ${samplePrompt.fixprom.subject} Lighting: ${samplePrompt.fixprom.lighting}. Negative: ${samplePrompt.fixprom.negative}`
        : samplePrompt.generic.subject;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#06060a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-amber-500/30 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <img src="/fixprom-icon.png" alt="Fixprom" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Fixprom</span>
              </span>
              <p className="text-[10px] text-zinc-500 leading-none">
                {t('Studio Ide & Prompt Video AI', 'AI Video Idea & Prompt Studio')}
              </p>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => scrollTo('demo')}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {t('Contoh Prompt', 'Prompt Demo')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('fitur')}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {t('Fitur Studio', 'Studio Features')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('kategori')}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {t('31 Kategori', '31 Categories')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('harga')}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {t('Harga', 'Pricing')}
            </button>
          </nav>

          <div className="flex items-center gap-3">
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

            {user ? (
              /* Logged in: show user badge + go to studio */
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400">
                  <UserCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/studio')}
                  icon={<ArrowRight className="w-3.5 h-3.5 text-black" />}
                >
                  {t('Buka Studio', 'Open Studio')}
                </Button>
              </>
            ) : (
              /* Guest: show login + signup */
              <>
                <NavLink
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t('Masuk', 'Sign In')}
                </NavLink>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  icon={<ArrowRight className="w-3.5 h-3.5 text-black" />}
                >
                  {t('Daftar Gratis', 'Get Started')}
                </Button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-2 animate-fade-in">
            <button
              type="button"
              onClick={() => scrollTo('demo')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 transition-colors"
            >
              {t('Contoh Prompt', 'Prompt Demo')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('fitur')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 transition-colors"
            >
              {t('Fitur Studio', 'Studio Features')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('kategori')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 transition-colors"
            >
              {t('31 Kategori', '31 Categories')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('harga')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 transition-colors"
            >
              {t('Harga', 'Pricing')}
            </button>
            {!user && (
              <NavLink
                to="/login"
                className="block px-3 py-2 rounded-lg text-xs text-amber-400 hover:bg-white/5 transition-colors"
              >
                {t('Masuk ke Akun', 'Sign In to Account')}
              </NavLink>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{t('Context Engine & Multi-Model Video Prompt Compiler', 'Context Engine & Multi-Model Video Prompt Compiler')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            {t('Ide Konten & Prompt Video AI yang', 'AI Video Content Ideas & Prompts')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              {t('Siap Masuk Studio Produksi', 'Ready for Production')}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t(
              'Hentikan prompt video acak yang menghasilkan visual plastik dan karakter bermutasi. Dari premis cerita lokal yang autentik hingga storyboard 4 adegan dengan parameter optik kamera untuk Kling 1.5, Google Veo 2, dan Runway Gen-3.',
              'Stop wasting credits on generic AI slop that distorts anatomy and character identity. Move from authentic narrative hooks to 4-scene storyboards with precise camera optics for Kling 1.5/2.0, Google Veo 2, and Runway Gen-3.'
            )}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(user ? '/studio' : '/signup')}
              icon={<ArrowRight className="w-4 h-4 text-black" />}
              className="w-full sm:w-auto"
            >
              {user
                ? t('Buka Studio', 'Open Studio')
                : t('Mulai Gratis - Tanpa Kartu Kredit', 'Start Free - No Credit Card Required')}
            </Button>

            <button
              type="button"
              onClick={() => scrollTo('demo')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              {t('Lihat Perbandingan Prompt', 'View Prompt Comparison')}
            </button>
          </div>

          {/* Social proof metric chips */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">21</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {t('Kategori Konten Pendek', 'Short-Form Categories')}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">6+ Model</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {t('Compiler Spesifik Vendor', 'Model-Specific Compilers')}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-emerald-400">AES-256</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {t('Keamanan Vault BYOK', 'Client Vault Security')}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-xl font-bold font-mono text-amber-400">0% Fake</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {t('Nol Angka Tren Palsu', 'Zero Fake Trend Metrics')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="px-6 py-16 bg-[#0b0b0e] border-y border-white/5">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t('Perbandingan Kualitas Prompt Video', 'Prompt Quality Comparison')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              {t(
                'Perhatikan perbedaan antara prompt AI generik yang boros token vs prompt terstruktur Fixprom yang dipahami engine AI video.',
                'Compare generic AI prompts that waste tokens against Fixprom structured prompts engineered for generative video engines.'
              )}
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('fixprom')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'fixprom'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('Prompt Fixprom (Director-Grade)', 'Fixprom Prompt (Director-Grade)')}
              </button>
              <button
                onClick={() => setActiveTab('generic')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'generic'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t('Prompt AI Biasa (Slop Klise)', 'Generic AI Prompt (Slop)')}
              </button>
            </div>
          </div>

          {/* Prompt card */}
          <div className="rounded-2xl bg-[#111115] border border-white/10 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    activeTab === 'fixprom'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {samplePrompt[activeTab].model}
                </span>
                <span className="text-xs text-zinc-500">
                  {t('Scene 1 / Detik 0-3 Hook', 'Scene 1 / 0-3s Hook')}
                </span>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-black/40 border border-white/5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('Tersalin', 'Copied') : t('Salin Prompt', 'Copy Prompt')}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                  {t('Gerakan Kamera & Lensa', 'Camera Movement & Lens Optics')}
                </span>
                <p className="p-3 rounded-lg bg-black/40 border border-white/5 text-zinc-200">
                  {samplePrompt[activeTab].camera}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                  {t('Prompt Video (Subject & Kinematika Fisik)', 'Video Prompt (Subject & Physical Kinematics)')}
                </span>
                <p className="p-3 rounded-lg bg-black/40 border border-white/5 text-amber-200/90 leading-relaxed">
                  {samplePrompt[activeTab].subject}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                    {t('Negative Prompt (Anti-Slop Filter)', 'Negative Prompt (Anti-Slop Filter)')}
                  </span>
                  <p className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-red-300/80 text-[11px]">
                    {samplePrompt[activeTab].negative}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px] mb-1">
                    {t('Instruksi Audio & Lip-Sync', 'Audio & Lip-Sync Direction')}
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

      {/* Feature Bento Grid */}
      <section id="fitur" className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t('Arsitektur Studio Konten yang Bekerja', 'Production Studio Architecture')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            {t(
              'Empat pilar yang menghubungkan kreativitas cerita Anda ke generator video AI kelas industri.',
              'Four core pillars connecting creative story concepts to industry-grade AI video generators.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tile 1: Context Engine */}
          <div className="md:col-span-7 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('Context Engine & Narasi Autentik', 'Context Engine & Narrative Grounding')}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t(
                  'Menghilangkan stereotip malas pada AI. Dialog dapat dipilih dalam Bahasa Indonesia santai, Jawa, Sunda, atau Inggris. Latar cerita dirancang natural tanpa memaksakan klise visual.',
                  'Eliminate generic AI cliches. Configure natural cultural dialog, grounded character personas, and believable environments without forced stereotypes.'
                )}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>{t('Preset Tersedia:', 'Available Presets:')}</span>
              <span className="text-amber-400">Indonesia Natural, Urban Modern, Nusantara Mystery</span>
            </div>
          </div>

          {/* Tile 2: Vendor Model Compiler */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('Multi-Model Syntax Compiler', 'Multi-Model Syntax Compiler')}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t(
                  'Tiap generator video punya format berbeda. Fixprom mengonversi storyboard Anda ke format perintah kamera Kling, Veo 2, Sora, Hailuo, Runway Gen-3, atau Luma Ray 2 secara otomatis.',
                  'Every generative video engine interprets instructions uniquely. Fixprom compiles your storyboard into exact syntax for Kling, Veo 2, Sora, Hailuo, Runway Gen-3, and Luma Ray 2.'
                )}
              </p>
            </div>
          </div>

          {/* Tile 3: Consistency Bibles */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('Character & World Bible Consistency', 'Character & World Continuity')}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t(
                  'Karakter mengunci 3 anchor fisik kanonis (warna pakaian, jam tangan, gaya rambut) agar bentuk wajah dan pakaian tidak bermutasi saat berganti adegan di AI video.',
                  'Enforces 3 canonical continuity anchors (outfit, hair, color temperature) preventing character drift across sequential video beats.'
                )}
              </p>
            </div>
          </div>

          {/* Tile 4: BYOK Security */}
          <div className="md:col-span-7 p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('Client-side BYOK Security (AES-256-GCM)', 'Client-Side BYOK Security (AES-256-GCM)')}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t(
                  'Gunakan API key AI milik Anda sendiri. Kredensial dienkripsi di peramban Anda melalui Web Crypto API. Server kami menerapkan zero-knowledge architecture: key Anda tidak pernah singgah di database kami.',
                  'Bring your own AI provider keys. Credentials are encrypted client-side using AES-256-GCM via the Web Cryptography API. Zero-knowledge architecture guarantees keys never touch Fixprom databases.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('Zero-knowledge client vault & ephemeral purge', 'Zero-knowledge client vault & ephemeral purge')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 21 Categories Showcase */}
      <section id="kategori" className="px-6 py-16 bg-[#0b0b0e] border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t('21 Format Konten Berdaya Retensi Tinggi', '21 High-Retention Content Formats')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {t(
                  'Kategori terkurasi dari format video pendek dengan performa tervalidasi di TikTok, Reels, dan Shorts.',
                  'Curated short-form categories validated for audience retention across TikTok, Reels, and YouTube Shorts.'
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/studio')}
              icon={<ArrowRight className="w-3.5 h-3.5 text-zinc-400" />}
            >
              {t('Buka Semua di Studio', 'View All in Studio')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
            {getLocalizedCategories(language).map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-[#111115] border border-white/5 hover:border-amber-500/30 hover:bg-[#14141c] transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => navigate('/studio', { state: { categoryId: cat.id } })}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {cat.group ? cat.group.split(' ')[0] : 'General'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{cat.suggestedDuration?.[0] || '15-60s'}</span>
                  <span className="group-hover:translate-x-1 transition-transform text-amber-400">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t('Pilihan Paket & Langganan', 'Flexible Plans & Pricing')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            {t(
              'Mulai gratis dengan 20 kredit AI trial. Tingkatkan kapan saja untuk akses penuh ke 21 kategori dan BYOK direct connector.',
              'Start free with 20 AI trial credits. Upgrade anytime for unrestricted access to all 21 categories and BYOK connectors.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Free Trial */}
          <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  {t('Trial Eksplorasi', 'Free Exploration')}
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Rp 0</span>
                  <span className="text-xs text-zinc-500">/ 24 {t('jam', 'hours')}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {t(
                    'Cocok untuk menguji kualitas prompt dan melihat perbandingan format video AI.',
                    'Perfect for testing prompt compilation quality and previewing model-specific outputs.'
                  )}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-400 pt-2 border-t border-white/5">
                {[
                  t('Alokasi 20 Kredit AI untuk eksplorasi awal', '20 AI Credits allocated for trial exploration'),
                  t('3 Kategori Konten Unggulan (Time Travel, Stickman, POV)', '3 Featured Categories (Time Travel, Stickman, POV)'),
                  t('Generator ide hook 1-3 detik & story beats', '1-3s Hook & narrative beat generator'),
                  t('Akses Prompt Production Desk & Story Studio', 'Access to Prompt Production Desk & Story Studio'),
                  t('Ekspor storyboard Markdown & JSON', 'Export storyboard in Markdown & JSON'),
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
              {t('Mulai Trial Sekarang', 'Start Free Trial')}
            </Button>
          </div>

          {/* Plan 2: Creator Pro (Featured) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#18181f] to-[#111115] border-2 border-amber-500/40 space-y-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
              {t('Pilihan Kreator', 'Creator Choice')}
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Creator Pro
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">
                    Rp {proPriceMonthly.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-zinc-400">/ {t('bulan', 'month')}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {t(
                    'Untuk konten kreator harian yang memproduksi video di TikTok, Reels, & Shorts.',
                    'For daily short-form creators producing across TikTok, Reels, and YouTube Shorts.'
                  )}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-white/5">
                {[
                  t('350 Kredit AI / bulan (~70 storyboard video lengkap)', '350 AI Credits / month (~70 complete video storyboards)'),
                  t('Semua 31 Kategori Konten Terbuka Penuh', 'All 31 Short-Form Categories Unlocked'),
                  t('Regenerasi adegan & storyboard kapan saja', 'Unlimited scene & storyboard regeneration'),
                  t('Opsi Top-Up Booster mulai Rp 20.000 (tidak hangus)', 'Booster top-up packs available (credits never expire)'),
                  t('Konektor BYOK Video Vault aman (Kling, Veo 2, Runway)', 'Secure BYOK Video Vault (Kling, Veo 2, Runway, Hailuo)'),
                  t('Format ekspor semua vendor model AI', 'Full export support for all AI video vendors'),
                  t('Penyimpanan cloud database privat Supabase', 'Private cloud sync via Supabase PostgreSQL'),
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
              {t('Aktifkan Creator Pro', 'Activate Creator Pro')}
            </Button>
          </div>

          {/* Plan 3: Creator Yearly */}
          <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    {t(`Tahunan (Hemat ${discountPct}%)`, `Yearly Pass (Save ${discountPct}%)`)}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {yearlySavings > 0
                      ? t(`Hemat Rp ${Math.round(yearlySavings / 1000)}rb`, `Save ~${discountPct}%`)
                      : t(`Hemat ${discountPct}%`, `Save ~${discountPct}%`)}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">
                    Rp {proPriceYearly.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-zinc-500">/ {t('tahun', 'year')}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {t(
                    'Solusi hemat bagi studio kreatif dan produser video independen.',
                    'Best value for creative agencies and independent video production teams.'
                  )}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-white/5">
                {[
                  t('Semua fitur Creator Pro selama 1 tahun penuh', 'All Creator Pro features for a full calendar year'),
                  t(
                    `Hemat ${discountPct}% (Setara ~Rp ${monthlyEquivalent.toLocaleString('id-ID')} / bulan)`,
                    `Save ${discountPct}% (~Rp ${monthlyEquivalent.toLocaleString('id-ID')} effective monthly rate)`
                  ),
                  t('Prioritas update prompt model video baru', 'Priority updates for newly released AI video models'),
                  t('Garansi aktivasi instan via QRIS, BCA, Mandiri', 'Instant activation via QRIS, BCA, and Mandiri'),
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/pricing')}
              className="w-full"
            >
              {t('Pilih Paket Tahunan', 'Choose Yearly Pass')}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('Siap Menghasilkan Video AI Berkualitas Tinggi?', 'Ready to Produce High-Retention AI Videos?')}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          {t(
            'Mulai susun ide cerita, kunci karakter konsisten, dan kompilasi prompt siap pakai sekarang.',
            'Develop narrative hooks, lock visual character consistency, and compile production-ready prompts now.'
          )}
        </p>
        <div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(user ? '/studio' : '/signup')}
            icon={<ArrowRight className="w-4 h-4 text-black" />}
          >
            {user ? t('Buka Studio Produksi', 'Open Production Studio') : t('Mulai Gratis Sekarang', 'Get Started Free Now')}
          </Button>
        </div>
      </section>

      {/* Footer (Clean, Zero GitHub Link) */}
      <footer className="border-t border-white/5 px-6 py-12 bg-[#06060a] text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30">
              <img src="/fixprom-icon.png" alt="Fixprom" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-zinc-300">Fixprom</span>
              <p className="text-[11px] text-zinc-600">
                {t('Studio Ide & Prompt Video Pendek AI', 'Short-form AI Video Prompt & Context Studio')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <NavLink to={user ? '/studio' : '/signup'} className="hover:text-zinc-300 transition-colors">
              {t('Buka Studio', 'Open Studio')}
            </NavLink>
            <NavLink to="/pricing" className="hover:text-zinc-300 transition-colors">
              {t('Langganan & Paket', 'Plans & Pricing')}
            </NavLink>
            <NavLink to={user ? '/byok' : '/login'} className="hover:text-zinc-300 transition-colors">
              {t('Konektor BYOK', 'BYOK Connect')}
            </NavLink>
          </div>

          <div className="text-[11px] text-zinc-600">
            © 2026 Fixprom. {t('Dibuat untuk kreator video pendek', 'Engineered for short-form video creators')}
          </div>
        </div>
      </footer>
    </div>
  );
};
