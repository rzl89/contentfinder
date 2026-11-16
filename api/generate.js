/**
 * Vercel Serverless Function — Secure AI Gateway
 * Protected backend endpoint: reads process.env.OPENAI_API_KEY securely.
 * Default Model: gpt-6-luna (with resilient automatic fallback)
 */

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

  const apiKey = req.body?.customApiKey || process.env.OPENAI_API_KEY;

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
        subcatName,
        platform = 'TikTok',
        duration = '30-60s',
        visualStyle = 'cinematic_realistic',
        contextName = 'Indonesia Natural',
        targetMarket = 'Indonesia',
        targetAudience = 'Digital youth & creator audience',
        dialogLanguage = 'indonesian',
        trendApproach = 'trend_first',
        additionalTheme,
        topic,
        count = 5,
        temperature = 0.8,
        ideaMemory,
        assignedAngles = [],
        creativeEntropy,
      } = payload || {};

      const effectiveTopic = (additionalTheme || topic || '').trim();

      const languageInstruction =
        dialogLanguage === 'javanese'
          ? 'Bahasa Jawa (ngoko/krama natural sehari-hari).'
          : dialogLanguage === 'sundanese'
          ? 'Bahasa Sunda (akrab natural).'
          : dialogLanguage === 'english'
          ? 'English (clear, conversational modern English).'
          : dialogLanguage === 'mixed'
          ? 'Campuran / Code-switching (Bahasa Indonesia santai campur istilah umum).'
          : dialogLanguage === 'none'
          ? 'Tanpa dialog (visual-only storytelling dengan sound effects/musik atmosferik).'
          : 'Bahasa Indonesia santai, kontemporer, dan akrab (tanpa kata kaku baku).';

      const trendInstruction =
        trendApproach === 'trend_first'
          ? 'STRATEGI VIRAL & RETENSI TINGGI: Hook 0-3 detik agresif tervalidasi dari pola retensi short-form (visual shock, pertanyaan tak terduga, atau adegan tengah konflik).'
          : 'STRATEGI NARRATIVE-FIRST: Alur dramatik berbobot, karakter mendalam, dan payoff emosional yang berkesan.';

      // Format previous ideas for negative constraint / anti-repetition
      const recentList = Array.isArray(ideaMemory?.recentIdeas) ? ideaMemory.recentIdeas : [];
      const historyContext =
        recentList.length > 0
          ? `\nPREVIOUSLY GENERATED IDEAS (DO NOT REPEAT OR CLOSELY PARAPHRASE THESE CONCEPTS):\n${recentList
              .slice(0, 15)
              .map(
                (item, idx) =>
                  `- [History #${idx + 1}] "${item.title}": ${item.hook} — ${item.premise}`
              )
              .join('\n')}\nCRITICAL: The ideas you generate now MUST be substantially different from all the above in premise, core conflict, and setting.\n`
          : '';

      // Format angle diversity directions
      const anglesContext =
        assignedAngles.length > 0
          ? `\nASSIGNED CREATIVE ANGLES (Apply one distinct angle to each idea):\n${assignedAngles
              .map((ang, idx) => `Idea #${idx + 1} angle directive: ${ang}`)
              .join('\n')}\n`
          : '';

      const systemPrompt = `You are Fixprom AI powered by ${requestedModel}, an elite content strategist and creative director for short-form video creators (${platform}).
Your task is to generate EXACTLY ${count} high-retention, creative, and completely DIVERSE video ideas.

RULES OF AUTHENTICITY & ANTI-SLOP (STRICT):
1. NO AI-CLICHÉ HOOKS: Do NOT use tired AI openings like "Pernahkah kamu membayangkan...", "Tahukah kamu bahwa...", "Bayangkan jika...", or "Unlock the secret". Start with an immediate concrete situation, dialogue snippet, or unexpected visual conflict.
2. NO STEREOTYPICAL LAZINESS: Do NOT assume all Indonesian stories take place in Jakarta slums, warungs, or motorbikes unless the specific narrative demands it. Represent modern, diverse Indonesian life authentically.
3. LANGUAGE ACCURACY: Language for dialogue/hook quotes must follow: ${languageInstruction}
4. STRATEGY ALIGNMENT: ${trendInstruction}
5. VISUAL INTEGRITY: Ground visual style cleanly in "${visualStyle}".

BATCH DIVERSITY & NON-REPETITION MANDATE (CRITICAL):
- Every idea in this batch MUST have a fundamentally different central conflict, point-of-view, setting, and payoff.
- DO NOT generate variations of the same incident with only cosmetic changes (e.g. changing names, objects, or locations while keeping the same core story).
- Each concept must stand on its own as a completely separate creative proposition.
${historyContext}
${anglesContext}

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
      "ending": "string (payoff / twist)",
      "suggestedLocation": "string",
      "localizationNotes": "string",
      "creativeRationale": "string"
    }
  ]
}`;

      const userPrompt = `Generate EXACTLY ${count} uniquely distinct video ideas for:
