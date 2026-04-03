import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .ilike("name", `%${q}%`)
    .eq("enrichment_status", "complete")
    .order("name")
    .limit(20);

  return NextResponse.json({ results: data || [] });
}
