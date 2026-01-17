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
    const { prompt, style, colorScheme, slideCount, includeImages, generateImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a world-class presentation designer known for creating award-winning, visually stunning, and highly engaging presentations. Your slides are known for being modern, creative, and impactful.

Your response MUST be a valid JSON array of slide objects with this exact structure:
[
  {
    "slideNumber": 1,
    "title": "Short Punchy Title",
    "subtitle": "Compelling tagline",
    "content": ["Point 1 (max 6 words)", "Point 2 (max 6 words)", "Point 3 (max 6 words)"],
    "notes": "Detailed speaker notes with talking points",
    "imagePrompt": "Detailed AI image prompt",
    "layout": "title|content|two-column|image-left|image-right|quote|stats|timeline|comparison",
    "icon": "emoji"
  }
]

🎨 DESIGN PHILOSOPHY:
- Less text, MORE IMPACT
- Every word must earn its place
- Visual hierarchy is everything
- White space is your friend

📊 SLIDE COUNT: Create exactly ${slideCount || 8} slides

🎭 SLIDE STRUCTURE (Required):
1. TITLE SLIDE (layout: "title") - Bold headline + memorable tagline + icon
2. PROBLEM/CONTEXT (layout: "content" or "stats") - Set the stage dramatically
3-${(slideCount || 8) - 2}. BODY SLIDES - Mix of layouts for visual variety
${slideCount || 8}. CLOSING SLIDE (layout: "title") - Strong call-to-action or memorable takeaway

📐 LAYOUT SELECTION RULES:
- "title" → Opening/closing slides, section dividers
- "stats" → When showing 2-4 key metrics (format: "Label: Value" e.g., "Revenue: $2.5M")
- "quote" → Powerful testimonials, key insights (first item = quote, second = attribution)
- "timeline" → Process steps, roadmaps, sequences (3-5 short items)
- "comparison" → Before/after, pros/cons, options (first half = left, second half = right)
- "two-column" → Contrasting ideas, dual concepts
- "image-left" / "image-right" → Feature highlights, case studies
- "content" → Standard bullet points (max 5 bullets)

✍️ CONTENT RULES:
- Bullet points: MAX 6 words each, start with action verbs
- Stats format: "Metric Name: 85%" or "Users: 10M+"
- Quotes: Impactful, memorable, under 20 words
- Timeline: Each step is 2-4 words

${includeImages ? `
🖼️ IMAGE PROMPTS (Be Ultra-Specific):
- Style: "3D render", "flat illustration", "cinematic photo", "abstract gradient art", "isometric design"
- Subject: Exactly what to show
- Mood: "inspiring", "innovative", "trustworthy", "energetic"
- Colors: Match ${colorScheme || 'the presentation theme'}
- Example: "3D isometric illustration of a rocket launching from a laptop, purple and blue gradient background, tech startup vibe, clean minimal style"
` : '- No image prompts needed'}

🎨 STYLE: ${style || 'Modern tech startup - bold, clean, innovative'}
🎨 COLORS: ${colorScheme || 'Use vibrant accent colors'}

⚠️ CRITICAL: Return ONLY valid JSON array. No markdown. No explanations.`;

    const userPrompt = `Create an absolutely STUNNING presentation about: "${prompt}"

Requirements:
- Make it look like a $10,000 professional presentation
- Short, punchy text that POPS
- Varied layouts (use at least 4 different layout types)
- Each slide tells part of a compelling story
- Stats should use real-looking specific numbers
- Include relevant emojis as icons
${includeImages ? '- Write vivid, specific image prompts for visual slides' : ''}

Make this the best presentation on this topic ever created!`;

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

    // Generate images if requested
    if (generateImages && includeImages) {
      console.log('Generating images for slides...');
      const slidesWithImages = await Promise.all(
        slides.map(async (slide: any, index: number) => {
          if (slide.imagePrompt && (slide.layout === 'image-left' || slide.layout === 'image-right' || index === 0)) {
            try {
              console.log(`Generating image for slide ${index + 1}: ${slide.imagePrompt.substring(0, 50)}...`);
              
              const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash-image',
                  messages: [
                    { 
                      role: 'user', 
                      content: `Generate a professional, high-quality presentation slide image: ${slide.imagePrompt}. Style: modern, clean, corporate, suitable for business presentations. Ultra high resolution.`
                    }
                  ],
                  modalities: ['image', 'text'],
                }),
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                if (imageUrl) {
                  console.log(`Image generated for slide ${index + 1}`);
                  return { ...slide, generatedImage: imageUrl };
                }
              } else {
                console.error(`Image generation failed for slide ${index + 1}:`, imageResponse.status);
              }
            } catch (imgError) {
              console.error(`Error generating image for slide ${index + 1}:`, imgError);
            }
          }
          return slide;
        })
      );
      slides = slidesWithImages;
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
