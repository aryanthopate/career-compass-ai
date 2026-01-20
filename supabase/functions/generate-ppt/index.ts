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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an ELITE presentation designer who creates STUNNING, PROFESSIONAL presentations for Fortune 500 companies, TED talks, and Apple-level keynotes.

RESPONSE FORMAT - Return ONLY valid JSON array:
[
  {
    "slideNumber": 1,
    "title": "Powerful 3-6 word headline",
    "subtitle": "Supporting tagline that hooks",
    "content": ["Point 1 with data/stat", "Point 2 with insight", "Point 3 with actionable item"],
    "presenterNotes": "DETAILED speaking script - exactly what to say, including transitions, emphasis points, pauses, and audience engagement tips. Write 100-200 words per slide.",
    "imagePrompt": "Ultra-specific professional image description",
    "layout": "mixed-content",
    "icon": "relevant emoji",
    "accentColor": "primary"
  }
]

🎯 CRITICAL RULES FOR EVERY SLIDE:
1. EVERY slide MUST have BOTH text content AND an imagePrompt - NO EXCEPTIONS
2. Text and image work TOGETHER on SAME slide - they complement each other
3. NO slide should be image-only or text-only
4. Content should be specific with real-looking data, stats, and facts
5. Presenter notes are MANDATORY and should be detailed speaking scripts

📊 EXACT SLIDES: ${slideCount || 10} slides

🎭 SLIDE STRUCTURE - ALL slides are MIXED CONTENT (text + image):

SLIDE 1 - TITLE/INTRO:
- Layout: "title" - Hero title with cinematic background image
- Title: Catchy, memorable 4-6 words
- Content: 2-3 key taglines/promises
- Image: Stunning hero visual related to topic
- Notes: Opening hook, how to grab attention, pause points

SLIDES 2-3 - PROBLEM/CONTEXT:
- Layout: "mixed-left" or "mixed-right" (image on one side, text on other)
- Content: Pain points with specific stats
- Image: Visual metaphor for problem/context
- Notes: How to build tension, rhetorical questions

SLIDES 4-${(slideCount || 10) - 3} - BODY CONTENT (vary these layouts):
- "stats-visual" → Big metrics WITH supporting visual
- "features-visual" → Feature cards WITH product/concept image
- "timeline-visual" → Process steps WITH journey illustration  
- "comparison-visual" → Side-by-side WITH contrast image
- "quote-visual" → Testimonial WITH person/context image
- "spotlight-visual" → Key feature WITH hero product shot

SLIDE ${(slideCount || 10) - 1} - KEY TAKEAWAYS:
- Layout: "takeaways-visual" 
- Content: 3-4 numbered key insights
- Image: Success/achievement visual
- Notes: How to summarize memorably

SLIDE ${slideCount || 10} - CALL TO ACTION:
- Layout: "cta-visual"
- Content: Clear next steps, contact info
- Image: Inspiring action-oriented visual
- Notes: Strong closing, call to action delivery

📐 LAYOUT TYPES (all are mixed text+image):
- "title" → Hero opener with text overlay on image area
- "mixed-left" → Image left (45%), text right (55%)
- "mixed-right" → Text left (55%), image right (45%)
- "stats-visual" → 3-4 big stats at top, supporting image below
- "features-visual" → 2x2 or 3x2 feature grid with large image
- "timeline-visual" → Horizontal timeline with background visual
- "comparison-visual" → Split comparison with central image
- "quote-visual" → Large quote with author image/context
- "spotlight-visual" → Centered feature with wraparound image
- "takeaways-visual" → Numbered list with success imagery
- "cta-visual" → Bold CTA with inspiring action image

🖼️ IMAGE PROMPT GUIDELINES - PROFESSIONAL & ENGAGING:
Create vivid, specific, PROFESSIONAL image descriptions:

STYLE REQUIREMENTS:
- "Corporate professional photography, clean and modern"
- "Sleek 3D render, soft gradients, premium feel"
- "Minimalist flat illustration, brand colors, sophisticated"
- "Abstract geometric art, luxury brand aesthetic"
- "Cinematic photography, shallow depth of field, dramatic lighting"