Category: ${categoryName} (${subcatName || ''})
Description: ${categoryDescription || ''}
${effectiveTopic ? `Specific Topic / Focus Angle: ${effectiveTopic}` : 'Specific Topic: General Category Exploration (Explore fresh, varied sub-angles)'}
Platform: ${platform}
Target Duration: ${duration}
Visual Style: ${visualStyle}
Context Profile: ${contextName}
Target Market: ${targetMarket}
Target Audience: ${targetAudience}
Dialog Language: ${dialogLanguage}
Trend Approach: ${trendApproach}
Entropy Seed: ${creativeEntropy || Date.now()}`;

      const { content, modelUsed } = await callOpenAI(
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

      // Backend similarity filter: ensure within-batch distinctness
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

      return res.status(200).json({ success: true, ideas: finalList, modelUsed });
    }

    if (action === 'develop_story') {
      const {
        idea,
        targetSceneCount = 4,
        targetModel = 'universal-neutral',
        dialogLanguage = 'indonesian',
        temperature = 0.7,
      } = payload || {};

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

      const systemPrompt = `You are Fixprom AI powered by ${requestedModel}, a Hollywood-grade visual director & prompt engineer specializing in video AI models (${targetModel}).
Transform this video idea into a fully articulated production package with 1 character bible, 1 world bible, and ${targetSceneCount} storyboard scenes.

CRITICAL ANTI-SLOP & PRODUCTION STANDARDS:
1. IMAGE PROMPTS (English):
   - Photorealistic cinema optics: specify lens focal length (e.g. 35mm anamorphic, 50mm f/1.8), lighting setup (e.g. volumetric golden hour, soft key with gentle rim), and color grading.
   - NO AI SLOP: Ban plastic Barbie skin, excessive CGI bloom, distorted fingers, and floating artifacts.
2. VIDEO PROMPTS (English):
   - Explicit camera motion verbs: pan, tilt, push in, orbit, slow tracking shot.
   - Subject kinematics: natural physical momentum, inertia, hair/clothing movement.
   - Vendor model alignment (${targetModel}):
     * If Kling: Prefix prompt with "[Camera: <movement>]".
     * If Google Veo: Emphasize optical hyper-realism and 4K textures.
     * If Runway Gen-3: Emphasize fluid momentum and continuous motion vectors.
     * If Luma: Emphasize smooth tracking and realistic weight.
3. CONTINUITY ANCHORS:
   - Detail at least 3 immutable physical anchors for the character (exact clothing color/material, accessory, hairstyle) so they do NOT mutate across scenes.
4. VOICE & DIALOGUE (MANDATORY — every scene MUST have a dialogue line):
   - Language: ${languageInstruction}.
   - Every single scene must include a "dialogue" field with an authentic spoken line in ${languageInstruction} that fits the character's personality and the scene beat.
   - The character's voiceStyle must describe how they sound and speak (e.g. "Bicara pelan tapi tegas, nada rendah tenang — tidak pernah panik"), and all dialogue lines must reflect that voiceStyle consistently.
   - Dialogue must be natural, grounded, and plot-relevant — not generic filler.
   - Scene 1 (hook): a short punchy line that stops the scroll.
   - Middle scenes: conversational or reactive lines showing character depth.
   - Final scene: memorable closing line fitting the story resolution.

Respond ONLY with a valid JSON object matching:
{
  "character": {
    "name": "string",
    "role": "string",
    "appearance": "string",
    "clothing": "string",
    "personality": "string",
    "voiceStyle": "string (e.g. Nada hangat, bicara mengalir dengan humor ringan. Tidak pernah berteriak.)",
    "consistencyAnchors": ["anchor1 (e.g. navy corduroy jacket)", "anchor2", "anchor3"]
  },
  "worldBible": {
    "name": "string",
    "environmentType": "urban | suburban | rural | natural | indoor | fantasy",
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
      "beatTitle": "Hook / Pembuka",
      "purpose": "Capture viewer attention in first 3 seconds",
      "summary": "string",
      "location": {
        "environmentType": "urban",
        "description": "string",
        "timeOfDay": "string",
        "weather": "string"
      },
      "characterActions": "string",
      "camera": {
        "shot": "Close-up / Medium Shot / Wide Shot",
        "angle": "Eye-level / Low angle / High angle",
        "movement": "Slow push in / Tracking right / Static / Crane down",
        "framing": "Rule of thirds / Center framed"
      },
      "lighting": "string (e.g. Warm afternoon sunlight with soft shadow falloff)",
      "dialogue": "WAJIB diisi � kalimat dialog dalam bahasa yang ditentukan, natural dan sesuai kepribadian karakter serta beat adegan ini",
      "narration": "string",
      "continuityAnchors": ["string"],
      "imagePrompt": "string (in descriptive English with camera, lens, lighting)",
      "videoPrompt": "string (in descriptive English with kinematics and camera movement)",
      "negativePrompt": "blurry, oversaturated, plastic skin, deformed hands, extra fingers, mutated limbs, text artifacts, watermark, low quality, glitch"
    }
  ]
}`;

      const userPrompt = `Develop complete production package for:
Title: ${idea.title}
Hook: ${idea.hook}
Premise: ${idea.premise}
Synopsis: ${idea.synopsis}
Visual Style: ${idea.visualStyle}
Duration: ${idea.estimatedDuration}`;

      const { content, modelUsed } = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature
      );

      const parsed = JSON.parse(content);
      return res.status(200).json({ success: true, package: parsed, modelUsed });
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
