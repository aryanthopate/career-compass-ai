import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume, analyses, skillGaps, interviewAttempts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating career verdict with AI");

    const systemPrompt = `You are an expert career advisor and hiring manager. Analyze the provided career data and generate a comprehensive career verdict.

You MUST respond with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "hiringProbability": <number 0-100>,
  "resumeReadiness": <number 0-100>,
  "skillReadiness": <number 0-100>,
  "interviewReadiness": <number 0-100>,
  "salaryRange": { "min": <number>, "max": <number> },
  "topRisks": ["<risk1>", "<risk2>", "<risk3>"],
  "nextActions": ["<action1>", "<action2>", "<action3>", "<action4>"],
  "recommendedRoles": ["<role1>", "<role2>", "<role3>"],
  "rolesToAvoid": ["<role1>", "<role2>"]
}

Base your analysis on:
1. Resume completeness and quality
2. Skills match for target roles
3. Interview performance history
4. Experience level and gaps
5. Market demand for their skills

Be realistic but encouraging. Salary should be in USD annually.`;

    const userPrompt = `Analyze this career data and provide a verdict:

RESUME DATA:
${resume ? JSON.stringify(resume, null, 2) : 'No resume data available'}

RESUME ANALYSES HISTORY:
${analyses?.length > 0 ? JSON.stringify(analyses.slice(0, 3), null, 2) : 'No analyses available'}

SKILL GAP ASSESSMENTS:
${skillGaps?.length > 0 ? JSON.stringify(skillGaps.slice(0, 3), null, 2) : 'No skill gap data available'}

INTERVIEW ATTEMPTS:
${interviewAttempts?.length > 0 ? JSON.stringify(interviewAttempts.slice(0, 3), null, 2) : 'No interview data available'}

Provide a comprehensive career verdict as a JSON object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI response:", content);

    // Parse the JSON response
    let verdict;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verdict = JSON.parse(jsonMatch[0]);
      } else {
        verdict = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse verdict");
    }

    // Validate and sanitize the response
    const sanitizedVerdict = {
      hiringProbability: Math.min(100, Math.max(0, Number(verdict.hiringProbability) || 50)),
      resumeReadiness: Math.min(100, Math.max(0, Number(verdict.resumeReadiness) || 50)),
      skillReadiness: Math.min(100, Math.max(0, Number(verdict.skillReadiness) || 50)),
      interviewReadiness: Math.min(100, Math.max(0, Number(verdict.interviewReadiness) || 50)),
      salaryRange: {
        min: Number(verdict.salaryRange?.min) || 40000,
        max: Number(verdict.salaryRange?.max) || 60000,
      },
      topRisks: Array.isArray(verdict.topRisks) ? verdict.topRisks.slice(0, 5) : [],
      nextActions: Array.isArray(verdict.nextActions) ? verdict.nextActions.slice(0, 5) : [],
      recommendedRoles: Array.isArray(verdict.recommendedRoles) ? verdict.recommendedRoles.slice(0, 5) : [],
      rolesToAvoid: Array.isArray(verdict.rolesToAvoid) ? verdict.rolesToAvoid.slice(0, 3) : [],
    };

    return new Response(JSON.stringify(sanitizedVerdict), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career verdict function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
