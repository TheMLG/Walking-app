import { Card } from './ui';

export function StatCard({ label, value, hint }) {
  return (
    <Card className="min-w-0">
      <div className="text-xs uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-accent">{value}</div>
      {hint ? <div className="mt-2 text-sm text-white/55">{hint}</div> : null}
    </Card>
  );
}
