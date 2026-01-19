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

    const systemPrompt = `You are LEGENDARY presentation architect. Your work appears in TED talks, Apple keynotes, Fortune 500 boardrooms. You craft VISUAL STORIES that captivate and convert.

RESPONSE FORMAT - Return ONLY valid JSON array:
[
  {
    "slideNumber": 1,
    "title": "Impactful 3-5 word title",
    "subtitle": "Supporting hook line",
    "content": ["Point 1", "Point 2", "Point 3"],
    "notes": "Speaker notes",
    "imagePrompt": "Detailed AI image description",
    "layout": "one of the layout types below",
    "icon": "relevant emoji",
    "accentColor": "primary|secondary|accent|neon"
  }
]

🎬 PRESENTATION PHILOSOPHY:
- ONE idea per slide, MAXIMUM impact
- Think Netflix pitch deck meets Apple keynote
- Every slide = potential viral screenshot
- Tension → Insight → Resolution narrative arc
- 70% visual, 30% text ratio

📊 EXACT SLIDES: ${slideCount || 8} slides

🎭 MANDATORY STRUCTURE:
1. OPENING: "title" or "magazine-hero" - Cinematic hook
2. PROBLEM/HOOK: "spotlight" or "hero-statement" - Create tension
3-${(slideCount || 8) - 2}. BODY: Strategic variety using ALL layouts
${slideCount || 8}. CLOSING: "hero-statement" or "call-to-action" - Memorable finale

📐 LAYOUT MASTERY (use 8+ different types):

HERO LAYOUTS:
- "title" → Cinematic opener with dramatic background
- "magazine-hero" → Editorial spread, bold typography + image
- "hero-statement" → Single powerful quote/stat, centered
- "section-break" → Transition between major sections

DATA LAYOUTS:
- "stats" → 3-4 BIG impressive metrics with context
- "metrics-grid" → 6 smaller metrics in clean grid
- "chart-story" → Single stat with narrative explanation
- "progress-bars" → Visual progress/comparison bars

CONTENT LAYOUTS:
- "spotlight" → Feature focus with icon + 3 points
- "features-grid" → 4-6 feature cards with icons
- "content" → Standard bullet points (SPARINGLY)
- "icon-list" → List with custom icons per point

COMPARISON LAYOUTS:
- "comparison" → Side-by-side A vs B
- "before-after" → Transformation story
- "timeline" → 4-5 step process/journey

VISUAL LAYOUTS:
- "image-left" → Visual + text split
- "image-right" → Text + visual split
- "gallery" → Multiple images showcase
- "quote" → Testimonial with attribution

IMPACT LAYOUTS:
- "call-to-action" → Bold CTA with button-style element
- "key-takeaways" → Summary with numbered points
- "agenda" → Roadmap/outline style

✍️ CONTENT RULES:
- Titles: 3-5 powerful words, active verbs
- Bullets: 6-8 words max, action-oriented
- Stats: SPECIFIC numbers (e.g., "2.4M users" not "millions")
- Quotes: Under 15 words, profound
- Timeline: 3-4 words per step

${includeImages ? `
🖼️ IMAGE PROMPTS - ULTRA PREMIUM:
Create vivid, specific image descriptions for AI generation:
- Style options: "3D isometric render", "abstract geometric art", "cinematic photography", "futuristic hologram", "minimalist illustration", "gradient mesh art"
- Always specify: lighting, mood, color palette (${colorScheme || 'dark premium'})
- Example: "Sleek 3D isometric render of floating data cubes with holographic glow, deep purple and cyan gradient, soft volumetric lighting, ultra-modern, 8K quality"
` : ''}

🎨 STYLE: ${style || 'Premium agency presentation - dark mode elegance'}
🎨 COLORS: ${colorScheme || 'Dark with vibrant accent gradients'}

⚠️ CRITICAL RULES:
1. Return ONLY valid JSON array - no markdown, no explanations
2. Use minimum 8 DIFFERENT layout types
3. Every stat must be specific and impressive
4. Vary slide density - some busy, some minimal
5. Create narrative flow with emotional arc`;

    const userPrompt = `Create an EXTRAORDINARY ${slideCount || 8}-slide presentation: "${prompt}"

Design Brief:
- Agency-level quality ($100,000 pitch deck standard)
- Strategic variety: Mix data slides, story slides, visual slides
- Include: spotlight, metrics-grid, hero-statement, timeline layouts
- Stats should be specific and believable
- Each slide contributes to an overall narrative arc
- Image prompts should be ultra-premium and specific

Make every slide a potential viral screenshot. GO LEGENDARY!`;

    console.log('Generating legendary presentation for:', prompt);

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
        temperature: 0.8,
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
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse slide content');
      }
    }

    // Validate and enhance slides
    slides = slides.map((slide: any, index: number) => ({
      ...slide,
      slideNumber: index + 1,
      layout: slide.layout || (index === 0 ? 'title' : 'content'),
      icon: slide.icon || '✨',
      accentColor: slide.accentColor || 'primary',
    }));

    // Generate images if requested
    if (generateImages && includeImages) {
      console.log('Generating images for slides...');
      const slidesWithImages = await Promise.all(
        slides.map(async (slide: any, index: number) => {
          // Generate for image layouts and title slides
          const shouldGenerateImage = slide.imagePrompt && (
            slide.layout === 'image-left' || 
            slide.layout === 'image-right' || 
            slide.layout === 'magazine-hero' ||
            slide.layout === 'gallery' ||
            index === 0
          );
          
          if (shouldGenerateImage) {
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
                      content: `Generate an ultra-premium presentation visual: ${slide.imagePrompt}. Style: modern, sophisticated, suitable for Fortune 500 presentations. 16:9 aspect ratio, 4K quality.`
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

    console.log(`Successfully generated ${slides.length} slides`);

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
