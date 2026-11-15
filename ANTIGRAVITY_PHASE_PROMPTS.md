# PROMPT LANJUTAN ANTIGRAVITY — JALANKAN BERURUTAN

Gunakan setelah `ANTIGRAVITY_MASTER_PROMPT.md`. Jangan jalankan semua phase sekaligus bila perubahan terlalu besar. Pastikan hasil setiap phase lolos build/test sebelum melanjutkan.

## Phase A — Audit dan migrasi

Audit workspace dan HTML lama. Petakan semua fitur, event handler, state, API call, penyimpanan, lisensi, dan ekspor. Tulis `docs/LEGACY_AUDIT.md` dan rencana migrasi. Jangan ubah kode dulu sebelum peta dependensi selesai. Tandai semua pola berisiko: Gemini API key di localStorage, key dalam URL query, owner PIN di frontend, dan lisensi/kuota yang divalidasi di client.

## Phase B — Context Engine dan kategori

Integrasikan modul `src/context-engine/` dari kit. Pastikan 19 kategori tampil, dapat dicari, memiliki creative logic tersendiri, dan memiliki default profile Indonesia Natural. Buat UI pengaturan konteks dengan override per proyek. Tambahkan unit tests untuk resolver dan category lookup. Jangan membuat generator ide sebelum profile dan kategori lolos test.

## Phase C — Content Idea Studio

Bangun form kategori, subkategori, platform, durasi, gaya visual, konteks, bahasa, tren, target audiens, dan tema. Buat generator 5 atau 10 ide. Setiap ide harus memuat judul, hook 1–3 detik, premis, sinopsis, beats, payoff, durasi, arahan visual, catatan lokalisasi, status tren, dan verification notes. Ide dapat dipilih, disimpan, difavoritkan, dan dikembangkan. Jangan menyebut ide viral tanpa sumber tren terverifikasi.

## Phase D — Story Studio

Untuk ide terpilih, buat story treatment, Character Bible, World/Environment Bible, dan storyboard. Setiap scene punya location, action, props, dialogue, camera, lighting, continuity anchors, dan timing. Jumlah scene harus tepat sama dengan pilihan pengguna. Jika LLM memberi jumlah yang salah, lakukan repair terbatas dan jika tetap gagal tampilkan error QC, jangan mengklaim berhasil.

## Phase E — Prompt Compiler dan QC

Hasilkan image prompt dan video prompt dari objek scene yang sama. Default instruksi visual berbahasa Inggris, dialog/caption Indonesia. Tambahkan target Universal, Veo, Kling, Runway, dan Luma hanya berdasarkan metadata kemampuan yang memiliki sumber dokumentasi dan tanggal verifikasi. Jika tidak diketahui, gunakan unknown. Tambahkan QC rule-based dan AI review. Sediakan salin, edit, lock, regenerate scene, serta ekspor JSON/TXT.

## Phase F — Backend, auth, persistence

Integrasikan penyimpanan proyek yang tahan refresh dan sinkron. Terapkan autentikasi serta isolasi per pengguna/tenant. Bila memakai Supabase, buat migration dan RLS policy serta test bahwa user lain tidak dapat membaca proyek atau credential. Simpan project, ideas, story bible, scene, prompt versions, dan trend observations.

## Phase G — BYOK Video Connector

Kerjakan hanya setelah autentikasi backend dan KMS/secret vault tersedia. Hilangkan seluruh API key dari browser storage dan URL. Implementasikan penyimpanan terenkripsi server-side, mask, test connection, replace, revoke/delete, ownership check, rate limit, log redaction, provider endpoint allowlist, dan worker queue. Bila KMS belum dikonfigurasi, nonaktifkan BYOK dan jelaskan statusnya. Jangan pernah mengirim plaintext key kembali ke frontend.

## Phase H — Final QA

Jalankan typecheck, lint, unit tests, build, dan pemeriksaan manual responsivitas. Test 3 skenario: Stickman Indonesia natural, POV fantasy, dan Time Travel sejarah. Periksa tidak ada local props yang dipaksakan, lokasi tidak melompat, karakter konsisten, jumlah scene tepat, dialog tidak berubah, dan API key tidak ada di frontend/storage/export/log. Buat README setup lengkap dan daftar keterbatasan nyata.
