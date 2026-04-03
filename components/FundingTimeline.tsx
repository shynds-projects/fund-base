import type { FundingRound } from "@/lib/types";

export default function FundingTimeline({ rounds }: { rounds: FundingRound[] }) {
  const sorted = [...rounds].sort((a, b) => a.sort_order - b.sort_order);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-light italic">
        No funding data available yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {sorted.map((round, i) => (
        <div key={round.id} className="flex gap-4">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-accent border-2 border-accent-light shrink-0 mt-1.5" />
            {i < sorted.length - 1 && (
              <div className="w-px flex-1 bg-border" />
            )}
          </div>

          {/* Content */}
          <div className="pb-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-[family-name:var(--font-playfair)] font-bold text-lg">
                {round.round_name}
              </span>
              {round.amount && (
                <span className="text-accent font-semibold">{round.amount}</span>
              )}
            </div>
            {round.date && (
              <p className="text-xs text-muted-light mb-1">{round.date}</p>
            )}
            {round.lead_investors.length > 0 && (
              <p className="text-sm text-muted">
                <span className="text-muted-light">Lead: </span>
                {round.lead_investors.join(", ")}
              </p>
            )}
            {round.other_investors.length > 0 && (
              <p className="text-sm text-muted">
                <span className="text-muted-light">Also: </span>
                {round.other_investors.join(", ")}
              </p>
            )}
            {round.valuation && (
              <p className="text-xs text-muted-light mt-1">
                Valuation: {round.valuation}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
