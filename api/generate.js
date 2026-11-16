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
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    // If requested model (e.g. gpt-6-luna) is not available or restricted on this account, fallback smoothly to gpt-4o-mini
    if (!response.ok && response.status === 404 && activeModel !== 'gpt-4o-mini') {
      console.warn(`Model ${activeModel} not found on account, falling back to gpt-4o-mini`);
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
        platform,
        duration,
        visualStyle,
        contextName,
        targetMarket,
        targetAudience,
        additionalTheme,
        count = 5,
        temperature = 0.75,
      } = payload || {};

      const systemPrompt = `You are TemporaForge AI powered by ${requestedModel}, an elite content strategist and creative director for Indonesian short-form video creators (TikTok, Instagram Reels, YouTube Shorts).
Your task is to generate ${count} high-retention, creative video ideas.

RULES OF AUTHENTICITY (9 GOLDEN RULES):
1. Do NOT assume all Indonesian stories take place in Jakarta or typical urban slums.
2. Do NOT insert random warungs, motorbikes, or stereotypical props unless narrative-justified.
3. Keep dialogue natural, contemporary Indonesian conversational slang (santai, akrab) unless historical/formal.
4. Ground the visual style cleanly in "${visualStyle}".
5. Ensure hooks grab attention in seconds 0-3 with suspense, intrigue, or relatable tension.

Respond ONLY with a valid JSON array of ${count} objects with this EXACT structure:
[
  {
    "title": "string",
    "hook": "string (Detik 0-3 hook text)",
    "premise": "string",
    "synopsis": "string",
    "storyBeats": ["Beat 1...", "Beat 2...", "Beat 3...", "Beat 4..."],
    "conflict": "string",
    "ending": "string (payoff / twist)",
    "suggestedLocation": "string",
    "localizationNotes": "string",
    "creativeRationale": "string"
  }
]`;

      const userPrompt = `Generate ${count} video ideas for:
Category: ${categoryName} (${subcatName || ''})
Description: ${categoryDescription || ''}
Platform: ${platform || 'TikTok'}
Target Duration: ${duration || '30-60s'}
Visual Style: ${visualStyle || 'cinematic_realistic'}
Context Profile: ${contextName || 'Indonesia Natural'}
Target Market: ${targetMarket || 'Indonesia'}
Target Audience: ${targetAudience || 'Digital youth & creator audience'}
${additionalTheme ? `Additional Theme / Angle: ${additionalTheme}` : ''}`;

      const { content, modelUsed } = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature
      );

      let parsed = JSON.parse(content);
      if (!Array.isArray(parsed) && parsed.ideas && Array.isArray(parsed.ideas)) {
        parsed = parsed.ideas;
      } else if (!Array.isArray(parsed) && Object.values(parsed)[0] && Array.isArray(Object.values(parsed)[0])) {
        parsed = Object.values(parsed)[0];
      }

      return res.status(200).json({ success: true, ideas: parsed, modelUsed });
    }

    if (action === 'develop_story') {
      const { idea, targetSceneCount = 4, temperature = 0.7 } = payload || {};

      const systemPrompt = `You are TemporaForge AI powered by ${requestedModel}, a Hollywood-grade visual director & prompt engineer for video AI models (Google Veo, Kling 1.5, Runway Gen-3, Luma Dream Machine).
Transform this short video idea into a fully articulated production package with 1 character, 1 world bible, and ${targetSceneCount} storyboard scenes.

CRITICAL REQUIREMENTS:
- Image & Video Prompts MUST be in descriptive, photorealistic English with camera movements, lighting, and textures.
- Negative prompts must list model artifact preventions.
- Dialogue can be in natural Indonesian.

Respond ONLY with a valid JSON object matching:
{
  "character": {
    "name": "string",
    "role": "string",
    "appearance": "string",
    "clothing": "string",
    "personality": "string",
    "consistencyAnchors": ["anchor1", "anchor2"]
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
        "shot": "Close-up / Medium Shot",
        "angle": "Eye level",
        "movement": "Slow push in",
        "framing": "Rule of thirds"
      },
      "lighting": "string",
      "dialogue": "string",
      "narration": "string",
      "continuityAnchors": ["string"],
      "imagePrompt": "string (in English)",
      "videoPrompt": "string (in English with motion description)",
      "negativePrompt": "blurry, low quality, distorted anatomy, text overlay, watermark, glitch"
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
