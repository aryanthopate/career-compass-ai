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
    const { action, code, sourceLanguage, targetLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (action === 'detect') {
      // Detect programming language
      const detectPrompt = `Analyze the following code and identify its programming language. 
Return ONLY the language name in lowercase (e.g., "python", "javascript", "java", "cpp", "c", "csharp", "ruby", "go", "rust", "php", "swift", "kotlin", "typescript").
Do not include any explanation, just the language name.

Code:
\`\`\`
${code}
\`\`\``;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a code language detector. Respond only with the programming language name in lowercase." },
            { role: "user", content: detectPrompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const language = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "unknown";

      console.log("Detected language:", language);

      return new Response(JSON.stringify({ language }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'convert') {
      // Convert code to target language
      const convertPrompt = `Convert the following ${sourceLanguage || 'code'} to ${targetLanguage}.

IMPORTANT RULES:
1. Preserve the exact algorithm and logic
2. Keep variable names similar where possible
3. Use idiomatic patterns for the target language
4. Include necessary imports/headers
5. Make sure the code is complete and runnable
6. Do not add any explanations, just return the converted code

Source code (${sourceLanguage || 'auto-detected'}):
\`\`\`
${code}
\`\`\`

Return ONLY the converted ${targetLanguage} code, nothing else.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { 
              role: "system", 
              content: "You are an expert code translator. Convert code between programming languages while preserving the exact algorithm and logic. Return only code, no explanations or markdown code blocks." 
            },
            { role: "user", content: convertPrompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      let convertedCode = data.choices?.[0]?.message?.content?.trim() || "";

      // Clean up code blocks if present
      convertedCode = convertedCode
        .replace(/^```[\w]*\n?/gm, '')
        .replace(/\n?```$/gm, '')
        .trim();

      console.log("Converted code length:", convertedCode.length);

      return new Response(JSON.stringify({ convertedCode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Code shift error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
