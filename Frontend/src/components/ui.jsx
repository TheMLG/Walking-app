import { CheckCircle2, Loader2 } from 'lucide-react';

export function Button({ className = '', variant = 'primary', ...props }) {
  const styles =
    variant === 'ghost'
      ? 'bg-transparent border border-line text-white hover:bg-white/5'
      : 'bg-accent text-black hover:brightness-110 shadow-glow';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', ...props }) {
  return <div className={`rounded-3xl border border-line bg-panel/90 p-5 shadow-glow ${className}`} {...props} />;
}

export function Input(props) {
  return (
    <input
      className="w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
      {...props}
    />
  );
}

export function Label({ children }) {
  return <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{children}</label>;
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
      rows={props.rows || 3}
      {...props}
    />
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed right-4 top-4 z-50 rounded-2xl border border-line bg-panel px-4 py-3 text-sm shadow-glow">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-accent" />
        <span>{toast}</span>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-white/60">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>
  );
}
