export default function OurRead({ content }: { content: string | null }) {
  if (!content) return null;

  return (
    <div className="bg-white border border-accent/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-[#818cf8]" />
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📝</span>
        <h4 className="font-[family-name:var(--font-playfair)] font-bold text-lg">
          Our Read
        </h4>
      </div>
      <div className="text-sm text-muted leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