ALWAYS SPECIFY:
1. Subject/scene (what's in the image)
2. Style (photography/3D/illustration)
3. Lighting (soft, dramatic, natural, studio)
4. Colors (matching ${colorScheme || 'professional dark with accent colors'})
5. Mood (confident, innovative, trustworthy, energetic)
6. Quality markers ("4K quality", "ultra-sharp", "premium")

GOOD IMAGE PROMPT EXAMPLES:
- "Professional team collaborating in modern glass office, natural lighting, shallow depth of field, warm tones, corporate photography, 4K quality"
- "Abstract 3D geometric shapes floating in space, deep purple and cyan gradient, soft volumetric lighting, futuristic premium feel, 8K render"
- "Minimalist flat illustration of data analytics dashboard, brand colors purple and teal, clean lines, sophisticated corporate style"
- "Close-up of hands typing on laptop with holographic data visualizations, cinematic blue lighting, tech innovation mood"

BAD IMAGE PROMPTS (AVOID):
- Generic descriptions like "business meeting" or "technology"
- No style or lighting specified
- Too vague or abstract

✍️ PRESENTER NOTES - SPEAKING SCRIPT:
Each slide MUST have detailed presenter notes (100-200 words) including:
- Opening hook/transition from previous slide
- Key talking points with emphasis markers
- Specific stats/facts to mention
- Rhetorical questions or audience engagement
- Pauses and pacing suggestions
- Transition to next slide

Example presenter notes:
"[PAUSE] Let me share something that might surprise you... [CLICK] This single statistic changed how we think about the problem. When 78% of customers report frustration with current solutions, we knew there had to be a better way. [LOOK AT AUDIENCE] How many of you have experienced this exact pain point? [PAUSE FOR EFFECT] That's why we built... [TRANSITION] Which brings me to our breakthrough approach..."

🎨 STYLE: ${style || 'Premium agency presentation - cinematic dark mode'}
🎨 COLORS: ${colorScheme || 'Dark backgrounds with vibrant accent gradients'}

⚠️ ABSOLUTE REQUIREMENTS:
1. Return ONLY valid JSON array - no markdown, no explanations
2. EVERY slide has imagePrompt AND content - NO EXCEPTIONS
3. Image prompts are detailed, professional, specific (50+ words each)
4. Presenter notes are detailed speaking scripts (100-200 words each)
5. Stats and data should look real and impressive
6. Create narrative arc: Hook → Problem → Solution → Benefits → Action`;

    const userPrompt = `Create a ${slideCount || 10}-slide PROFESSIONAL presentation about: "${prompt}"

CRITICAL REQUIREMENTS:
1. Every single slide MUST have both text content AND an image prompt
2. Images must complement the text on the same slide
3. Include detailed presenter notes for each slide (what to say)
4. Make it look like a $50,000 agency presentation
5. Use specific, believable statistics and data
6. Image prompts must be ultra-detailed and professional

Make every slide STUNNING and ENGAGING!`;

    console.log('Generating presentation with Gemini for:', prompt);

    // Call Gemini API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up markdown if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Raw Gemini response:', content.substring(0, 500));

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

    // Validate and enhance slides - ensure all have image prompts and notes
    slides = slides.map((slide: any, index: number) => {
      const defaultImagePrompt = `Professional ${index === 0 ? 'hero' : 'supporting'} visual for "${slide.title || prompt}", corporate photography style, premium lighting, 4K quality, sophisticated modern aesthetic`;
      const defaultNotes = `Slide ${index + 1}: Present the key points about ${slide.title || 'this topic'}. Engage the audience with the visual and highlight the main message. Transition smoothly to the next concept.`;
      
      return {
        ...slide,
        slideNumber: index + 1,
        layout: slide.layout || (index === 0 ? 'title' : 'mixed-right'),
        icon: slide.icon || '✨',
        accentColor: slide.accentColor || 'primary',
        imagePrompt: slide.imagePrompt || defaultImagePrompt,
        presenterNotes: slide.presenterNotes || defaultNotes,
        content: slide.content || ['Key point about ' + (slide.title || prompt)],
      };
    });

    // Generate images using Gemini Vision if requested
    if (generateImages && includeImages) {
      console.log('Generating images for slides with Gemini...');
      
      const slidesWithImages = await Promise.all(
        slides.map(async (slide: any, index: number) => {
          // Generate image for all slides that have image prompts
          if (slide.imagePrompt) {
            try {
              console.log(`Generating image for slide ${index + 1}: ${slide.imagePrompt.substring(0, 60)}...`);
              
              const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: `Generate a professional presentation slide image: ${slide.imagePrompt}. 
                      
Requirements:
- 16:9 aspect ratio
- Premium corporate quality
- Clean, modern aesthetic
- Suitable for Fortune 500 presentation
- Professional lighting and composition
- High resolution, 4K quality`
                    }]
                  }],
                  generationConfig: {
                    responseModalities: ["image", "text"],
                  }
                }),
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                // Extract base64 image from Gemini response
                const imageParts = imageData.candidates?.[0]?.content?.parts || [];
                const imagePart = imageParts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
                
                if (imagePart?.inlineData?.data) {
                  const mimeType = imagePart.inlineData.mimeType || 'image/png';
                  const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;
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

    console.log(`Successfully generated ${slides.length} slides with mixed content`);

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
