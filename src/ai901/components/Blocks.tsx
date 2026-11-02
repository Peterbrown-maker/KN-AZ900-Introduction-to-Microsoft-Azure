import { Lightbulb, Info, AlertTriangle, Target, CandlestickChart, BadgeCheck, PencilLine } from 'lucide-react';
import type { Block, CalloutTone } from '../types';
import { Rich } from '../ui';
import { Sim } from '../sims';

const TONES: Record<CalloutTone, { icon: typeof Info; label: string; cls: string }> = {
  tip: { icon: Lightbulb, label: 'Tip', cls: 'border-emerald-400/30 bg-emerald-500/[0.07] text-emerald-200' },
  note: { icon: Info, label: 'Note', cls: 'border-sky-400/30 bg-sky-500/[0.07] text-sky-200' },
  warn: { icon: AlertTriangle, label: 'Watch out', cls: 'border-amber-400/30 bg-amber-500/[0.07] text-amber-200' },
  trap: { icon: Target, label: 'Exam trap', cls: 'border-red-400/30 bg-red-500/[0.07] text-red-200' },
  forex: { icon: CandlestickChart, label: 'Forex project example', cls: 'border-violet-400/30 bg-violet-500/[0.07] text-violet-200' },
  verify: { icon: BadgeCheck, label: 'Verified source', cls: 'border-cyan-400/30 bg-cyan-500/[0.07] text-cyan-200' },
  correction: { icon: PencilLine, label: 'Correction to the notes', cls: 'border-fuchsia-400/30 bg-fuchsia-500/[0.07] text-fuchsia-200' },
};

export function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case 'h':
      return <h3 className="text-xl sm:text-2xl font-bold text-white pt-4 scroll-mt-24">{b.text}</h3>;
    case 'p':
      return <p className="text-[15px] sm:text-base text-gray-300 leading-[1.8]"><Rich text={b.text} /></p>;
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul';
      return (
        <L className={`space-y-2 text-[15px] text-gray-300 leading-relaxed ${b.ordered ? 'list-decimal pl-6' : ''}`}>
          {b.items.map((it, i) => (
            <li key={i} className={b.ordered ? 'pl-1' : 'flex gap-3'}>
              {!b.ordered && <span className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
              <span><Rich text={it} /></span>
            </li>
          ))}
        </L>
      );
    }
    case 'table':
      return (
        <figure className="space-y-2">
          {b.caption && <figcaption className="text-xs text-gray-500">{b.caption}</figcaption>}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04]"><tr>{b.headers.map((h, i) => <th key={i} className="text-left font-semibold text-gray-200 px-4 py-2.5 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-white/5 align-top">{r.map((c, j) => <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'text-gray-100 font-medium' : 'text-gray-300'}`}><Rich text={c} /></td>)}</tr>)}</tbody>
            </table>
          </div>
        </figure>
      );
    case 'callout': {
      const t = TONES[b.tone];
      return (
        <aside className={`rounded-xl border p-4 ${t.cls}`}>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5"><t.icon className="w-4 h-4" /> {b.title ?? t.label}</p>
          <p className="text-sm text-gray-200 leading-relaxed"><Rich text={b.text} /></p>
        </aside>
      );
    }
    case 'sim':
      return (
        <figure className="space-y-2 ai-noprint">
          <Sim id={b.id} />
          {b.caption && <figcaption className="text-xs text-gray-500 text-center">{b.caption}</figcaption>}
        </figure>
      );
    case 'code':
      return (
        <figure className="space-y-1.5">
          {b.caption && <figcaption className="text-xs text-gray-500">{b.caption}</figcaption>}
          <pre className="rounded-xl bg-black/50 border border-white/10 p-4 overflow-x-auto text-[12.5px] leading-relaxed font-mono text-gray-200"><code>{b.code}</code></pre>
        </figure>
      );
    case 'steps':
      return (
        <ol className="relative space-y-3 pl-2">
          {b.items.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-sm font-bold text-[#050a17]" style={{ background: 'var(--accent)' }}>{i + 1}</span>
              <div className="pt-1"><p className="font-semibold text-white">{s.title}</p><p className="text-sm text-gray-300 leading-relaxed"><Rich text={s.text} /></p></div>
            </li>
          ))}
        </ol>
      );
    case 'formula':
      return (
        <figure className="rounded-xl bg-black/40 border border-white/10 px-5 py-4 text-center">
          <p className="font-mono text-base sm:text-lg text-white overflow-x-auto">{b.text}</p>
          {b.caption && <figcaption className="text-xs text-gray-500 mt-1">{b.caption}</figcaption>}
        </figure>
      );
  }
}
