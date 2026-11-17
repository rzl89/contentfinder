import type { ContentCategory } from '@/types';

/**
 * Fixprom — Full 21-Category Content Catalog
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
    nameEn: 'Time Travel & Historical POV',
    description:
      'Konten yang membawa penonton ke masa lalu atau masa depan, menampilkan perspektif orang pertama dari era sejarah atau peristiwa penting.',
    descriptionEn: 'Immersive content that transports viewers to the past or future, showcasing first-person perspectives of historical epochs or pivotal events.',
    group: 'Storytelling & Entertainment',
    groupEn: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'time-travel-historical',
        name: 'Sejarah & Peradaban',
        nameEn: 'History & Civilizations',
        description: 'Menjelajahi momen bersejarah dari sudut pandang orang pertama',
        descriptionEn: 'Exploring historic moments from a first-person perspective',
      },
      {
        id: 'time-travel-future',
        name: 'Masa Depan & Sci-Fi',
        nameEn: 'Future & Sci-Fi',
        description: 'Membayangkan kehidupan di masa depan dengan teknologi canggih',
        descriptionEn: 'Imagining life in the future with advanced technology',
      },
      {
        id: 'time-travel-nusantara',
        name: 'Nusantara Tempo Dulu',
        nameEn: 'Ancient Archipelago',
        description: 'Merasakan kehidupan di kerajaan-kerajaan Nusantara kuno',
        descriptionEn: 'Experiencing life in ancient kingdoms and historic eras',
      },
    ],
    creativeFramework:
      'TEMPORAL CONTRAST — Struktur cerita dibangun di atas kontras antara dua era. ' +
      'Mulai di satu titik waktu, lalu "lompat" ke titik lain untuk menciptakan kejutan, ironi, atau refleksi. ' +
      'Gunakan detail sensorik era tersebut (pakaian, suara, bau) agar penonton "merasakan" perpindahan waktu. ' +
      'Akhiri dengan insight yang menghubungkan masa lalu & masa kini.',
    creativeFrameworkEn: 'TEMPORAL CONTRAST — Story arc built on contrast between two eras. Start at one point in time, jump to another to spark wonder, irony, or reflection. Use era-specific sensory cues and close with a resonant insight.',
    hookStyle:
      'Buka dengan visual yang langsung menunjukkan "ini bukan zaman sekarang" — pakaian kuno, arsitektur historis, atau teks overlay tahun (misal "Jakarta, 1942"). Efek transisi waktu dalam 1 detik pertama.',
    hookStyleEn: 'Open with a visual cue establishing \'this is not modern day\' — historic attire, period architecture, or year timestamp. Deliver time-shift transition in the first second.',
    visualGuidance:
      'Gunakan color grading berbeda untuk setiap era: sepia/warm untuk masa lalu, cool-toned untuk masa depan. Transisi waktu menggunakan efek distorsi, flash, atau morphing. Detail kostum & setting harus akurat per era.',
    visualGuidanceEn: 'Distinct color grading per era: sepia/warm for the past, cool/sleek for the future. Time transitions using distortion, light bursts, or smooth morphing.',
    indonesiaGuidance:
      'Prioritaskan momen sejarah Indonesia: Majapahit, Sriwijaya, kemerdekaan, era reformasi. Gunakan referensi arsitektur lokal (candi, rumah adat). Sensitivitas terhadap peristiwa sejarah yang masih sensitif.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'POV: Kamu pedagang rempah di Pelabuhan Sunda Kelapa tahun 1527, tiba-tiba terlempar ke Jakarta 2024',
      'Seorang anak kecil menemukan cermin ajaib yang menunjukkan Indonesia tahun 2100',
      'Perbandingan sehari di kehidupan pelajar era Majapahit vs pelajar Gen-Z sekarang',
    ],
    exampleIdeasEn: [
      "POV: You are an ancient spice merchant in 1527 suddenly teleported into the bustling center of 2024",
      "A child discovers an antique mirror that reflects daily life in the year 2100",
      "Side-by-side comparison: A student day in an ancient empire vs a modern Gen-Z student"
],
    icon: 'Clock',
  },

  {
    id: 'stickman',
    name: 'Animasi Stickman',
    nameEn: 'Stickman Animation',
    description:
      'Cerita visual menggunakan karakter stickman sederhana yang menyampaikan pesan kuat lewat gerakan, ekspresi, dan situasi lucu atau dramatis.',
    descriptionEn: 'Visual storytelling with minimalist stickman characters delivering strong messages through punchy motion, expressive timing, and comedic or dramatic situations.',
    group: 'Storytelling & Entertainment',
    groupEn: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'stickman-comedy',
        name: 'Stickman Komedi',
        nameEn: 'Stickman Comedy',
        description: 'Situasi absurd dan lucu dengan karakter stickman',
        descriptionEn: 'Absurd and hilarious situations with stickman characters',
      },
      {
        id: 'stickman-life-lesson',
        name: 'Stickman Pelajaran Hidup',
        nameEn: 'Stickman Life Lessons',
        description: 'Cerita inspiratif atau moral disampaikan lewat stickman',
        descriptionEn: 'Inspiring or moral narratives told through stickman figures',
      },
      {
        id: 'stickman-action',
        name: 'Stickman Aksi & Pertarungan',
        nameEn: 'Stickman Action & Combat',
        description: 'Adegan aksi epik dengan animasi stickman dinamis',
        descriptionEn: 'Epic action sequences with fluid stickman choreography',
      },
    ],
    creativeFramework:
      'MINIMALIST EXPRESSIONISM — Kekuatan ada pada kesederhanaan. ' +
      'Cerita hanya mengandalkan gesture, pose, dan timing karena karakter tidak punya detail wajah. ' +
      'Gunakan prinsip "show, don\'t tell" secara literal: setiap beat harus bisa dipahami tanpa dialog. ' +
      'Komedi muncul dari physical comedy dan situasi absurd; drama muncul dari body language dan konteks.',
    creativeFrameworkEn: 'MINIMALIST EXPRESSIONISM — Power in simplicity. Rely on gestures, posture, and pacing. Pure \'show, don\'t tell\'. Slapstick comedy and dramatic gravity expressed entirely through physical momentum.',
    hookStyle:
      'Langsung masuk ke aksi atau situasi yang menarik perhatian — stickman jatuh, berlari, atau menghadapi masalah. Tidak ada buildup panjang; visual pertama sudah bergerak.',
    hookStyleEn: 'Dive directly into dynamic motion — stickman falling, sprinting, or colliding with a dilemma. Zero long preamble; immediate kinetic hook.',
    visualGuidance:
      'Background putih atau solid color sederhana. Garis hitam tebal untuk karakter. Gunakan efek warna hanya untuk emphasis (merah untuk bahaya, biru untuk sedih). Animasi harus smooth dengan timing komedi yang tepat.',
    visualGuidanceEn: 'Clean white or solid background. Bold black outlines for characters. Accent color used sparingly for emphasis (red for hazard, blue for melancholy). Snappy comedic timing.',
    indonesiaGuidance: undefined,
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Stickman mencoba semua cara untuk mendapatkan WiFi gratis — semakin absurd tiap percobaan',
      'Pertarungan epik dua stickman yang ternyata hanya berebut charger HP terakhir',
      'Stickman yang selalu gagal tapi pantang menyerah, akhirnya berhasil di momen terakhir',
    ],
    exampleIdeasEn: [
      "Stickman tries every absurd hack to get free Wi-Fi — escalating in chaos with every attempt",
      "An epic anime-style duel between two stickmen, revealed to be over the last phone charger",
      "A resilient stickman fails repeatedly but perseveres until a triumphant final breakthrough"
],
    icon: 'Pencil',
  },

  {
    id: 'pov-experience',
    name: 'Pengalaman POV',
    nameEn: 'First-Person POV Experience',
    description:
      'Konten immersive yang menempatkan penonton langsung di perspektif orang pertama — seolah-olah mereka yang mengalami situasi tersebut.',
    descriptionEn: 'High-immersion content placing viewers directly into a first-person perspective — making them feel as if they are experiencing the event firsthand.',
    group: 'Storytelling & Entertainment',
    groupEn: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'pov-daily-life',
        name: 'POV Kehidupan Sehari-hari',
        nameEn: 'Daily Life POV',
        description: 'Pengalaman umum yang relatable dari sudut pandang orang pertama',
        descriptionEn: 'Relatable everyday scenarios from an authentic first-person lens',
      },
      {
        id: 'pov-profession',
        name: 'POV Profesi & Pekerjaan',
        nameEn: 'Career & Trade POV',
        description: 'Merasakan sehari menjadi profesi tertentu',
        descriptionEn: 'Stepping into the shoes of specialized professions for a day',
      },
      {
        id: 'pov-extreme',
        name: 'POV Situasi Ekstrem',
        nameEn: 'Extreme Situations POV',
        description: 'Pengalaman menegangkan atau luar biasa dari perspektif pertama',
        descriptionEn: 'High-adrenaline or suspenseful scenarios from a direct view',
      },
      {
        id: 'pov-fantasy',
        name: 'POV Fantasi & Imajinatif',
        nameEn: 'Fantasy & Surreal POV',
        description: 'Pengalaman mustahil yang hanya bisa terjadi dalam imajinasi',
        descriptionEn: 'Mind-bending experiences that exist only in vivid imagination',
      },
    ],
    creativeFramework:
      'IMMERSIVE FIRST-PERSON — Semua elemen dirancang agar penonton merasa "ini terjadi padaku". ' +
      'Kamera selalu dari eye-level atau hand-held POV. Narasi menggunakan "kamu" untuk memperkuat identifikasi. ' +
      'Bangun tension lewat apa yang penonton "lihat" dan "dengar" secara bertahap. ' +
      'Kunci: penonton harus bereaksi secara emosional seolah mereka ada di sana.',
    creativeFrameworkEn: 'IMMERSIVE FIRST-PERSON — Designed so viewers instinctively feel \'this is happening to me\'. Eye-level or handheld camera. Gradual tension build through sensory soundscape and visual reveals.',
    hookStyle:
      'Teks overlay "POV:" diikuti skenario spesifik dan menarik. Frame pertama langsung dari sudut pandang orang pertama — tangan terlihat, atau environment dari eye-level.',
    hookStyleEn: 'Bold \'POV:\' on-screen text paired with an intriguing premise. First frame instantly locks into eye-level hands or immediate foreground view.',
    visualGuidance:
      'Kamera selalu first-person: eye-level, slight shake untuk realisme. Tangan atau bagian tubuh terlihat di frame. Depth of field dangkal untuk fokus pada apa yang "dilihat". Sound design krusial — suara ambient harus mendukung immersion.',
    visualGuidanceEn: 'Authentic camera shake, visible hands/gestures interacting with props, shallow depth of field, spatial ambient sound design.',
    indonesiaGuidance:
      'Gunakan setting Indonesia yang familiar: angkot, pasar tradisional, sekolah, kampung. POV profesi lokal (tukang bakso, ojol, guru honorer) sangat relatable.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'POV: Kamu driver ojol yang ternyata penumpangnya mantan yang belum move on',
      'POV: Hari pertama kerja di perusahaan besar, tapi kamu salah masuk ruangan rapat direksi',
      'POV: Terbangun di tahun 3024 dan semua orang berbicara bahasa yang tidak kamu mengerti',
    ],
    exampleIdeasEn: [
      "POV: You are a ride-share driver and your late-night passenger turns out to be your unresolved ex",
      "POV: First day at a corporate headquarters and you accidentally walk into an executive board meeting",
      "POV: Waking up in the year 3024 where everyone communicates in a language you cannot decode"
],
    icon: 'Eye',
  },

  {
    id: 'relatable-animated',
    name: 'Cerita Animasi Relatable',
    nameEn: 'Relatable Animated Stories',
    description:
      'Cerita animasi pendek yang menggambarkan situasi sehari-hari yang sangat relatable — momen "itu gue banget!" yang memicu engagement tinggi.',
    descriptionEn: 'Short animated vignettes depicting funny, awkward, or endearing everyday moments that spark immediate \'that is so me!\' engagement.',
    group: 'Storytelling & Entertainment',
    groupEn: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'relatable-school',
        name: 'Kehidupan Sekolah & Kampus',
        nameEn: 'School & Campus Life',
        description: 'Momen-momen relatable dari dunia pendidikan',
        descriptionEn: 'Instantly recognizable classroom and student moments',
      },
      {
        id: 'relatable-family',
        name: 'Keluarga & Rumah Tangga',
        nameEn: 'Family & Household Dynamics',
        description: 'Dinamika keluarga Indonesia yang bikin angguk-angguk',
        descriptionEn: 'Wholesome, humorous everyday family quirks and habits',
      },
      {
        id: 'relatable-social',
        name: 'Pergaulan & Sosial Media',
        nameEn: 'Social & Digital Culture',
        description: 'Kebiasaan sosial dan interaksi digital yang relatable',
        descriptionEn: 'Online texting habits, social etiquette, and relatable blunders',
      },
    ],
    creativeFramework:
      'MIRROR COMEDY — Cerita berfungsi sebagai "cermin" pengalaman penonton. ' +
      'Identifikasi satu micro-moment spesifik yang dialami banyak orang tapi jarang dibicarakan. ' +
      'Exaggerate reaksi karakter untuk efek komedi, tapi situasinya harus tetap realistis. ' +
      'Punchline terbaik adalah saat penonton berpikir "kok tahu sih?!". ' +
      'Gunakan setup-payoff yang cepat karena audiensnya sudah tahu konteksnya.',
    creativeFrameworkEn: 'MIRROR COMEDY — Holds up a mirror to shared human habits. Exaggerated animated reactions grounded in authentic micro-moments. Quick setup-to-punchline rhythm.',
    hookStyle:
      'Buka dengan situasi yang langsung dikenali penonton — teks "Kalau kamu pernah…" atau visual yang menunjukkan momen spesifik. Ekspresi karakter di frame pertama harus memicu rasa penasaran.',
    hookStyleEn: 'Instant recognition hook: \'When you tell your mom 5 more minutes...\' with expressive opening frame that hooks curiosity.',
    visualGuidance:
      'Gaya animasi yang hangat dan friendly — warna cerah, karakter dengan ekspresi berlebihan. Chibi atau semi-realistic style. Panel komik bisa digunakan untuk mempercepat storytelling. Ekspresi wajah adalah kunci utama.',
    visualGuidanceEn: 'Warm, inviting palette, expressive chibi or stylized 2D characters, snappy comedic zooms and visual sound effects.',
    indonesiaGuidance:
      'Angkat budaya "anak kos", kebiasaan keluarga Indonesia (ditanya kapan nikah, makan nasi harus pakai lauk), dan kebiasaan digital (scroll TikTok sampai subuh, ghosting di chat).',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Saat kamu bilang "5 menit lagi" ke ibu tapi sudah lewat 2 jam',
      'Perjuangan anak kos masak Indomie dengan peralatan seadanya tapi hasilnya level chef',
      'Reaksi beda-beda saat grup WA keluarga mulai share berita hoax',
    ],
    exampleIdeasEn: [
      "When you say 'just 5 more minutes' in bed and wake up 3 hours later in panic",
      "The struggle of making gourmet instant noodles at 2 AM with random pantry leftovers",
      "Different generational reactions when the family group chat starts forwarding chain messages"
],
    icon: 'Smile',
  },

  {
    id: 'microdrama',
    name: 'Microdrama & Mini Seri',
    nameEn: 'Microdrama & Mini Series',
    description:
      'Drama pendek bersambung atau standalone dengan plot twist, emosi kuat, dan cliffhanger yang membuat penonton ingin tahu kelanjutannya.',
    descriptionEn: 'Bite-sized episodic or standalone drama with sharp emotional turns, intense conflicts, and addictive cliffhangers that compel repeat viewing.',
    group: 'Storytelling & Entertainment',
    groupEn: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'microdrama-romance',
        name: 'Drama Romansa',
        nameEn: 'Romance Drama',
        description: 'Kisah cinta pendek dengan twist emosional',
        descriptionEn: 'Short, intense love stories with unexpected emotional twists',
      },
      {
        id: 'microdrama-thriller',
        name: 'Drama Thriller & Misteri',
        nameEn: 'Mystery & Thriller',
        description: 'Cerita tegang pendek dengan plot twist mengejutkan',
        descriptionEn: 'High-tension suspense microdramas with shocking reveals',
      },
      {
        id: 'microdrama-family',
        name: 'Drama Keluarga',
        nameEn: 'Family Drama',
        description: 'Cerita emosional tentang ikatan keluarga dan pengorbanan',
        descriptionEn: 'Deeply emotional stories about family sacrifice and reconciliation',
      },
      {
        id: 'microdrama-social',
        name: 'Drama Sosial',
        nameEn: 'Social Issues Drama',
        description: 'Cerita yang mengangkat isu sosial dengan cara yang menyentuh',
        descriptionEn: 'Thought-provoking narratives spotlighting contemporary societal challenges',
      },
    ],
    creativeFramework:
      'COMPRESSED DRAMA ARC — Gunakan struktur tiga babak yang dipadatkan: ' +
      '(1) Setup cepat dalam 3-5 detik — karakter + konflik langsung terlihat. ' +
      '(2) Escalation — konflik meningkat dengan satu atau dua beat. ' +
      '(3) Twist/Resolution — akhir yang tidak terduga atau emosional. ' +
      'Setiap detik harus memajukan plot. Tidak ada filler. ' +
      'Untuk seri: akhiri setiap episode dengan cliffhanger yang membuat penonton HARUS lihat episode berikutnya.',
    creativeFrameworkEn: 'COMPRESSED DRAMA ARC — 3-act structure condensed into 30-90 seconds: Immediate hook/crisis (0-5s) → Escalation (5-25s) → Climax twist or cliffhanger (25-45s). Zero wasted seconds.',
    hookStyle:
      'Mulai dari tengah konflik — karakter sedang menangis, berteriak, atau situasi sudah tegang. Jangan mulai dari "suatu hari…". Overlay "Part 1" atau "Episode X" untuk menandakan seri.',
    hookStyleEn: 'Drop into the middle of intense conflict — tears, confrontation, or high stakes. Clear \'Part 1 / Episode 1\' badge to establish serial format.',
    visualGuidance:
      'Cinematic framing: close-up untuk emosi, wide shot untuk establishing. Lighting dramatis — kontras tinggi untuk thriller, warm untuk romansa. Gunakan slow-motion di momen puncak emosi. Music scoring sangat penting.',
    visualGuidanceEn: 'Cinematic close-ups, high contrast lighting, dynamic handheld or slow push-in, expressive orchestral or ambient score.',
    indonesiaGuidance:
      'Setting sinetron-style tapi dengan kualitas sinematik. Konflik yang resonan di Indonesia: perjodohan, perbedaan kelas sosial, anak rantau, dan dilema antara karir vs keluarga.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Seorang ibu menjual perhiasannya diam-diam untuk biayai kuliah anaknya — twist: anaknya sudah tahu sejak awal',
      'Dua orang bertemu di kereta, jatuh cinta dalam 3 menit — tapi salah satu dari mereka menyimpan rahasia besar',
      'Mini seri 5 episode: Seorang driver ojol yang ternyata mantan CEO perusahaan besar',
    ],
    exampleIdeasEn: [
      "A mother secretly pawns her cherished heirloom for her son's tuition — twist: he knew all along",
      "Two strangers strike a spark on an express train, but one carries a secret that changes everything",
      "5-part mini series: A delivery driver who turns out to be an undercover tech executive"
],
    icon: 'Film',
  },

  {
    id: 'what-if',
    name: 'Bagaimana Jika & Realitas Alternatif',
    nameEn: 'What If & Alternate Realities',
    description:
      'Konten spekulatif yang mengeksplorasi skenario "bagaimana jika" — dari yang mungkin terjadi hingga yang benar-benar fantastis.',
    descriptionEn: 'Speculative storytelling exploring \'what if\' scenarios — from intriguing historical pivots to mind-expanding scientific and societal shifts.',
    group: 'Storytelling & Entertainment',
    groupEn: 'Storytelling & Entertainment',
    subcategories: [
      {
        id: 'what-if-history',
        name: 'Sejarah Alternatif',
        nameEn: 'Alternate History',
        description: 'Bagaimana jika peristiwa sejarah berbeda hasilnya?',
        descriptionEn: 'What if pivotal historical turning points turned out differently?',
      },
      {
        id: 'what-if-science',
        name: 'Sains Spekulatif',
        nameEn: 'Speculative Science',
        description: 'Bagaimana jika hukum fisika atau alam berubah?',
        descriptionEn: 'What if laws of physics or biology functioned in reverse?',
      },
      {
        id: 'what-if-society',
        name: 'Masyarakat Alternatif',
        nameEn: 'Alternate Societies',
        description: 'Bagaimana jika struktur sosial atau aturan dunia berbeda?',
        descriptionEn: 'What if human social norms or currency operated under wild new rules?',
      },
    ],
    creativeFramework:
      'PREMISE ESCALATION — Mulai dengan satu premis "bagaimana jika" yang jelas, ' +
      'lalu escalate konsekuensinya secara logis tapi mengejutkan. ' +
      'Setiap beat menunjukkan dampak yang semakin besar dari premis awal. ' +
      'Penonton harus berpikir "oh iya, kalau begitu berarti…" di setiap tahap. ' +
      'Akhiri dengan konsekuensi terbesar yang belum terpikirkan penonton.',
    creativeFrameworkEn: 'PREMISE ESCALATION — Start with one clear \'what if\' premise, then escalate logical yet startling chain reactions. Each beat reveals a bigger, unforeseen ripple effect.',
    hookStyle:
      'Teks bold "BAGAIMANA JIKA…" diikuti premis yang langsung memicu rasa penasaran. Visual pertama menunjukkan dunia "normal" yang akan segera berubah.',
    hookStyleEn: 'Bold text \'WHAT IF...\' backed by an uncanny visual that turns a familiar everyday rule upside down.',
    visualGuidance:
      'Split-screen atau before/after untuk menunjukkan perbedaan realitas. Efek visual surreal untuk menunjukkan perubahan dunia. World-building visual yang detail untuk membuat realitas alternatif terasa nyata.',
    visualGuidanceEn: 'Split-screen comparisons, surreal environmental world-building, cinematic scale, high contrast before-and-after aesthetics.',
    indonesiaGuidance:
      'Premis yang relevan untuk Indonesia: "Bagaimana jika Majapahit tidak runtuh?", "Bagaimana jika Indonesia punya 4 musim?", "Bagaimana jika semua orang Indonesia bisa teleportasi?"',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Bagaimana jika gravitasi bumi tiba-tiba menjadi setengahnya — apa yang terjadi pada kehidupan sehari-hari?',
      'Bagaimana jika Indonesia tidak pernah dijajah — seperti apa kota-kota kita sekarang?',
      'Bagaimana jika setiap orang hanya bisa berbohong sekali seumur hidup?',
    ],
    exampleIdeasEn: [
      "What if Earth's gravity suddenly halved for 24 hours — how daily life and transit collapse",
      "What if historical ancient empires survived and evolved into hyper-modern cybernetic metropolises",
      "What if humans could only tell one lie in their entire lifetime before losing the ability to speak?"
],
    icon: 'HelpCircle',
  },

  // ─────────────────────────────────────────────────────────────
  //  GROUP 2 — Visual & AI Creativity
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ai-transformation',
    name: 'Transformasi AI & Before-After',
    nameEn: 'AI Transformation & Before-After',
    description:
      'Konten yang menampilkan transformasi visual menggunakan AI — dari sebelum ke sesudah, perubahan wajah, aging, glow-up, atau transformasi objek.',
    descriptionEn: 'Visually captivating transformation content powered by AI — glow-ups, aging, historical revivals, and surprising object/place metamorphoses.',
    group: 'Visual & AI Creativity',
    groupEn: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'ai-transform-person',
        name: 'Transformasi Orang',
        nameEn: 'Person Transformation',
        description: 'Glow-up, aging, atau perubahan penampilan orang dengan AI',
        descriptionEn: 'Glow-up, aging, or historic styling of human subjects',
      },
      {
        id: 'ai-transform-place',
        name: 'Transformasi Tempat',
        nameEn: 'Place & Architecture',
        description: 'Perubahan lokasi, bangunan, atau kota dengan AI',
        descriptionEn: 'Reimagining local streetscapes, ruins, or landmarks into futuristic realms',
      },
      {
        id: 'ai-transform-object',
        name: 'Transformasi Objek',
        nameEn: 'Object Metamorphosis',
        description: 'Mengubah benda biasa menjadi sesuatu yang luar biasa',
        descriptionEn: 'Transforming mundane daily items into cinematic, luxury artifacts',
      },
    ],
    creativeFramework:
      'REVEAL ARCHITECTURE — Struktur dibangun di atas momen "reveal". ' +
      'Tunjukkan keadaan "sebelum" cukup lama agar penonton membentuk ekspektasi, ' +
      'lalu gunakan transisi yang memuaskan untuk menunjukkan hasil transformasi. ' +
      'Kunci: gap antara ekspektasi dan hasil harus sebesar mungkin. ' +
      'Bisa dibalik (mulai dari hasil, reveal asal) untuk efek berbeda.',
    creativeFrameworkEn: 'REVEAL ARCHITECTURE — Built around the anticipation and payoff of the transformation reveal. Establish the \'before\' baseline, heighten suspense, and unleash a satisfying visual transition.',
    hookStyle:
      'Tunjukkan keadaan "sebelum" yang biasa atau bahkan jelek di frame pertama — penonton harus penasaran "akan jadi apa?". Tambahkan teks "Tunggu sampai akhir…" atau countdown visual.',
    hookStyleEn: 'Display the raw, humble \'before\' state with a high-stakes promise or countdown: \'Watch till the end to see the 50-year leap...\'',
    visualGuidance:
      'Transisi harus mulus dan memuaskan — morph, swipe, atau dissolve. Sebelum: pencahayaan flat, tanpa filter. Sesudah: pencahayaan dramatis, warna saturated. Slow-motion di momen reveal. Angle kamera harus konsisten before/after.',
    visualGuidanceEn: 'Seamless morphs, wipes, or particle dissolves. Flat realistic lighting in \'before\' transitioning to dramatic cinematic lighting in \'after\'.',
    indonesiaGuidance:
      'Transformasi landmark Indonesia (Monas, Borobudur versi futuristik), transformasi makanan tradisional menjadi fine dining, atau glow-up dengan konteks budaya lokal.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Transformasi AI: Bagaimana wajah pahlawan nasional Indonesia akan terlihat jika hidup di tahun 2024',
      'Before-After: Warung pinggir jalan ditransformasi AI menjadi restoran bintang 5 tapi menu tetap sama',
      'Mengubah foto lama hitam-putih keluarga menjadi berwarna dan hidup dengan AI',
    ],
    exampleIdeasEn: [
      "AI Transformation: How iconic historical heroes would dress and look in modern 2024 streetwear",
      "Before-After: A rustic street food cart transformed into a Michelin-star dining aesthetic",
      "Restoring and animating a faded 100-year-old black-and-white family photograph into vivid 4K life"
],
    icon: 'Wand2',
  },

  {
    id: 'miniature-giant',
    name: 'Dunia Miniatur & Raksasa',
    nameEn: 'Miniature Worlds & Giants',
    description:
      'Konten yang bermain dengan skala — menampilkan dunia miniatur yang detail atau objek/makhluk raksasa di dunia nyata, menciptakan efek visual yang memukau.',
    descriptionEn: 'Scale-disrupting visual wonders — intricate miniature universes hidden inside everyday objects or colossal giants roaming modern reality.',
    group: 'Visual & AI Creativity',
    groupEn: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'miniature-world',
        name: 'Dunia Miniatur',
        nameEn: 'Miniature Worlds',
        description: 'Dunia kecil yang sangat detail di dalam objek sehari-hari',
        descriptionEn: 'Tiny, bustling micro-societies flourishing inside daily items',
      },
      {
        id: 'giant-world',
        name: 'Dunia Raksasa',
        nameEn: 'Colossal Giants',
        description: 'Makhluk atau objek raksasa berinteraksi dengan dunia nyata',
        descriptionEn: 'Towering mythical or organic titans interacting with real-world skylines',
      },
      {
        id: 'scale-illusion',
        name: 'Ilusi Skala',
        nameEn: 'Scale Illusions',
        description: 'Permainan perspektif yang menipu mata penonton',
        descriptionEn: 'Perspective trickery that bends spatial expectations',
      },
    ],
    creativeFramework:
      'SCALE DISRUPTION — Keajaiban muncul dari pelanggaran skala yang sudah kita kenal. ' +
      'Mulai dengan establishing shot di skala normal, lalu zoom in/out untuk memecahkan ekspektasi. ' +
      'Detail adalah segalanya: semakin detail dunia miniatur, semakin memukau. ' +
      'Untuk dunia raksasa, interaksi dengan objek skala normal adalah kunci impact. ' +
      'Musik dan sound design harus mendukung pergeseran skala.',
    creativeFrameworkEn: 'SCALE DISRUPTION — Violate conventional scale rules. Establish standard frame, then zoom into microscopic detail or pull back to reveal a towering presence.',
    hookStyle:
      'Visual pertama terlihat "normal" — lalu kamera bergerak untuk menunjukkan bahwa skalanya salah. Zoom-in ke objek biasa yang ternyata berisi dunia miniatur, atau zoom-out untuk reveal makhluk raksasa.',
    hookStyleEn: 'Frame opens on a seemingly ordinary object, then camera dives in to reveal an entire functioning city inside it.',
    visualGuidance:
      'Depth of field ekstrem untuk efek tilt-shift (miniatur). Partikel debu atau efek atmosfer untuk sense of scale. Lighting harus konsisten antara elemen miniatur/raksasa dan environment asli. Komposisi memanfaatkan leading lines untuk menunjukkan kontras skala.',
    visualGuidanceEn: 'Extreme tilt-shift depth of field for miniature dioramas; volumetric fog, scale dust particles, and low-angle camera perspective for giants.',
    indonesiaGuidance:
      'Miniatur dunia di dalam makanan Indonesia (nasi goreng, rendang), dunia kecil di dalam becak, atau kucing raksasa di antara gedung-gedung Jakarta.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Di dalam sepiring nasi goreng ternyata ada seluruh peradaban miniatur yang hidup',
      'Kucing raksasa setinggi Monas berjalan-jalan di Jakarta — penduduk kota bereaksi',
      'Zoom in ke tetes air hujan dan temukan kota miniatur di dalamnya',
    ],
    exampleIdeasEn: [
      "Zooming into a cup of coffee reveals a tiny bustling harbor with miniature ships sailing the foam",
      "A colossal fluffy cat as tall as a skyscraper calmly sunbathing across a downtown financial district",
      "A single droplet of morning rain holding a fully illuminated microscopic fantasy city"
],
    icon: 'Maximize2',
  },

  {
    id: 'fantasy-mythology',
    name: 'Fantasi & Mitologi',
    nameEn: 'Fantasy & Mythology',
    description:
      'Konten yang mengangkat dunia fantasi, makhluk mitologi, legenda, dan cerita rakyat dengan visual AI yang menakjubkan.',
    descriptionEn: 'Mythological sagas, folklore, legendary beasts, and celestial world-building brought to life through spellbinding cinematic AI imagery.',
    group: 'Visual & AI Creativity',
    groupEn: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'fantasy-nusantara',
        name: 'Mitologi Nusantara',
        nameEn: 'Regional Folklore & Legends',
        description: 'Makhluk dan legenda dari cerita rakyat Indonesia',
        descriptionEn: 'Ancient regional mythical creatures and heroic epics',
      },
      {
        id: 'fantasy-world',
        name: 'Mitologi Dunia',
        nameEn: 'World Mythologies',
        description: 'Dewa, naga, dan makhluk mitologi dari berbagai budaya',
        descriptionEn: 'Dragons, pantheons, and legendary lore across global mythologies',
      },
      {
        id: 'fantasy-original',
        name: 'Fantasi Original',
        nameEn: 'Original High Fantasy',
        description: 'Dunia fantasi dan makhluk ciptaan baru yang unik',
        descriptionEn: 'Novel fantasy realms, spellcasting rules, and exotic creature designs',
      },
    ],
    creativeFramework:
      'MYTHIC WORLDBUILDING — Setiap video adalah jendela ke dunia yang utuh. ' +
      'Bangun "aturan dunia" yang konsisten meskipun fantastis. ' +
      'Makhluk mitologi harus punya "personality" dan motivasi, bukan hanya visual. ' +
      'Gunakan struktur mitos klasik: ada keajaiban, ada bahaya, ada pelajaran. ' +
      'Visual harus "lived-in" — dunia fantasi terasa pernah dihuni, bukan baru dibuat.',
    creativeFrameworkEn: 'MYTHIC WORLDBUILDING — Every frame feels lived-in and steeped in deep lore. Mythical beings with clear agency and characterization rather than generic CGI.',
    hookStyle:
      'Buka dengan visual yang impossible tapi indah — makhluk terbang, dunia terbalik, atau landscape fantasi yang detail. Musik orkestra atau gamelan modern untuk membangun atmosphere epik.',
    hookStyleEn: 'Open with an awe-inspiring, impossible vision — an ancient leviathan breaching clouds or a glowing celestial portal.',
    visualGuidance:
      'Warna-warna saturated dan dramatic: emas, ungu, hijau zamrud. Volumetric lighting dan god rays. Desain makhluk harus detail dan konsisten. Environment fantasi dengan elemen arsitektur yang recognizable. Partikel magic dan efek cahaya supernatural.',
    visualGuidanceEn: 'Luminous volumetric rays, deep jewel tones (emerald, gold, obsidian), mystical particulate effects, authentic cultural ornamentation.',
    indonesiaGuidance:
      'Angkat makhluk mitologi Nusantara: Garuda, Naga Batak, Leak Bali, Buto Ijo. Gunakan estetika wayang dan batik sebagai elemen desain. Arsitektur candi dan keraton sebagai inspirasi world-building.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Garuda Pancasila terbangun dari tidur panjangnya dan terbang melintasi seluruh Indonesia modern',
      'Sebuah desa menemukan pintu gerbang ke dunia paralel di balik air terjun — versi fantasi Indonesia',
      'Pertarungan epik antara Naga Batak dan makhluk laut dari mitologi Bugis di Samudra Hindia',
    ],
    exampleIdeasEn: [
      "An ancient mythical eagle guardian awakens after centuries to watch over a gleaming modern metropolis",
      "Hidden behind a sacred mountain waterfall lies an undiscovered subterranean civilization",
      "An epic celestial clash between sea dragons and mountain titans over the tempestuous open ocean"
],
    icon: 'Sparkles',
  },

  {
    id: 'satisfying-restoration',
    name: 'Video Satisfying & Restorasi',
    nameEn: 'Satisfying Restorations & Process',
    description:
      'Konten visual yang memberikan kepuasan melalui proses restorasi, pembersihan, penyusunan, atau transformasi dari kotor/rusak menjadi bersih/baru.',
    descriptionEn: 'Oddly satisfying visual content featuring deep cleaning, precision craftsmanship, meticulous restorations, and orderly transformations.',
    group: 'Visual & AI Creativity',
    groupEn: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'satisfying-cleaning',
        name: 'Pembersihan & Restorasi',
        nameEn: 'Deep Cleaning & Renewal',
        description: 'Proses membersihkan atau merestorasi benda kotor/rusak',
        descriptionEn: 'Transforming filthy, weathered surfaces into pristine condition',
      },
      {
        id: 'satisfying-organizing',
        name: 'Penyusunan & Organisasi',
        nameEn: 'Organization & Symmetry',
        description: 'Merapikan dan mengorganisir benda secara memuaskan',
        descriptionEn: 'Tidying clutter into razor-sharp, geometric perfection',
      },
      {
        id: 'satisfying-process',
        name: 'Proses yang Memuaskan',
        nameEn: 'Satisfying Craft Process',
        description: 'Proses pembuatan, pemotongan, atau pencetakan yang oddly satisfying',
        descriptionEn: 'Hypnotic artisan crafting, slicing, polishing, and manufacturing cycles',
      },
    ],
    creativeFramework:
      'TENSION-RELEASE LOOP — Bangun "ketidaknyamanan visual" (kotor, berantakan, rusak), ' +
      'lalu release melalui proses yang memuaskan. ' +
      'Kunci: proses itu sendiri harus visible dan gradual — penonton menikmati perjalanan, bukan hanya hasil. ' +
      'Gunakan ritme: setup ketidaknyamanan → proses → moment of satisfaction → repeat. ' +
      'Audio ASMR (suara scrubbing, clicking, pouring) memperkuat kepuasan.',
    creativeFrameworkEn: 'TENSION-RELEASE LOOP — Build visual discomfort through heavy dirt, rust, or chaos, then deliver visceral release through gradual, immaculate cleansing.',
    hookStyle:
      'Tunjukkan keadaan paling kotor/berantakan/rusak di detik pertama — semakin "parah" semakin baik. Penonton langsung ingin melihat proses pembersihannya. Sound effect yang crisp di awal.',
    hookStyleEn: 'Frame 1 presents the most severe grimy condition possible. Crisp tactile ASMR sound right at second zero.',
    visualGuidance:
      'Close-up ekstrem untuk menunjukkan detail proses. Time-lapse untuk proses panjang. Before/after split-screen di akhir. Warna kontras antara kotor (kusam, coklat) dan bersih (cerah, putih). Pencahayaan merata tanpa shadow keras.',
    visualGuidanceEn: 'Macro close-ups on bristles, peeling rust, high-definition water jets, and side-by-side spotless split screens.',
    indonesiaGuidance: undefined,
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'Restorasi sepatu sneaker putih yang sudah sangat kotor — dari lumpur hingga kembali seperti baru',
      'Membersihkan dan menata ulang warung makan yang berantakan — transformasi total dalam 60 detik',
      'Proses pembuatan jajanan tradisional Indonesia dari awal hingga akhir — satisfying ASMR',
    ],
    exampleIdeasEn: [
      "Restoring heavily mud-caked vintage sneakers back to factory showroom freshness",
      "Deep power-washing 20 years of moss off an ancient stone garden path in 45 seconds",
      "Artisan wood carving and resin polishing of a geometric sculpture — hypnotic ASMR"
],
    icon: 'Brush',
  },

  {
    id: 'scenic-aesthetic',
    name: 'Visual Scenic & Estetik',
    nameEn: 'Scenic Visuals & Aesthetic Mood',
    description:
      'Konten visual yang indah dan cinematic — pemandangan alam, urban aesthetic, golden hour, dan momen-momen visual yang menenangkan atau memukau.',
    descriptionEn: 'Breathtaking cinematic scenery, tranquil golden-hour landscapes, urban neon aesthetics, and mood-driven visual poetry.',
    group: 'Visual & AI Creativity',
    groupEn: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'scenic-nature',
        name: 'Alam & Pemandangan',
        nameEn: 'Nature & Wilderness',
        description: 'Keindahan alam dari pegunungan hingga lautan',
        descriptionEn: 'Majestic peaks, misty coastlines, and pristine rainforests',
      },
      {
        id: 'scenic-urban',
        name: 'Urban & Cityscape',
        nameEn: 'Urban & Architecture',
        description: 'Estetika kota, arsitektur, dan kehidupan urban',
        descriptionEn: 'Metropolitan skylines, moody rainy streets, and modern geometry',
      },
      {
        id: 'scenic-mood',
        name: 'Mood & Atmosphere',
        nameEn: 'Atmosphere & Mood',
        description: 'Visual yang membangun suasana dan emosi tertentu',
        descriptionEn: 'Visual tones crafted to evoke tranquility, nostalgia, or wanderlust',
      },
    ],
    creativeFramework:
      'VISUAL POETRY — Tidak ada plot tradisional; "cerita" disampaikan melalui mood, ritme visual, dan emosi. ' +
      'Setiap shot harus bisa berdiri sendiri sebagai artwork. ' +
      'Gunakan musik sebagai narasi utama — visual mengikuti ritme dan emosi musik. ' +
      'Transisi antar shot harus seamless dan mengalir. ' +
      'Ciptakan "visual rhythm": shot cepat → lambat → cepat untuk mengendalikan emosi penonton.',
    creativeFrameworkEn: 'VISUAL POETRY — Mood and emotional cadence replace conventional dialogue. Every shot stands as fine-art photography synchronized to evocative audio.',
    hookStyle:
      'Buka dengan shot paling dramatis dan indah — aerial view, golden hour extreme, atau visual impossible. Musik harus langsung menyentuh emosi di detik pertama. Tidak perlu teks atau narasi.',
    hookStyleEn: 'Begin with a jaw-dropping establishing aerial shot or sunrise breakthrough that commands immediate stillness and wonder.',
    visualGuidance:
      'Aspect ratio cinematic (21:9 letterbox di dalam 9:16 bisa efektif). Color grading yang kuat dan konsisten per video. Drone shots dan gimbal movements yang smooth. Golden hour dan blue hour lighting. Slow-motion untuk momen-momen kecil yang indah.',
    visualGuidanceEn: 'Anamorphic aspect ratio, subtle slow-motion, golden hour/blue hour lighting, smooth gimbal or drone camera trajectories.',
    indonesiaGuidance:
      'Indonesia punya landscape luar biasa: Raja Ampat, Bromo, Labuan Bajo, sawah terasering Bali. Urban aesthetic Jakarta malam hari, gang-gang Yogyakarta, atau pelabuhan tradisional.',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Cinematic journey matahari terbit di Gunung Bromo — dari gelap total hingga emas menyala',
      'Jakarta dalam 60 detik: dari kemacetan pagi hingga gemerlap lampu kota di malam hari',
      'Visual poem tentang hujan di desa Indonesia — setiap shot adalah lukisan bergerak',
    ],
    exampleIdeasEn: [
      "A cinematic sunrise across misty volcanic peaks — from pitch-black night to radiant amber dawn",
      "A metropolitan neon odyssey: cruising rainy downtown avenues under reflected streetlights",
      "Visual poem of a tranquil monsoon shower over a secluded mountain cabin"
],
    icon: 'Mountain',
  },

  {
    id: 'kids-animation',
    name: 'Animasi Edukasi & Cerita Anak',
    nameEn: 'Kids Educational & Cheerful Animation',
    description:
      'Video animasi 3D/2D ceria untuk anak dan balita, menampilkan karakter fabel imut, petualangan eksplorasi, dongeng budi pekerti, dan edukasi kebiasaan baik.',
    descriptionEn: 'Vibrant, friendly 2D/3D animations for toddlers and children: adorable animal fables, exploration quests, positive manners, and early learning.',
    group: 'Visual & AI Creativity',
    groupEn: 'Visual & AI Creativity',
    subcategories: [
      {
        id: 'kids-fables-moral',
        name: 'Fabel Hewan & Budi Pekerti',
        nameEn: 'Animal Fables & Values',
        description: 'Cerita dongeng hewan yang mengajarkan nilai kejujuran, tolong-menolong, dan empati',
        descriptionEn: 'Heartwarming fables teaching kindness, honesty, and teamwork',
      },
      {
        id: 'kids-early-learning',
        name: 'Edukasi Dini & Sains Ringan',
        nameEn: 'Early Learning & Science',
        description: 'Mengenal warna, angka, hewan, dan fenomena alam lewat nyanyian dan animasi ceria',
        descriptionEn: 'Counting, colors, animal sounds, and nature wonders made fun',
      },
      {
        id: 'kids-daily-habits',
        name: 'Kebiasaan Baik Sehari-hari',
        nameEn: 'Healthy Daily Habits',
        description: 'Menyikat gigi, merapikan mainan, cuci tangan, dan adab sopan santun kepada orang tua',
        descriptionEn: 'Brushing teeth, tidying toys, and polite manners with cheerful songs',
      },
      {
        id: 'kids-folklore-cheerful',
        name: 'Cerita Rakyat Versi Ceria',
        nameEn: 'Cheerful Folk Tales',
        description: 'Dongeng nusantara diadaptasi ramah anak tanpa unsur kekerasan atau ketakutan',
        descriptionEn: 'Classic folk tales adapted into gentle, kid-friendly adventures',
      },
    ],
    creativeFramework:
      'CHEERFUL MORAL ARC — Buka dengan visual karakter imut berenergi positif dalam dunia penuh warna. ' +
      'Gunakan struktur: "Momen Ceria (Detik 0-3) → Masalah Kecil/Tantangan (3-8s) → Kolaborasi/Penyelesaian Menyenangkan (8-20s) → Lagu/Pesan Moral Gembira (20-30s)". ' +
      'Gunakan kalimat pendek, ritme pengucapan jelas, dan repetisi kata kunci yang mudah ditirukan anak-anak.',
    creativeFrameworkEn: 'CHEERFUL MORAL ARC — Energetic opening greeting (0-3s) → Playful challenge (3-10s) → Fun collaborative solution (10-22s) → Joyful rhyme or song payoff (22-30s).',
    hookStyle:
      'Karakter imut melambaikan tangan ke arah kamera sambil menyapa ceria atau bertanya hal seru: "Halo teman-teman! Siapa yang tahu kenapa gajah punya belalai panjang?". Efek suara pop/chime cerah dalam 1 detik pertama.',
    hookStyleEn: 'Cute rounded character waves cheerfully directly at the camera with an engaging question and bright chime sound effect.',
    visualGuidance:
      'Warna primer cerah (bright yellow, sky blue, candy pink) dan pastel lembut. Karakter 3D stylized rounded chibi (gaya Pixar/Disney kartun anak). Pencahayaan terang merata (high-key soft lighting), ekspresi mata besar ekspresif, tanpa elemen tajam atau menakutkan.',
    visualGuidanceEn: 'Saturated primary colors, soft pastel backdrops, rounded chibi 3D characters, high-key warm lighting, friendly expressive eyes.',
    indonesiaGuidance:
      'Sentuhan ramah Indonesia: latar rumah asri pekarangan buah tropis, taman bermain nusantara, hewan khas nusantara (kancil, badak bercula satu, burung jalak bali). Dialog berbahasa Indonesia yang santun dan edukatif.',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Si Kancil & Pohon Buah Bersama: Kancil mengajak Monyet membagikan buah rambutan kepada kura-kura yang lapar',
      'Petualangan Dino Kecil Mencari Pelangi: Belajar mengenali 7 warna pelangi lewat gelembung sabun ajaib di taman',
      'Ayo Sikat Gigi Sebelum Tidur!: Lagu dan animasi seru kuman gigi yang kabur saat sikat gigi berbusa stroberi',
    ],
    exampleIdeasEn: [
      "The Little Clever Deer & The Fruit Tree: Working together with friends to pick sweet tropical fruits",
      "Little Dino Rainbow Safari: Discovering 7 colors of the rainbow through magic floating soap bubbles",
      "Brush Your Teeth Song: Fun cartoon tooth monsters dancing away under strawberry foam"
],
    icon: 'Sparkles',
  },

  // ─────────────────────────────────────────────────────────────
  //  GROUP 3 — Education, Facts & Mystery
  // ─────────────────────────────────────────────────────────────
  {
    id: 'educational-facts',
    name: 'Fakta Edukatif & Rasa Ingin Tahu',
    nameEn: 'Curiosity & Mind-Blowing Facts',
    description:
      'Konten yang menyajikan fakta menarik, penjelasan sains, sejarah, atau fenomena dengan cara yang engaging dan mudah dipahami.',
    descriptionEn: 'Engaging science explainers, astonishing historical trivia, biological wonders, and fascinating revelations behind everyday phenomena.',
    group: 'Education, Facts & Mystery',
    groupEn: 'Education, Facts & Mystery',
    subcategories: [
      {
        id: 'edu-science',
        name: 'Sains & Teknologi',
        nameEn: 'Science & Technology',
        description: 'Fakta dan penjelasan sains yang mind-blowing',
        descriptionEn: 'Mind-bending discoveries in space, physics, and technology',
      },
      {
        id: 'edu-history',
        name: 'Sejarah & Budaya',
        nameEn: 'History & Antiquity',
        description: 'Fakta sejarah dan budaya yang jarang diketahui',
        descriptionEn: 'Obscure historical truths and legendary events',
      },
      {
        id: 'edu-nature',
        name: 'Alam & Makhluk Hidup',
        nameEn: 'Nature & Biology',
        description: 'Fakta menakjubkan tentang dunia alam dan biologi',
        descriptionEn: 'Extraordinary creature adaptations and planetary phenomena',
      },
      {
        id: 'edu-daily',
        name: 'Fakta Sehari-hari',
        nameEn: 'Everyday Objects',
        description: 'Penjelasan menarik tentang benda atau fenomena sehari-hari',
        descriptionEn: 'Surprising engineering secrets behind daily items we take for granted',
      },
    ],
    creativeFramework:
      'CURIOSITY GAP — Mulai dengan pertanyaan atau fakta yang menciptakan "gap" pengetahuan, ' +
      'lalu tutup gap tersebut secara bertahap dengan penjelasan yang semakin dalam. ' +
      'Setiap beat harus membuat penonton berpikir "oh, tapi kenapa?" — sehingga mereka terus menonton. ' +
      'Gunakan analogi visual yang konkret untuk konsep abstrak. ' +
      'Akhiri dengan implikasi yang membuat penonton berpikir setelah video selesai.',
    creativeFrameworkEn: 'CURIOSITY GAP — Spark a knowledge gap with an impossible-sounding fact, then systematically explain it with vivid analogies and accelerating intrigue.',
    hookStyle:
      'Buka dengan pertanyaan provokatif atau fakta mengejutkan: "Tahukah kamu bahwa…?" atau "Ini adalah benda yang bisa menghancurkan…". Visual pertama harus mendukung klaim bold tersebut.',
    hookStyleEn: 'Provocative fact or challenging question: \'Did you know that...\' backed by a bold graphic statement.',
    visualGuidance:
      'Infografis animasi yang clean dan modern. Zoom-in/zoom-out untuk menunjukkan skala. Diagram dan visualisasi data yang atraktif. Split-screen untuk perbandingan. Teks overlay untuk angka dan fakta kunci — ukuran besar, font bold.',
    visualGuidanceEn: 'Clean kinetic typography, animated infographic overlays, comparative split-screens, dynamic zoom scale diagrams.',
    indonesiaGuidance:
      'Fakta tentang Indonesia yang orang Indonesia sendiri belum tahu: keunikan flora/fauna, sejarah yang jarang diajarkan, fenomena alam khas Indonesia, dan pencapaian Indonesia di dunia.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Kenapa Indonesia punya 17.000 pulau tapi mayoritas penduduknya tinggal di Jawa? Penjelasan geologis dan historis',
      'Apa yang terjadi pada tubuhmu kalau kamu hanya makan Indomie selama 30 hari? Penjelasan ilmiah',
      'Komodo Dragon: satu-satunya naga sungguhan di dunia — fakta yang bikin merinding',
    ],
    exampleIdeasEn: [
      "Why our oceans contain more historical artifacts than all world museums combined",
      "What happens to human cellular biology if you drink only pure water for 7 straight days",
      "The bizarre truth about deep-sea creatures that produce their own bioluminescent headlights"
],
    icon: 'Lightbulb',
  },

  {
    id: 'mystery-horror',
    name: 'Misteri, Horor & Tak Terjelaskan',
    nameEn: 'Mystery, Horror & Unexplained',
    description:
      'Konten yang mengeksplorasi misteri, cerita horor, fenomena tak terjelaskan, true crime, dan hal-hal yang membuat penonton merinding sekaligus penasaran.',
    descriptionEn: 'Spine-chilling mysteries, psychological horror, unsolved phenomena, atmospheric urban legends, and unsettling true crime enigmas.',
    group: 'Education, Facts & Mystery',
    groupEn: 'Education, Facts & Mystery',
    subcategories: [
      {
        id: 'mystery-unsolved',
        name: 'Misteri Belum Terpecahkan',
        nameEn: 'Unsolved Enigmas',
        description: 'Kasus dan fenomena yang masih jadi tanda tanya',
        descriptionEn: 'Historical mysteries and vanishing incidents that remain unexplained',
      },
      {
        id: 'mystery-horror-story',
        name: 'Cerita Horor',
        nameEn: 'Atmospheric Horror',
        description: 'Cerita seram yang membangun suspense dan ketakutan',
        descriptionEn: 'Creepy, psychological horror building dread and shocking twists',
      },
      {
        id: 'mystery-conspiracy',
        name: 'Teori & Konspirasi',
        nameEn: 'Theories & Conspiracies',
        description: 'Teori menarik tentang fenomena yang tak terjelaskan',
        descriptionEn: 'Intriguing hypotheses surrounding bizarre occurrences',
      },
    ],
    creativeFramework:
      'SUSPENSE ARCHITECTURE — Informasi diberikan secara terkontrol untuk memaksimalkan ketegangan. ' +
      'Gunakan prinsip "apa yang tidak ditunjukkan lebih menakutkan daripada yang ditunjukkan". ' +
      'Build-up bertahap: normal → sedikit aneh → sangat aneh → reveal yang mengganggu. ' +
      'Sisakan satu pertanyaan yang tidak terjawab di akhir — biarkan penonton memikirkannya. ' +
      'Sound design adalah 50% dari horor: silence → ambient → sudden sound.',
    creativeFrameworkEn: 'SUSPENSE ARCHITECTURE — Strict control of information. What remains unseen in the shadows terrifies more than what is revealed. Sudden silence followed by ambient chill.',
    hookStyle:
      'Buka dengan visual yang "something is off" — tampak normal tapi ada sesuatu yang salah. Atau mulai dengan kalimat misterius: "Sampai hari ini, tidak ada yang bisa menjelaskan…". Suara ambient yang unsettling.',
    hookStyleEn: 'Frame opens on an ordinary setting where one subtle detail is completely wrong, paired with an unsettling ambient frequency.',
    visualGuidance:
      'Desaturated colors, kontras tinggi dengan shadow dalam. Grain dan noise untuk efek raw/found footage. Camera movement tidak stabil untuk membangun unease. Negative space yang banyak — biarkan penonton membayangkan apa yang ada di kegelapan. Flash frame dan glitch untuk jump scare subtle.',
    visualGuidanceEn: 'Desaturated palettes, deep shadow contrast, vintage film grain, uneasy handheld motion, subtle glitch frames.',
    indonesiaGuidance:
      'Indonesia kaya akan urban legend dan cerita horor: Kuntilanak, Pocong, Tuyul, Nyi Roro Kidul. Bisa juga angkat misteri sejarah Indonesia yang belum terpecahkan. Hindari konten yang terlalu gore atau menyinggung kepercayaan.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Misteri Pulau Sentinel Utara Indonesia: Mengapa penduduknya menolak semua kontak dengan dunia luar?',
      'Cerita horor POV: Kamu bermalam di rumah nenek di desa dan mendengar suara yang tidak bisa dijelaskan',
      'Fakta mengerikan tentang kedalaman laut Indonesia yang belum pernah dijelajahi manusia',
    ],
    exampleIdeasEn: [
      "The eerie lighthouse mystery where three keepers vanished from an island without a trace",
      "POV Horror: Spending a stormy night at an isolated forest cabin when tapping begins on the roof",
      "Terrifying real discoveries made at the deepest points of the Mariana Trench"
],
    icon: 'Ghost',
  },

  // ─────────────────────────────────────────────────────────────
  //  GROUP 4 — Social & Short-form Formats
  // ─────────────────────────────────────────────────────────────
  {
    id: 'animal-pet',
    name: 'Hewan & POV Peliharaan',
    nameEn: 'Animals & Pet POV',
    description:
      'Konten dari sudut pandang hewan peliharaan atau tentang interaksi menggemaskan antara hewan dan manusia — lucu, menghangatkan hati, dan shareable.',
    descriptionEn: 'Heartwarming, hilarious, and viral pet perspectives, inner-monologue animal humor, and incredible wildlife behavioral moments.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'animal-pov',
        name: 'POV Hewan',
        nameEn: 'Pet Inner POV',
        description: 'Cerita dari sudut pandang hewan peliharaan',
        descriptionEn: 'Stories told from the sassy inner monologue of domestic pets',
      },
      {
        id: 'animal-human',
        name: 'Interaksi Hewan & Manusia',
        nameEn: 'Human & Pet Bonds',
        description: 'Momen lucu atau menyentuh antara hewan dan pemiliknya',
        descriptionEn: 'Heartfelt, goofy, and endearing human-animal companionship',
      },
      {
        id: 'animal-wild',
        name: 'Hewan Liar & Alam',
        nameEn: 'Wildlife & Nature',
        description: 'Perilaku menakjubkan hewan liar yang jarang terlihat',
        descriptionEn: 'Rare, breathtaking moments captured in the animal kingdom',
      },
    ],
    creativeFramework:
      'ANTHROPOMORPHIC NARRATION — Berikan "suara batin" dan "personality" pada hewan. ' +
      'Humor muncul dari gap antara apa yang hewan "pikirkan" vs realitas situasi. ' +
      'Narasi inner-monolog hewan dengan bahasa casual dan relatable. ' +
      'Emosi kunci: gemas, lucu, dan "aww". ' +
      'Untuk konten edukatif, gunakan fakta hewan yang mind-blowing sebagai hook.',
    creativeFrameworkEn: 'ANTHROPOMORPHIC NARRATION — Give animals a distinct personality and inner monologue. Comedy stems from the gap between their lofty thoughts and goofy actions.',
    hookStyle:
      'Close-up wajah hewan dengan ekspresi "judging" atau menggemaskan. Teks overlay narasi inner-monolog hewan: "POV: Majikan pulang setelah 5 menit tapi menurutku sudah 5 tahun."',
    hookStyleEn: 'Close-up on a pet with a deadpan judgmental stare with on-screen monologue text: \'POV: My human was gone for 3 minutes which is 30 dog years...\'',
    visualGuidance:
      'Eye-level kamera sejajar hewan untuk POV. Warna warm dan cerah. Slow-motion untuk momen menggemaskan. Focus on ekspresi — mata dan telinga hewan sangat ekspresif. Background blur agar fokus pada hewan.',
    visualGuidanceEn: 'Low camera eye-level matching pet height, warm vibrant hues, snappy comedic zoom-ins on ear twitches or expressive eyes.',
    indonesiaGuidance:
      'Kucing (sangat populer di Indonesia), anjing kampung, bebek, ayam kampung — hewan yang familiar. Konteks: kucing warung kopi, kucing masjid, anjing penjaga kampung.',
    suggestedDuration: ['10-15s', '15-30s', '30-60s'],
    exampleIdeas: [
      'POV: Kamu kucing warung kopi yang menilai setiap pelanggan berdasarkan pesanan mereka',
      'Drama seekor kucing kampung yang "diadopsi" oleh 5 rumah berbeda dan menikmati makan gratis di semua tempat',
      'Reaksi anjing kampung pertama kali melihat salju — AI visualisasi momen imajiner',
    ],
    exampleIdeasEn: [
      "POV: You are a neighborhood café cat rating every customer based on how they greet you",
      "A stray puppy strategic masterplan to adopt the most gentle human in the park",
      "A golden retriever inner monologue during its very first encounter with a robot vacuum"
],
    icon: 'Cat',
  },

  {
    id: 'comedy-meme',
    name: 'Komedi, Meme & Reaksi',
    nameEn: 'Comedy, Memes & Reactions',
    description:
      'Konten humor murni — meme viral, sketch komedi pendek, reaksi berlebihan, dan format-format lucu yang memicu share dan comment.',
    descriptionEn: 'Pure comedy gold: viral sketch formats, relatable exaggerations, trending meme parodies, and high-energy comedic timing.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'comedy-sketch',
        name: 'Sketch Komedi',
        nameEn: 'Comedic Sketches',
        description: 'Cerita komedi pendek dengan punchline kuat',
        descriptionEn: 'Tight situational comedy with sharp punchlines',
      },
      {
        id: 'comedy-meme-format',
        name: 'Meme & Format Viral',
        nameEn: 'Viral Meme Formats',
        description: 'Adaptasi format meme populer dengan konten baru',
        descriptionEn: 'Clever parodies and iterations of trending social media tropes',
      },
      {
        id: 'comedy-reaction',
        name: 'Reaksi & Commentary',
        nameEn: 'Humorous Reactions',
        description: 'Reaksi lucu terhadap situasi atau konten viral',
        descriptionEn: 'Over-the-top commentary and reaction humor to absurd life situations',
      },
    ],
    creativeFramework:
      'COMEDIC TIMING ENGINE — Humor = Setup + Subverted Expectation + Timing. ' +
      'Setup harus singkat (max 5 detik) agar punchline tidak kehilangan momentum. ' +
      'Subvert ekspektasi: arahkan penonton ke satu hal, deliver yang lain. ' +
      'Beat komedi: pause sebelum punchline, lalu deliver dengan cepat. ' +
      'Rule of Three: dua hal normal → yang ketiga absurd. ' +
      'Callback ke joke sebelumnya memperkuat humor di akhir.',
    creativeFrameworkEn: 'COMEDIC TIMING ENGINE — Setup + Subverted Expectation + Razor Timing. Deliver setup within 4 seconds, subvert sharply at the 12-second mark, hit with an unexpected callback.',
    hookStyle:
      'Langsung masuk ke situasi lucu — tidak ada intro. Ekspresi berlebihan atau situasi absurd di frame pertama. Sound effect yang familiar dan lucu (cartoon boing, record scratch).',
    hookStyleEn: 'Immediate plunge into absurdity — outrageous facial reaction, iconic sound cue, zero unnecessary introduction.',
    visualGuidance:
      'Warna cerah dan saturated. Ekspresi wajah/karakter yang exaggerated. Zoom-in cepat ke momen punchline. Meme text: font Impact atau bold sans-serif. Pacing cepat — cut setiap 2-3 detik.',
    visualGuidanceEn: 'Vibrant high-saturation tones, rapid cuts (1.5-3 seconds per cut), sudden zooms into deadpan faces, crisp sound effects.',
    indonesiaGuidance:
      'Humor Indonesia: sarkas halus, situasi "mager", drama keluarga yang dilebih-lebihkan, dan budaya "flexing". Referensi: meme lokal, trending topics Twitter/TikTok Indonesia.',
    suggestedDuration: ['10-15s', '15-30s'],
    exampleIdeas: [
      'Ekspektasi vs Realita: Masak mengikuti tutorial chef vs hasilnya yang bikin sedih',
      'Reaksi beda generasi saat WiFi mati — Boomer vs Milenial vs Gen Z',
      'Meme format: "Orang Indonesia kalau dengar kata diskon" — escalation dari tenang ke chaos',
    ],
    exampleIdeasEn: [
      "Expectation vs Reality: Cooking from a Michelin-star video tutorial vs the actual kitchen disaster",
      "How different generations react when the home Wi-Fi suddenly disconnects for 10 seconds",
      "Meme Format: People trying to leave an event without saying goodbye to anyone"
],
    icon: 'Laugh',
  },

  {
    id: 'social-relationship',
    name: 'Kehidupan Sosial & Hubungan',
    nameEn: 'Social Life & Relationships',
    description:
      'Konten tentang dinamika hubungan — pertemanan, pacaran, pernikahan, keluarga, dan interaksi sosial yang emosional dan relatable.',
    descriptionEn: 'Intimate and relatable explorations of friendships, dating, romance, family dynamics, and workplace camaraderie.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'social-romance',
        name: 'Romansa & Pacaran',
        nameEn: 'Romance & Dating',
        description: 'Momen manis, lucu, atau menyedihkan dalam hubungan romantis',
        descriptionEn: 'Sweet, awkward, or poignant moments in modern love',
      },
      {
        id: 'social-friendship',
        name: 'Persahabatan',
        nameEn: 'Friendship Chronicles',
        description: 'Dinamika pertemanan yang menghangatkan hati',
        descriptionEn: 'Lifelong companion dynamics, unspoken friend codes, and reunions',
      },
      {
        id: 'social-family',
        name: 'Keluarga',
        nameEn: 'Family Bonds',
        description: 'Ikatan dan dinamika keluarga yang emosional',
        descriptionEn: 'Emotional parent-child milestones, generational differences, and warmth',
      },
      {
        id: 'social-workplace',
        name: 'Kehidupan Kerja',
        nameEn: 'Workplace & Office Life',
        description: 'Interaksi dan drama di tempat kerja',
        descriptionEn: 'Corporate survival humor, teammate camaraderie, and career milestones',
      },
    ],
    creativeFramework:
      'EMOTIONAL RESONANCE MAPPING — Identifikasi emosi universal (rindu, canggung, bangga, cemburu) ' +
      'lalu wujudkan dalam situasi hyper-specific yang membuat penonton berpikir "kok bisa sama persis". ' +
      'Kekuatan bukan di plot tapi di DETAIL kecil yang authentic. ' +
      'Gunakan kontras emosi: lucu → sedih → lucu untuk menjaga engagement. ' +
      'Tinggalkan ruang untuk penonton "mengisi" emosi mereka sendiri.',
    creativeFrameworkEn: 'EMOTIONAL RESONANCE MAPPING — Focus on micro-moments of emotional truth that viewers recognize instantly. Juxtapose humor with authentic vulnerability.',
    hookStyle:
      'Buka dengan situasi yang langsung memicu identifikasi emosional. Teks: "Tag seseorang yang…" atau "Pernah nggak sih…". Musik yang langsung membangun mood (lagu romantis, nostalgic, atau upbeat).',
    hookStyleEn: 'Open with a deeply relatable sentiment: \'Tag that one friend who...\' or a touching text screenshot that immediately pulls on heartstrings.',
    visualGuidance:
      'Warm tones untuk momen positif, cool/muted untuk momen sedih. Candid-style framing, bukan posed. Close-up tangan yang bersentuhan, ekspresi mata, gestur kecil. Soft lighting untuk momen intim. Montage style untuk menunjukkan perjalanan hubungan.',
    visualGuidanceEn: 'Warm natural lighting, candid framing, medium close-ups on hands, glances, and genuine micro-expressions.',
    indonesiaGuidance:
      'Hubungan dalam konteks Indonesia: LDR antar pulau, tradisi lamaran adat, drama WA grup keluarga, overthinking sebelum chat gebetan, dan dinamika anak rantau yang rindu rumah.',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Perjalanan hubungan dari "siapa sih ini?" di DM Instagram sampai "bismillah, temuin orangtua"',
      'Saat kamu dan sahabat SMA ketemu lagi setelah 10 tahun — semua berubah tapi persahabatan tetap sama',
      'Chat terakhir dari ibu sebelum kamu berangkat merantau vs chat pertama saat kamu sampai',
    ],
    exampleIdeasEn: [
      "The evolution of a relationship: from awkward direct messages to meeting each other family",
      "Reuniting with your high school best friend after a decade — everything changed yet nothing did",
      "The difference between your first corporate job interview vs your fifth year on the job"
],
    icon: 'Heart',
  },

  {
    id: 'challenges-journey',
    name: 'Tantangan & Perjalanan Pribadi',
    nameEn: 'Personal Challenges & Journeys',
    description:
      'Konten motivasi, transformasi diri, tantangan viral, dan dokumentasi perjalanan pribadi yang menginspirasi dan memicu engagement.',
    descriptionEn: 'Inspiring 30-day challenges, physical and mental transformations, creative growth diaries, and resilience chronicles that inspire action.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'challenge-viral',
        name: 'Tantangan Viral',
        nameEn: 'Viral Challenges',
        description: 'Tantangan dan trend challenge yang sedang populer',
        descriptionEn: 'Testing popular skill and habit challenges with full transparency',
      },
      {
        id: 'challenge-transformation',
        name: 'Transformasi Diri',
        nameEn: 'Personal Transformation',
        description: 'Dokumentasi perubahan diri — fisik, skill, atau kehidupan',
        descriptionEn: 'Documenting fitness, creative, or life shifts step-by-step',
      },
      {
        id: 'challenge-motivation',
        name: 'Motivasi & Inspirasi',
        nameEn: 'Motivation & Drive',
        description: 'Cerita inspiratif dan motivasi yang menggerakkan',
        descriptionEn: 'Uplifting messages of grit, overcoming adversity, and personal reinvention',
      },
    ],
    creativeFramework:
      'PROGRESS NARRATIVE — Struktur dibangun di atas perjalanan dari titik A ke titik B. ' +
      'Tunjukkan "titik terendah" agar titik tertinggi terasa lebih bermakna. ' +
      'Dokumentasi proses lebih penting daripada hasil — penonton ingin melihat perjuangan. ' +
      'Milestone markers: tunjukkan progress di titik-titik tertentu (hari ke-1, ke-15, ke-30). ' +
      'Kunci: vulnerability dan authenticity — kesempurnaan tidak menginspirasi, perjuangan yang menginspirasi.',
    creativeFrameworkEn: 'PROGRESS NARRATIVE — Track growth from vulnerable rock-bottom to triumphant breakthrough. Highlight the messy middle days where most give up.',
    hookStyle:
      'Tunjukkan hasil akhir yang menakjubkan di detik pertama, lalu flashback ke awal perjalanan. Atau tunjukkan tantangan yang tampak mustahil dengan teks "Aku akan coba ini selama 30 hari…".',
    hookStyleEn: 'Tease the breathtaking final outcome in second one, then flash back to day 1 with: \'I decided to attempt this for 30 days...\'',
    visualGuidance:
      'Before/after split screen atau side-by-side. Time-lapse untuk menunjukkan proses. Teks overlay untuk day counter dan milestone. Musik yang build-up dari mellow ke triumphant. Raw/unfiltered footage untuk authenticity.',
    visualGuidanceEn: 'Split-screen day-1 vs day-30, dynamic on-screen day counter, tempo-building score shifting from melancholy to triumph.',
    indonesiaGuidance:
      'Tantangan yang relevan: belajar bahasa daerah dalam 30 hari, keliling Indonesia dengan budget minimal, transformasi dari anak kampung ke profesional kota.',
    suggestedDuration: ['30-60s', '1-3min'],
    exampleIdeas: [
      'Tantangan 30 hari: belajar membatik dari nol sampai bisa membuat karya sendiri',
      'Perjalanan seorang anak warung kelontong menjadi founder startup — told in 60 seconds',
      'Challenge: hidup dengan Rp50.000/hari selama seminggu di Jakarta — day by day documentation',
    ],
    exampleIdeasEn: [
      "30-Day Mastery Challenge: Learning digital animation from zero to producing a finished short film",
      "From small-town beginner to thriving creative director: an honest 60-second visual diary",
      "The 7-day smartphone detox challenge: What actually happened to my sleep and productivity"
],
    icon: 'Trophy',
  },

  {
    id: 'food-imagination',
    name: 'Makanan & Imajinasi',
    nameEn: 'Culinary Imagination & Food',
    description:
      'Konten food yang kreatif dan imajinatif — bukan sekadar review makanan, tapi eksplorasi kreatif tentang makanan dengan twist AI, animasi, atau konsep unik.',
    descriptionEn: 'Sensory culinary adventures blending mouthwatering food storytelling with creative AI twists, fusion concepts, and culinary lore.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'food-creative',
        name: 'Kreasi Makanan Kreatif',
        nameEn: 'Creative Food Creations',
        description: 'Resep atau kreasi makanan dengan twist unik dan imajinatif',
        descriptionEn: 'Innovative recipes, cross-cultural fusions, and plating artistry',
      },
      {
        id: 'food-story',
        name: 'Cerita di Balik Makanan',
        nameEn: 'Stories Behind the Dish',
        description: 'Narasi dan sejarah menarik di balik makanan tertentu',
        descriptionEn: 'Rich cultural origins and artisan dedication behind beloved dishes',
      },
      {
        id: 'food-fantasy',
        name: 'Makanan Fantasi',
        nameEn: 'Fantasy & Futuristic Eats',
        description: 'Makanan impossible atau futuristik yang dibuat dengan AI',
        descriptionEn: 'Surreal, impossible delicacies and futuristic space foods visualized by AI',
      },
    ],
    creativeFramework:
      'SENSORY STORYTELLING — Makanan bukan hanya visual, tapi pengalaman multisensori. ' +
      'Setiap shot harus membuat penonton "merasakan" melalui layar: uap, tekstur, warna, dan suara. ' +
      'Bangun narasi di balik makanan — siapa yang membuatnya, apa ceritanya, mengapa makanan ini spesial. ' +
      'Twist imajinatif: bagaimana jika makanan ini hidup? Bagaimana jika makanan dari 2 budaya digabung? ' +
      'Close-up dan slow-mo adalah bahasa utama food content.',
    creativeFrameworkEn: 'SENSORY STORYTELLING — Engage all senses through the screen: sizzling steam, crisp crunches, velvety textures, and golden sauces.',
    hookStyle:
      'Close-up ASMR makanan yang sedang dimasak — suara minyak mendesis, keju meleleh, atau saus dituang. Visual pertama harus memicu air liur. Atau konsep makanan yang begitu unik sehingga penonton harus tahu apa itu.',
    hookStyleEn: 'Extreme macro ASMR shot of cheese stretching, sauce drizzling, or hot butter sizzling. Visuals that trigger instant cravings.',
    visualGuidance:
      'Macro close-up untuk detail tekstur. Warm lighting yang membuat makanan terlihat lebih appetizing. Steam dan smoke effects. Overhead shot untuk plating. Slow-motion pour, drizzle, dan cut. Warna dominan warm: oranye, merah, kuning emas.',
    visualGuidanceEn: 'Macro lenses, warm appetizing lighting, overhead flat-lays, slow-motion pours and chops, deep golden tones.',
    indonesiaGuidance:
      'Kekayaan kuliner Indonesia: Rendang, Soto, Nasi Goreng, Bakso, Gudeg. Bisa angkat street food culture, warung tradisional, atau fusion makanan Indonesia modern. Cerita ibu-ibu penjual makanan yang legenda di kampung.',
    suggestedDuration: ['15-30s', '30-60s'],
    exampleIdeas: [
      'AI membayangkan: bagaimana jika semua 34 provinsi di Indonesia membuat versi Nasi Goreng mereka?',
      'Cerita di balik Rendang — perjalanan dari dapur Minangkabau menjadi makanan terenak di dunia',
      'Makanan fusion impossible: Ramen × Bakso × Taco — AI merancang resep dan tampilannya',
    ],
    exampleIdeasEn: [
      "AI imagines: How 20 world cultures would reimagine the classic comfort noodle bowl",
      "The 12-hour journey of slow-simmered artisanal broth from morning market to evening bowl",
      "An impossible culinary crossover: Mexican street taco meets Japanese ramen bar"
],
    icon: 'ChefHat',
  },

  {
    id: 'product-story',
    name: 'Cerita Produk & Iklan AI',
    nameEn: 'Product Storytelling & AI Commercials',
    description:
      'Konten yang menceritakan produk atau brand dengan cara kreatif dan non-iklan — storytelling yang membuat penonton engage tanpa merasa sedang ditarget iklan.',
    descriptionEn: 'Cinematic product narratives and brand storytelling that captivate audiences organically without feeling like intrusive advertisements.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'product-origin',
        name: 'Cerita Asal-usul Produk',
        nameEn: 'Product Origin Stories',
        description: 'Narasi menarik tentang bagaimana sebuah produk diciptakan',
        descriptionEn: 'Compelling chronicles of how visionary ideas and craft products came to life',
      },
      {
        id: 'product-creative-ad',
        name: 'Iklan Kreatif AI',
        nameEn: 'Cinematic AI Commercials',
        description: 'Iklan produk yang dibuat dengan AI secara cinematic',
        descriptionEn: 'High-production brand vignettes showcasing products with cinematic flair',
      },
      {
        id: 'product-comparison',
        name: 'Perbandingan & Review Kreatif',
        nameEn: 'Story-Driven Reviews',
        description: 'Review produk dengan format storytelling yang engaging',
        descriptionEn: 'Creative comparisons and real-world stress tests woven into entertaining narratives',
      },
    ],
    creativeFramework:
      'STEALTH STORYTELLING — Produk bukan hero, cerita adalah hero. ' +
      'Penonton harus engage dengan cerita terlebih dahulu, baru menyadari bahwa ada produk di dalamnya. ' +
      'Gunakan "problem → struggle → discovery → transformation" arc dimana produk muncul natural di tahap discovery. ' +
      'Jangan pernah buka dengan produk; buka dengan masalah atau emosi. ' +
      'CTA (jika ada) harus muncul setelah value sudah delivered.',
    creativeFrameworkEn: 'STEALTH STORYTELLING — The story is the hero, the product is the tool. Hook with a relatable pain point or emotional quest; reveal the product as an organic turning point.',
    hookStyle:
      'Buka dengan masalah yang relatable atau momen emosional — BUKAN dengan produk. Penonton harus berpikir mereka menonton cerita, bukan iklan. Reveal produk secara natural di pertengahan atau akhir.',
    hookStyleEn: 'Open with a compelling human dilemma or visual spectacle — never a dry product logo. Let viewers get invested in the journey first.',
    visualGuidance:
      'Cinematic quality tinggi — iklan AI harus terlihat lebih baik dari iklan tradisional. Product shot dengan dramatic lighting dan slow-motion. Lifestyle shots: produk digunakan dalam konteks nyata. Color grading yang premium dan consistent.',
    visualGuidanceEn: 'Commercial-grade rim lighting, slow-motion turntable product spins, high-end color grading, tactile close-ups.',
    indonesiaGuidance:
      'UMKM dan brand lokal Indonesia: batik, kopi lokal, skincare lokal, makanan khas daerah. Ceritakan craft dan passion di balik produk lokal. Kaitkan dengan kebanggaan "produk Indonesia".',
    suggestedDuration: ['15-30s', '30-60s', '1-3min'],
    exampleIdeas: [
      'Cerita: Nenek di Yogyakarta masih membuat batik tulis selama 50 tahun — produk batiknya kini dikirim ke seluruh dunia',
      'AI commercial: Kopi dari petani di Toraja — dari kebun di pegunungan sampai secangkir latte di Jakarta',
      'Perbandingan kreatif: 5 sunscreen lokal Indonesia diuji di bawah terik matahari Bali — siapa yang menang?',
    ],
    exampleIdeasEn: [
      "The story of a third-generation ceramicist whose handcrafted mugs are now shipped across the globe",
      "Cinematic AI Commercial: Single-origin mountain coffee beans journeying from misty highlands to sunrise espresso",
      "Extreme real-world endurance test: Putting an everyday backpack through torrential rain and rugged mountain terrain"
],
    icon: 'ShoppingBag',
  },

  {
    id: 'affiliate-marketing',
    name: 'Affiliate & Review Produk TikTok/Shopee',
    nameEn: 'Affiliate & TikTok/Shopee Reviews',
    description:
      'Format video komersial berkonversi tinggi untuk kreator affiliate: unboxing dramatis, problem-solution instan, demonstrasi uji ketahanan (stress-test), dan trigger keranjang kuning.',
    descriptionEn: 'High-conversion commercial formats for affiliate creators: dramatic unboxings, instant problem-solving demonstrations, and yellow basket triggers.',
    group: 'Social & Short-form Formats',
    groupEn: 'Social & Short-form Formats',
    subcategories: [
      {
        id: 'affiliate-problem-solution',
        name: 'Problem-Solution Instan (Pain Point)',
        nameEn: 'Instant Problem-Solver',
        description: 'Menyorot masalah menjengkelkan sehari-hari dan menghadirkan produk sebagai penyelamat',
        descriptionEn: 'Spotlighting an annoying daily pain point and showcasing the product as the hero',
      },
      {
        id: 'affiliate-unboxing-firstlook',
        name: 'Dramatis Unboxing & First Look',
        nameEn: 'Dramatic Unboxing & First Look',
        description: 'Sensasi unboxing visual memuaskan (ASMR/estetik) dengan ekspektasi vs realita',
        descriptionEn: 'Sensory ASMR unboxings with honest expectation-versus-reality verdicts',
      },
      {
        id: 'affiliate-before-after',
        name: 'Before vs After & Uji Ketahanan',
        nameEn: 'Before vs After Stress Test',
        description: 'Eksperimen ekstrem menguji klaim produk secara visual dan transparan',
        descriptionEn: 'Extreme visual tests proving product durability and performance claims',
      },
      {
        id: 'affiliate-honest-worthit',
        name: 'Review Jujur "Worth It Gak Sih?"',
        nameEn: 'Honest \'Is It Worth It?\' Review',
        description: 'Bedah kelebihan, kekurangan, dan alasan kenapa barang ini wajib di-checkout sekarang',
        descriptionEn: 'Transparent pros, cons, and compelling reasons to grab the deal right now',
      },
    ],
    creativeFramework:
      'CONVERSION RETENTION ARC — Struktur psikologis konversi belanja kilat: ' +
      '"Pain Point Agitation (Detik 0-3) → Product Reveal & WOW Factor (3-8s) → Visual Proof / Demo Nyata (8-18s) → Objections Handled / Harga Relatable (18-24s) → Urgent Call-to-Action (24-30s)". ' +
      'Tekankan utilitas nyata produk bagi hidup penonton, bukan sekadar spesifikasi teknis membosankan.',
    creativeFrameworkEn: 'CONVERSION RETENTION ARC — Pain Point Agitation (0-3s) → Product Reveal WOW Factor (3-8s) → Visual Proof / Demo (8-18s) → Objection Handling (18-24s) → Urgent Call to Action (24-30s).',
    hookStyle:
      'Buka dengan kalimat pencegah penyesalan atau tantangan berani: "Jangan checkout barang ini sebelum lihat video ini!", "Nyesel banget baru tahu ada alat semurah ini!", atau visual masalah berantakan yang diselesaikan seketika.',
    hookStyleEn: 'Stop-the-scroll warning hook: \'Don\'t check out that viral gadget until you see this test!\' or dramatic visual demonstration of a problem solved in 2 seconds.',
    visualGuidance:
      'Pencahayaan produk tajam studio (high-contrast punchy lighting). Macro close-up detail bahan dan tekstur. Split screen Before-After dinamis. Sudut pandang tangan interaktif memegang barang. Ruang komposisi bawah bersih untuk tombol keranjang kuning/keranjang oranye.',
    visualGuidanceEn: 'Studio ring-light illumination, macro focus on materials, dynamic before-and-after split screens, clean lower-third space for affiliate shopping cart buttons.',
    indonesiaGuidance:
      'Fokus pada ceruk produk laris pasar Indonesia: perabot rumah tangga pintar (home living), skincare/beauty lokal BPOM, fashion harian terjangkau, serta gadget fungsional murah. Gaya tutur santai, ramah, dan jujur khas kreator lokal.',
    suggestedDuration: ['10-15s', '15-30s', '30-60s'],
    exampleIdeas: [
      'Alat Pel Putar Otomatis: Tes membersihkan tumpahan kopi kental di lantai keramik hanya dalam 5 detik — tanpa tangan kotor!',
      'Tripod Tracking AI Murah: Bikin kreator solo bisa bikin video jalan-jalan dengan angle sinematik tanpa bantuan kameramen',
      'Termos Stainless 24 Jam: Eksperimen memasukkan es batu di cuaca terik 35°C Jakarta — apakah masih beku sampai malam?',
    ],
    exampleIdeasEn: [
      "Automatic Spin Mop: Cleaning a dark coffee spill on white tiles in 5 seconds flat — hands stay completely clean!",
      "Affordable AI Tracking Tripod: Letting solo creators film dynamic walking videos without a camera operator",
      "24-Hour Stainless Steel Flask: Ice water left in a 38°C hot car all afternoon — does it stay frozen?"
],
    icon: 'ShoppingBag',
  },
];

// ─────────────────────────────────────────────────────────────
//  Helper functions
// ─────────────────────────────────────────────────────────────

/** Find a category by its stable id. Returns `undefined` if not found. */
export function getCategoryById(id: string, lang: 'id' | 'en' = 'id'): ContentCategory | undefined {
  const cat = CONTENT_CATEGORIES.find((c) => c.id === id);
  if (!cat) return undefined;
  if (lang === 'en') {
    return {
      ...cat,
      name: cat.nameEn || cat.name,
      description: cat.descriptionEn || cat.description,
      group: cat.groupEn || cat.group,
      subcategories: cat.subcategories.map((s) => ({
        ...s,
        name: s.nameEn || s.name,
        description: s.descriptionEn || s.description,
      })),
      creativeFramework: cat.creativeFrameworkEn || cat.creativeFramework,
      hookStyle: cat.hookStyleEn || cat.hookStyle,
      visualGuidance: cat.visualGuidanceEn || cat.visualGuidance,
      exampleIdeas: cat.exampleIdeasEn && cat.exampleIdeasEn.length > 0 ? cat.exampleIdeasEn : cat.exampleIdeas,
    };
  }
  return cat;
}

