import { createServerClient } from "@/lib/supabase";
import type { Company } from "@/lib/types";
import Header from "@/components/Header";
import CompanyCard from "@/components/CompanyCard";
import SearchHero from "@/components/SearchHero";

async function getCompanies(): Promise<{ companies: Company[]; count: number }> {
  const supabase = createServerClient();

  const { data, count } = await supabase
    .from("companies")
    .select("*", { count: "exact" })
    .eq("enrichment_status", "complete")
    .order("name");

  return { companies: data || [], count: count || 0 };
}

export default async function Home() {
  const { companies, count } = await getCompanies();

  return (
    <>
      <Header />
      <main>
        <SearchHero count={count} />

        {companies.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-muted whitespace-nowrap">
                Companies
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </section>
        )}

        {companies.length === 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-16 text-center">
            <p className="text-muted text-lg">
              No companies yet. Search for a startup to get started!
            </p>
          </section>
        )}
      </main>
    </>
  );
}
