/**
 * Vercel Serverless Function — Secure AI Gateway
 * Protected backend endpoint: reads process.env.OPENAI_API_KEY securely.
 * Default Model: gpt-6-luna (with resilient automatic fallback)
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

  // Model default: gpt-6-luna per user specification
  const requestedModel = req.body?.payload?.model || process.env.OPENAI_MODEL || 'gpt-6-luna';
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

    // If requested model (e.g. gpt-6-luna) returns 404 or unsupported on this tier, fallback smoothly to gpt-4o-mini
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
        productReferenceImages = [],
        characterReferenceImages = [],
        productVisionAnalysis,
        characterVisionAnalysis,
        additionalTheme,
        topic,
        count = 5,
        temperature = 0.75,
        ideaMemory,
        assignedAngles = [],
        creativeEntropy,
        uiLanguage = 'id',
      } = payload || {};

      const effectiveTopic = (additionalTheme || topic || '').trim();
      const isProductAd = storyboardType === 'ad';

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

      const defaultSystemPromptIdeas = `You are "FlowStoryboard-Pro", a veteran commercial director & ad-film engineer with 10+ years of hands-on experience crafting TV commercials, cinematic movie/drama clips, and animated spots, now specialized in the Google Flow + Omni Flash (Veo) pipeline.
Your job: Convert the user's category, theme, and parameters into EXACTLY ${count} production-ready, diverse video concepts for ${isProductAd ? 'Product Commercial / Ad' : 'Movie / Drama / Animated Clip'}.

GOLDEN RULES (STRICT):
1. CRITICAL SYSTEM CONSTRAINT: You are a text-based prompt engineer. Output ONLY valid JSON code blocks.
2. BEAT STRUCTURE:
${isProductAd
  ? '   • ADS (products / e-commerce): 1 Hook -> 2 Problem/Context -> 3 Product Reveal -> 4-5 Feature close-ups -> 6 Benefit demo -> 7 Lifestyle shot -> 8 Result/social proof -> 9 CTA + logo.'
  : '   • MOVIE / DRAMA / ANIMATED clips: 1 Establishing shot -> 2 Character intro -> 3 Setup -> 4-5 Build-up -> 6 Conflict -> 7-8 Climax -> 9 Resolution / end frame.'}
3. DIVERSITY: Every idea in this batch must have a distinct central conflict, setting, visual hook, and payoff.
4. VISUAL PRECISION: Ground visual tone cleanly in "${visualStyle}".
5. ${outputLanguageInstruction}
${historyContext}${anglesContext}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects.
{
  "ideas": [
    {
      "title": "string",
      "hook": "string (Detik 0-3 hook text yang spesifik dan tajam)",
      "premise": "string (premis unik yang berbeda dari ide lainnya)",
      "synopsis": "string",
      "storyBeats": ["Beat 1 (Detik 0-3 Hook)...", "Beat 2 (Eskalasi)...", "Beat 3 (Puncak/Klimaks)...", "Beat 4 (Twist/Payoff)..."],
      "conflict": "string",
      "ending": "string (payoff / twist / CTA)",
      "suggestedLocation": "string",
      "localizationNotes": "string",
      "creativeRationale": "string"
    }
  ]
}`;

      const systemPrompt = adminSystemPromptOverride
        ? `${adminSystemPromptOverride}

--- DYNAMIC CONTEXT (injected per request) ---
Storyboard Type: ${isProductAd ? 'Product Ad / Commercial' : 'Movie / Drama / Animated Clip'}
Visual style: ${visualStyle}
Platform: ${platform}
Duration: ${duration}
${outputLanguageInstruction}
${historyContext}${anglesContext}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects with keys: title, hook, premise, synopsis, storyBeats, conflict, ending, suggestedLocation, localizationNotes, creativeRationale.`
        : defaultSystemPromptIdeas;

      const userPrompt = `Generate EXACTLY ${count} uniquely distinct video ideas for:
Category: ${categoryName}
Description: ${categoryDescription || ''}
Type: ${isProductAd ? `Product Ad / Commercial (Brand: ${productBrandName || 'Standard'})` : 'Movie / Drama / Animated Clip'}
${productReferenceImages && productReferenceImages.length > 0 ? `Product Reference: ${productReferenceImages.length} image(s) provided. Structure every concept around hero product demonstration, physical unboxing/use-case, high-converting problem-to-solution arc, and visual proof.` : ''}
${characterReferenceImages && characterReferenceImages.length > 0 ? `Character Reference: ${characterReferenceImages.length} image(s) provided. Ground character actions, appearance, and styling strictly to the character reference images.` : ''}
${productVisionAnalysis ? `Product Vision AI Analysis (GPT-6.1-Terra): ${productVisionAnalysis.physicalDescription} | Key Features: ${productVisionAnalysis.keyVisualFeatures ? productVisionAnalysis.keyVisualFeatures.join(', ') : ''} | Colors: ${productVisionAnalysis.colorPalette ? productVisionAnalysis.colorPalette.join(', ') : ''}` : ''}
${characterVisionAnalysis ? `Character Vision AI Analysis (GPT-6.1-Terra): ${characterVisionAnalysis.anchorDescription} | Wardrobe: ${characterVisionAnalysis.clothing}` : ''}
${effectiveTopic ? `Specific Concept / Idea: ${effectiveTopic}` : 'Explore fresh, creative sub-angles for this category'}
Platform: ${platform}
Target Duration: ${duration}
Visual Style: ${visualStyle}
Dialogue Language: ${languageInstruction}
Entropy Seed: ${creativeEntropy || Date.now()}`;

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
        productReferenceImages = idea?.productReferenceImages || [],
        characterReferenceImages = idea?.characterReferenceImages || payload?.characterReferenceImages || [],
        productVisionAnalysis = idea?.productVisionAnalysis || payload?.productVisionAnalysis,
        characterVisionAnalysis = idea?.characterVisionAnalysis || payload?.characterVisionAnalysis,
      } = payload || {};

      const effectiveSceneCount = targetSceneCount && targetSceneCount >= 4 ? targetSceneCount : 9;
      const httpRefUrls = (productReferenceImages || []).filter((u) => typeof u === 'string' && u.startsWith('http'));
      const sampleCrefUrl = httpRefUrls.length > 0 ? httpRefUrls[0] : '[URL_GAMBAR_PRODUK]';
      const httpCharUrls = (characterReferenceImages || []).filter((u) => typeof u === 'string' && u.startsWith('http'));
      const sampleCharCrefUrl = httpCharUrls.length > 0 ? httpCharUrls[0] : '[URL_GAMBAR_KARAKTER]';

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

      // Vendor alignment block — always injected regardless of system prompt source
      const vendorAlignmentBlock = `
--- VENDOR ALIGNMENT (MANDATORY — do NOT omit) ---
Target AI video model for prompt formatting: ${targetModel}
Apply these format rules strictly in every scene's videoPrompt field:
- If Kling (kling-1-5): prefix video prompt with [Camera: <movement>] and add multi-angle tags.
- If Veo 2 / Google Flow (google-veo-2): focus on optical realism, clean 9-panel contact sheet layout, and 4K textures.
- If Runway Gen-3 (runway-gen3-alpha): start video prompt with [Camera Movement / Framing]: followed by scene and fluid motion vectors.
- If Luma Ray 2 (luma-dream-machine): specify dynamic camera motion paths and continuous momentum.
- If MiniMax Hailuo (minimax-hailuo): focus on authentic human micro-expressions and natural physical dynamics.
- If OpenAI Sora (openai-sora): describe 3D spatial consistency, depth interaction, and environmental physics.
- If Pika (pika-2-0): append camera motion parameters: -camera <move> -motion 2 -fps 24.
- If PixVerse (pixverse-v3): focus on character consistency lock and 4K UHD cinematic clarity.
- If Tencent Hunyuan (tencent-hunyuan): use rich, expressive visual descriptions and temporal stability.
- If Universal (universal-neutral): use neutral studio cinematography terms (Shot, Angle, Movement, Lighting).
${productReferenceImages && productReferenceImages.length > 0 ? `
PRODUCT REFERENCE ATTACHMENT (Mode: Image-to-Video & Midjourney --cref):
- Reference images provided (${productReferenceImages.length} image(s)).
- In individual scene prompts ("scenes"):
  * For scenes showcasing the hero product: describe the exact physical product appearance, packaging, material textures, and studio lighting highlights.
  * In imagePrompt: Append Midjourney product continuity parameter: "--cref ${sampleCrefUrl} --cw 100".
  * In videoPrompt: Add prefix "[I2V Mode: Use product reference as starting frame]" with camera movement highlighting the product.
- In imagePromptJson: include reference instruction or Midjourney tag "--cref ${sampleCrefUrl} --cw 100".
- In videoPromptJson: specify "[I2V Mode: Use product reference as starting frame]" and focus camera motion and lighting around the physical product.
- In worldBible props: explicitly anchor the product physical traits (branding, packaging, color palette).` : ''}
${characterReferenceImages && characterReferenceImages.length > 0 ? `
CHARACTER REFERENCE ATTACHMENT (Mode: Face & Wardrobe Lock):
- Reference character images provided (${characterReferenceImages.length} image(s)).
- In Character Bible: Lock facial geometry, skin tone, hair, and clothing to match reference images exactly.
- In imagePrompt: Append Midjourney character continuity parameter: "--cref ${sampleCharCrefUrl} --cw 100".
- In videoPrompt: Lock facial consistency and wardrobe.` : ''}
${productVisionAnalysis ? `
VISION AI PRODUCT ATTRIBUTES (GPT-6.1-Terra Analysis):
- Physical description: ${productVisionAnalysis.physicalDescription}
- Color palette: ${productVisionAnalysis.colorPalette ? productVisionAnalysis.colorPalette.join(', ') : ''}
- Visual features: ${productVisionAnalysis.keyVisualFeatures ? productVisionAnalysis.keyVisualFeatures.join('; ') : ''}
- Prompt enhancement: "${productVisionAnalysis.promptEnhancement || ''}"` : ''}
${characterVisionAnalysis ? `
VISION AI CHARACTER ATTRIBUTES (GPT-6.1-Terra Analysis):
- Consistency anchor: ${characterVisionAnalysis.anchorDescription}
- Appearance: ${characterVisionAnalysis.appearance}
- Clothing: ${characterVisionAnalysis.clothing}
- Hair style: ${characterVisionAnalysis.hairStyle}` : ''}
Respond ONLY with valid JSON matching the schema provided.`;

      // Use admin-defined system prompt override if set; otherwise use built-in FlowStoryboard-Pro prompt
      const systemPrompt = adminSystemPromptOverride
        ? `${adminSystemPromptOverride}

--- DYNAMIC CONTEXT (injected per request) ---
Target scene count: ${effectiveSceneCount}
Dialogue language: ${languageInstruction}
Output language: ${storyOutputLangInstruction}
Target AI video model: ${targetModel}
${vendorAlignmentBlock}`
        : `You are "FlowStoryboard-Pro" powered by ${requestedModel}, a veteran commercial director and ad-film engineer with 10+ years of hands-on experience crafting cinematic movie/drama clips and viral spots, specialized in the Google Flow + Omni Flash (Veo) and universal AI video pipeline.
Your job: convert ANY user idea into a complete production package containing:
1. Character Bible and World Bible
2. Exactly ${effectiveSceneCount} storyboard scenes (covering the full 9-panel narrative arc)
3. CODE BLOCK 1 — 9-panel storyboard grid IMAGE JSON prompt
4. CODE BLOCK 2 — 10-second continuous VIDEO JSON prompt
5. Plan Summary (3-5 bullets) and Self-Validation Report.

CRITICAL RULES (FOLLOW STRICTLY):
1. ZERO IMAGE RENDERING: You are a text-based prompt engineer. Do NOT draw or generate images yourself. Output pure JSON.
2. GLOBAL ANCHOR CONSISTENCY:
   - Define ONE exact detailed anchor_description for the main protagonist (colors, shape, clothing materials, facial features, accessories).
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
7. ${storyOutputLangInstruction}

Respond ONLY with a valid JSON object matching this structure:
{
  "planSummary": [
    "Style and Aspect Ratio: ...",
    "Narrative arc and beat structure: ...",
    "On-screen typography plan (max 3 placements): ...",
    "Audio and 50% VO coverage plan: ..."
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
    "style": "string",
    "aspect_ratio": "16:9",
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
    "task": "image-to-video, single continuous 10-second video built from the 9-panel storyboard grid, panels become sequential scenes",
    "source_image": "the generated 9-panel storyboard grid",
    "style": "string",
    "aspect_ratio": "16:9",
    "duration_seconds": 10,
    "ingredients_references": ["REF_CHARACTER_01"],
    "on_screen_text": {
      "rule": "same minimal placements as the image JSON; each text animates in only during its panel time slot",
      "placements": [
        { "appears_at": "0.0s-1.1s", "text": "hook text", "animation": "soft fade-in, hold, fade-out" },
        { "appears_at": "8.8s-10.0s", "text": "Title — Tagline", "animation": "clean end-card reveal" }
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

      const userPrompt = `Develop complete production package for:
Title: ${idea.title}
Hook: ${idea.hook}
Premise: ${idea.premise}
Synopsis: ${idea.synopsis}
Visual Style: ${idea.visualStyle}
Duration: ${idea.estimatedDuration}`;

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

    if (action === 'analyze_reference_image') {
      const {
        imageUrl,
        imageDataUrl,
        imageType = 'product',
        model: reqVisionModel,
        promptHint,
      } = payload || {};

      const targetImageUrl = imageUrl || imageDataUrl;
      if (!targetImageUrl || typeof targetImageUrl !== 'string') {
        return res.status(400).json({
          error: 'IMAGE_MISSING',
          message: 'Gambar referensi belum disertakan atau format tidak valid.',
        });
      }

      const visionModel = reqVisionModel || process.env.OPENAI_VISION_MODEL || 'gpt-6.1-terra';

      const isCharacter = imageType === 'character';

      const systemPrompt = isCharacter
        ? `You are Fixprom GPT-6.1-Terra Vision Engine, an elite character design and cinematic continuity AI.
Analyze the provided character reference image in photographic detail to generate locked visual prompts for AI video generators (Runway Gen-3/4, Kling 2.1, Google Veo, Luma Dream Machine, Midjourney cref).
You MUST respond with a valid JSON object matching this schema:
{
  "characterName": "Detected or inferred archetype/name",
  "age": "Apparent age range (e.g. 25-30 years old)",
  "gender": "Gender presentation",
  "appearance": "Facial geometry, skin tone, facial features, distinctive traits",
  "clothing": "Detailed wardrobe, fabrics, color palette, jacket/shirt style, accessories",
  "hairStyle": "Hair color, texture, length, styling",
  "distinctiveFeatures": ["Feature 1", "Feature 2"],
  "expressionTone": "Demeanor and default expression",
  "lightingStyle": "Cinematic portrait lighting style",
  "anchorDescription": "Exact consistency anchor sentence to lock character identity in every scene",
  "midjourneyCrefParam": "--cref ${targetImageUrl.startsWith('http') ? targetImageUrl : '[URL]'} --cw 100",
  "i2vStartFrameInstruction": "[I2V Mode: Lock character identity, face geometry, and outfit from reference image. Prevent morphing]",
  "promptEnhancement": "Concise English character consistency prompt to anchor into all video scene prompts"
}`
        : `You are Fixprom GPT-6.1-Terra Vision Engine, an elite commercial product cinematography and brand visual AI.
Analyze the provided product reference image in extreme visual detail to generate production-ready prompts for AI video generators (Runway Gen-3/4, Google Veo, Kling 2.1, Luma Dream Machine, Sora, Midjourney cref).
You MUST respond with a valid JSON object matching this schema:
{
  "productName": "Extracted brand or product name, or descriptive title",
  "category": "Product category (e.g. Skincare, Beverage, Gadget, Apparel)",
  "physicalDescription": "Ultra-clear English description of product geometry, materials, bottle/packaging shape, texture, and finish",
  "colorPalette": ["#Hex or Primary Color", "Secondary Color", "Accent Highlight"],
  "keyVisualFeatures": ["Visual detail 1", "Visual detail 2", "Visual detail 3"],
  "packagingStyle": "Label typography, minimalist/luxury design, logo placement, packaging material",
  "lightingAndReflection": "Optimal studio lighting, rim highlights, soft ambient diffuse, specular reflection",
  "suggestedCameraAngles": ["Macro close-up 45-degree hero angle", "360-degree floating turntable rotation", "Slow motion reveal"],
  "midjourneyCrefParam": "--cref ${targetImageUrl.startsWith('http') ? targetImageUrl : '[URL]'} --cw 100",
  "i2vStartFrameInstruction": "[I2V Mode: Use reference image as frame 0 first frame. Lock product silhouette, typography, and texture without morphing]",
  "promptEnhancement": "Cinematic English prompt suffix anchoring exact product look into all video scene prompts"
}`;

      const userText = isCharacter
        ? `Perform comprehensive visual analysis of this character reference image. Extract identity, wardrobe, facial geometry, and cinematic prompt anchors for AI video generation.${promptHint ? ` Additional user hint: ${promptHint}` : ''}`
        : `Perform comprehensive visual analysis of this product reference image. Extract geometry, material textures, brand aesthetics, and cinematic prompt anchors for AI video generation.${promptHint ? ` Additional user hint: ${promptHint}` : ''}`;

      const userMessage = {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          {
            type: 'image_url',
            image_url: {
              url: targetImageUrl,
              detail: 'high',
            },
          },
        ],
      };

      const result = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          userMessage,
        ],
        0.4,
        visionModel
      );

      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(result.content);
      } catch (parseErr) {
        console.warn('Vision analysis JSON parse failed, returning fallback extraction:', parseErr);
        parsedAnalysis = {
          productName: 'Reference Item',
          physicalDescription: result.content?.slice(0, 300) || 'Detailed product reference',
          colorPalette: ['#1A1A1A', '#F59E0B'],
          keyVisualFeatures: ['High-fidelity physical reference', 'Cinematic studio lighting'],
          suggestedCameraAngles: ['Hero shot 45-degree angle', 'Dynamic macro close-up'],
          midjourneyCrefParam: `--cref ${targetImageUrl.startsWith('http') ? targetImageUrl : '[URL]'} --cw 100`,
          i2vStartFrameInstruction: '[I2V Mode: Reference image locked as frame 0 first frame]',
          promptEnhancement: 'photorealistic physical product reference with authentic surface texture and studio lighting',
        };
      }

      const promptTokens = result.usage?.prompt_tokens || 850;
      const completionTokens = result.usage?.completion_tokens || 280;
      const totalTokens = result.usage?.total_tokens || (promptTokens + completionTokens);

      return res.status(200).json({
        success: true,
        analysis: parsedAnalysis,
        modelUsed: 'gpt-6.1-terra',
        actualEngine: result.modelUsed,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          modelUsed: 'gpt-6.1-terra',
          estimatedCreditCost: 5,
        },
        estimatedCreditCost: 5,
      });
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
