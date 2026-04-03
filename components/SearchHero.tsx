"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchHero({ count }: { count: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-6xl font-bold mb-4">
          fund<span className="text-accent">.</span>base
        </h1>
        <p className="text-lg text-muted mb-8">
          Free, AI-powered startup intelligence. Search any VC-backed company.
        </p>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a startup (e.g. Stripe, Figma, Ramp)..."
              className="w-full px-6 py-4 rounded-full border border-border bg-white text-base focus:outline-none focus:border-accent focus:shadow-lg focus:shadow-accent/5 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#a8662e] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {count > 0 && (
          <p className="text-sm text-muted-light mb-4">
            {count} {count === 1 ? "company" : "companies"} tracked
          </p>
        )}

        <a
          href="/browse"
          className="inline-block text-sm font-semibold text-accent border border-accent px-5 py-2.5 rounded-full hover:bg-accent hover:text-white transition-colors"
        >
          Browse All Companies ↗
        </a>
      </div>
    </section>
  );
}
