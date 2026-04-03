"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import CompanyCard from "@/components/CompanyCard";
import type { Company } from "@/lib/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [enrichSlug, setEnrichSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      });
  }, [query]);

  const handleEnrich = useCallback(async () => {
    setEnriching(true);
    const res = await fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: query }),
    });
    const data = await res.json();
    if (data.slug) {
      setEnrichSlug(data.slug);
      // Poll for completion
      const interval = setInterval(async () => {
        const statusRes = await fetch(
          `/api/enrich/status?slug=${data.slug}`
        );
        const statusData = await statusRes.json();
        if (statusData.status === "complete") {
          clearInterval(interval);
          window.location.href = `/company/${data.slug}`;
        } else if (statusData.status === "failed") {
          clearInterval(interval);
          setEnriching(false);
          setEnrichSlug(null);
        }
      }, 3000);
    }
  }, [query]);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">
          Results for &ldquo;{query}&rdquo;
        </h1>
        <div className="h-px bg-border mb-8" />

        {loading && (
          <div className="flex items-center gap-3 text-muted">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Searching...
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && !enriching && (
          <div className="text-center py-16">
            <p className="text-lg text-muted mb-4">
              We don&apos;t have <strong>{query}</strong> yet.
            </p>
            <button
              onClick={handleEnrich}
              className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-[#a8662e] transition-colors"
            >
              Build this profile with AI ✦
            </button>
          </div>
        )}

        {enriching && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-muted mb-2">
              Building profile for <strong>{query}</strong>...
            </p>
            <p className="text-sm text-muted-light">
              Our AI is researching this company. This takes about 30 seconds.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
