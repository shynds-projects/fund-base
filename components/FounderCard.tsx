import type { Founder } from "@/lib/types";

export default function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-[family-name:var(--font-playfair)] font-bold text-lg">
            {founder.name}
          </h4>
          {founder.title && (
            <p className="text-sm text-accent font-medium">{founder.title}</p>
          )}
        </div>
        {founder.linkedin_url && (
          <a
            href={founder.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-light hover:text-accent transition-colors"
          >
            LinkedIn ↗
          </a>
        )}
      </div>

      {founder.bio && (
        <p className="text-sm text-muted leading-relaxed mb-3">{founder.bio}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {founder.college && (
          <span className="text-xs bg-accent-light text-accent px-2.5 py-1 rounded-full">
            🎓 {founder.college}
          </span>
        )}
        {founder.mba && (
          <span className="text-xs bg-accent-light text-accent px-2.5 py-1 rounded-full">
            📚 {founder.mba}
          </span>
        )}
        {founder.previous_companies.map((co) => (
          <span
            key={co}
            className="text-xs bg-[#f0ebe4] text-muted px-2.5 py-1 rounded-full"
          >
            {co}
          </span>
        ))}
      </div>
    </div>
  );
}
