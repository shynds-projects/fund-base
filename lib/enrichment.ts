import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "./supabase";
import { EXTRACTION_PROMPT, OUR_READ_PROMPT } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function enrichCompany(companyName: string, slug: string) {
  const supabase = createServerClient();

  try {
    // Step 1: Extract structured company data
    const extractionResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: "user",
          content: `Research this company and return the JSON: ${companyName}`,
        },
      ],
    });

    const extractionText =
      extractionResponse.content[0].type === "text"
        ? extractionResponse.content[0].text
        : "";

    // Parse the JSON response
    const data = JSON.parse(extractionText);

    // Step 2: Generate "Our Read"
    const ourReadResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: OUR_READ_PROMPT,
      messages: [
        {
          role: "user",
          content: `Write an "Our Read" culture analysis for ${companyName}. Here's the company data: ${JSON.stringify(data)}`,
        },
      ],
    });

    const ourRead =
      ourReadResponse.content[0].type === "text"
        ? ourReadResponse.content[0].text
        : "";

    // Step 3: Write to Supabase
    // Update company record
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: data.name || companyName,
        description: data.description,
        industry: data.industry,
        hq_location: data.hq_location,
        website: data.website,
        offices: data.offices || [],
        estimated_arr: data.estimated_arr,
        top_clients: data.top_clients || [],
        our_read: ourRead,
        enrichment_status: "complete",
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);

    if (companyError) throw companyError;

    // Get company ID
    const { data: companyRow } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!companyRow) throw new Error("Company not found after update");

    const companyId = companyRow.id;

    // Insert funding rounds
    if (data.funding_rounds && data.funding_rounds.length > 0) {
      const rounds = data.funding_rounds.map(
        (r: Record<string, unknown>, i: number) => ({
          company_id: companyId,
          round_name: r.round_name,
          amount: r.amount,
          date: r.date,
          lead_investors: r.lead_investors || [],
          other_investors: r.other_investors || [],
          valuation: r.valuation,
          sort_order: r.sort_order ?? i,
        })
      );
      await supabase.from("funding_rounds").insert(rounds);
    }

    // Insert founders
    if (data.founders && data.founders.length > 0) {
      const founders = data.founders.map((f: Record<string, unknown>) => ({
        company_id: companyId,
        name: f.name,
        title: f.title,
        bio: f.bio,
        college: f.college,
        mba: f.mba,
        previous_companies: f.previous_companies || [],
        linkedin_url: f.linkedin_url,
      }));
      await supabase.from("founders").insert(founders);
    }

    // Insert team patterns
    if (data.team_patterns && data.team_patterns.length > 0) {
      const patterns = data.team_patterns.map(
        (p: Record<string, unknown>) => ({
          company_id: companyId,
          pattern_type: p.pattern_type,
          pattern_value: p.pattern_value,
        })
      );
      await supabase.from("team_patterns").insert(patterns);
    }

    console.log(`Successfully enriched: ${companyName}`);
  } catch (error) {
    console.error(`Enrichment failed for ${companyName}:`, error);
    await supabase
      .from("companies")
      .update({ enrichment_status: "failed" })
      .eq("slug", slug);
    throw error;
  }
}
