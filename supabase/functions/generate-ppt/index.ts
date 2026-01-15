import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, colorScheme, slideCount, includeImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert presentation designer. Create professional, engaging presentation slides based on user prompts.

Your response MUST be a valid JSON array of slide objects with this exact structure:
[
  {
    "slideNumber": 1,
    "title": "Slide Title",
    "subtitle": "Optional subtitle",
    "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "notes": "Speaker notes for this slide",
    "imagePrompt": "Description for an image that would enhance this slide",
    "layout": "title|content|two-column|image-left|image-right|quote|stats"
  }
]

Guidelines:
- Create ${slideCount || 8} slides minimum
- First slide should be a title slide with compelling headline
- Last slide should be a conclusion/thank you slide
- Use concise, impactful bullet points (max 5-6 per slide)
- Vary slide layouts for visual interest
- Include relevant image prompts for visual slides
- Add helpful speaker notes
- Style: ${style || 'professional'}
- Color scheme preference: ${colorScheme || 'modern blue'}
- ${includeImages ? 'Include image suggestions for visual impact' : 'Focus on text content'}

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

    const userPrompt = `Create a presentation about: ${prompt}

Make it detailed, professional, and visually engaging. Each slide should have clear, actionable content.`;

    console.log('Generating presentation for prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'API credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up markdown if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Raw AI response:', content.substring(0, 500));

    let slides;
    try {
      slides = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse slide content');
      }
    }

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating presentation:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
