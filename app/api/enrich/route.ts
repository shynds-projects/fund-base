import { createServerClient } from "@/lib/supabase";
import { enrichCompany } from "@/lib/enrichment";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { companyName } = await request.json();
  if (!companyName || typeof companyName !== "string") {
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });
  }

  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const supabase = createServerClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("companies")
    .select("slug, enrichment_status")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json({
      slug: existing.slug,
      status: existing.enrichment_status,
    });
  }

  // Create placeholder
  await supabase.from("companies").insert({
    slug,
    name: companyName.trim(),
    enrichment_status: "in_progress",
  });

  // Run enrichment (don't await — let it run while client polls)
  enrichCompany(companyName.trim(), slug).catch(async (err) => {
    console.error("Enrichment failed:", err);
    await supabase
      .from("companies")
      .update({ enrichment_status: "failed" })
      .eq("slug", slug);
  });

  return NextResponse.json({ slug, status: "in_progress" });
}
