import { createServerClient } from "@/lib/supabase";
import type { CompanyProfile } from "@/lib/types";
import Header from "@/components/Header";
import FundingTimeline from "@/components/FundingTimeline";
import FounderCard from "@/components/FounderCard";
import TeamPatterns from "@/components/TeamPatterns";
import OurRead from "@/components/OurRead";
import SectionHeader from "@/components/SectionHeader";
import { notFound } from "next/navigation";

async function getCompany(slug: string): Promise<CompanyProfile | null> {
  const supabase = createServerClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!company) return null;

  const [{ data: rounds }, { data: founders }, { data: patterns }] =
    await Promise.all([
      supabase
        .from("funding_rounds")
        .select("*")
        .eq("company_id", company.id)
        .order("sort_order"),
      supabase.from("founders").select("*").eq("company_id", company.id),
      supabase.from("team_patterns").select("*").eq("company_id", company.id),
    ]);

  return {
    ...company,
    funding_rounds: rounds || [],
    founders: founders || [],
    team_patterns: patterns || [],
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) notFound();

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent-light px-3 py-1 rounded-full">
              {company.industry || "Startup"}
            </span>
            {company.enrichment_status === "in_progress" && (
              <span className="text-xs font-medium text-muted-light animate-pulse">
                Building profile...
              </span>
            )}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold mb-3">
            {company.name}
          </h1>
          {company.description && (
            <p className="text-lg text-muted leading-relaxed max-w-2xl">
              {company.description}
            </p>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-accent hover:underline mt-2"
            >
              {company.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {company.hq_location && (
            <div className="bg-white border border-border rounded-xl p-4">
              <p className="text-xs text-muted-light uppercase tracking-wider mb-1">
                HQ
              </p>
              <p className="text-sm font-semibold">{company.hq_location}</p>
            </div>
          )}
          {company.estimated_arr && (
            <div className="bg-white border border-border rounded-xl p-4">
              <p className="text-xs text-muted-light uppercase tracking-wider mb-1">
                Est. ARR
              </p>
              <p className="text-sm font-semibold">{company.estimated_arr}</p>
            </div>
          )}
          {company.funding_rounds.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4">
              <p className="text-xs text-muted-light uppercase tracking-wider mb-1">
                Latest Round
              </p>
              <p className="text-sm font-semibold">
                {company.funding_rounds[company.funding_rounds.length - 1].round_name}
              </p>
            </div>
          )}
          {company.founders.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-4">
              <p className="text-xs text-muted-light uppercase tracking-wider mb-1">
                Founders
              </p>
              <p className="text-sm font-semibold">{company.founders.length}</p>
            </div>
          )}
        </div>

        {/* Top Clients */}
        {company.top_clients.length > 0 && (
          <div className="mb-10">
            <SectionHeader title="Top Clients" />
            <div className="flex flex-wrap gap-2">
              {company.top_clients.map((client) => (
                <span
                  key={client}
                  className="text-sm bg-white border border-border px-4 py-2 rounded-full"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Funding */}
        {company.funding_rounds.length > 0 && (
          <div className="mb-10">
            <SectionHeader title="Funding History" />
            <FundingTimeline rounds={company.funding_rounds} />
          </div>
        )}

        {/* Founders */}
        {company.founders.length > 0 && (
          <div className="mb-10">
            <SectionHeader title="Founders" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.founders.map((founder) => (
                <FounderCard key={founder.id} founder={founder} />
              ))}
            </div>
          </div>
        )}

        {/* Team DNA */}
        {company.team_patterns.length > 0 && (
          <div className="mb-10">
            <SectionHeader title="Team DNA" />
            <TeamPatterns patterns={company.team_patterns} />
          </div>
        )}

        {/* Our Read */}
        {company.our_read && (
          <div className="mb-10">
            <SectionHeader title="Culture & Vibe" />
            <OurRead content={company.our_read} />
          </div>
        )}

        {/* Offices */}
        {company.offices && company.offices.length > 0 && (
          <div className="mb-10">
            <SectionHeader title="Offices" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {company.offices.map((office, i) => (
                <div
                  key={i}
                  className="bg-white border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    📍 {office.city}, {office.country}
                  </span>
                  {office.teams_hint && (
                    <span className="text-xs text-muted-light">
                      {office.teams_hint}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
