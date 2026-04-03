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
    .select("*, funding_rounds(*), founders(*)")
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

  // Filter by funding stage
  if (stage && results.length > 0) {
    results = results.filter((company: Record<string, unknown>) => {
      const rounds = company.funding_rounds as Array<{ round_name: string }>;
      if (!rounds || rounds.length === 0) return false;
      return rounds.some((r) =>
        r.round_name.toLowerCase().includes(stage.toLowerCase())
      );
    });
  }

  // Enrich with aggregated data
  const cleaned = results.map(
    ({
      funding_rounds,
      founders,
      ...rest
    }: Record<string, unknown>) => {
      const rounds = (funding_rounds as Array<{ round_name: string; amount: string | null; sort_order: number }>) || [];
      const founderList = (founders as Array<{ name: string }>) || [];

      const sortedRounds = [...rounds].sort((a, b) => a.sort_order - b.sort_order);
      const latestRound = sortedRounds.length > 0
        ? sortedRounds[sortedRounds.length - 1]?.round_name
        : null;
      const totalRounds = sortedRounds.length;
      const founderCount = founderList.length;
      const founderNames = founderList.map((f) => f.name).join(", ");

      return {
        ...rest,
        latest_round: latestRound,
        total_rounds: totalRounds,
        founder_count: founderCount,
        founder_names: founderNames,
      };
    }
  );

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
