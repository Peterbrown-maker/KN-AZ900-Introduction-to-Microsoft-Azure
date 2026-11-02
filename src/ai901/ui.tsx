import { Fragment, type ReactNode, useId } from 'react';
import * as Icons from 'lucide-react';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';

type IconCmp = React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
export const iconByName = (name: string): IconCmp => (Icons as unknown as Record<string, IconCmp>)[name] ?? Icons.BookOpen;

/** Renders **bold**, *emphasis*, `code` and bare URLs inside a string. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|https?:\/\/[^\s)]+|#\/ai901\/[\w/-]+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith('**')) return <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
        if (p.startsWith('`')) return <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-200 font-mono text-[0.85em]">{p.slice(1, -1)}</code>;
        if (p.startsWith('http')) return <a key={i} href={p} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-2 break-all hover:text-cyan-200">{p}</a>;
        if (p.startsWith('#/ai901')) return <a key={i} href={p} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">{p === '#/ai901/lab' ? 'Open the Neural Network Laboratory' : p}</a>;
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

interface SimFrameProps {
  title: string;
  icon?: string;
  children: ReactNode;
  /** What this simulation demonstrates. */
  shows?: string;
  /** What it deliberately leaves out or simplifies. */
  omits?: string;
  onReset?: () => void;
  controls?: ReactNode;
}

export function SimFrame({ title, icon = 'FlaskConical', children, shows, omits, onReset, controls }: SimFrameProps) {
  const Icon = iconByName(icon);
  return (
    <section className="ai-sim relative rounded-2xl border border-white/10 bg-[#070d1f]/80 overflow-hidden" aria-label={`Interactive: ${title}`}>
      <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: 'radial-gradient(ellipse at top, color-mix(in srgb, var(--accent, #22d3ee) 14%, transparent), transparent 60%)' }} />
      <header className="relative flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8">
        <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: 'color-mix(in srgb, var(--accent, #22d3ee) 18%, transparent)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--accent, #22d3ee)' }} />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-300 flex-1 min-w-0">{title}</p>
        {controls}
        {onReset && (
          <button onClick={onReset} className="ai-btn-ghost text-xs" aria-label="Reset simulation">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </header>
      <div className="relative p-4 sm:p-5">{children}</div>
      {(shows || omits) && (
        <footer className="relative grid sm:grid-cols-2 gap-3 px-4 sm:px-5 py-3 border-t border-white/8 text-xs leading-relaxed">
          {shows && (
            <p className="flex gap-2 text-gray-400"><Eye className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" /><span><span className="text-emerald-300 font-semibold">What this shows: </span>{shows}</span></p>
          )}
          {omits && (
            <p className="flex gap-2 text-gray-400"><EyeOff className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" /><span><span className="text-amber-300 font-semibold">What it leaves out: </span>{omits}</span></p>
          )}
        </footer>
      )}
    </section>
  );
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${value === o.value ? 'text-[#050a17]' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          style={value === o.value ? { background: 'var(--accent, #22d3ee)' } : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <label htmlFor={id} className="text-gray-400">{label}</label>
        <span className="font-mono text-gray-200">{format ? format(value) : value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="ai-range w-full" />
    </div>
  );
}

export function Bar({ value, color = 'var(--accent, #22d3ee)', className = '' }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-2 rounded-full bg-white/8 overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  );
}

/** Deterministic shuffle so a quiz attempt keeps a stable order across re-renders. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
