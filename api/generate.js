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
      } = payload || {};

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

      // Use admin-defined system prompt override if set; otherwise use built-in FlowStoryboard-Pro prompt
      const systemPrompt = adminSystemPromptOverride
        ? `${adminSystemPromptOverride}

--- DYNAMIC CONTEXT (injected per request) ---
Target scene count: ${effectiveSceneCount}
Dialogue language: ${languageInstruction}
Output language: ${storyOutputLangInstruction}
Target AI video model: ${targetModel}
Respond ONLY with valid JSON matching the full schema provided.`
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
   - If Kling: prefix video prompt with [Camera: <movement>].
   - If Veo 2 / Google Flow: focus on optical realism and 4K textures.
   - If Runway Gen-3 / Luma: specify fluid motion vectors and smooth tracking.
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

    return res.status(400).json({ error: 'INVALID_ACTION', message: `Unknown action: ${action}` });
  } catch (error) {
    console.error('AI Gateway Error:', error);
    return res.status(500).json({
      error: 'AI_GATEWAY_FAILED',
      message: error.message || 'Internal error in AI proxy',
    });
  }
}
