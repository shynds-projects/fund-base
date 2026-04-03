export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-muted whitespace-nowrap">
        {title}
      </h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
