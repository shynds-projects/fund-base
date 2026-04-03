import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("companies")
    .select("enrichment_status")
    .eq("slug", slug)
    .single();

  if (!data) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ status: data.enrichment_status });
}
