import type { APIRoute } from 'astro';

export const prerender = false;

const LM_STUDIO_URL = (process as any).env?.LM_STUDIO_URL || 'http://127.0.0.1:1234/v1';

export const POST: APIRoute = async (context) => {
  try {
    const request = context.request;
    
    // Read raw body
    const chunks: Buffer[] = [];
    for await (const chunk of request.body || []) {
      chunks.push(Buffer.from(chunk));
    }
    const bodyText = Buffer.concat(chunks).toString('utf-8');
    
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message, 'body:', bodyText);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const title = (body as any).title;
    const content = (body as any).content;

    if (!title && !content) {
      return new Response(JSON.stringify({ error: 'title or content required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Given the following title and content, generate a summary and SVG thumbnail.

TITLE: ${title}
CONTENT: ${content}

Generate:
1. A concise summary (1-2 sentences, max 200 characters) in the same language as the input
2. An SVG thumbnail (400x225 pixels) with:
   - Title words (first 3-5 words from the actual title) as large text
   - A short summary (1 sentence) below the title
   - Modern color palette (blues, purples, or teals)
   - Simple geometric shapes

IMPORTANT: Replace "First Three Words" with actual title words and "Short summary preview" with actual summary text.

Respond in JSON format only:
{
  "summary": "actual summary text here",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'>...actual SVG with real text...</svg>"
}`;

    let parsed;
    
    try {
      // Get available models from LM Studio
      const modelsResponse = await fetch(`${LM_STUDIO_URL}/models`, {
        signal: AbortSignal.timeout(5000),
      });
      
      let model = 'qwen3.6-35b-a3b@6bit'; // default fallback
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        if (modelsData.data && modelsData.data.length > 0) {
          model = modelsData.data[0].id;
        }
      }
      
      console.log('Using LM Studio model:', model);

      // Call LM Studio OpenAI-compatible API
      const lmStudioResponse = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates blog post summaries and SVG thumbnails in JSON format. Do not output reasoning or thinking process. Minimize reasoning and provide immediate concise summary and SVG output.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 32768,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (lmStudioResponse.ok) {
        const data = await lmStudioResponse.json();
        if (data.choices && data.choices[0]?.message?.content) {
          const responseText = data.choices[0].message.content;
          try {
            parsed = JSON.parse(responseText);
          } catch (e) {
            console.log('Failed to parse LLM JSON response:', e.message);
          }
        }
      }
    } catch (lmStudioError) {
      console.log('LM Studio not available:', (lmStudioError as Error).message);
    }

    // Fallback if LM Studio failed or returned invalid JSON
    if (!parsed || !parsed.summary) {
      const text = (content || '')
        .replace(/^#{1,6}\s+.*$/gm, '')
        .replace(/\n+/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      const sentences = text.match(/[^.!?가-힣]+[.!?가-힣]+\s*/g);
      let summary = '';
      
      if (sentences && sentences.length > 0) {
        const scored = sentences.map((s, i) => {
          const clean = s.trim();
          if (!clean || clean.length < 15) return { text: clean, score: 0 };
          const lengthScore = 1 / Math.log(2 + clean.length / 10);
          const positionScore = 1 / (1 + i * 0.3);
          return { text: clean, score: lengthScore + positionScore };
        });
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, Math.min(3, sentences.length));
        top.sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text));
        summary = top.map(s => s.text).join(' ').trim();
      }

      const titleWords = (title || 'Post').split(/\s+/).slice(0, 3).join(' ');
      
      parsed = {
        summary: summary || (title || 'Untitled').slice(0, 200),
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea"/>
              <stop offset="100%" style="stop-color:#764ba2"/>
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill="url(#bg)"/>
          <circle cx="320" cy="50" r="80" fill="rgba(255,255,255,0.1)"/>
          <circle cx="80" cy="180" r="60" fill="rgba(255,255,255,0.1)"/>
          <text x="200" y="95" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">${titleWords}</text>
          <line x1="150" y1="115" x2="250" y2="115" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <text x="200" y="145" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="13" font-family="Arial, sans-serif">${summary.slice(0, 50)}</text>
        </svg>`
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