/** Return categories with text localized according to language */
export function getLocalizedCategories(lang: 'id' | 'en' = 'id'): ContentCategory[] {
  if (lang === 'id') return CONTENT_CATEGORIES;
  return CONTENT_CATEGORIES.map((cat) => ({
    ...cat,
    name: cat.nameEn || cat.name,
    description: cat.descriptionEn || cat.description,
    group: cat.groupEn || cat.group,
    subcategories: cat.subcategories.map((s) => ({
      ...s,
      name: s.nameEn || s.name,
      description: s.descriptionEn || s.description,
    })),
    creativeFramework: cat.creativeFrameworkEn || cat.creativeFramework,
    hookStyle: cat.hookStyleEn || cat.hookStyle,
    visualGuidance: cat.visualGuidanceEn || cat.visualGuidance,
    exampleIdeas: cat.exampleIdeasEn && cat.exampleIdeasEn.length > 0 ? cat.exampleIdeasEn : cat.exampleIdeas,
  }));
}

/** Return every category that belongs to a given group. */
export function getCategoriesByGroup(group: string, lang: 'id' | 'en' = 'id'): ContentCategory[] {
  const categories = getLocalizedCategories(lang);
  return categories.filter((c) => c.group === group || (c.groupEn && c.groupEn === group));
}

/**
 * Case-insensitive search across category `name` and `description`.
 * Returns all categories whose name OR description contains the query string.
 */
export function searchCategories(query: string, lang: 'id' | 'en' = 'id'): ContentCategory[] {
  const q = query.toLowerCase();
  const categories = getLocalizedCategories(lang);
  return categories.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
      (c.descriptionEn && c.descriptionEn.toLowerCase().includes(q)),
  );
}
