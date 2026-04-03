"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface BrowseCompany {
  id: string;
  slug: string;
  name: string;
  industry: string | null;
  hq_location: string | null;
  estimated_arr: string | null;
  latest_round: string | null;
  total_rounds: number;
  founder_count: number;
  founder_names: string;
  top_clients: string[];
}

interface BrowseResponse {
  results: BrowseCompany[];
  filters: {
    industries: string[];
    locations: string[];
    stages: string[];
  };
}

export default function BrowsePage() {
  const [data, setData] = useState<BrowseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (industry) params.set("industry", industry);
    if (stage) params.set("stage", stage);
    if (location) params.set("location", location);

    const res = await fetch(`/api/browse?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [search, industry, stage, location]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const clearFilters = () => {
    setSearch("");
    setIndustry("");
    setStage("");
    setLocation("");
  };

  const hasFilters = search || industry || stage || location;

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-2">
            Browse Companies
          </h1>
          <p className="text-muted">
            Filter and explore {data?.results.length ?? "..."} VC-backed startups.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-light mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Company name..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#f8f9fc] text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-light mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#f8f9fc] text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">All Industries</option>
                {data?.filters.industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-light mb-2">
                Funding Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#f8f9fc] text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">All Stages</option>
                {data?.filters.stages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-light mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#f8f9fc] text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">All Locations</option>
                {data?.filters.locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-muted">
                {data?.results.length ?? 0} results
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-accent hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading && (
          <div className="flex items-center justify-center gap-3 text-muted py-16">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Loading companies...
          </div>
        )}

        {!loading && data && data.results.length > 0 && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#f8f9fc]">
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">Company</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">Industry</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">HQ</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">Latest Round</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">Est. ARR</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">Founders</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs">Top Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((company, i) => (
                    <tr
                      key={company.id}
                      className={`border-b border-border last:border-b-0 hover:bg-accent-light/50 transition-colors ${
                        i % 2 === 0 ? "" : "bg-[#fcfcfe]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/company/${company.slug}`}
                          className="font-semibold text-foreground hover:text-accent transition-colors"
                        >
                          {company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {company.industry && (
                          <span className="text-xs font-medium text-accent bg-accent-light px-2 py-0.5 rounded-full">
                            {company.industry}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">
                        {company.hq_location || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {company.latest_round ? (
                          <span className="font-medium">{company.latest_round}</span>
                        ) : (
                          <span className="text-muted-light">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {company.estimated_arr || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted max-w-[200px] truncate">
                        {company.founder_names || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted max-w-[200px] truncate">
                        {company.top_clients && company.top_clients.length > 0
                          ? company.top_clients.slice(0, 3).join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && data && data.results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted mb-2">
              No companies match your filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </>
  );
}
