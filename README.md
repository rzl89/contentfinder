# Fixprom — AI Content Idea & Prompt Studio

> **Fixprom: AI Content Idea & Prompt Studio** untuk kreator video pendek. Temukan ide berbasis 19 kategori dan pola tren terverifikasi, kunci identitas karakter dan dunia cerita, lalu kompilasi image prompt dan video prompt siap pakai untuk berbagai model AI (Universal, Google Veo, Kling, Runway, Luma).

---

## 🌟 Fitur Utama

- **19 Kategori Konten dengan Creative Logic Mandiri**:
  - Storytelling & Entertainment: Perjalanan Waktu, Stickman Animation, POV Experience, Relatable Animated Stories, Microdrama, What If.
  - Visual & AI Creativity: AI Transformation, Miniature/Giant World, Fantasy & Mythology, Satisfying/Restoration, Scenic Visuals.
  - Education, Facts & Mystery: Educational Facts, Mystery & Horror.
  - Social & Short-form: Animal/Pet POV, Comedy & Meme, Social Life, Challenges, Food & Imagination, Product Story & AI Ad.
- **Context Engine Terintegrasi (Default: Indonesia Natural)**:
  - 9 Golden Rules of Context Authenticity: Menghindari stereotip buatan (warung/motor bebek sembarangan), tidak memaksa Jakarta-sentris, dan menjaga dialog bahasa Indonesia kasual natural.
  - Prompt teknis visual otomatis berbahasa Inggris untuk kompatibilitas maksimal dengan model AI dunia.
- **Story Studio, Character Bible & World Bible**:
  - Penguncian visual konsisten (wardrobe, fitur wajah, aksesori) antar-adegan.
- **Prompt Production Desk**:
  - Editor adegan per beat terstruktur: Ringkasan, Lokasi & Waktu, Kamera, Pencahayaan, Aksi Karakter, Dialog Kanonis, Continuity Anchors, Image Prompt, Video Prompt, Negative Prompt.
- **Model-Specific Prompt Compiler**:
  - Target Universal, Google Veo 2, Kling 1.5, Runway Gen-3, Luma Ray 2.
  - Parameter hanya disesuaikan jika vendor resmi memverifikasinya. Fitur yang belum diverifikasi ditandai `unknown`.
- **Quality Control (QC) Engine**:
  - Memeriksa kesesuaian jumlah adegan, penomoran urut, kelengkapan field, konsistensi waktu (deteksi kontradiksi siang vs malam), serta kelayakan dialog.
- **Trend Radar**:
  - Menampilkan observasi tren terverifikasi dari TikTok Creative Center, YouTube Culture & Trends, dan Meta Creator Report.
  - Bebas angka fiktif atau klaim viralitas halusinasi LLM.
- **BYOK (Bring Your Own Key) & Zero Video Markup**:
  - Fixprom adalah Prompt Studio, bukan penjual kredit video.
  - Desain keamanan Envelope Encryption (AES-256-GCM + Cloud KMS).
  - Jika KMS belum dikonfigurasi, sistem menampilkan status `Belum dikonfigurasi` dan mengunci operasi direct dispatch demi melindungi kunci Anda.

---

## 🚀 Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js versi 18+ (direkomendasikan v20+)
- npm atau pnpm

### 1. Clone & Masuk ke Direktori
```bash
cd c:\Users\Acer\contentfinder
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat yang ditampilkan di terminal (default: `http://localhost:5173`).

### 4. Menjalankan Automated Tests
```bash
npm test
```
Menjalankan 23 automated tests (Context Engine, Model Compiler, QC Engine, Envelope Encryption Vault, RLS Tenant Isolation).

### 5. Type-Check dan Production Build
```bash
npm run build
```
Menjalankan TypeScript build (`tsc -b`) dan Vite production bundle bundler.

---

## ⚙️ Environment Variables (Opsional untuk Backend / KMS)

Jika Anda ingin mengaktifkan Cloud KMS untuk BYOK Video Connector atau Supabase Backend, salin file contoh ke `.env`:

```env
# Cloud KMS Master Secret (Minimal 32 karakter untuk AES-256-GCM Envelope Encryption)
KMS_MASTER_KEY=your-32-byte-secret-master-key-here

# Supabase Auth & Database (Opsional untuk sinkronisasi cloud)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

*Catatan: Tanpa variabel di atas, aplikasi tetap berjalan 100% penuh sebagai Studio Prompt lokal dengan perlindungan keamanan default.*

---

## 🗄️ Database & Row Level Security (RLS)

Skema database PostgreSQL dan kebijakan Row Level Security tersedia di:
- `server/db/schema.sql` — Tabel `profiles`, `projects`, `ideas`, `characters`, `world_bibles`, `scenes`, `provider_credentials`, `video_generation_jobs`.
- `server/db/rls_policies.sql` — Kebijakan RLS isolasi tenant (User A tidak dapat mengakses project atau credentials User B).

---

## 📁 Struktur Proyek

```
contentfinder/
├── index.html                 # Entry point HTML dengan tema gelap obsidian
├── vite.config.ts             # Konfigurasi Vite & Tailwind CSS v4
├── tailwind.config.ts         # Design tokens: obsidian, card, amber, emerald
├── src/
│   ├── types/                 # Definisi tipe TypeScript lengkap
│   ├── context-engine/        # 19 Kategori, Default Profile, Context Resolver
│   │   ├── categories.ts      # 19 kategori dengan creative logic mandiri
│   │   ├── default-profile.ts # Profil Indonesia Natural & 9 Golden Rules
│   │   └── context-resolver.ts# Algoritma resolusi override & validator
│   ├── stores/                # Zustand State Stores
│   │   ├── project-store.ts   # State project, characters, world, scenes, QC
│   │   ├── trend-store.ts     # Data observasi tren tervalidasi
│   │   └── byok-store.ts      # State provider status & masked keys
│   ├── lib/
│   │   ├── model-catalog.ts   # Katalog kapabilitas model terverifikasi
│   │   ├── qc-engine.ts       # Mesin Quality Control (PASS/REVIEW/FAIL)
│   │   ├── prompt-compiler.ts # Kompilasi prompt teknis & ekspor Markdown/JSON
│   │   └── ai-generator.ts    # Generator ide, storyboard, dan bible
│   ├── components/
│   │   ├── ui/                # BentoTile, Button, Input, Select, Badge, Modal, Toast
│   │   └── layout/            # Sidebar, Header, Responsive Drawer, AppLayout
│   ├── pages/
│   │   ├── idea-studio-page.tsx   # Studio Eksplorasi 19 Kategori Ide
│   │   ├── prompt-desk-page.tsx   # Production Desk & Editor Adegan
│   │   ├── trend-radar-page.tsx   # Radar Tren Terverifikasi
│   │   ├── byok-page.tsx          # Konektor Video BYOK & Antrean Job
│   │   ├── projects-page.tsx      # Manajemen Proyek
│   │   └── settings-page.tsx      # Pengaturan Konteks & 9 Golden Rules
│   └── App.tsx                # Routing React Router v7
└── server/
    ├── security/              # Envelope Encryption AES-256-GCM & Log Redaction
    └── db/                    # Skema PostgreSQL & RLS Policies
```

---

## 📄 Lisensi & Hak Cipta

© 2026 TemporaForge AI. Hak cipta dilindungi undang-undang.
