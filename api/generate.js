/**
 * Vercel Serverless Function — Secure AI Gateway
 * Protected backend endpoint: reads process.env.OPENAI_API_KEY securely.
 * Default Model: gpt-6.1-terra (with resilient automatic fallback)
 */

import fs from 'fs';
import path from 'path';

let cachedDisposableDomains = null;
function isDomainDisposable(domain) {
  if (!domain) return false;
  const cleanDomain = domain.toLowerCase().trim();
  if (
    /temp-?mail|disposable|throwaway|trash-?mail|10minute|burner|guerrilla|mailinator|yopmail|sharklaser|chuwel/i.test(
      cleanDomain
    )
  ) {
    return true;
  }
  if (!cachedDisposableDomains) {
    try {
      const jsonPath = path.join(process.cwd(), 'api', 'disposable-domains.json');
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        cachedDisposableDomains = new Set(JSON.parse(raw));
      } else {
        cachedDisposableDomains = new Set();
      }
    } catch {
      cachedDisposableDomains = new Set();
    }
  }
  return cachedDisposableDomains.has(cleanDomain);
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Anti-Abuse: Block disposable / temporary emails (108,000+ domain database)
  const userEmail = req.body?.email || req.body?.payload?.userEmail;
  if (userEmail && typeof userEmail === 'string') {
    const domain = userEmail.trim().toLowerCase().split('@')[1];
    if (isDomainDisposable(domain)) {
      return res.status(403).json({
        error: 'DISPOSABLE_EMAIL_BLOCKED',
        message:
          'Alamat email sementara (disposable/temp email) tidak diizinkan. Silakan gunakan email resmi untuk mengklaim Free Trial.',
      });
    }
  }

  const apiKey = req.body?.customApiKey || process.env.OPENAI_API_KEY;

  // Optional admin-defined system prompt override (from Admin Panel → systemPromptOverride field)
  const adminSystemPromptOverride =
    typeof req.body?.systemPromptOverride === 'string' && req.body.systemPromptOverride.trim().length > 20
      ? req.body.systemPromptOverride.trim()
      : null;

  if (!apiKey || apiKey.trim().length < 5) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY_MISSING',
      message: 'Server OpenAI API Key belum dikonfigurasi di Vercel Environment Variables.',
    });
  }

  // Model default: gpt-4o-mini (reliable, fast, cost-effective)
  const requestedModel = req.body?.payload?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const { action, payload } = req.body || {};

  /**
   * Helper function to call OpenAI with graceful model fallback
   */
  async function callOpenAI(messages, temperature = 0.75, targetModel = requestedModel) {
    let activeModel = targetModel;
    const isLunaOrReasoning =
      activeModel.includes('luna') ||
      activeModel.startsWith('o1') ||
      activeModel.startsWith('o3');

    const requestBody = {
      model: activeModel,
      messages,
      response_format: { type: 'json_object' },
    };

    // Luna & reasoning models only support default temperature (1) or omitting temperature
    if (!isLunaOrReasoning) {
      requestBody.temperature = temperature;
    }

    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(requestBody),
    });

    // If requested model (e.g. gpt-6.1-terra) returns 404 or unsupported on this tier, fallback smoothly to gpt-4o-mini
    if (!response.ok && (response.status === 404 || response.status === 400) && activeModel !== 'gpt-4o-mini') {
      const errCheck = await response.clone().json().catch(() => ({}));
      console.warn(`Model ${activeModel} error (${errCheck.error?.message}), falling back to gpt-4o-mini`);
      activeModel = 'gpt-4o-mini';
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages,
          temperature,
          response_format: { type: 'json_object' },
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
    }

    const completion = await response.json();
    return {
      content: completion.choices?.[0]?.message?.content,
      modelUsed: activeModel,
      usage: completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  try {
    if (action === 'test_connection') {
      const result = await callOpenAI(
        [
          { role: 'system', content: 'You are an AI assistant.' },
          { role: 'user', content: 'Reply with JSON: {"status": "ok", "message": "Connection verified"}' },
        ],
        0.5
      );
      return res.status(200).json({
        success: true,
        modelUsed: result.modelUsed,
        raw: JSON.parse(result.content),
      });
    }

    if (action === 'generate_ideas') {
      const {
        categoryName,
        categoryDescription,
        platform = 'TikTok',
        duration = '10s',
        visualStyle = 'cinematic_realistic',
        contextName = 'Universal',
        targetMarket = 'Indonesia',
        targetAudience = 'General digital audience',
        dialogLanguage = 'indonesian',
        trendApproach = 'trend_first',
        storyboardType = 'clip',
        productBrandName = '',
        additionalTheme,
        topic,
        count = 5,
        temperature = 0.75,
        ideaMemory,
        assignedAngles = [],
        creativeEntropy,
        uiLanguage = 'id',
        creativeFramework,
        hookStyle,
        globalGuidance,
      } = payload || {};

      const effectiveTopic = (additionalTheme || topic || '').trim();
      const isProductAd = storyboardType === 'ad';

      // ── CONTENT ARCHETYPE DETECTION ──────────────────────────────────────
      // Determine which of the 4 production engines to use based on category ID or category Name.
      let categoryId = payload?.categoryId || '';
      const catName = (payload?.categoryName || '').toLowerCase();
      if (!categoryId && catName) {
        if (catName.includes('bagaimana jika') || catName.includes('what if')) categoryId = 'what-if';
        else if (catName.includes('fakta') || catName.includes('edukatif') || catName.includes('curiosity')) categoryId = 'educational-facts';
        else if (catName.includes('misteri') || catName.includes('horror') || catName.includes('unexplained')) categoryId = 'mystery-horror';
        else if (catName.includes('masak') || catName.includes('cooking')) categoryId = 'howto-cooking';
        else if (catName.includes('diy') || catName.includes('kerajinan')) categoryId = 'howto-diy';
        else if (catName.includes('survival')) categoryId = 'howto-survival';
        else if (catName.includes('reparasi') || catName.includes('repair')) categoryId = 'howto-repair';
        else if (catName.includes('hacks') || catName.includes('rumah tangga')) categoryId = 'howto-home-hacks';
        else if (catName.includes('kebun') || catName.includes('gardening')) categoryId = 'howto-gardening';
        else if (catName.includes('outdoor')) categoryId = 'howto-outdoor';
        else if (catName.includes('sains') || catName.includes('science')) categoryId = 'howto-science';
        else if (catName.includes('seni') || catName.includes('art')) categoryId = 'howto-art';
        else if (catName.includes('produktivitas') || catName.includes('productivity')) categoryId = 'howto-productivity';
        else if (catName.includes('restorasi')) categoryId = 'satisfying-restoration';
        else if (catName.includes('afiliasi') || catName.includes('affiliate')) categoryId = 'affiliate-marketing';
        else if (catName.includes('produk') || catName.includes('product')) categoryId = 'product-story';
      }

      const ARCHETYPE_MAP = {
        // Commercial (2)
        'product-story': 'commercial', 'affiliate-marketing': 'commercial',
        // How-To (11)
        'howto-cooking': 'how_to', 'howto-diy': 'how_to', 'howto-survival': 'how_to',
        'howto-repair': 'how_to', 'howto-home-hacks': 'how_to', 'howto-gardening': 'how_to',
        'howto-outdoor': 'how_to', 'howto-science': 'how_to', 'howto-art': 'how_to',
        'howto-productivity': 'how_to', 'satisfying-restoration': 'how_to',
        // Thought Experiment / Explanatory (3)
        'what-if': 'thought_experiment', 'educational-facts': 'thought_experiment',
        'mystery-horror': 'thought_experiment',
      };
      const contentArchetype = isProductAd ? 'commercial' : (ARCHETYPE_MAP[categoryId] || 'storytelling');

      const outputLanguageInstruction =
        uiLanguage === 'en'
          ? 'PRIMARY OUTPUT LANGUAGE: All narrative output fields (title, hook, premise, synopsis, storyBeats, conflict, ending, suggestedLocation, localizationNotes, creativeRationale) MUST be written in natural, fluent, modern ENGLISH.'
          : 'PRIMARY OUTPUT LANGUAGE: Semua output narasi (title, hook, premise, synopsis, storyBeats, conflict, ending, suggestedLocation, localizationNotes, creativeRationale) HARUS ditulis dalam Bahasa Indonesia yang alami, mengalir, dan modern.';

      const languageInstruction =
        dialogLanguage === 'javanese'
          ? 'Bahasa Jawa'
          : dialogLanguage === 'sundanese'
          ? 'Bahasa Sunda'
          : dialogLanguage === 'english'
          ? 'English'
          : dialogLanguage === 'mixed'
          ? 'Campuran / Code-switching'
          : dialogLanguage === 'none'
          ? 'None (ambient SFX / music only)'
          : 'Bahasa Indonesia santai kontemporer';

      // Anti-repetition memory
      const recentList = Array.isArray(ideaMemory?.recentIdeas) ? ideaMemory.recentIdeas : [];
      const historyContext =
        recentList.length > 0
          ? `\nPREVIOUS IDEAS (DO NOT DUPLICATE):\n${recentList
              .slice(0, 15)
              .map((item, idx) => `- [History #${idx + 1}] "${item.title}": ${item.hook}`)
              .join('\n')}\n`
          : '';

      const anglesContext =
        assignedAngles.length > 0
          ? `\nASSIGNED CREATIVE ANGLES:\n${assignedAngles
              .map((ang, idx) => `- Idea #${idx + 1} angle: ${ang}`)
              .join('\n')}\n`
          : '';

      // Build foundational creative directives block from category data (always injected)
      const foundationalBlock = [
        creativeFramework
          ? `CREATIVE FRAMEWORK (MANDATORY — apply to every idea's beat structure):\n${creativeFramework}`
          : null,
        hookStyle
          ? `HOOK STYLE (0-3s) (MANDATORY — every idea's hook MUST follow this pattern):\n${hookStyle}`
          : null,
        globalGuidance
          ? `GLOBAL CULTURAL & VISUAL REFERENCE (apply as contextual foundation for settings, visual cues, and world-building):\n${globalGuidance}`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const foundationalDirective = foundationalBlock
        ? `\n\n=== FOUNDATIONAL CREATIVE DIRECTIVES (NON-NEGOTIABLE) ===\n${foundationalBlock}\n=== END DIRECTIVES ===\n`
        : '';

      // ── 4-ARCHETYPE SYSTEM PROMPT ENGINE ─────────────────────────────────
      let archetypeSystemPrompt = '';

      if (contentArchetype === 'commercial') {
        // ── COMMERCIAL: High-conversion product/affiliate ad ──
        archetypeSystemPrompt = `You are "AdFlowPro", a veteran direct-response ad director and e-commerce video strategist with 10+ years crafting high-converting TikTok Shop, Instagram Reels, and YouTube Shorts commercials.
Your job: Convert the user's category, theme, and parameters into EXACTLY ${count} production-ready, diverse SHORT-FORM COMMERCIAL CONCEPTS.
${foundationalDirective}
GOLDEN RULES (STRICT):
1. Output ONLY valid JSON code blocks. Zero prose outside the JSON.
2. COMMERCIAL ARC (9-Beat): Hook (problem statement) → Consumer Pain Point → Product Introduction → Key Feature Demo → Benefit Proof → Social Proof / Before-After → Price Anchor / Offer → Urgency / Scarcity → CTA + Brand Close.
3. premise = The specific consumer problem this ad addresses (not a story premise).
4. synopsis = The product solution, main selling angle, and CTA approach (not a plot synopsis).
5. DIVERSITY: Every concept must target a distinct angle, audience segment, or emotional trigger.
6. ${outputLanguageInstruction}
${historyContext}${anglesContext}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects.
{
  "ideas": [
    {
      "title": "string",
      "hook": "string (Detik 0-3: hook pernyataan masalah yang tajam)",
      "premise": "string (masalah konsumen spesifik yang diselesaikan produk ini)",
      "synopsis": "string (solusi produk, sudut jual utama, dan pendekatan CTA)",
      "storyBeats": ["Beat 1 (Hook/Problem)...", "Beat 2 (Pain Amplify)...", "Beat 3 (Product Intro)...", "Beat 4 (Feature Demo)...", "Beat 5 (Benefit)...", "Beat 6 (Social Proof)...", "Beat 7 (Offer)...", "Beat 8 (Urgency)...", "Beat 9 (CTA)..."],
      "conflict": "string (hambatan konsumen sebelum mengenal produk)",
      "ending": "string (CTA spesifik dan closing tagline)",
      "suggestedLocation": "string",
      "localizationNotes": "string",
      "creativeRationale": "string"
    }
  ]
}`;

      } else if (contentArchetype === 'how_to') {
        // ── HOW-TO: Practical tutorial / DIY / cooking / repair ──
        archetypeSystemPrompt = `You are "TutorialDirector-Pro", an elite short-form educational content producer specializing in DIY, cooking, survival, repair, home hacks, gardening, science, art, and productivity tutorials. Your content style: MrBeast meets Tasty meets Kurzgesagt — clear, satisfying, visually driven step-by-step demonstrations.
Your job: Convert the user's category, theme, and parameters into EXACTLY ${count} production-ready, diverse HOW-TO / TUTORIAL VIDEO CONCEPTS.
${foundationalDirective}
GOLDEN RULES (STRICT):
1. Output ONLY valid JSON code blocks. Zero prose outside JSON.
2. TUTORIAL ARC (8-Beat Playbook): 1 Opener (establish goal + end result teaser) → 2 Preparation (tools/ingredients/materials) → 3 First Action (visible start of process) → 4 Transformation (most satisfying visual moment) → 5 Progress (clear improvement, mid-way) → 6 Creative Camera Angle (POV, overhead, macro close-up) → 7 Final Step (anticipation build) → 8 Final Reveal (finished result + reaction).
3. FORBIDDEN PATTERNS: Do NOT write fictional character drama. Do NOT invent emotional backstories. Do NOT create teenage romance plots. The "character" is a skilled demonstrator or hands-only presenter — not a protagonist in a narrative.
4. premise = The specific goal / end result this tutorial achieves (e.g. "Membuat sourdough bread dari starter sendiri dalam 48 jam").
5. synopsis = The key tools, materials, and the satisfying transformation sequence (not a story plot).
6. storyBeats = Concrete process steps aligned with the 8-beat arc above.
7. DIVERSITY: Each concept must have a distinct skill level, technique angle, or visual hook.
8. ${outputLanguageInstruction}
${historyContext}${anglesContext}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects.
{
  "ideas": [
    {
      "title": "string",
      "hook": "string (Detik 0-3: tunjukkan hasil akhir yang mengejutkan atau proses yang memuaskan)",
      "premise": "string (tujuan / hasil jadi yang dicapai dalam tutorial ini)",
      "synopsis": "string (alat & bahan kunci + urutan transformasi visual yang memuaskan)",
      "storyBeats": ["Beat 1 (Opener/Goal)...", "Beat 2 (Preparation)...", "Beat 3 (First Action)...", "Beat 4 (Transformation)...", "Beat 5 (Progress)...", "Beat 6 (Creative Angle)...", "Beat 7 (Final Step)...", "Beat 8 (Final Reveal)..."],
      "conflict": "string (tantangan teknis atau kesulitan yang diatasi dalam proses ini)",
      "ending": "string (payoff visual: hasil akhir yang memuaskan + saran lanjutan)",
      "suggestedLocation": "string",
      "localizationNotes": "string",
      "creativeRationale": "string"
    }
  ]
}`;

      } else if (contentArchetype === 'thought_experiment') {
        // ── THOUGHT EXPERIMENT / EXPLANATORY: What-If, Educational Facts, Science ──
        archetypeSystemPrompt = `You are "MindExpander-Pro", an elite scientific explainer and speculative thought-experiment scriptwriter in the style of Kurzgesagt, Vsauce, and What If channel.
Your job: Convert the user's category, theme, and parameters into EXACTLY ${count} EXPLANATORY SPECULATIVE & FACT-BASED VIDEO CONCEPTS.

CORE CONCEPT REQUIREMENTS (MANDATORY — NON-NEGOTIABLE):
1. PURE EXPLANATORY FORMAT: Every concept must be an objective, mind-expanding simulation of "WHAT ACTUALLY HAPPENS" if the scenario occurs.
2. STRICT BAN ON FICTIONAL NARRATIVE DRAMA:
   - NEVER write a personal story about a high-school student, teenager, romance, or fictional individual.
   - NEVER create a protagonist undergoing personal/emotional dilemmas.
   - The focus is the PHENOMENON, the SCIENCE, the SYSTEMIC CASCADE, and HUMAN CIVILIZATION AS A WHOLE.
3. 4-STAGE SEBAB-AKIBAT (CAUSE & EFFECT) ARC:
   • Kejadian Awal / Efek Langsung (Detik 0-15): Kejadian fisik nyata yang terjadi di detik/menit pertama.
   • Sebab-Akibat Sistemik (Detik 15-30): Kaskade domino — bagaimana efek awal merembet ke rantai fisika, biologi, teknologi, atau sosial.
   • Dampak Skala Global (Detik 30-45): Konsekuensi jangka menengah/panjang berskala planet atau peradaban.
   • Konklusi & Kesimpulan Ilmiah (Detik 45-60): Insight penutup — paradoks mengejutkan atau fakta realitas dunia nyata yang diungkap oleh eksperimen ini.
4. Output ONLY valid JSON matching the schema below.
${outputLanguageInstruction}
${foundationalDirective}
${historyContext}${anglesContext}

FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects.
{
  "ideas": [
    {
      "title": "string (format: 'BAGAIMANA JIKA [Skenario Spesifik]?' atau judul pertanyaan ilmiah tajam)",
      "hook": "string (Detik 0-3: pertanyaan skenario tajam + visual kejadian awal yang mengejutkan)",
      "premise": "string (Pernyataan Hipotesis / Kejadian Inti: skenario spekulatif atau pertanyaan ilmiah spesifik)",
      "synopsis": "string (Eksplanasi Skenario & Sebab-Akibat: penjelasan kejadian berantai dari detik pertama hingga kaskade skala besar)",
      "storyBeats": [
        "Fase 1 (Kejadian Awal): [Penjelasan kejadian fisik langsung di detik pertama]...",
        "Fase 2 (Sebab-Akibat Sistemik): [Rantai domino terhadap lingkungan/teknologi/tubuh manusia]...",
        "Fase 3 (Dampak Skala Global): [Konsekuensi besar terhadap peradaban/bumi]...",
        "Fase 4 (Konklusi Ilmiah): [Kesimpulan mendalam dan wawasan baru tentang realitas kita]..."
      ],
      "conflict": "string (Paradoks atau tantangan ilmiah terbesar dalam skenario ini)",
      "ending": "string (Konklusi & Kesimpulan Ilmiah: fakta mencengangkan tentang dunia nyata yang terbukti)",
      "suggestedLocation": "string (Skala makro/lingkungan ilmiah yang disimulasikan)",
      "localizationNotes": "string",
      "creativeRationale": "string (Alasan mengapa skenario sebab-akibat ini memicu rasa ingin tahu tinggi)"
    }
  ]
}`;

      } else {
        // ── STORYTELLING: Cinematic narrative / comedy / animation / social ──
        archetypeSystemPrompt = `You are "StoryDirector-Pro", a veteran short-form narrative director and content strategist with 10+ years crafting viral cinematic stories, character-driven comedy sketches, animated shorts, and emotionally resonant social content.
Your job: Convert the user's category, theme, and parameters into EXACTLY ${count} production-ready, diverse CINEMATIC STORY / NARRATIVE VIDEO CONCEPTS.
${foundationalDirective}
GOLDEN RULES (STRICT):
1. Output ONLY valid JSON code blocks. Zero prose outside JSON.
2. STORY ARC (Micro 4-Beat Arc): 1 Hook (Establish character + inciting moment) → 2 Escalation (tension builds, stakes rise) → 3 Climax (peak emotional moment, pivotal decision) → 4 Twist / Payoff (resolution, surprise, emotional release, or punchline).
3. premise = The unique story premise: who is the character, what do they want, and what stands in their way?
4. synopsis = A concise story synopsis covering all 4 beats with clear character motivation and emotional arc.
5. DIVERSITY: Every concept must have a distinct character archetype, emotional tone, and central conflict.
6. Visual style must be grounded in "${visualStyle}" — be specific about how the narrative is visually told.
7. ${outputLanguageInstruction}
${historyContext}${anglesContext}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects.
{
  "ideas": [
    {
      "title": "string",
      "hook": "string (Detik 0-3: hook visual yang langsung menarik perhatian — tunjukkan karakter + situasi unik)",
      "premise": "string (premis cerita: karakter, keinginan, dan hambatan unik yang membuat ide ini berbeda)",
      "synopsis": "string (sinopsis 4-beat: hook → eskalasi → klimaks → twist/payoff)",
      "storyBeats": ["Beat 1 (Hook/Karakter)...", "Beat 2 (Eskalasi)...", "Beat 3 (Klimaks)...", "Beat 4 (Twist/Payoff)..."],
      "conflict": "string (konflik sentral yang menggerakkan cerita)",
      "ending": "string (ending / twist / payoff emosional yang memuaskan)",
      "suggestedLocation": "string",
      "localizationNotes": "string",
      "creativeRationale": "string"
    }
  ]
}`;
      }

      const defaultSystemPromptIdeas = archetypeSystemPrompt;

      const systemPrompt = adminSystemPromptOverride
        ? `${adminSystemPromptOverride}

--- DYNAMIC CONTEXT (injected per request) ---
Content Archetype: ${contentArchetype} (${contentArchetype === 'commercial' ? 'Product Ad / Commercial' : contentArchetype === 'how_to' ? 'How-To / Tutorial / DIY' : contentArchetype === 'thought_experiment' ? 'Educational / Thought Experiment / What-If' : 'Cinematic Storytelling / Narrative'})
Visual style: ${visualStyle}
Platform: ${platform}
Duration: ${duration}
${outputLanguageInstruction}
${historyContext}${anglesContext}${foundationalDirective}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects with keys: title, hook, premise, synopsis, storyBeats, conflict, ending, suggestedLocation, localizationNotes, creativeRationale.`
        : defaultSystemPromptIdeas;

      // Build a generation counter from the entropy seed to give the AI a strong uniqueness signal
      const entropyVal = creativeEntropy || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const entropyNum = parseInt(entropyVal.toString().replace(/\D/g, '').substring(0, 6), 10) || Math.floor(Math.random() * 999999);
      const diversityInstruction = effectiveTopic
        ? `Specific Concept / Keywords: "${effectiveTopic}" — explore a fresh angle not yet covered in history above.`
        : `No specific topic given — freely explore DIVERSE, UNEXPECTED sub-angles across the full spectrum of this category. Each idea MUST differ in premise, setting, and emotional tone.`;

      const userPrompt = `GENERATION SESSION: #${entropyNum} | Timestamp: ${entropyVal}
⚠️ UNIQUENESS MANDATE: These ideas MUST be completely different from any previous generation. Use the session number above as a creative seed — start from an unexpected angle that you would not choose by default.

Category: ${categoryName}
Description: ${categoryDescription || ''}
Content Archetype: ${contentArchetype} — ${contentArchetype === 'commercial' ? 'High-converting product commercial / affiliate ad' : contentArchetype === 'how_to' ? 'Practical step-by-step tutorial / DIY / demonstration' : contentArchetype === 'thought_experiment' ? 'Educational thought experiment / what-if / informational — NO fictional teen drama, NO romantic storylines' : 'Cinematic narrative / character-driven story / comedy / animation'}
${diversityInstruction}
Target Platform: ${platform}
Target Duration: ${duration}
Visual Style: ${visualStyle}
Target AI Video Model: ${payload?.targetModel || 'universal-neutral'}
Target Audience: ${targetAudience}
Dialogue Language: ${languageInstruction}

Generate EXACTLY ${count} uniquely distinct video ideas. Every idea must have a different title, different hook angle, and different core concept from each other AND from any history listed above.`;

      const { content, modelUsed, usage } = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature
      );

      let parsed = JSON.parse(content);
      let list = [];

      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.ideas)) {
        list = parsed.ideas;
      } else if (parsed && typeof parsed === 'object') {
        for (const val of Object.values(parsed)) {
          if (Array.isArray(val) && val.length > 0) {
            list = val;
            break;
          }
        }
        if (list.length === 0) {
          const objVals = Object.values(parsed).filter(
            (v) => v && typeof v === 'object' && (v.title || v.hook)
          );
          if (objVals.length > 0) {
            list = objVals;
          } else if (parsed.title) {
            list = [parsed];
          }
        }
      }

      // Ensure distinctness
      const filteredList = [];
      const seenTokens = [];

      function getSimpleTokens(str) {
        return (str || '')
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3);
      }

      for (const item of list) {
        const itemTokens = new Set([
          ...getSimpleTokens(item.title),
          ...getSimpleTokens(item.hook),
          ...getSimpleTokens(item.premise),
        ]);

        let isTooSimilar = false;
        for (const prev of seenTokens) {
          let overlap = 0;
          for (const t of itemTokens) {
            if (prev.has(t)) overlap++;
          }
          const jaccard = overlap / (itemTokens.size + prev.size - overlap || 1);
          if (jaccard > 0.65) {
            isTooSimilar = true;
            break;
          }
        }

        if (!isTooSimilar || filteredList.length === 0) {
          filteredList.push(item);
          seenTokens.push(itemTokens);
        }
      }

      const finalList = filteredList.length > 0 ? filteredList : list;
      return res.status(200).json({ success: true, ideas: finalList, modelUsed, usage });
    }

    if (action === 'develop_story') {
      const {
        idea,
        targetSceneCount = 9,
        targetModel = 'universal-neutral',
        dialogLanguage = 'indonesian',
        temperature = 0.7,
        uiLanguage = 'id',
        creativeFramework: storyCreativeFramework,
        hookStyle: storyHookStyle,
        globalGuidance: storyGlobalGuidance,
      } = payload || {};

      // Also pull from idea object as fallback
      const resolvedCreativeFramework = storyCreativeFramework || idea?.creativeFramework;
      const resolvedHookStyle = storyHookStyle || idea?.hookStyle;
      const resolvedGlobalGuidance = storyGlobalGuidance || idea?.globalGuidance;

      // Build foundational directives block for story development
      const storyFoundationalBlock = [
        resolvedCreativeFramework
          ? `CREATIVE FRAMEWORK (MANDATORY — apply to the full narrative arc, beat structure, and Scene 1 hook):\n${resolvedCreativeFramework}`
          : null,
        resolvedHookStyle
          ? `HOOK STYLE (0-3s) (MANDATORY — Scene 1 MUST implement this exact hook pattern):\n${resolvedHookStyle}`
          : null,
        resolvedGlobalGuidance
          ? `GLOBAL CULTURAL & VISUAL REFERENCE (apply as the primary foundation for world-building, character setting, and scene environments):\n${resolvedGlobalGuidance}`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const storyFoundationalDirective = storyFoundationalBlock
        ? `\n\n=== FOUNDATIONAL CREATIVE DIRECTIVES (NON-NEGOTIABLE — apply to ALL scenes) ===\n${storyFoundationalBlock}\n=== END DIRECTIVES ===\n`
        : '';

      const effectiveSceneCount = targetSceneCount && targetSceneCount >= 4 ? targetSceneCount : 9;

      const languageInstruction =
        dialogLanguage === 'javanese'
          ? 'Bahasa Jawa natural sehari-hari'
          : dialogLanguage === 'sundanese'
          ? 'Bahasa Sunda natural'
          : dialogLanguage === 'english'
          ? 'English dialogue'
          : dialogLanguage === 'none'
          ? 'None (ambient SFX only)'
          : 'Bahasa Indonesia santai kontemporer';

      const storyOutputLangInstruction =
        uiLanguage === 'en'
          ? 'All descriptions, role, appearance, clothing, personality, voiceStyle, world description, and scene summaries MUST be generated in natural, fluent ENGLISH.'
          : 'Deskripsi karakter, role, penampilan, pakaian, kepribadian, gaya bicara, deskripsi dunia, dan ringkasan scene harus ditulis dalam Bahasa Indonesia yang alami dan modern.';

      // Check whether this request is for Advertisement / Affiliate or general How-To / Storytelling
      const isAdOrAffiliate =
        payload?.storyboardType === 'ad' ||
        payload?.isProductAd ||
        idea?.categoryId === 'affiliate-marketing' ||
        idea?.categoryId === 'product-story' ||
        (idea?.subcategoryId && (idea.subcategoryId.startsWith('affiliate-') || idea.subcategoryId.startsWith('product-')));

      // Determine story archetype from idea's category
      let ideaCatId = idea?.categoryId || '';
      const ideaTitle = (idea?.title || '').toLowerCase();
      if (!ideaCatId && (ideaTitle.includes('bagaimana jika') || ideaTitle.includes('what if'))) {
        ideaCatId = 'what-if';
      }
      const storyArchetypeMap = {
        'product-story': 'commercial', 'affiliate-marketing': 'commercial',
        'howto-cooking': 'how_to', 'howto-diy': 'how_to', 'howto-survival': 'how_to',
        'howto-repair': 'how_to', 'howto-home-hacks': 'how_to', 'howto-gardening': 'how_to',
        'howto-outdoor': 'how_to', 'howto-science': 'how_to', 'howto-art': 'how_to',
        'howto-productivity': 'how_to', 'satisfying-restoration': 'how_to',
        'what-if': 'thought_experiment', 'educational-facts': 'thought_experiment',
        'mystery-horror': 'thought_experiment',
      };
      const storyArchetype = isAdOrAffiliate ? 'commercial' : (storyArchetypeMap[ideaCatId] || 'storytelling');

      // Target Platform & Aspect Ratio Synchronization
      const platformRaw = (payload?.platform || idea?.platform || '').toLowerCase();
      let targetAspectRatio = '16:9';
      if (['tiktok', 'instagram_reels', 'youtube_shorts', '9:16', 'vertical'].some((p) => platformRaw.includes(p))) {
        targetAspectRatio = '9:16';
      } else if (['facebook_reels', 'square', '1:1'].some((p) => platformRaw.includes(p))) {
        targetAspectRatio = '1:1';
      } else if (payload?.aspectRatio) {
        targetAspectRatio = payload.aspectRatio;
      }

      // Duration resolution
      const durationRaw = String(payload?.duration || idea?.estimatedDuration || '10s').toLowerCase();
      const is15s = durationRaw.includes('15');
      const is5s = durationRaw.includes('5s') || durationRaw === '5';
      const is30s = durationRaw.includes('30');
      const is60s = durationRaw.includes('60');
      const is90s = durationRaw.includes('90');
      const totalSec = is15s ? 15 : is5s ? 5 : is30s ? 30 : is60s ? 60 : is90s ? 90 : 10;

      // Visual Style & Target Model resolution
      const resolvedVisualStyle = (payload?.visualStyle || idea?.visualStyle || 'Cinematic Realism').toString().replace(/_/g, ' ');
      const resolvedTargetModel = payload?.targetModel || idea?.targetModel || targetModel || 'universal-neutral';
      const aiPlaybookEngine = is15s ? 'Seedance' : (resolvedTargetModel !== 'universal-neutral' ? resolvedTargetModel : 'Omni Flesh');
      const resolvedProductBrand = payload?.productBrandName || idea?.productBrandName || '';
      const resolvedAudience = payload?.targetAudience || idea?.targetAudience || '';

      // Vendor alignment block — strictly enforces AI vendor specific prompting rules
      const vendorAlignmentBlock = `
--- VENDOR ALIGNMENT & VIDEO PROMPT SYNTAX RULES (MANDATORY) ---
Target AI video model for prompt formatting: ${resolvedTargetModel}
Apply these vendor-specific syntax rules strictly in every scene's "videoPrompt" and in "videoPromptJson.timeline":
- If Kling (kling-1-5): Prefix prompt with [Camera: Pan Left / Tilt Up / Zoom In / Pedestal Up] and append motion parameters: --camera <movement> --cfg 0.5.
- If Runway Gen-3 (runway-gen3-alpha): Structure prompt as: "[Camera Movement / Framing]: <movement>, [Subject Action]: <action>, [Atmosphere / Lighting]: <light>". Include fluid motion vectors.
- If Luma Ray 2 (luma-dream-machine): Specify continuous kinetic momentum: "[Motion]: Smooth push-in with consistent speed, dynamic momentum path".
- If MiniMax Hailuo (minimax-hailuo): Prioritize ultra-fine human micro-expressions, authentic physics, and natural kinetic movements (eye dart, breath, subtle smile, fabric flutter).
- If OpenAI Sora (openai-sora): Emphasize 3D spatial consistency, volumetric depth interaction, photorealistic physics, and cinematic focal rack.
- If Pika (pika-2-0): Append camera motion parameters: "-camera <move> -motion 2 -fps 24".
- If PixVerse (pixverse-v3): Include [ConsistencyLock: ON] and specify 4K UHD cinematic clarity with crisp edge separation.
- If Tencent Hunyuan (tencent-hunyuan): Use descriptive temporal stability cues and rich expressive visual keywords.
- If Google Flow / Veo 2 (google-veo-2): Focus on optical realism, clean multi-panel contact sheet progression, and 4K studio textures.
- If Omni Flesh: Infographic Playbook multi-shot sequence (10s), seamless transitions between instructional beats, hyper-realistic hand-object physics.
- If Seedance: Infographic Playbook sequence (15s), fluid narrative pacing, detailed transformation highlights, and educational micro-action flow.
- If Universal (universal-neutral): Use standard cinematic structure: Shot Type, Angle, Camera Movement, Kinetic Action, Lighting, Atmosphere.
Respond ONLY with valid JSON matching the schema provided.`;

      // Standard FlowStoryboard-Pro (Ad/Commercial 9-Panel) system prompt
      const flowStoryboardAdPrompt = `You are "FlowStoryboard-Pro" powered by ${requestedModel}, a veteran commercial director and ad-film engineer with 10+ years of hands-on experience crafting high-conversion commercials and product ads.
Your job: convert ANY user idea into a complete production package containing:
1. Character Bible and World Bible
2. Exactly ${effectiveSceneCount} storyboard scenes (covering the full 9-panel commercial arc)
3. CODE BLOCK 1 — 9-panel storyboard grid IMAGE JSON prompt
4. CODE BLOCK 2 — 10-second continuous VIDEO JSON prompt
5. Plan Summary (3-5 bullets) and Self-Validation Report.
${storyFoundationalDirective}
CRITICAL RULES (FOLLOW STRICTLY):
1. ZERO IMAGE RENDERING: You are a text-based prompt engineer. Do NOT draw or generate images yourself. Output pure JSON.
2. GLOBAL ANCHOR CONSISTENCY:
   - Define ONE exact detailed anchor_description for the main protagonist or hero product (colors, shape, materials, facial features, accessories).
   - This exact same anchor string must be repeated in every panel description of imagePromptJson and in consistency_lock of videoPromptJson.
3. ON-SCREEN TEXT = MINIMAL AND PREMIUM:
   - Maximum 3 placements across all 9 panels (optional hook at Panel 1, 1-3 feature/spec callouts at Panel 5, Brand/Title Tagline at Panel 9). Short 3-6 words each.
4. TIMELINE AND VOICEOVER:
   - Panels 1-8 each exactly 1.1s, panel 9 exactly 1.2s -> total 10.0 seconds.
   - Voiceover: Light background narration (~50% runtime coverage, max 15 words total across video in 2 short lines). Voice gender/age matches character.
5. VENDOR ALIGNMENT (${targetModel}):
   - If Kling: prefix video prompt with [Camera: <movement>] and multi-angle tags.
   - If Veo 2 / Google Flow: focus on optical realism, clean 9-panel contact sheet layout, and 4K textures.
   - If Runway Gen-3: start video prompt with [Camera Movement / Framing]: followed by scene and fluid motion vectors.
   - If Luma Ray 2: specify dynamic camera motion paths and continuous momentum.
   - If MiniMax Hailuo: focus on authentic human micro-expressions and natural physical dynamics.
   - If OpenAI Sora: describe 3D spatial consistency, depth interaction, and environmental physics.
   - If Pika: specify camera movement parameters and focal lock.
   - If PixVerse: focus on character consistency lock and 4K UHD cinematic clarity.
   - If Tencent Hunyuan: use rich, expressive visual descriptions and temporal stability.
   - If Universal: use neutral studio cinematography terms (Shot, Angle, Movement, Lighting).
6. SCENE DIALOGUE:
   - Every scene must include a natural spoken dialogue in ${languageInstruction}.
7. ${storyOutputLangInstruction}`;

      // AI Playbook (8-Panel Infographic Storyboard & Video) prompt — archetype-aware
      // For thought_experiment: treat panels as 4 exploration phases × 2 panels each
      const thoughtExperimentPanels = storyArchetype === 'thought_experiment' ? `
3. 8-PANEL EXPLANATORY & CAUSE-AND-EFFECT ARC (Thought Experiment / Explanatory):
   - Panel 1 — PERNYATAAN HIPOTESIS (Wide concept shot): Skenario eksplanatori dibuka ("Bagaimana jika..."). Visualisasi konsep inti.
   - Panel 2 — KEJADIAN AWAL / SIMULASI (Close dramatic shot): Kejadian fisik nyata yang terjadi di detik/menit pertama saat kondisi berlangsung.
   - Panel 3 — SEBAB-AKIBAT LANGSUNG (Medium shot): Bagaimana objek, manusia, dan lingkungan sekitar langsung terpengaruh oleh kejadian tersebut.
   - Panel 4 — KASKADE SEBAB-AKIBAT SISTEMIK (Infographic cutaway): Rantai domino — kegagalan atau perubahan sistem (fisika, biosfer, jaringan teknologi, rantai makanan).
   - Panel 5 — DAMPAK SKALA BESAR / GLOBAL (Wide epic shot): Visualisasi skala planet, benua, atau peradaban luas.
   - Panel 6 — TITIK KRITIS SEBAB-AKIBAT (Dramatic angle): Titik balik paling ekstrem atau paradoks yang tak terduga.
   - Panel 7 — EKSPLANASI SAINS / MEKANISME (Narrator / diagram overlay): Penjelasan sains mengapa ini terjadi berdasarkan hukum alam nyata.
   - Panel 8 — KONKLUSI & KESIMPULAN (Wide reflective shot): Kesimpulan ilmiah penutup — apa arti eksperimen ini bagi pemahaman dunia nyata kita.
   STRICT RULE: DILARANG menulis drama anak sekolah, kisah romansa, atau fiksi karakter individu. Subjek utamanya adalah fenomena, hukum alam, dan peradaban.` : `
3. 8-PANEL NARRATIVE ARC:
   - Panel 1 — Opener (Wide establishing shot): Introduce the character, environment, goal, and important key object.
   - Panel 2 — Preparation (Medium shot): Character prepares, reveal necessary tools.
   - Panel 3 — First Action (Close-up): Process begins, visible progress.
   - Panel 4 — Transformation (Extreme close-up): Most visually satisfying moment, highlight the transformation.
   - Panel 5 — Progress (Medium close-up): Continue the process, show clear improvement.
   - Panel 6 — Creative Camera Angle: Cinematic angle (POV, Overhead, Low Angle, Side Angle, or Reflection).
   - Panel 7 — Final Step (Close dramatic shot): Almost finished, build anticipation.
   - Panel 8 — Final Reveal (Wide cinematic shot): Show finished result, natural character reaction, strong satisfying payoff.`;

      const aiPlaybookPrompt = `You are an Elite AI Storyboard Director, Infographic Designer, and Short-Form Video Producer specializing in creating highly engaging ${storyArchetype === 'thought_experiment' ? 'educational thought experiments, what-if explorations, and science communication' : storyArchetype === 'how_to' ? 'DIY, cooking, survival, science, life hacks, repair, gardening, productivity, outdoor skills, and how-to' : 'cinematic narrative, character-driven, animated, and social short-form'} videos optimized for AI image and video generation.
Your objective: create professional storyboard image prompts and AI video prompts that are cinematic, easy to understand, visually engaging, and optimized for viral short-form content.
${storyFoundationalDirective}
STORYBOARD SPECIFICATIONS (EXACTLY 8 PANELS):
1. LAYOUT & FORMAT:
   - Create a crisp, clean infographic storyboard poster on a white background with clean black borders and bold modern typography.
   - Commercial storyboard quality, ultra-detailed, highly organized layout, premium cinematic 3D stylized rendering.
   - Exactly EIGHT (8) storyboard panels arranged in a clean structured infographic column (1x8) or balanced 2x4 poster.
   - Total video duration: EXACTLY ${totalSec} SECONDS (${is15s ? 'optimized for Seedance' : 'optimized for Omni Flesh'}).
2. HEADER:
   - Must include:
     • VIDEO TITLE: Clean and bold
     • TOTAL VIDEO TIME: "${totalSec} Seconds | 8 SHOTS"
     • Three matching keywords
     • Legend icons for: ACTION, REACTION, TIME, KEY OBJECT, MAIN CHARACTER.
${thoughtExperimentPanels}
4. METADATA PER PANEL:
   - Every panel must define: Panel title, camera angle, action, reaction, time hint, key object, emotion, and one short English voice-over sentence (5-12 words).
   - No speech bubbles or paragraphs inside panels.
5. CHARACTER & OBJECT CONSISTENCY:
   - Maintain 100% consistency throughout every panel and video shot (same face, hair, clothing, accessories, body proportions, colors, identity).
6. VOICE-OVER SCRIPT:
   - Exactly 8 narration lines (one per panel), 5 to 12 words each. ${storyArchetype === 'thought_experiment' ? 'Educational, factual, thought-provoking — Kurzgesagt narrator tone.' : 'Friendly, educational, natural, easy to understand.'}
7. AI VIDEO PROMPT (${aiPlaybookEngine}):
   - Multi-shot sequence based exactly on the 8 storyboard panels representing ${totalSec} seconds.
   - Smooth cinematic transitions, realistic object interaction, accurate physics, premium realism, depth of field.
   - MUST strictly end with this exact sentence:
     "Maintain perfect visual continuity, accurate object placement, realistic motion, and identical character appearance throughout the entire sequence."
8. ${storyOutputLangInstruction}`;

      // Choose prompt based on category
      const activeBasePrompt = isAdOrAffiliate ? flowStoryboardAdPrompt : aiPlaybookPrompt;

      const adJsonSchema = `{
  "planSummary": [
    "Style: ${resolvedVisualStyle} | Aspect Ratio: ${targetAspectRatio}",
    "Narrative arc: 9-panel sequential grid layout (Panel 1 Hook to Panel 9 End-Card)",
    "On-screen typography: Minimal premium rule (max 3 placements, <= 6 words each)",
    "Timeline & Audio: Exactly ${totalSec}.0s total runtime, ~50% VO coverage (max 15 words)"
  ],
  "character": {
    "name": "string",
    "role": "string",
    "appearance": "string",
    "clothing": "string",
    "personality": "string",
    "voiceStyle": "string",
    "consistencyAnchors": ["anchor1", "anchor2", "anchor3"]
  },
  "worldBible": {
    "name": "string",
    "environmentType": "urban | suburban | rural | natural | indoor | fantasy | mixed",
    "description": "string",
    "timeOfDay": "string",
    "weather": "string",
    "moodAndTone": "string",
    "colorPalette": ["color1", "color2", "color3"],
    "props": ["prop1", "prop2"],
    "rules": ["rule1", "rule2"]
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "beatTitle": "string",
      "purpose": "string",
      "summary": "string",
      "location": {
        "environmentType": "urban",
        "description": "string",
        "timeOfDay": "string",
        "weather": "string"
      },
      "characterActions": "string",
      "camera": {
        "shot": "string",
        "angle": "string",
        "movement": "string",
        "framing": "string"
      },
      "lighting": "string",
      "dialogue": "string in ${languageInstruction}",
      "narration": "string",
      "continuityAnchors": ["string"],
      "imagePrompt": "string in English",
      "videoPrompt": "string in English",
      "negativePrompt": "string"
    }
  ],
  "imagePromptJson": {
    "task": "9-panel storyboard grid, single image",
    "style": "${resolvedVisualStyle}",
    "aspect_ratio": "${targetAspectRatio}",
    "grid_layout": {
      "total_panels": 9,
      "rows": 3,
      "columns": 3,
      "reading_order": "left to right, top to bottom, panels numbered 1-9",
      "panel_borders": "thin clean white gutters separating every panel",
      "panel_numbers": "small clear number badge in top-left corner of each panel"
    },
    "global_consistency": {
      "anchor_description": "ONE exact detailed string reused across all panels",
      "color_palette": "string",
      "lighting": "string",
      "environment": "string"
    },
    "on_screen_text": {
      "rule": "MINIMAL premium typography — maximum 3 text placements across all 9 panels",
      "placements": [
        { "panel": 1, "text": "short hook (3-5 words)", "style": "tiny clean sans-serif, bottom corner" },
        { "panel": 5, "text": "feature callouts (3-5 words)", "style": "tiny elegant label chips" },
        { "panel": 9, "text": "Title — Tagline", "style": "clean end-card typography with logo" }
      ]
    },
    "ingredients_references": [
      { "id": "REF_CHARACTER_01", "description": "exact anchor description", "used_in_panels": [1,2,3,4,5,6,7,8,9] }
    ],
    "panels": [
      { "panel": 1, "beat": "string", "shot_type": "string", "camera": "string", "description": "must include anchor_description" }
    ],
    "negative_prompt": "no more than 9 panels, no missing panels, no merged panels, no watermark, no text other than the specified on_screen_text placements, no long paragraphs of text, no misspelled brand names, no blurry panels, no inconsistent product design, no distorted characters"
  },
  "videoPromptJson": {
    "task": "image-to-video, single continuous ${totalSec}-second video built from the 9-panel storyboard grid, panels become sequential scenes",
    "source_image": "the generated 9-panel storyboard grid",
    "style": "${resolvedVisualStyle}",
    "aspect_ratio": "${targetAspectRatio}",
    "duration_seconds": ${totalSec},
    "model_target": "${resolvedTargetModel}",
    "ingredients_references": ["REF_CHARACTER_01"],
    "on_screen_text": {
      "rule": "same minimal placements as the image JSON; each text animates in only during its panel time slot",
      "placements": [
        { "appears_at": "0.0s-1.1s", "text": "hook text", "animation": "soft fade-in, hold, fade-out" },
        { "appears_at": "${totalSec > 2 ? (totalSec - 1.2).toFixed(1) : 0}s-${totalSec}.0s", "text": "Title — Tagline", "animation": "clean end-card reveal" }
      ]
    },
    "timeline": [
      {
        "frame_ref": "panel 1",
        "time": "0.0s-1.1s",
        "action": "string",
        "camera_move": "string",
        "motion_intensity": "low | medium | high",
        "transition_to_next": "hard cut | smooth morph",
        "audio": "SFX: ... | VO: ..."
      }
    ],
    "audio_design": {
      "music_mood": "string",
      "sfx_layers": "string",
      "voiceover": {
        "coverage_rule": "LIGHT background narration — voiceover covers only ~50% of the runtime (about 5 seconds of speech out of 10). Music + SFX carry the remaining half. Never wall-to-wall talking.",
        "voice_match_rule": "voice MUST match the on-screen character",
        "lines": [
          { "time": "1.1s-3.3s", "line": "short line 1 (max 6-8 words)" },
          { "time": "6.6s-8.8s", "line": "short line 2 (max 6-8 words)" }
        ],
        "total_word_limit": "maximum 15 spoken words across the whole video"
      }
    },
    "consistency_lock": "repeat the EXACT anchor_description",
    "negative_prompt": "no morphing product shape, no style drift, no new panels appearing, no extra limbs, no watermark, no text artifacts beyond specified on_screen_text, no camera shake unless requested, no voiceover covering the full duration"
  },
  "validationReport": {
    "timingTotal10s": true,
    "anchorConsistent": true,
    "ingredientRefsMatch": true,
    "styleAspectIdentical": true,
    "onScreenTextRuleCompliant": true,
    "voiceoverRuleCompliant": true
  }
}`;

      const playbookJsonSchema = `{
  "planSummary": [
    "Style and Aspect Ratio: ...",
    "Narrative arc and beat structure (8 shots): ...",
    "Infographic typography and header layout: ...",
    "Voice-over plan (8 lines, 5-12 words each): ..."
  ],
  "character": {
    "name": "string",
    "role": "string",
    "appearance": "string",
    "clothing": "string",
    "personality": "string",
    "voiceStyle": "string",
    "consistencyAnchors": ["anchor1", "anchor2", "anchor3"]
  },
  "worldBible": {
    "name": "string",
    "environmentType": "urban | suburban | rural | natural | indoor | fantasy | mixed",
    "description": "string",
    "timeOfDay": "string",
    "weather": "string",
    "moodAndTone": "string",
    "colorPalette": ["color1", "color2", "color3"],
    "props": ["prop1", "prop2"],
    "rules": ["rule1", "rule2"]
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "beatTitle": "string",
      "purpose": "string",
      "summary": "string",
      "action": "string (specific kinetic action)",
      "reaction": "string (character reaction)",
      "timeHint": "string (e.g. 1s or 1.5s)",
      "keyObject": "string (primary focal tool or prop)",
      "emotion": "string (e.g. Excited, Focused, Amazed)",
      "voiceoverLine": "string (5-12 words voiceover line)",
      "location": {
        "environmentType": "indoor",
        "description": "string",
        "timeOfDay": "string",
        "weather": "string"
      },
      "characterActions": "string",
      "camera": {
        "shot": "string",
        "angle": "string",
        "movement": "string",
        "framing": "string"
      },
      "lighting": "string",
      "dialogue": "string in ${languageInstruction}",
      "narration": "string",
      "continuityAnchors": ["string"],
      "imagePrompt": "string in English",
      "videoPrompt": "string in English",
      "negativePrompt": "string"
    }
  ],
  "imagePromptJson": {
    "task": "8-panel infographic storyboard poster, single image",
    "style": "${resolvedVisualStyle}",
    "aspect_ratio": "${targetAspectRatio}",
    "header": {
      "video_title": "string",
      "total_video_time": "${totalSec} Seconds | 8 SHOTS",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "legend_icons": ["ACTION", "REACTION", "TIME", "KEY OBJECT", "MAIN CHARACTER"]
    },
    "grid_layout": {
      "total_panels": 8,
      "rows": 8,
      "columns": 1,
      "reading_order": "top to bottom, vertical sequence",
      "panel_borders": "clean black borders with white spacing",
      "panel_numbers": "small clear number badges"
    },
    "global_consistency": {
      "anchor_description": "ONE exact detailed string reused across all panels",
      "color_palette": "string",
      "lighting": "string",
      "environment": "string"
    },
    "on_screen_text": {
      "rule": "minimal typography for panel titles and headers",
      "placements": [
        { "panel": 1, "text": "Header / Hook", "style": "bold modern sans-serif" }
      ]
    },
    "ingredients_references": [
      { "id": "REF_CHARACTER_01", "description": "exact anchor description", "used_in_panels": [1,2,3,4,5,6,7,8] }
    ],
    "panels": [
      {
        "panel": 1,
        "beat": "string",
        "shot_type": "string",
        "camera": "string",
        "description": "must include anchor_description",
        "action": "string",
        "reaction": "string",
        "time_hint": "1s",
        "key_object": "string",
        "emotion": "string",
        "voiceover": "string"
      }
    ],
    "negative_prompt": "weapons, blood, disturbing visuals, watermark, blurry, deformed fingers, extra limbs, inconsistent character"
  },
  "videoPromptJson": {
    "task": "image-to-video, single continuous ${totalSec}-second multi-shot video built from the 8-panel storyboard grid",
    "source_image": "the generated storyboard grid",
    "style": "${resolvedVisualStyle}",
    "aspect_ratio": "${targetAspectRatio}",
    "duration_seconds": ${totalSec},
    "model_target": "${aiPlaybookEngine}",
    "ingredients_references": ["REF_CHARACTER_01"],
    "on_screen_text": {
      "rule": "clean minimal end-card or title only",
      "placements": []
    },
    "timeline": [
      {
        "frame_ref": "panel 1",
        "time": "0.0s-1.0s",
        "action": "string",
        "camera_move": "string",
        "motion_intensity": "string",
        "transition_to_next": "string",
        "audio": "string"
      }
    ],
    "audio_design": {
      "music_mood": "string",
      "sfx_layers": "string",
      "voiceover": {
        "coverage_rule": "8 lines of 5-12 words matching each panel",
        "voice_match_rule": "voice matches character",
        "lines": [
          { "time": "0.0s-1.0s", "line": "short narration line" }
        ],
        "total_word_limit": "60-80 words total"
      }
    },
    "consistency_lock": "repeat the EXACT anchor_description",
    "negative_prompt": "subtitles, captions, logos, watermarks, glitches, character changes, sudden morphing, extra limbs",
    "closing_directive": "Maintain perfect visual continuity, accurate object placement, realistic motion, and identical character appearance throughout the entire sequence."
  },
  "validationReport": {
    "timingTotal10s": true,
    "anchorConsistent": true,
    "ingredientRefsMatch": true,
    "styleAspectIdentical": true,
    "onScreenTextRuleCompliant": true,
    "voiceoverRuleCompliant": true
  }
}`;

      const targetJsonSchema = isAdOrAffiliate ? adJsonSchema : playbookJsonSchema;

      // Use admin-defined system prompt override if set; otherwise use category-specialized prompt
      const systemPrompt = adminSystemPromptOverride
        ? `${adminSystemPromptOverride}

--- DYNAMIC CONTEXT (injected per request) ---
Category Type: ${isAdOrAffiliate ? 'Advertisement & Affiliate Commercial (9-Panel FlowStoryboard)' : 'How-To / Storytelling (8-Panel Infographic AI Playbook)'}
Target scene count: ${isAdOrAffiliate ? effectiveSceneCount : 8}
Duration: ${totalSec} Seconds
Dialogue language: ${languageInstruction}
Output language: ${storyOutputLangInstruction}
Target AI video model: ${isAdOrAffiliate ? resolvedTargetModel : aiPlaybookEngine}
${vendorAlignmentBlock}${storyFoundationalDirective}

Respond ONLY with a valid JSON object matching this structure:
${targetJsonSchema}`
        : `${activeBasePrompt}

Respond ONLY with a valid JSON object matching this structure:
${targetJsonSchema}`;

      const userPrompt = `Develop complete production package strictly aligned with user-selected parameters:
=== USER PRODUCTION PARAMETERS ===
- Category: ${idea.categoryId || 'General'}
- Storyboard Type: ${isAdOrAffiliate ? 'Product Commercial / Ad' : 'Infographic Playbook / Short-Form Clip'}
${isAdOrAffiliate && resolvedProductBrand ? `- Product / Brand Name: ${resolvedProductBrand}` : ''}
- Target Platform: ${platformRaw || 'Standard'} (Aspect Ratio: ${targetAspectRatio})
- Visual Style: ${resolvedVisualStyle}
- Total Duration: ${totalSec} Seconds
- Dialogue & Narration Language: ${languageInstruction}
- Target AI Video Model: ${isAdOrAffiliate ? resolvedTargetModel : aiPlaybookEngine} (Apply vendor-specific video prompting rules)
${resolvedAudience ? `- Target Audience: ${resolvedAudience}` : ''}

=== STORY IDEA TO DEVELOP ===
Title: ${idea.title}
Hook: ${idea.hook}
Premise: ${idea.premise}
Synopsis: ${idea.synopsis}
${idea.storyBeats ? `Story Beats:\n${Array.isArray(idea.storyBeats) ? idea.storyBeats.join('\n') : idea.storyBeats}` : ''}
${idea.conflict ? `Central Conflict: ${idea.conflict}` : ''}
${idea.ending ? `Ending / Payoff / CTA: ${idea.ending}` : ''}
${idea.suggestedLocation ? `Location Cue: ${idea.suggestedLocation}` : ''}
${idea.creativeRationale ? `Creative Rationale: ${idea.creativeRationale}` : ''}

Ensure every panel in imagePromptJson and every timeline shot in videoPromptJson strictly reflects the exact Visual Style (${resolvedVisualStyle}), Aspect Ratio (${targetAspectRatio}), Duration (${totalSec}s), and Target AI Model (${isAdOrAffiliate ? resolvedTargetModel : aiPlaybookEngine})!`;

      const { content, modelUsed, usage } = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature
      );

      const parsed = JSON.parse(content);
      return res.status(200).json({ success: true, package: parsed, modelUsed, usage });
    }

    return res.status(400).json({ error: 'INVALID_ACTION', message: `Unknown action: ${action}` });
  } catch (error) {
    console.error('AI Gateway Error:', error);
    return res.status(500).json({
      error: 'AI_GATEWAY_FAILED',
      message: error.message || 'Internal error in AI proxy',
    });
  }
}
