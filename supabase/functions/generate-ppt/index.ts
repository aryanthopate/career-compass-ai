import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lovable AI Gateway - supports image generation
const LOVABLE_AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, colorScheme, slideCount, includeImages, generateImages } = await req.json();
    
    // Use Lovable API key for reliability (no quota issues)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an ELITE presentation designer who creates STUNNING, AWARD-WINNING presentations for Fortune 500 companies, TED talks, and Apple-level keynotes.

RESPONSE FORMAT - Return ONLY valid JSON array (no markdown, no explanations):
[
  {
    "slideNumber": 1,
    "title": "Powerful 3-6 word headline",
    "subtitle": "Supporting tagline that hooks",
    "content": ["Point 1 with data/stat", "Point 2 with insight", "Point 3 with actionable item"],
    "presenterNotes": "DETAILED 100-200 word speaking script with [PAUSE], [EMPHASIS], transitions, and audience engagement tips",
    "imagePrompt": "Ultra-detailed 50+ word professional image description",
    "layout": "mixed-left",
    "icon": "relevant emoji",
    "accentColor": "primary"
  }
]

🎯 CRITICAL REQUIREMENTS - EVERY SLIDE MUST HAVE:
1. ✅ Text content (title + 3-5 bullet points with real data)
2. ✅ Image prompt (detailed, professional, 50+ words)
3. ✅ Presenter notes (100-200 word speaking script)
4. ✅ NO slide should be image-only or text-only - MIXED CONTENT ALWAYS

📊 CREATE EXACTLY ${slideCount || 10} SLIDES

🎭 SLIDE STRUCTURE FOR MIXED CONTENT:

SLIDE 1 - TITLE HERO:
- Layout: "title"
- Title: Catchy 4-6 words, memorable
- Subtitle: Compelling tagline
- Content: 2-3 key promises/highlights
- Image: "Stunning cinematic hero image, [TOPIC]-related visual, dramatic lighting, ultra-high quality 4K, professional photography style, depth of field, corporate premium aesthetic"
- Notes: "Welcome everyone! [PAUSE] Today I'm going to share something that will change how you think about [topic]. [LOOK AT AUDIENCE] Let me start with a story..."

SLIDES 2-3 - CONTEXT/PROBLEM:
- Layout: "mixed-left" or "mixed-right"
- Content: Pain points with specific stats (e.g., "78% of companies struggle with...")
- Image: "Visual metaphor showing [problem/challenge], professional photography, muted tones transitioning to vibrant, symbolic imagery, 4K quality"
- Notes: "[TRANSITION] Now let's talk about why this matters. [CLICK] When you look at these numbers... [PAUSE FOR EFFECT]"

SLIDES 4-${(slideCount || 10) - 3} - BODY (use varied layouts):
- "stats-visual" → Big metrics (Revenue: $2.5M, Growth: 145%) WITH supporting business visual
- "features-visual" → 3-4 feature cards WITH product/concept 3D render
- "timeline-visual" → 3-5 process steps WITH journey illustration
- "comparison-visual" → Side-by-side benefits WITH contrast imagery
- "quote-visual" → Testimonial WITH person/context image
- "spotlight-visual" → Key feature focus WITH hero product shot
- "mixed-left" / "mixed-right" → Standard image+text split

SLIDE ${(slideCount || 10) - 1} - KEY TAKEAWAYS:
- Layout: "takeaways-visual"
- Content: 3-4 numbered key insights
- Image: "Success and achievement concept, professional team celebrating, bright optimistic lighting, corporate photography, 4K quality"
- Notes: "[RECAP] So let me summarize what we've covered today... [COUNT ON FINGERS] First... Second... Third..."

SLIDE ${slideCount || 10} - CALL TO ACTION:
- Layout: "cta-visual"
- Content: ["Clear next step", "Contact info", "Deadline/urgency"]
- Image: "Inspiring action-oriented visual, forward momentum, bright future concept, cinematic lighting, motivational corporate imagery"
- Notes: "[STRONG CLOSE] The question isn't whether you should act - it's whether you can afford not to. [PAUSE] Here's exactly what to do next..."

