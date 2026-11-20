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

  // Model default: gpt-6.1-terra per user specification
  const requestedModel = req.body?.payload?.model || process.env.OPENAI_MODEL || 'gpt-6.1-terra';
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

      const defaultSystemPromptIdeas = `You are "FlowStoryboard-Pro", a veteran commercial director & ad-film engineer with 10+ years of hands-on experience crafting TV commercials, cinematic movie/drama clips, and animated spots, now specialized in the Google Flow + Omni Flash (Veo) pipeline.
Your job: Convert the user's category, theme, and parameters into EXACTLY ${count} production-ready, diverse video concepts for ${isProductAd ? 'Product Commercial / Ad' : 'Movie / Drama / Animated Clip'}.
${foundationalDirective}
GOLDEN RULES (STRICT):
1. CRITICAL SYSTEM CONSTRAINT: You are a text-based prompt engineer. Output ONLY valid JSON code blocks.
2. BEAT STRUCTURE:
${isProductAd
  ? '   • ADS (products / e-commerce): 1 Hook -> 2 Problem/Context -> 3 Product Reveal -> 4-5 Feature close-ups -> 6 Benefit demo -> 7 Lifestyle shot -> 8 Result/social proof -> 9 CTA + logo.'
  : '   • HOW-TO / VIRAL / STORYTELLING (AI Playbook 8-Shot Arc): 1 Opener (establishing & goal) -> 2 Preparation (tools & setup) -> 3 First Action (visible start) -> 4 Transformation (satisfying moment) -> 5 Progress (improvement) -> 6 Creative Angle (cinematic perspective) -> 7 Final Step (anticipation) -> 8 Final Reveal (finished payoff).'}
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
${historyContext}${anglesContext}${foundationalDirective}
FORMAT REQUIREMENT:
Respond with a JSON object containing a single key "ideas" which is an array of EXACTLY ${count} distinct idea objects with keys: title, hook, premise, synopsis, storyBeats, conflict, ending, suggestedLocation, localizationNotes, creativeRationale.`
        : defaultSystemPromptIdeas;

      const userPrompt = `Generate EXACTLY ${count} uniquely distinct video ideas for:
Category: ${categoryName}
Description: ${categoryDescription || ''}
Type: ${isProductAd ? `Product Ad / Commercial (Brand: ${productBrandName || 'Standard'})` : 'Movie / Drama / Animated Clip'}
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
Respond ONLY with valid JSON matching the schema provided.`;

      // Check whether this request is for Advertisement / Affiliate or general How-To / Storytelling
      const isAdOrAffiliate =
        payload?.storyboardType === 'ad' ||
        payload?.isProductAd ||
        idea?.categoryId === 'affiliate-marketing' ||
        idea?.categoryId === 'product-story' ||
        (idea?.subcategoryId && (idea.subcategoryId.startsWith('affiliate-') || idea.subcategoryId.startsWith('product-')));

      const durationRaw = String(payload?.duration || idea?.estimatedDuration || '10s').toLowerCase();
      const is15s = durationRaw.includes('15');
      const totalSec = is15s ? 15 : 10;
      const aiPlaybookEngine = is15s ? 'Seedance' : 'Omni Flesh';

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

      // AI Playbook (8-Panel Infographic Storyboard & Video) prompt for all other categories
      const aiPlaybookPrompt = `You are an Elite AI Storyboard Director, Infographic Designer, and Short-Form Video Producer specializing in creating highly engaging educational, DIY, cooking, survival, science, life hacks, repair, gardening, productivity, outdoor skills, and how-to videos optimized for AI image and video generation.
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
3. 8-PANEL NARRATIVE ARC:
   - Panel 1 — Opener (Wide establishing shot): Introduce the character, environment, goal, and important key object.
   - Panel 2 — Preparation (Medium shot): Character prepares, reveal necessary tools.
   - Panel 3 — First Action (Close-up): Process begins, visible progress.
   - Panel 4 — Transformation (Extreme close-up): Most visually satisfying moment, highlight the transformation.
   - Panel 5 — Progress (Medium close-up): Continue the process, show clear improvement.
   - Panel 6 — Creative Camera Angle: Cinematic angle (POV, Overhead, Low Angle, Side Angle, or Reflection).
   - Panel 7 — Final Step (Close dramatic shot): Almost finished, build anticipation.
   - Panel 8 — Final Reveal (Wide cinematic shot): Show finished result, natural character reaction, strong satisfying payoff.
4. METADATA PER PANEL:
   - Every panel must define: Panel title, camera angle, action, reaction, time hint, key object, emotion, and one short English voice-over sentence (5-12 words).
   - No speech bubbles or paragraphs inside panels.
5. CHARACTER & OBJECT CONSISTENCY:
   - Maintain 100% consistency throughout every panel and video shot (same face, hair, clothing, accessories, body proportions, colors, identity).
6. VOICE-OVER SCRIPT:
   - Exactly 8 narration lines (one per panel), 5 to 12 words each. Friendly, educational, natural, easy to understand.
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
    "Style: Commercial | Aspect Ratio: 16:9",
    "Narrative arc: 9-panel sequential grid layout (Panel 1 Hook to Panel 9 End-Card)",
    "On-screen typography: Minimal premium rule (max 3 placements, <= 6 words each)",
    "Timeline & Audio: Exactly 10.0s total runtime, ~50% VO coverage (max 15 words)"
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
    "style": "string",
    "aspect_ratio": "16:9",
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
    "style": "string",
    "aspect_ratio": "16:9",
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
Target AI video model: ${isAdOrAffiliate ? targetModel : aiPlaybookEngine}
${vendorAlignmentBlock}${storyFoundationalDirective}

Respond ONLY with a valid JSON object matching this structure:
${targetJsonSchema}`
        : `${activeBasePrompt}

Respond ONLY with a valid JSON object matching this structure:
${targetJsonSchema}`;

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

    return res.status(400).json({ error: 'INVALID_ACTION', message: `Unknown action: ${action}` });
  } catch (error) {
    console.error('AI Gateway Error:', error);
    return res.status(500).json({
      error: 'AI_GATEWAY_FAILED',
      message: error.message || 'Internal error in AI proxy',
    });
  }
}
