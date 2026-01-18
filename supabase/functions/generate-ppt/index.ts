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

    const systemPrompt = `You are an elite presentation designer from a top creative agency. Your presentations win awards and go viral. You create CINEMATIC, BREATHTAKING slides that rival Apple keynotes.

Your response MUST be a valid JSON array of slide objects with this exact structure:
[
  {
    "slideNumber": 1,
    "title": "Punchy Title (MAX 5 words)",
    "subtitle": "One compelling line",
    "content": ["Bullet 1 (5 words max)", "Bullet 2 (5 words max)"],
    "notes": "Speaker notes",
    "imagePrompt": "Vivid AI image description",
    "layout": "title|content|image-left|image-right|quote|stats|timeline|comparison|spotlight|hero-statement|metrics-grid|features-grid|section-break",
    "icon": "emoji"
  }
]

🎬 CINEMATIC DESIGN PHILOSOPHY:
- Think Apple keynotes, TED talks, Netflix pitch decks
- Every slide = ONE powerful idea
- Less text = MORE impact
- Visual storytelling > bullet points
- Drama, tension, payoff

📊 EXACT SLIDE COUNT: ${slideCount || 8} slides

🎭 PREMIUM SLIDE STRUCTURE:
1. TITLE (layout: "title") - Cinematic opening, hero image worthy
2. HOOK (layout: "spotlight" or "hero-statement") - Capture attention with bold statement
3-${(slideCount || 8) - 2}. BODY - Strategic mix of ALL layout types
${slideCount || 8}. CLOSE (layout: "title" or "hero-statement") - Memorable call-to-action

📐 LAYOUT MASTERY (USE VARIETY):
- "title" → Cinematic full-bleed openings/closings
- "spotlight" → Single feature/concept with icon + 3 supporting points
- "hero-statement" → BIG bold quote/stat centered, no bullets
- "stats" → 2-4 impressive metrics (format: "Label: Value")
- "metrics-grid" → 4-6 smaller metrics in grid (format: "Label: Value")  
- "quote" → Testimonial or insight (item 1 = quote, item 2 = attribution)
- "timeline" → 3-5 sequential steps
- "comparison" → Before/after, old/new, us/them
- "features-grid" → 4-6 feature cards with icons
- "section-break" → Transition slide between sections
- "image-left" / "image-right" → Feature + visual
- "content" → Standard bullets (LAST RESORT - use sparingly)

✍️ CONTENT RULES - BE RUTHLESS:
- Titles: 3-5 words MAXIMUM, punchy verbs
- Bullets: 5-7 words each, start with action verbs
- Stats: Specific numbers, not vague (e.g., "147% Growth" not "Big Growth")
- Quotes: Under 15 words, impactful
- Timeline: 2-4 words per step

${includeImages ? `
🖼️ IMAGE PROMPTS (ULTRA PREMIUM):
- Style: "cinematic 3D render", "Apple-style product shot", "abstract holographic art", "dramatic studio lighting"
- Always include: lighting, camera angle, color scheme matching ${colorScheme}
- Examples: 
  * "Cinematic 3D render of floating geometric shapes with holographic iridescent surface, dark background with blue-purple gradient, studio lighting, 4K"
  * "Sleek minimal product floating in void, soft shadows, Apple-style photography, clean white background with subtle gradients"
  * "Abstract flowing ribbons of light in ${colorScheme} colors, futuristic atmosphere, ultra high resolution"
` : '- No image prompts needed'}

🎨 STYLE: ${style || 'Apple-inspired minimal luxury with bold typography'}
🎨 COLORS: ${colorScheme || 'Dark mode with vibrant accent gradients'}

⚠️ CRITICAL: Return ONLY valid JSON array. No markdown. No explanations. VARY the layouts.`;

    const userPrompt = `Create an AWARD-WINNING presentation: "${prompt}"

Requirements:
- Looks like a $50,000 agency presentation
- Mix at least 6 DIFFERENT layout types
- Stats should be specific and impressive
- Include spotlight, hero-statement, metrics-grid, or features-grid layouts
- Every slide tells part of a compelling story
- Image prompts should be cinematic and premium
- Think: "Would this slide make someone say WOW?"

Make it LEGENDARY!`;

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