📐 LAYOUT TYPES (ALL include both text + image):
- "title" → Hero opener with full background image + text overlay
- "mixed-left" → Image (45%) left, text (55%) right
- "mixed-right" → Text (55%) left, image (45%) right
- "stats-visual" → Big stat cards at top, supporting image below
- "features-visual" → 2x2 feature grid + large image
- "timeline-visual" → Horizontal timeline + background visual
- "comparison-visual" → Split comparison + central image
- "quote-visual" → Large quote block + author image
- "spotlight-visual" → Centered feature + wraparound image
- "takeaways-visual" → Numbered list + success imagery
- "cta-visual" → Bold CTA button + inspiring action image

🖼️ IMAGE PROMPT REQUIREMENTS (50+ words each):
Create VIVID, SPECIFIC, PROFESSIONAL image descriptions:

ALWAYS SPECIFY:
1. Subject/scene (what's in the image)
2. Style (corporate photography / 3D render / flat illustration / abstract art)
3. Lighting (dramatic / soft / natural / studio / cinematic)
4. Colors (matching ${colorScheme || 'professional dark with accent colors'})
5. Mood (confident / innovative / trustworthy / energetic / premium)
6. Quality markers ("4K quality", "ultra-sharp", "premium aesthetic", "high-end")
7. Composition (shallow depth of field, centered subject, rule of thirds)

EXCELLENT IMAGE PROMPT EXAMPLES:
- "Professional diverse team collaborating in modern glass office with city skyline view, natural golden hour lighting streaming through windows, shallow depth of field focusing on engaged discussion, warm corporate tones, 4K photography quality, premium Fortune 500 aesthetic"
- "Abstract 3D geometric shapes floating in deep space, flowing gradients of purple to cyan to magenta, soft volumetric god rays, futuristic premium tech feel, 8K render quality, Apple-style minimalist sophistication"
- "Close-up hands of executive reviewing data dashboard on sleek tablet, holographic data visualizations floating above, cool blue accent lighting, tech innovation mood, cinematic shallow depth of field, ultra-modern corporate setting"

✍️ PRESENTER NOTES FORMAT (100-200 words each):
Write exactly what the speaker should say, including:
- Opening hook/transition phrase
- [PAUSE] markers for dramatic effect
- [CLICK] for advancing to next point
- [LOOK AT AUDIENCE] for engagement
- [EMPHASIS] for key words
- Specific stats and facts to mention
- Rhetorical questions
- Transition to next slide

EXAMPLE PRESENTER NOTES:
"[TRANSITION] And this brings us to something fascinating... [CLICK] Take a look at this number. [PAUSE] 87% of industry leaders are already doing this. [LOOK AT AUDIENCE] Now, I want you to think about your own organization. Are you part of that 87%? Or are you in the 13% that's falling behind? [PAUSE FOR EFFECT] The good news is, it's not too late. [CLICK] Here's exactly how you can catch up and even get ahead... [TRANSITION TO NEXT] Let me show you the three steps..."

🎨 STYLE: ${style || 'Premium agency presentation - cinematic dark mode with vibrant accents'}
🎨 COLORS: ${colorScheme || 'Dark sophisticated backgrounds with electric accent gradients'}

⚠️ FINAL CHECKLIST - VERIFY EACH SLIDE HAS:
☑️ Compelling title (3-6 words)
☑️ 3-5 content points with real data/stats
☑️ Detailed image prompt (50+ words, professional style)
☑️ Presenter notes (100-200 words with markers)
☑️ Layout type for mixed content
☑️ Relevant emoji icon
☑️ Narrative flow to next slide`;

    const userPrompt = `Create a ${slideCount || 10}-slide PROFESSIONAL presentation about: "${prompt}"

REQUIREMENTS:
1. Every single slide MUST have both text content AND a detailed image prompt
2. Images and text work TOGETHER on the same slide - complementary
3. Include detailed 100-200 word presenter notes for each slide (speaking script)
4. Use real-looking statistics and data points
5. Create a narrative arc: Hook → Problem → Solution → Benefits → Action
6. Make it look like a $50,000 agency presentation

Return ONLY valid JSON array. No markdown, no explanations.`;

    console.log('Generating presentation with Lovable AI Gateway for:', prompt);

    // Call Lovable AI Gateway (more reliable, no quota issues)
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Clean up markdown if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Raw AI response length:', content.length);
    console.log('Raw AI response preview:', content.substring(0, 500));

    let slides;
    try {
      slides = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse slide content from AI response');
      }
    }

    // Validate and enhance slides - ensure all have image prompts and notes
    slides = slides.map((slide: any, index: number) => {
      const defaultImagePrompt = `Professional ${index === 0 ? 'cinematic hero' : 'high-quality supporting'} visual for "${slide.title || prompt}", corporate photography style with dramatic lighting, shallow depth of field, premium 4K quality, sophisticated modern aesthetic, Fortune 500 presentation ready`;
      
      const defaultNotes = `[SLIDE ${index + 1}] Present the key points about ${slide.title || 'this topic'}. [PAUSE] Highlight the main message and engage your audience with the visual. [CLICK] Move through each point deliberately. [TRANSITION] This leads us to the next important concept...`;
      
      return {
        ...slide,
        slideNumber: index + 1,
        layout: slide.layout || (index === 0 ? 'title' : index % 2 === 0 ? 'mixed-left' : 'mixed-right'),
        icon: slide.icon || '✨',
        accentColor: slide.accentColor || 'primary',
        imagePrompt: slide.imagePrompt || defaultImagePrompt,
        presenterNotes: slide.presenterNotes || slide.notes || defaultNotes,
        content: Array.isArray(slide.content) ? slide.content : ['Key point about ' + (slide.title || prompt)],
      };
    });

    // Generate images using Gemini Vision API if requested
    if (generateImages && includeImages) {
      console.log('Generating AI images for slides...');
      
      const slidesWithImages = await Promise.all(
        slides.map(async (slide: any, index: number) => {
          if (slide.imagePrompt) {
            try {
              console.log(`Generating image for slide ${index + 1}: ${slide.imagePrompt.substring(0, 80)}...`);
              
              // Use Lovable AI Gateway with image generation model
              const imageResponse = await fetch(LOVABLE_AI_GATEWAY, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash-image-preview',
                  messages: [{
                    role: 'user',
                    content: `Generate a professional presentation slide image with these specifications:

${slide.imagePrompt}

CRITICAL REQUIREMENTS:
- 16:9 widescreen aspect ratio (1920x1080)
- Premium corporate/business quality suitable for Fortune 500 presentation
- Clean, modern, sophisticated aesthetic
- Professional lighting and composition
- High resolution, ultra-sharp, 4K quality
- NO text, words, or letters in the image
- Focus on visual storytelling and professional imagery`
                  }],
                  modalities: ['image', 'text'],
                }),
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                // Extract base64 image from Lovable AI Gateway response
                const images = imageData.choices?.[0]?.message?.images || [];
                
                if (images.length > 0 && images[0]?.image_url?.url) {
                  console.log(`✓ Image generated for slide ${index + 1}`);
                  return { ...slide, generatedImage: images[0].image_url.url };
                }
              } else {
                const errorText = await imageResponse.text();
                console.error(`Image generation failed for slide ${index + 1}:`, imageResponse.status, errorText);
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

    // Count slides with images
    const slidesWithImagesCount = slides.filter((s: any) => s.generatedImage).length;
    console.log(`✓ Successfully generated ${slides.length} slides (${slidesWithImagesCount} with images)`);

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating presentation:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Please try again. If the issue persists, try with fewer slides or disable AI images.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
