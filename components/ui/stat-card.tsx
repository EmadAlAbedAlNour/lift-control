interface StatCardProps {
  label: string;
  value: string;
  trend: string;
}

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <p className="mb-4 text-sm font-medium text-subtext">{label}</p>
      <p className="mb-4 text-3xl font-bold tracking-tight text-ink">{value}</p>
      <p className="text-sm font-medium text-primary">{trend}</p>
    </article>
  );
}
