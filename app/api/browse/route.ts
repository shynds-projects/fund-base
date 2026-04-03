import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || "";
  const industry = params.get("industry") || "";
  const stage = params.get("stage") || "";
  const location = params.get("location") || "";

  const supabase = createServerClient();

  let query = supabase
    .from("companies")
    .select("*, funding_rounds(*)")
    .eq("enrichment_status", "complete")
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (industry) {
    query = query.ilike("industry", `%${industry}%`);
  }

  if (location) {
    query = query.ilike("hq_location", `%${location}%`);
  }

  const { data } = await query;

  let results = data || [];

  // Filter by funding stage client-side since it requires joining
  if (stage && results.length > 0) {
    results = results.filter((company: Record<string, unknown>) => {
      const rounds = company.funding_rounds as Array<{ round_name: string }>;
      if (!rounds || rounds.length === 0) return false;
      return rounds.some((r) =>
        r.round_name.toLowerCase().includes(stage.toLowerCase())
      );
    });
  }

  // Strip funding_rounds from response to keep it light
  const cleaned = results.map(({ funding_rounds, ...rest }: Record<string, unknown>) => {
    const rounds = funding_rounds as Array<{ round_name: string }>;
    const latestRound = rounds && rounds.length > 0
      ? rounds[rounds.length - 1]?.round_name
      : null;
    return { ...rest, latest_round: latestRound };
  });

  // Get distinct values for filter dropdowns
  const allData = await supabase
    .from("companies")
    .select("industry, hq_location")
    .eq("enrichment_status", "complete");

  const industries = [
    ...new Set(
      (allData.data || [])
        .map((c: { industry: string | null }) => c.industry)
        .filter(Boolean)
    ),
  ].sort();

  const locations = [
    ...new Set(
      (allData.data || [])
        .map((c: { hq_location: string | null }) => c.hq_location)
        .filter(Boolean)
    ),
  ].sort();

  return NextResponse.json({
    results: cleaned,
    filters: {
      industries,
      locations,
      stages: ["Seed", "Series A", "Series B", "Series C", "Series D", "Series E", "IPO"],
    },
  });
}
