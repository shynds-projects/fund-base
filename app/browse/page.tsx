"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import CompanyCard from "@/components/CompanyCard";
import type { Company } from "@/lib/types";

interface BrowseResponse {
  results: (Company & { latest_round?: string })[];
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
      <main className="max-w-6xl mx-auto px-6 py-10">
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
            {/* Search */}
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

            {/* Industry */}
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
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Stage */}
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
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
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
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
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

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center gap-3 text-muted py-16">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Loading companies...
          </div>
        )}

        {!loading && data && data.results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.results.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
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
