import type { TeamPattern } from "@/lib/types";

const ICONS: Record<string, string> = {
  school: "🎓",
  employer: "🏢",
  geography: "📍",
  other: "✦",
};

export default function TeamPatterns({ patterns }: { patterns: TeamPattern[] }) {
  if (patterns.length === 0) return null;

  return (
    <div className="space-y-2">
      {patterns.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3"
        >
          <span className="text-lg">{ICONS[p.pattern_type] || "✦"}</span>
          <p className="text-sm text-muted">{p.pattern_value}</p>
        </div>
      ))}
    </div>
  );
}
