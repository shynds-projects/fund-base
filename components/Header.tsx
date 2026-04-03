"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl font-bold text-accent whitespace-nowrap"
        >
          fund.base
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a startup..."
            className="w-full px-4 py-2 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </form>

        <nav className="flex gap-6 text-sm font-semibold text-muted uppercase tracking-wide">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
