import Link from "next/link";
import type { Company } from "@/lib/types";

export default function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/company/${company.slug}`}
      className="block bg-white border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-accent/30 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-[#818cf8] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent-light px-2.5 py-1 rounded-full">
          {company.industry || "Startup"}
        </span>
        <span className="text-muted-light group-hover:text-accent transition-colors">
          ↗
        </span>
      </div>

      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
        {company.name}
      </h3>

      <p className="text-sm text-muted leading-relaxed line-clamp-2">
        {company.description || "AI-powered company profile"}
      </p>

      {company.hq_location && (
        <p className="text-xs text-muted-light mt-3">{company.hq_location}</p>
      )}
    </Link>
  );
}
