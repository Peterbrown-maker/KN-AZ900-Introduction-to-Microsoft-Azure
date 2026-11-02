import type { ReactNode } from 'react';
import type { SourceTag } from '../types';

const SRC: Record<SourceTag, { label: string; cls: string; title: string }> = {
  notes: { label: 'Course notes', cls: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30', title: 'Based on your supplied AI-901 notes' },
  official: { label: 'Verified MS Learn', cls: 'bg-blue-500/15 text-blue-200 border-blue-400/30', title: 'Verified against current Microsoft Learn content (Oct 2026)' },
  supplemental: { label: 'Supplemental', cls: 'bg-amber-500/15 text-amber-200 border-amber-400/30', title: 'Added material not present in the supplied notes' },
};

export function SourceBadges({ sources }: { sources: SourceTag[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {sources.map((s) => <span key={s} title={SRC[s].title} className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${SRC[s].cls}`}>{SRC[s].label}</span>)}
    </span>
  );
}

export function Ring({ value, size = 64, stroke = 6, color = 'var(--accent)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--accent)' }}>{eyebrow}</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
      {children && <div className="text-gray-400 mt-3 max-w-2xl leading-relaxed">{children}</div>}
    </header>
  );
}
