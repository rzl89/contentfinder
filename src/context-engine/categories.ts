import type { ContentCategory } from '@/types';

/**
 * Fixprom — Full 19-Category Content Catalog
 *
 * Every category carries its own creative framework, hook style,
 * visual guidance, and (where relevant) Indonesia-specific context.
 */

export const CONTENT_CATEGORIES: ContentCategory[] = [
  // ─────────────────────────────────────────────────────────────
  //  GROUP 1 — Storytelling & Entertainment
  // ─────────────────────────────────────────────────────────────
  {
    id: 'time-travel',
    name: 'Perjalanan Waktu & POV Sejarah',
    description:
      'Konten yang membawa penonton ke masa lalu atau masa depan, menampilkan perspektif orang pertama dari era sejarah atau peristiwa penting.',
    group: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'time-travel-historical',
        name: 'Sejarah & Peradaban',
        description: 'Menjelajahi momen bersejarah dari sudut pandang orang pertama',
      },
      {
        id: 'time-travel-future',
        name: 'Masa Depan & Sci-Fi',
        description: 'Membayangkan kehidupan di masa depan dengan teknologi canggih',
      },
      {
        id: 'time-travel-nusantara',
        name: 'Nusantara Tempo Dulu',
        description: 'Merasakan kehidupan di kerajaan-kerajaan Nusantara kuno',
      },
    ],
    creativeFramework:
      'TEMPORAL CONTRAST — Struktur cerita dibangun di atas kontras antara dua era. ' +
      'Mulai di satu titik waktu, lalu "lompat" ke titik lain untuk menciptakan kejutan, ironi, atau refleksi. ' +
      'Gunakan detail sensorik era tersebut (pakaian, suara, bau) agar penonton "merasakan" perpindahan waktu. ' +
      'Akhiri dengan insight yang menghubungkan masa lalu & masa kini.',
    hookStyle:
      'Buka dengan visual yang langsung menunjukkan "ini bukan zaman sekarang" — pakaian kuno, arsitektur historis, atau teks overlay tahun (misal "Jakarta, 1942"). Efek transisi waktu dalam 1 detik pertama.',
    visualGuidance:
      'Gunakan color grading berbeda untuk setiap era: sepia/warm untuk masa lalu, cool-toned untuk masa depan. Transisi waktu menggunakan efek distorsi, flash, atau morphing. Detail kostum & setting harus akurat per era.',
    indonesiaGuidance:
      'Prioritaskan momen sejarah Indonesia: Majapahit, Sriwijaya, kemerdekaan, era reformasi. Gunakan referensi arsitektur lokal (candi, rumah adat). Sensitivitas terhadap peristiwa sejarah yang masih sensitif.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'POV: Kamu pedagang rempah di Pelabuhan Sunda Kelapa tahun 1527, tiba-tiba terlempar ke Jakarta 2024',
      'Seorang anak kecil menemukan cermin ajaib yang menunjukkan Indonesia tahun 2100',
      'Perbandingan sehari di kehidupan pelajar era Majapahit vs pelajar Gen-Z sekarang',
    ],
    icon: 'Clock',
  },

  {
    id: 'stickman',
    name: 'Animasi Stickman',
    description:
      'Cerita visual menggunakan karakter stickman sederhana yang menyampaikan pesan kuat lewat gerakan, ekspresi, dan situasi lucu atau dramatis.',
    group: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'stickman-comedy',
        name: 'Stickman Komedi',
        description: 'Situasi absurd dan lucu dengan karakter stickman',
      },
      {
        id: 'stickman-life-lesson',
        name: 'Stickman Pelajaran Hidup',
        description: 'Cerita inspiratif atau moral disampaikan lewat stickman',
      },
      {
        id: 'stickman-action',
        name: 'Stickman Aksi & Pertarungan',
        description: 'Adegan aksi epik dengan animasi stickman dinamis',
      },
    ],
    creativeFramework:
      'MINIMALIST EXPRESSIONISM — Kekuatan ada pada kesederhanaan. ' +
      'Cerita hanya mengandalkan gesture, pose, dan timing karena karakter tidak punya detail wajah. ' +
      'Gunakan prinsip "show, don\'t tell" secara literal: setiap beat harus bisa dipahami tanpa dialog. ' +
      'Komedi muncul dari physical comedy dan situasi absurd; drama muncul dari body language dan konteks.',
    hookStyle:
      'Langsung masuk ke aksi atau situasi yang menarik perhatian — stickman jatuh, berlari, atau menghadapi masalah. Tidak ada buildup panjang; visual pertama sudah bergerak.',
    visualGuidance:
      'Background putih atau solid color sederhana. Garis hitam tebal untuk karakter. Gunakan efek warna hanya untuk emphasis (merah untuk bahaya, biru untuk sedih). Animasi harus smooth dengan timing komedi yang tepat.',
    indonesiaGuidance: undefined,
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Stickman mencoba semua cara untuk mendapatkan WiFi gratis — semakin absurd tiap percobaan',
      'Pertarungan epik dua stickman yang ternyata hanya berebut charger HP terakhir',
      'Stickman yang selalu gagal tapi pantang menyerah, akhirnya berhasil di momen terakhir',
    ],
    icon: 'Pencil',
  },

  {
    id: 'pov-experience',
    name: 'Pengalaman POV',
    description:
      'Konten immersive yang menempatkan penonton langsung di perspektif orang pertama — seolah-olah mereka yang mengalami situasi tersebut.',
    group: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'pov-daily-life',
        name: 'POV Kehidupan Sehari-hari',
        description: 'Pengalaman umum yang relatable dari sudut pandang orang pertama',
      },
      {
        id: 'pov-profession',
        name: 'POV Profesi & Pekerjaan',
        description: 'Merasakan sehari menjadi profesi tertentu',
      },
      {
        id: 'pov-extreme',
        name: 'POV Situasi Ekstrem',
        description: 'Pengalaman menegangkan atau luar biasa dari perspektif pertama',
      },
      {
        id: 'pov-fantasy',
        name: 'POV Fantasi & Imajinatif',
        description: 'Pengalaman mustahil yang hanya bisa terjadi dalam imajinasi',
      },
    ],
    creativeFramework:
      'IMMERSIVE FIRST-PERSON — Semua elemen dirancang agar penonton merasa "ini terjadi padaku". ' +
      'Kamera selalu dari eye-level atau hand-held POV. Narasi menggunakan "kamu" untuk memperkuat identifikasi. ' +
      'Bangun tension lewat apa yang penonton "lihat" dan "dengar" secara bertahap. ' +
      'Kunci: penonton harus bereaksi secara emosional seolah mereka ada di sana.',
    hookStyle:
      'Teks overlay "POV:" diikuti skenario spesifik dan menarik. Frame pertama langsung dari sudut pandang orang pertama — tangan terlihat, atau environment dari eye-level.',
    visualGuidance:
      'Kamera selalu first-person: eye-level, slight shake untuk realisme. Tangan atau bagian tubuh terlihat di frame. Depth of field dangkal untuk fokus pada apa yang "dilihat". Sound design krusial — suara ambient harus mendukung immersion.',
    indonesiaGuidance:
      'Gunakan setting Indonesia yang familiar: angkot, pasar tradisional, sekolah, kampung. POV profesi lokal (tukang bakso, ojol, guru honorer) sangat relatable.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'POV: Kamu driver ojol yang ternyata penumpangnya mantan yang belum move on',
      'POV: Hari pertama kerja di perusahaan besar, tapi kamu salah masuk ruangan rapat direksi',
      'POV: Terbangun di tahun 3024 dan semua orang berbicara bahasa yang tidak kamu mengerti',
    ],
    icon: 'Eye',
  },

  {
    id: 'relatable-animated',
    name: 'Cerita Animasi Relatable',
    description:
      'Cerita animasi pendek yang menggambarkan situasi sehari-hari yang sangat relatable — momen "itu gue banget!" yang memicu engagement tinggi.',
    group: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'relatable-school',
        name: 'Kehidupan Sekolah & Kampus',
        description: 'Momen-momen relatable dari dunia pendidikan',
      },
      {
        id: 'relatable-family',
        name: 'Keluarga & Rumah Tangga',
        description: 'Dinamika keluarga Indonesia yang bikin angguk-angguk',
      },
      {
        id: 'relatable-social',
        name: 'Pergaulan & Sosial Media',
        description: 'Kebiasaan sosial dan interaksi digital yang relatable',
      },
    ],
    creativeFramework:
      'MIRROR COMEDY — Cerita berfungsi sebagai "cermin" pengalaman penonton. ' +
      'Identifikasi satu micro-moment spesifik yang dialami banyak orang tapi jarang dibicarakan. ' +
      'Exaggerate reaksi karakter untuk efek komedi, tapi situasinya harus tetap realistis. ' +
      'Punchline terbaik adalah saat penonton berpikir "kok tahu sih?!". ' +
      'Gunakan setup-payoff yang cepat karena audiensnya sudah tahu konteksnya.',
    hookStyle:
      'Buka dengan situasi yang langsung dikenali penonton — teks "Kalau kamu pernah…" atau visual yang menunjukkan momen spesifik. Ekspresi karakter di frame pertama harus memicu rasa penasaran.',
    visualGuidance:
      'Gaya animasi yang hangat dan friendly — warna cerah, karakter dengan ekspresi berlebihan. Chibi atau semi-realistic style. Panel komik bisa digunakan untuk mempercepat storytelling. Ekspresi wajah adalah kunci utama.',
    indonesiaGuidance:
      'Angkat budaya "anak kos", kebiasaan keluarga Indonesia (ditanya kapan nikah, makan nasi harus pakai lauk), dan kebiasaan digital (scroll TikTok sampai subuh, ghosting di chat).',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Saat kamu bilang "5 menit lagi" ke ibu tapi sudah lewat 2 jam',
      'Perjuangan anak kos masak Indomie dengan peralatan seadanya tapi hasilnya level chef',
      'Reaksi beda-beda saat grup WA keluarga mulai share berita hoax',
    ],
    icon: 'Smile',
  },

  {
    id: 'microdrama',
    name: 'Microdrama & Mini Seri',
    description:
      'Drama pendek bersambung atau standalone dengan plot twist, emosi kuat, dan cliffhanger yang membuat penonton ingin tahu kelanjutannya.',
    group: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'microdrama-romance',
        name: 'Drama Romansa',
        description: 'Kisah cinta pendek dengan twist emosional',
      },
      {
        id: 'microdrama-thriller',
        name: 'Drama Thriller & Misteri',
        description: 'Cerita tegang pendek dengan plot twist mengejutkan',
      },
      {
        id: 'microdrama-family',
        name: 'Drama Keluarga',
        description: 'Cerita emosional tentang ikatan keluarga dan pengorbanan',
      },
      {
        id: 'microdrama-social',
        name: 'Drama Sosial',
        description: 'Cerita yang mengangkat isu sosial dengan cara yang menyentuh',
      },
    ],
    creativeFramework:
      'COMPRESSED DRAMA ARC — Gunakan struktur tiga babak yang dipadatkan: ' +
      '(1) Setup cepat dalam 3-5 detik — karakter + konflik langsung terlihat. ' +
      '(2) Escalation — konflik meningkat dengan satu atau dua beat. ' +
      '(3) Twist/Resolution — akhir yang tidak terduga atau emosional. ' +
      'Setiap detik harus memajukan plot. Tidak ada filler. ' +
      'Untuk seri: akhiri setiap episode dengan cliffhanger yang membuat penonton HARUS lihat episode berikutnya.',
    hookStyle:
      'Mulai dari tengah konflik — karakter sedang menangis, berteriak, atau situasi sudah tegang. Jangan mulai dari "suatu hari…". Overlay "Part 1" atau "Episode X" untuk menandakan seri.',
    visualGuidance:
      'Cinematic framing: close-up untuk emosi, wide shot untuk establishing. Lighting dramatis — kontras tinggi untuk thriller, warm untuk romansa. Gunakan slow-motion di momen puncak emosi. Music scoring sangat penting.',
    indonesiaGuidance:
      'Setting sinetron-style tapi dengan kualitas sinematik. Konflik yang resonan di Indonesia: perjodohan, perbedaan kelas sosial, anak rantau, dan dilema antara karir vs keluarga.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Seorang ibu menjual perhiasannya diam-diam untuk biayai kuliah anaknya — twist: anaknya sudah tahu sejak awal',
      'Dua orang bertemu di kereta, jatuh cinta dalam 3 menit — tapi salah satu dari mereka menyimpan rahasia besar',
      'Mini seri 5 episode: Seorang driver ojol yang ternyata mantan CEO perusahaan besar',
    ],
    icon: 'Film',
  },

  {
    id: 'what-if',
    name: 'Bagaimana Jika & Realitas Alternatif',
    description:
      'Konten spekulatif yang mengeksplorasi skenario "bagaimana jika" — dari yang mungkin terjadi hingga yang benar-benar fantastis.',
    group: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'what-if-history',
        name: 'Sejarah Alternatif',
        description: 'Bagaimana jika peristiwa sejarah berbeda hasilnya?',
      },
      {
        id: 'what-if-science',
        name: 'Sains Spekulatif',
        description: 'Bagaimana jika hukum fisika atau alam berubah?',
      },
      {
        id: 'what-if-society',
        name: 'Masyarakat Alternatif',
        description: 'Bagaimana jika struktur sosial atau aturan dunia berbeda?',
      },
    ],
    creativeFramework:
      'PREMISE ESCALATION — Mulai dengan satu premis "bagaimana jika" yang jelas, ' +
      'lalu escalate konsekuensinya secara logis tapi mengejutkan. ' +
      'Setiap beat menunjukkan dampak yang semakin besar dari premis awal. ' +
      'Penonton harus berpikir "oh iya, kalau begitu berarti…" di setiap tahap. ' +
      'Akhiri dengan konsekuensi terbesar yang belum terpikirkan penonton.',
    hookStyle:
      'Teks bold "BAGAIMANA JIKA…" diikuti premis yang langsung memicu rasa penasaran. Visual pertama menunjukkan dunia "normal" yang akan segera berubah.',
    visualGuidance:
      'Split-screen atau before/after untuk menunjukkan perbedaan realitas. Efek visual surreal untuk menunjukkan perubahan dunia. World-building visual yang detail untuk membuat realitas alternatif terasa nyata.',
    indonesiaGuidance:
      'Premis yang relevan untuk Indonesia: "Bagaimana jika Majapahit tidak runtuh?", "Bagaimana jika Indonesia punya 4 musim?", "Bagaimana jika semua orang Indonesia bisa teleportasi?"',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Bagaimana jika gravitasi bumi tiba-tiba menjadi setengahnya — apa yang terjadi pada kehidupan sehari-hari?',
      'Bagaimana jika Indonesia tidak pernah dijajah — seperti apa kota-kota kita sekarang?',
      'Bagaimana jika setiap orang hanya bisa berbohong sekali seumur hidup?',
    ],
    icon: 'HelpCircle',
  },

  // ─────────────────────────────────────────────────────────────
  //  GROUP 2 — Visual & AI Creativity
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ai-transformation',
    name: 'Transformasi AI & Before-After',
    description:
      'Konten yang menampilkan transformasi visual menggunakan AI — dari sebelum ke sesudah, perubahan wajah, aging, glow-up, atau transformasi objek.',
    group: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'ai-transform-person',
        name: 'Transformasi Orang',
        description: 'Glow-up, aging, atau perubahan penampilan orang dengan AI',
      },
      {
        id: 'ai-transform-place',
        name: 'Transformasi Tempat',
        description: 'Perubahan lokasi, bangunan, atau kota dengan AI',
      },
      {
        id: 'ai-transform-object',
        name: 'Transformasi Objek',
        description: 'Mengubah benda biasa menjadi sesuatu yang luar biasa',
      },
    ],
    creativeFramework:
      'REVEAL ARCHITECTURE — Struktur dibangun di atas momen "reveal". ' +
      'Tunjukkan keadaan "sebelum" cukup lama agar penonton membentuk ekspektasi, ' +
      'lalu gunakan transisi yang memuaskan untuk menunjukkan hasil transformasi. ' +
      'Kunci: gap antara ekspektasi dan hasil harus sebesar mungkin. ' +
      'Bisa dibalik (mulai dari hasil, reveal asal) untuk efek berbeda.',
    hookStyle:
      'Tunjukkan keadaan "sebelum" yang biasa atau bahkan jelek di frame pertama — penonton harus penasaran "akan jadi apa?". Tambahkan teks "Tunggu sampai akhir…" atau countdown visual.',
    visualGuidance:
      'Transisi harus mulus dan memuaskan — morph, swipe, atau dissolve. Sebelum: pencahayaan flat, tanpa filter. Sesudah: pencahayaan dramatis, warna saturated. Slow-motion di momen reveal. Angle kamera harus konsisten before/after.',
    indonesiaGuidance:
      'Transformasi landmark Indonesia (Monas, Borobudur versi futuristik), transformasi makanan tradisional menjadi fine dining, atau glow-up dengan konteks budaya lokal.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Transformasi AI: Bagaimana wajah pahlawan nasional Indonesia akan terlihat jika hidup di tahun 2024',
      'Before-After: Warung pinggir jalan ditransformasi AI menjadi restoran bintang 5 tapi menu tetap sama',
      'Mengubah foto lama hitam-putih keluarga menjadi berwarna dan hidup dengan AI',
    ],
    icon: 'Wand2',
  },

  {
    id: 'miniature-giant',
    name: 'Dunia Miniatur & Raksasa',
    description:
      'Konten yang bermain dengan skala — menampilkan dunia miniatur yang detail atau objek/makhluk raksasa di dunia nyata, menciptakan efek visual yang memukau.',
    group: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'miniature-world',
        name: 'Dunia Miniatur',
        description: 'Dunia kecil yang sangat detail di dalam objek sehari-hari',
      },
      {
        id: 'giant-world',
        name: 'Dunia Raksasa',
        description: 'Makhluk atau objek raksasa berinteraksi dengan dunia nyata',
      },
      {
        id: 'scale-illusion',
        name: 'Ilusi Skala',
        description: 'Permainan perspektif yang menipu mata penonton',
      },
    ],
    creativeFramework:
      'SCALE DISRUPTION — Keajaiban muncul dari pelanggaran skala yang sudah kita kenal. ' +
      'Mulai dengan establishing shot di skala normal, lalu zoom in/out untuk memecahkan ekspektasi. ' +
      'Detail adalah segalanya: semakin detail dunia miniatur, semakin memukau. ' +
      'Untuk dunia raksasa, interaksi dengan objek skala normal adalah kunci impact. ' +
      'Musik dan sound design harus mendukung pergeseran skala.',
    hookStyle:
      'Visual pertama terlihat "normal" — lalu kamera bergerak untuk menunjukkan bahwa skalanya salah. Zoom-in ke objek biasa yang ternyata berisi dunia miniatur, atau zoom-out untuk reveal makhluk raksasa.',
    visualGuidance:
      'Depth of field ekstrem untuk efek tilt-shift (miniatur). Partikel debu atau efek atmosfer untuk sense of scale. Lighting harus konsisten antara elemen miniatur/raksasa dan environment asli. Komposisi memanfaatkan leading lines untuk menunjukkan kontras skala.',
    indonesiaGuidance:
      'Miniatur dunia di dalam makanan Indonesia (nasi goreng, rendang), dunia kecil di dalam becak, atau kucing raksasa di antara gedung-gedung Jakarta.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Di dalam sepiring nasi goreng ternyata ada seluruh peradaban miniatur yang hidup',
      'Kucing raksasa setinggi Monas berjalan-jalan di Jakarta — penduduk kota bereaksi',
      'Zoom in ke tetes air hujan dan temukan kota miniatur di dalamnya',
    ],
    icon: 'Maximize2',
  },

  {
    id: 'fantasy-mythology',
    name: 'Fantasi & Mitologi',
    description:
      'Konten yang mengangkat dunia fantasi, makhluk mitologi, legenda, dan cerita rakyat dengan visual AI yang menakjubkan.',
    group: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'fantasy-nusantara',
        name: 'Mitologi Nusantara',
        description: 'Makhluk dan legenda dari cerita rakyat Indonesia',
      },
      {
        id: 'fantasy-world',
        name: 'Mitologi Dunia',
        description: 'Dewa, naga, dan makhluk mitologi dari berbagai budaya',
      },
      {
        id: 'fantasy-original',
        name: 'Fantasi Original',
        description: 'Dunia fantasi dan makhluk ciptaan baru yang unik',
      },
    ],
    creativeFramework:
      'MYTHIC WORLDBUILDING — Setiap video adalah jendela ke dunia yang utuh. ' +
      'Bangun "aturan dunia" yang konsisten meskipun fantastis. ' +
      'Makhluk mitologi harus punya "personality" dan motivasi, bukan hanya visual. ' +
      'Gunakan struktur mitos klasik: ada keajaiban, ada bahaya, ada pelajaran. ' +
      'Visual harus "lived-in" — dunia fantasi terasa pernah dihuni, bukan baru dibuat.',
    hookStyle:
      'Buka dengan visual yang impossible tapi indah — makhluk terbang, dunia terbalik, atau landscape fantasi yang detail. Musik orkestra atau gamelan modern untuk membangun atmosphere epik.',
    visualGuidance:
      'Warna-warna saturated dan dramatic: emas, ungu, hijau zamrud. Volumetric lighting dan god rays. Desain makhluk harus detail dan konsisten. Environment fantasi dengan elemen arsitektur yang recognizable. Partikel magic dan efek cahaya supernatural.',
    indonesiaGuidance:
      'Angkat makhluk mitologi Nusantara: Garuda, Naga Batak, Leak Bali, Buto Ijo. Gunakan estetika wayang dan batik sebagai elemen desain. Arsitektur candi dan keraton sebagai inspirasi world-building.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Garuda Pancasila terbangun dari tidur panjangnya dan terbang melintasi seluruh Indonesia modern',
      'Sebuah desa menemukan pintu gerbang ke dunia paralel di balik air terjun — versi fantasi Indonesia',
      'Pertarungan epik antara Naga Batak dan makhluk laut dari mitologi Bugis di Samudra Hindia',
    ],
    icon: 'Sparkles',
  },

  {
    id: 'satisfying-restoration',
    name: 'Video Satisfying & Restorasi',
    description:
      'Konten visual yang memberikan kepuasan melalui proses restorasi, pembersihan, penyusunan, atau transformasi dari kotor/rusak menjadi bersih/baru.',
    group: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'satisfying-cleaning',
        name: 'Pembersihan & Restorasi',
        description: 'Proses membersihkan atau merestorasi benda kotor/rusak',
      },
      {
        id: 'satisfying-organizing',
        name: 'Penyusunan & Organisasi',
        description: 'Merapikan dan mengorganisir benda secara memuaskan',
      },
      {
        id: 'satisfying-process',
        name: 'Proses yang Memuaskan',
        description: 'Proses pembuatan, pemotongan, atau pencetakan yang oddly satisfying',
      },
    ],
    creativeFramework:
      'TENSION-RELEASE LOOP — Bangun "ketidaknyamanan visual" (kotor, berantakan, rusak), ' +
      'lalu release melalui proses yang memuaskan. ' +
      'Kunci: proses itu sendiri harus visible dan gradual — penonton menikmati perjalanan, bukan hanya hasil. ' +
      'Gunakan ritme: setup ketidaknyamanan → proses → moment of satisfaction → repeat. ' +
      'Audio ASMR (suara scrubbing, clicking, pouring) memperkuat kepuasan.',
    hookStyle:
      'Tunjukkan keadaan paling kotor/berantakan/rusak di detik pertama — semakin "parah" semakin baik. Penonton langsung ingin melihat proses pembersihannya. Sound effect yang crisp di awal.',
    visualGuidance:
      'Close-up ekstrem untuk menunjukkan detail proses. Time-lapse untuk proses panjang. Before/after split-screen di akhir. Warna kontras antara kotor (kusam, coklat) dan bersih (cerah, putih). Pencahayaan merata tanpa shadow keras.',
    indonesiaGuidance: undefined,
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Restorasi sepatu sneaker putih yang sudah sangat kotor — dari lumpur hingga kembali seperti baru',
      'Membersihkan dan menata ulang warung makan yang berantakan — transformasi total dalam 60 detik',
      'Proses pembuatan jajanan tradisional Indonesia dari awal hingga akhir — satisfying ASMR',
    ],
    icon: 'Brush',
  },

  {
    id: 'scenic-aesthetic',
    name: 'Visual Scenic & Estetik',
    description:
      'Konten visual yang indah dan cinematic — pemandangan alam, urban aesthetic, golden hour, dan momen-momen visual yang menenangkan atau memukau.',
    group: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'scenic-nature',
        name: 'Alam & Pemandangan',
        description: 'Keindahan alam dari pegunungan hingga lautan',
      },
      {
        id: 'scenic-urban',
        name: 'Urban & Cityscape',
        description: 'Estetika kota, arsitektur, dan kehidupan urban',
      },
      {
        id: 'scenic-mood',
        name: 'Mood & Atmosphere',
        description: 'Visual yang membangun suasana dan emosi tertentu',
      },
    ],
    creativeFramework:
      'VISUAL POETRY — Tidak ada plot tradisional; "cerita" disampaikan melalui mood, ritme visual, dan emosi. ' +
      'Setiap shot harus bisa berdiri sendiri sebagai artwork. ' +
      'Gunakan musik sebagai narasi utama — visual mengikuti ritme dan emosi musik. ' +
      'Transisi antar shot harus seamless dan mengalir. ' +
      'Ciptakan "visual rhythm": shot cepat → lambat → cepat untuk mengendalikan emosi penonton.',
    hookStyle:
      'Buka dengan shot paling dramatis dan indah — aerial view, golden hour extreme, atau visual impossible. Musik harus langsung menyentuh emosi di detik pertama. Tidak perlu teks atau narasi.',
    visualGuidance:
      'Aspect ratio cinematic (21:9 letterbox di dalam 9:16 bisa efektif). Color grading yang kuat dan konsisten per video. Drone shots dan gimbal movements yang smooth. Golden hour dan blue hour lighting. Slow-motion untuk momen-momen kecil yang indah.',
    indonesiaGuidance:
      'Indonesia punya landscape luar biasa: Raja Ampat, Bromo, Labuan Bajo, sawah terasering Bali. Urban aesthetic Jakarta malam hari, gang-gang Yogyakarta, atau pelabuhan tradisional.',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Cinematic journey matahari terbit di Gunung Bromo — dari gelap total hingga emas menyala',
      'Jakarta dalam 60 detik: dari kemacetan pagi hingga gemerlap lampu kota di malam hari',
      'Visual poem tentang hujan di desa Indonesia — setiap shot adalah lukisan bergerak',
    ],
    icon: 'Mountain',
  },

  // ─────────────────────────────────────────────────────────────
  //  GROUP 3 — Education, Facts & Mystery
  // ─────────────────────────────────────────────────────────────
  {
    id: 'educational-facts',
    name: 'Fakta Edukatif & Rasa Ingin Tahu',
    description:
      'Konten yang menyajikan fakta menarik, penjelasan sains, sejarah, atau fenomena dengan cara yang engaging dan mudah dipahami.',
    group: 'Education, Facts & Mystery',
    subcategories: [
      {
        id: 'edu-science',
        name: 'Sains & Teknologi',
        description: 'Fakta dan penjelasan sains yang mind-blowing',
      },
      {
        id: 'edu-history',
        name: 'Sejarah & Budaya',
        description: 'Fakta sejarah dan budaya yang jarang diketahui',
      },
      {
        id: 'edu-nature',
        name: 'Alam & Makhluk Hidup',
        description: 'Fakta menakjubkan tentang dunia alam dan biologi',
      },
      {
        id: 'edu-daily',
        name: 'Fakta Sehari-hari',
        description: 'Penjelasan menarik tentang benda atau fenomena sehari-hari',
      },
    ],
    creativeFramework:
      'CURIOSITY GAP — Mulai dengan pertanyaan atau fakta yang menciptakan "gap" pengetahuan, ' +
      'lalu tutup gap tersebut secara bertahap dengan penjelasan yang semakin dalam. ' +
      'Setiap beat harus membuat penonton berpikir "oh, tapi kenapa?" — sehingga mereka terus menonton. ' +
      'Gunakan analogi visual yang konkret untuk konsep abstrak. ' +
      'Akhiri dengan implikasi yang membuat penonton berpikir setelah video selesai.',
    hookStyle:
      'Buka dengan pertanyaan provokatif atau fakta mengejutkan: "Tahukah kamu bahwa…?" atau "Ini adalah benda yang bisa menghancurkan…". Visual pertama harus mendukung klaim bold tersebut.',
    visualGuidance:
      'Infografis animasi yang clean dan modern. Zoom-in/zoom-out untuk menunjukkan skala. Diagram dan visualisasi data yang atraktif. Split-screen untuk perbandingan. Teks overlay untuk angka dan fakta kunci — ukuran besar, font bold.',
    indonesiaGuidance:
      'Fakta tentang Indonesia yang orang Indonesia sendiri belum tahu: keunikan flora/fauna, sejarah yang jarang diajarkan, fenomena alam khas Indonesia, dan pencapaian Indonesia di dunia.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Kenapa Indonesia punya 17.000 pulau tapi mayoritas penduduknya tinggal di Jawa? Penjelasan geologis dan historis',
      'Apa yang terjadi pada tubuhmu kalau kamu hanya makan Indomie selama 30 hari? Penjelasan ilmiah',
      'Komodo Dragon: satu-satunya naga sungguhan di dunia — fakta yang bikin merinding',
    ],
    icon: 'Lightbulb',
  },

  {
    id: 'mystery-horror',
    name: 'Misteri, Horor & Tak Terjelaskan',
    description:
      'Konten yang mengeksplorasi misteri, cerita horor, fenomena tak terjelaskan, true crime, dan hal-hal yang membuat penonton merinding sekaligus penasaran.',
    group: 'Education, Facts & Mystery',
    subcategories: [
      {
        id: 'mystery-unsolved',
        name: 'Misteri Belum Terpecahkan',
        description: 'Kasus dan fenomena yang masih jadi tanda tanya',
      },
      {
        id: 'mystery-horror-story',
        name: 'Cerita Horor',
        description: 'Cerita seram yang membangun suspense dan ketakutan',
      },
      {
        id: 'mystery-conspiracy',
        name: 'Teori & Konspirasi',
        description: 'Teori menarik tentang fenomena yang tak terjelaskan',
      },
    ],
    creativeFramework:
      'SUSPENSE ARCHITECTURE — Informasi diberikan secara terkontrol untuk memaksimalkan ketegangan. ' +
      'Gunakan prinsip "apa yang tidak ditunjukkan lebih menakutkan daripada yang ditunjukkan". ' +
      'Build-up bertahap: normal → sedikit aneh → sangat aneh → reveal yang mengganggu. ' +
      'Sisakan satu pertanyaan yang tidak terjawab di akhir — biarkan penonton memikirkannya. ' +
      'Sound design adalah 50% dari horor: silence → ambient → sudden sound.',
    hookStyle:
      'Buka dengan visual yang "something is off" — tampak normal tapi ada sesuatu yang salah. Atau mulai dengan kalimat misterius: "Sampai hari ini, tidak ada yang bisa menjelaskan…". Suara ambient yang unsettling.',
    visualGuidance:
      'Desaturated colors, kontras tinggi dengan shadow dalam. Grain dan noise untuk efek raw/found footage. Camera movement tidak stabil untuk membangun unease. Negative space yang banyak — biarkan penonton membayangkan apa yang ada di kegelapan. Flash frame dan glitch untuk jump scare subtle.',
    indonesiaGuidance:
      'Indonesia kaya akan urban legend dan cerita horor: Kuntilanak, Pocong, Tuyul, Nyi Roro Kidul. Bisa juga angkat misteri sejarah Indonesia yang belum terpecahkan. Hindari konten yang terlalu gore atau menyinggung kepercayaan.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Misteri Pulau Sentinel Utara Indonesia: Mengapa penduduknya menolak semua kontak dengan dunia luar?',
      'Cerita horor POV: Kamu bermalam di rumah nenek di desa dan mendengar suara yang tidak bisa dijelaskan',
      'Fakta mengerikan tentang kedalaman laut Indonesia yang belum pernah dijelajahi manusia',
    ],
    icon: 'Ghost',
  },

  // ─────────────────────────────────────────────────────────────
  //  GROUP 4 — Social & Short-form Formats
  // ─────────────────────────────────────────────────────────────
  {
    id: 'animal-pet',
    name: 'Hewan & POV Peliharaan',
    description:
      'Konten dari sudut pandang hewan peliharaan atau tentang interaksi menggemaskan antara hewan dan manusia — lucu, menghangatkan hati, dan shareable.',
    group: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'animal-pov',
        name: 'POV Hewan',
        description: 'Cerita dari sudut pandang hewan peliharaan',
      },
      {
        id: 'animal-human',
        name: 'Interaksi Hewan & Manusia',
        description: 'Momen lucu atau menyentuh antara hewan dan pemiliknya',
      },
      {
        id: 'animal-wild',
        name: 'Hewan Liar & Alam',
        description: 'Perilaku menakjubkan hewan liar yang jarang terlihat',
      },
    ],
    creativeFramework:
      'ANTHROPOMORPHIC NARRATION — Berikan "suara batin" dan "personality" pada hewan. ' +
      'Humor muncul dari gap antara apa yang hewan "pikirkan" vs realitas situasi. ' +
      'Narasi inner-monolog hewan dengan bahasa casual dan relatable. ' +
      'Emosi kunci: gemas, lucu, dan "aww". ' +
      'Untuk konten edukatif, gunakan fakta hewan yang mind-blowing sebagai hook.',
    hookStyle:
      'Close-up wajah hewan dengan ekspresi "judging" atau menggemaskan. Teks overlay narasi inner-monolog hewan: "POV: Majikan pulang setelah 5 menit tapi menurutku sudah 5 tahun."',
    visualGuidance:
      'Eye-level kamera sejajar hewan untuk POV. Warna warm dan cerah. Slow-motion untuk momen menggemaskan. Focus on ekspresi — mata dan telinga hewan sangat ekspresif. Background blur agar fokus pada hewan.',
    indonesiaGuidance:
      'Kucing (sangat populer di Indonesia), anjing kampung, bebek, ayam kampung — hewan yang familiar. Konteks: kucing warung kopi, kucing masjid, anjing penjaga kampung.',
    suggestedDuration: ['10-15s', '15-30s', '30-60s'],
    exampleIdeas: [
      'POV: Kamu kucing warung kopi yang menilai setiap pelanggan berdasarkan pesanan mereka',
      'Drama seekor kucing kampung yang "diadopsi" oleh 5 rumah berbeda dan menikmati makan gratis di semua tempat',
      'Reaksi anjing kampung pertama kali melihat salju — AI visualisasi momen imajiner',
    ],
    icon: 'Cat',
  },

  {
    id: 'comedy-meme',
    name: 'Komedi, Meme & Reaksi',
    description:
      'Konten humor murni — meme viral, sketch komedi pendek, reaksi berlebihan, dan format-format lucu yang memicu share dan comment.',
    group: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'comedy-sketch',
        name: 'Sketch Komedi',
        description: 'Cerita komedi pendek dengan punchline kuat',
      },
      {
        id: 'comedy-meme-format',
        name: 'Meme & Format Viral',
        description: 'Adaptasi format meme populer dengan konten baru',
      },
      {
        id: 'comedy-reaction',
        name: 'Reaksi & Commentary',
        description: 'Reaksi lucu terhadap situasi atau konten viral',
      },
    ],
    creativeFramework:
      'COMEDIC TIMING ENGINE — Humor = Setup + Subverted Expectation + Timing. ' +
      'Setup harus singkat (max 5 detik) agar punchline tidak kehilangan momentum. ' +
      'Subvert ekspektasi: arahkan penonton ke satu hal, deliver yang lain. ' +
      'Beat komedi: pause sebelum punchline, lalu deliver dengan cepat. ' +
      'Rule of Three: dua hal normal → yang ketiga absurd. ' +
      'Callback ke joke sebelumnya memperkuat humor di akhir.',
    hookStyle:
      'Langsung masuk ke situasi lucu — tidak ada intro. Ekspresi berlebihan atau situasi absurd di frame pertama. Sound effect yang familiar dan lucu (cartoon boing, record scratch).',
    visualGuidance:
      'Warna cerah dan saturated. Ekspresi wajah/karakter yang exaggerated. Zoom-in cepat ke momen punchline. Meme text: font Impact atau bold sans-serif. Pacing cepat — cut setiap 2-3 detik.',
    indonesiaGuidance:
      'Humor Indonesia: sarkas halus, situasi "mager", drama keluarga yang dilebih-lebihkan, dan budaya "flexing". Referensi: meme lokal, trending topics Twitter/TikTok Indonesia.',
    suggestedDuration: ['10-15s', '15-30s'],
    exampleIdeas: [
      'Ekspektasi vs Realita: Masak mengikuti tutorial chef vs hasilnya yang bikin sedih',
      'Reaksi beda generasi saat WiFi mati — Boomer vs Milenial vs Gen Z',
      'Meme format: "Orang Indonesia kalau dengar kata diskon" — escalation dari tenang ke chaos',
    ],
    icon: 'Laugh',
  },

  {
    id: 'social-relationship',
    name: 'Kehidupan Sosial & Hubungan',
    description:
      'Konten tentang dinamika hubungan — pertemanan, pacaran, pernikahan, keluarga, dan interaksi sosial yang emosional dan relatable.',
    group: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'social-romance',
        name: 'Romansa & Pacaran',
        description: 'Momen manis, lucu, atau menyedihkan dalam hubungan romantis',
      },
      {
        id: 'social-friendship',
        name: 'Persahabatan',
        description: 'Dinamika pertemanan yang menghangatkan hati',
      },
      {
        id: 'social-family',
        name: 'Keluarga',
        description: 'Ikatan dan dinamika keluarga yang emosional',
      },
      {
        id: 'social-workplace',
        name: 'Kehidupan Kerja',
        description: 'Interaksi dan drama di tempat kerja',
      },
    ],
    creativeFramework:
      'EMOTIONAL RESONANCE MAPPING — Identifikasi emosi universal (rindu, canggung, bangga, cemburu) ' +
      'lalu wujudkan dalam situasi hyper-specific yang membuat penonton berpikir "kok bisa sama persis". ' +
      'Kekuatan bukan di plot tapi di DETAIL kecil yang authentic. ' +
      'Gunakan kontras emosi: lucu → sedih → lucu untuk menjaga engagement. ' +
      'Tinggalkan ruang untuk penonton "mengisi" emosi mereka sendiri.',
    hookStyle:
      'Buka dengan situasi yang langsung memicu identifikasi emosional. Teks: "Tag seseorang yang…" atau "Pernah nggak sih…". Musik yang langsung membangun mood (lagu romantis, nostalgic, atau upbeat).',
    visualGuidance:
      'Warm tones untuk momen positif, cool/muted untuk momen sedih. Candid-style framing, bukan posed. Close-up tangan yang bersentuhan, ekspresi mata, gestur kecil. Soft lighting untuk momen intim. Montage style untuk menunjukkan perjalanan hubungan.',
    indonesiaGuidance:
      'Hubungan dalam konteks Indonesia: LDR antar pulau, tradisi lamaran adat, drama WA grup keluarga, overthinking sebelum chat gebetan, dan dinamika anak rantau yang rindu rumah.',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Perjalanan hubungan dari "siapa sih ini?" di DM Instagram sampai "bismillah, temuin orangtua"',
      'Saat kamu dan sahabat SMA ketemu lagi setelah 10 tahun — semua berubah tapi persahabatan tetap sama',
      'Chat terakhir dari ibu sebelum kamu berangkat merantau vs chat pertama saat kamu sampai',
    ],
    icon: 'Heart',
  },

  {
    id: 'challenges-journey',
    name: 'Tantangan & Perjalanan Pribadi',
    description:
      'Konten motivasi, transformasi diri, tantangan viral, dan dokumentasi perjalanan pribadi yang menginspirasi dan memicu engagement.',
    group: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'challenge-viral',
        name: 'Tantangan Viral',
        description: 'Tantangan dan trend challenge yang sedang populer',
      },
      {
        id: 'challenge-transformation',
        name: 'Transformasi Diri',
        description: 'Dokumentasi perubahan diri — fisik, skill, atau kehidupan',
      },
      {
        id: 'challenge-motivation',
        name: 'Motivasi & Inspirasi',
        description: 'Cerita inspiratif dan motivasi yang menggerakkan',
      },
    ],
    creativeFramework:
      'PROGRESS NARRATIVE — Struktur dibangun di atas perjalanan dari titik A ke titik B. ' +
      'Tunjukkan "titik terendah" agar titik tertinggi terasa lebih bermakna. ' +
      'Dokumentasi proses lebih penting daripada hasil — penonton ingin melihat perjuangan. ' +
      'Milestone markers: tunjukkan progress di titik-titik tertentu (hari ke-1, ke-15, ke-30). ' +
      'Kunci: vulnerability dan authenticity — kesempurnaan tidak menginspirasi, perjuangan yang menginspirasi.',
    hookStyle:
      'Tunjukkan hasil akhir yang menakjubkan di detik pertama, lalu flashback ke awal perjalanan. Atau tunjukkan tantangan yang tampak mustahil dengan teks "Aku akan coba ini selama 30 hari…".',
    visualGuidance:
      'Before/after split screen atau side-by-side. Time-lapse untuk menunjukkan proses. Teks overlay untuk day counter dan milestone. Musik yang build-up dari mellow ke triumphant. Raw/unfiltered footage untuk authenticity.',
    indonesiaGuidance:
      'Tantangan yang relevan: belajar bahasa daerah dalam 30 hari, keliling Indonesia dengan budget minimal, transformasi dari anak kampung ke profesional kota.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Tantangan 30 hari: belajar membatik dari nol sampai bisa membuat karya sendiri',
      'Perjalanan seorang anak warung kelontong menjadi founder startup — told in 60 seconds',
      'Challenge: hidup dengan Rp50.000/hari selama seminggu di Jakarta — day by day documentation',
    ],
    icon: 'Trophy',
  },

  {
    id: 'food-imagination',
    name: 'Makanan & Imajinasi',
    description:
      'Konten food yang kreatif dan imajinatif — bukan sekadar review makanan, tapi eksplorasi kreatif tentang makanan dengan twist AI, animasi, atau konsep unik.',
    group: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'food-creative',
        name: 'Kreasi Makanan Kreatif',
        description: 'Resep atau kreasi makanan dengan twist unik dan imajinatif',
      },
      {
        id: 'food-story',
        name: 'Cerita di Balik Makanan',
        description: 'Narasi dan sejarah menarik di balik makanan tertentu',
      },
      {
        id: 'food-fantasy',
        name: 'Makanan Fantasi',
        description: 'Makanan impossible atau futuristik yang dibuat dengan AI',
      },
    ],
    creativeFramework:
      'SENSORY STORYTELLING — Makanan bukan hanya visual, tapi pengalaman multisensori. ' +
      'Setiap shot harus membuat penonton "merasakan" melalui layar: uap, tekstur, warna, dan suara. ' +
      'Bangun narasi di balik makanan — siapa yang membuatnya, apa ceritanya, mengapa makanan ini spesial. ' +
      'Twist imajinatif: bagaimana jika makanan ini hidup? Bagaimana jika makanan dari 2 budaya digabung? ' +
      'Close-up dan slow-mo adalah bahasa utama food content.',
    hookStyle:
      'Close-up ASMR makanan yang sedang dimasak — suara minyak mendesis, keju meleleh, atau saus dituang. Visual pertama harus memicu air liur. Atau konsep makanan yang begitu unik sehingga penonton harus tahu apa itu.',
    visualGuidance:
      'Macro close-up untuk detail tekstur. Warm lighting yang membuat makanan terlihat lebih appetizing. Steam dan smoke effects. Overhead shot untuk plating. Slow-motion pour, drizzle, dan cut. Warna dominan warm: oranye, merah, kuning emas.',
    indonesiaGuidance:
      'Kekayaan kuliner Indonesia: Rendang, Soto, Nasi Goreng, Bakso, Gudeg. Bisa angkat street food culture, warung tradisional, atau fusion makanan Indonesia modern. Cerita ibu-ibu penjual makanan yang legenda di kampung.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'AI membayangkan: bagaimana jika semua 34 provinsi di Indonesia membuat versi Nasi Goreng mereka?',
      'Cerita di balik Rendang — perjalanan dari dapur Minangkabau menjadi makanan terenak di dunia',
      'Makanan fusion impossible: Ramen × Bakso × Taco — AI merancang resep dan tampilannya',
    ],
    icon: 'ChefHat',
  },

  {
    id: 'product-story',
    name: 'Cerita Produk & Iklan AI',
    description:
      'Konten yang menceritakan produk atau brand dengan cara kreatif dan non-iklan — storytelling yang membuat penonton engage tanpa merasa sedang ditarget iklan.',
    group: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'product-origin',
        name: 'Cerita Asal-usul Produk',
        description: 'Narasi menarik tentang bagaimana sebuah produk diciptakan',
      },
      {
        id: 'product-creative-ad',
        name: 'Iklan Kreatif AI',
        description: 'Iklan produk yang dibuat dengan AI secara cinematic',
      },
      {
        id: 'product-comparison',
        name: 'Perbandingan & Review Kreatif',
        description: 'Review produk dengan format storytelling yang engaging',
      },
    ],
    creativeFramework:
      'STEALTH STORYTELLING — Produk bukan hero, cerita adalah hero. ' +
      'Penonton harus engage dengan cerita terlebih dahulu, baru menyadari bahwa ada produk di dalamnya. ' +
      'Gunakan "problem → struggle → discovery → transformation" arc dimana produk muncul natural di tahap discovery. ' +
      'Jangan pernah buka dengan produk; buka dengan masalah atau emosi. ' +
      'CTA (jika ada) harus muncul setelah value sudah delivered.',
    hookStyle:
      'Buka dengan masalah yang relatable atau momen emosional — BUKAN dengan produk. Penonton harus berpikir mereka menonton cerita, bukan iklan. Reveal produk secara natural di pertengahan atau akhir.',
    visualGuidance:
      'Cinematic quality tinggi — iklan AI harus terlihat lebih baik dari iklan tradisional. Product shot dengan dramatic lighting dan slow-motion. Lifestyle shots: produk digunakan dalam konteks nyata. Color grading yang premium dan consistent.',
    indonesiaGuidance:
      'UMKM dan brand lokal Indonesia: batik, kopi lokal, skincare lokal, makanan khas daerah. Ceritakan craft dan passion di balik produk lokal. Kaitkan dengan kebanggaan "produk Indonesia".',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Cerita: Nenek di Yogyakarta masih membuat batik tulis selama 50 tahun — produk batiknya kini dikirim ke seluruh dunia',
      'AI commercial: Kopi dari petani di Toraja — dari kebun di pegunungan sampai secangkir latte di Jakarta',
      'Perbandingan kreatif: 5 sunscreen lokal Indonesia diuji di bawah terik matahari Bali — siapa yang menang?',
    ],
    icon: 'ShoppingBag',
  },
];

// ─────────────────────────────────────────────────────────────
//  Helper functions
// ─────────────────────────────────────────────────────────────

/** Find a category by its stable id. Returns `undefined` if not found. */
export function getCategoryById(id: string): ContentCategory | undefined {
  return CONTENT_CATEGORIES.find((c) => c.id === id);
}

/** Return every category that belongs to a given group. */
export function getCategoriesByGroup(group: string): ContentCategory[] {
  return CONTENT_CATEGORIES.filter((c) => c.group === group);
}

/**
 * Case-insensitive search across category `name` and `description`.
 * Returns all categories whose name OR description contains the query string.
 */
export function searchCategories(query: string): ContentCategory[] {
  const q = query.toLowerCase();
  return CONTENT_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q),
  );
}
