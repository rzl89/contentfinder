# Audit ringkas aplikasi TemporaForge lama

Sumber: `reference/temporaforge_legacy_reference.html` yang disertakan dalam kit.

## Struktur yang ditemukan

- Satu file HTML sekitar 2.296 baris dengan JavaScript vanilla.
- Tailwind CSS CDN, Lucide CDN, dan Google Fonts.
- UI dark/bento dengan aksen amber dan emerald.
- Modul eksplorasi sudut cerita, analisis DNA karakter melalui foto, pengaturan adegan, scene production deck, copy batch, dan ekspor JSON/TXT.
- State proyek dan lisensi disimpan di localStorage.
- Pemanggilan Gemini dilakukan langsung dari browser.

## Bagian yang masih bernilai

- Tampilan dark bento dan komponen kartu.
- Ide/sudut cerita sebelum proses storyboard.
- Character DNA dan foto referensi.
- Kontrol jumlah scene, durasi klip, rasio, dan bahasa dialog.
- Scene deck yang dapat diedit.
- Fungsi copy prompt per scene/batch dan ekspor JSON/TXT.

## Bagian yang perlu diganti

- Aplikasi terlalu terikat pada Time Travel POV.
- Prompt dibuat khusus untuk Google Flow/Veo, belum mendukung banyak kategori dan model.
- Belum ada context resolver umum, world bible, category-specific creative logic, atau Trend Radar berbasis sumber.
- Penyimpanan proyek masih bergantung pada localStorage.

## Temuan keamanan penting

- Gemini API key dibaca dari localStorage.
- Gemini API key disisipkan ke URL query `?key=...` pada request browser.
- Owner PIN dan generator/verifikasi lisensi berada di frontend.
- Kuota/free tier dapat dimodifikasi lewat browser; fingerprint browser bukan kontrol keamanan yang kuat.
- Foto referensi diubah menjadi Base64 dan ikut disimpan ke workspace browser.

## Arahan migrasi

Pertahankan fitur dan visual yang bernilai, tetapi ganti arsitektur rahasia, autentikasi, lisensi, dan persistence dengan backend. Jangan memindahkan secret lama ke sistem baru tanpa menghapus nilainya dari browser serta log.
