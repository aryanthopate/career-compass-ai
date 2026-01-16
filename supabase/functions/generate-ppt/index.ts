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

    const systemPrompt = `You are an expert presentation designer creating modern, visually stunning presentations. Create professional, engaging presentation slides based on user prompts.

Your response MUST be a valid JSON array of slide objects with this exact structure:
[
  {
    "slideNumber": 1,
    "title": "Compelling Slide Title",
    "subtitle": "Optional subtitle with impact",
    "content": ["Key point 1 - keep concise", "Key point 2 - actionable insight", "Key point 3 - memorable takeaway"],
    "notes": "Detailed speaker notes for this slide",
    "imagePrompt": "Detailed description for AI image generation: modern, professional, high-quality image of [specific scene/concept] with [style details], corporate photography style, 4k quality",
    "layout": "title|content|two-column|image-left|image-right|quote|stats|timeline|comparison",
    "accentColor": "#hexcolor that matches the content mood",
    "icon": "emoji that represents this slide's theme"
  }
]

Design Guidelines:
- Create exactly ${slideCount || 8} slides
- First slide: Title slide with powerful headline and tagline
- Last slide: Call-to-action or thank you slide
- Use varied layouts: mix content, image-left, image-right, stats, quote, comparison, timeline
- Keep bullet points SHORT (max 8 words each), impactful, action-oriented
- Maximum 4-5 bullet points per slide
- Style: ${style || 'modern professional with creative flair'}
- Color scheme preference: ${colorScheme || 'vibrant gradient'}
- ${includeImages ? 'Include detailed image prompts for AI generation - be specific about style, mood, lighting, composition' : 'Focus on text content with icons'}

Image Prompt Guidelines (when includeImages is true):
- Be specific: "A team of diverse professionals collaborating in a modern glass office, warm lighting, shallow depth of field"
- Include style: "minimalist illustration style" or "corporate photography" or "abstract geometric art"
- Add mood: "inspiring", "professional", "innovative", "trustworthy"
- Specify composition: "wide shot", "close-up", "aerial view"

Layout Distribution Suggestions:
- Title slides: "title" layout
- Data/metrics: "stats" layout  
- Comparisons: "comparison" or "two-column" layout
- Process/steps: "timeline" layout
- Key quotes: "quote" layout
- Feature highlights: "image-left" or "image-right" layout
- General content: "content" layout

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

    const userPrompt = `Create a stunning modern presentation about: ${prompt}

Make it detailed, visually engaging, and professional. Each slide should have:
- Clear, concise content (not wordy)
- Varied layouts for visual interest
- Specific image prompts if images are enabled
- Relevant icons/emojis
- Speaker notes for the presenter`;

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
