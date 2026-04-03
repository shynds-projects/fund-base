"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

type SortKey = "name" | "industry" | "hq_location" | "latest_round" | "estimated_arr" | "founder_names" | "top_clients";
type SortDir = "asc" | "desc";

const ROUND_ORDER: Record<string, number> = {
  "pre-seed": 0, "seed": 1, "series a": 2, "series b": 3, "series c": 4,
  "series d": 5, "series e": 6, "series f": 7, "series g": 8, "ipo": 9,
};

function TypeaheadFilter({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setInputVal(value), [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(inputVal.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-light mb-2">
        {label}
      </label>
      <input
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange("");
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#f8f9fc] text-sm focus:outline-none focus:border-accent transition-colors"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          <button
            className="w-full text-left px-4 py-2 text-sm text-muted-light hover:bg-accent-light transition-colors"
            onClick={() => { onChange(""); setInputVal(""); setOpen(false); }}
          >
            All
          </button>
          {filtered.map((opt) => (
            <button
              key={opt}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent-light transition-colors"
              onClick={() => { onChange(opt); setInputVal(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  const [data, setData] = useState<BrowseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    const sorted = [...data.results].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortKey === "latest_round") {
        aVal = ROUND_ORDER[(a.latest_round || "").toLowerCase()] ?? -1;
        bVal = ROUND_ORDER[(b.latest_round || "").toLowerCase()] ?? -1;
      } else if (sortKey === "top_clients") {
        aVal = (a.top_clients || []).join(", ").toLowerCase();
        bVal = (b.top_clients || []).join(", ").toLowerCase();
      } else {
        aVal = ((a[sortKey] as string) || "").toLowerCase();
        bVal = ((b[sortKey] as string) || "").toLowerCase();
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data?.results, sortKey, sortDir]);

  const hasFilters = search || industry || stage || location;

  const SortHeader = ({ label, column }: { label: string; column: SortKey }) => (
    <th
      className="text-left px-4 py-3 font-semibold text-muted-light uppercase tracking-wider text-xs cursor-pointer hover:text-accent transition-colors select-none"
      onClick={() => handleSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === column ? (
          <span className="text-accent">{sortDir === "asc" ? "↑" : "↓"}</span>
        ) : (
          <span className="opacity-30">↕</span>
        )}
      </span>
    </th>
  );

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
            <TypeaheadFilter
              label="Industry"
              value={industry}
              onChange={setIndustry}
              options={data?.filters.industries || []}
              placeholder="Type to filter..."
            />
            <TypeaheadFilter
              label="Funding Stage"
              value={stage}
              onChange={setStage}
              options={data?.filters.stages || []}
              placeholder="Type to filter..."
            />
            <TypeaheadFilter
              label="Location"
              value={location}
              onChange={setLocation}
              options={data?.filters.locations || []}
              placeholder="Type to filter..."
            />
          </div>

          {hasFilters && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-muted">
                {sortedResults.length} results
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

        {!loading && sortedResults.length > 0 && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#f8f9fc]">
                    <SortHeader label="Company" column="name" />
                    <SortHeader label="Industry" column="industry" />
                    <SortHeader label="HQ" column="hq_location" />
                    <SortHeader label="Latest Round" column="latest_round" />
                    <SortHeader label="Est. ARR" column="estimated_arr" />
                    <SortHeader label="Founders" column="founder_names" />
                    <SortHeader label="Top Clients" column="top_clients" />
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((company, i) => (
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

        {!loading && sortedResults.length === 0 && !loading && (
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
