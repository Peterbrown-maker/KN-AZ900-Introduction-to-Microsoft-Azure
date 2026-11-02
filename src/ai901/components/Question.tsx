import { useMemo } from 'react';
import { ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import type { Question } from '../types';
import { Rich, shuffle } from '../ui';

export type Answer = string | string[] | Record<string, string> | undefined;

const seedOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7);

export function initialAnswer(q: Question, seed: number): Answer {
  if (q.type === 'order') {
    let items = shuffle(q.order!, seed + seedOf(q.id));
    if (items.every((x, i) => x === q.order![i])) items = [...items.slice(1), items[0]];
    return items;
  }
  if (q.type === 'multi') return [];
  if (q.type === 'match') return {};
  return undefined;
}

export function isAnswered(q: Question, a: Answer) {
  if (q.type === 'single') return typeof a === 'string';
  if (q.type === 'multi') return Array.isArray(a) && a.length > 0;
  if (q.type === 'order') return true;
  if (q.type === 'match') return !!a && Object.keys(a as object).length === q.pairs!.length;
  return false;
}

export function isCorrect(q: Question, a: Answer) {
  if (q.type === 'single') return a === q.correct![0];
  if (q.type === 'multi') { const s = new Set(a as string[]); return s.size === q.correct!.length && q.correct!.every((c) => s.has(c)); }
  if (q.type === 'order') return (a as string[]).every((x, i) => x === q.order![i]);
  if (q.type === 'match') return q.pairs!.every((p) => (a as Record<string, string>)[p.left] === p.right);
  return false;
}

interface Props {
  q: Question;
  answer: Answer;
  onChange: (a: Answer) => void;
  revealed: boolean;
  seed: number;
  index?: number;
}

/** Renders any question type. Option order is shuffled deterministically per attempt; answers are compared by id. */
export function QuestionView({ q, answer, onChange, revealed, seed, index }: Props) {
  const opts = useMemo(() => (q.options ? shuffle(q.options, seed + seedOf(q.id)) : []), [q, seed]);
  const rights = useMemo(() => (q.pairs ? shuffle([...new Set(q.pairs.map((p) => p.right))], seed + seedOf(q.id) + 3) : []), [q, seed]);
  const correct = revealed && isCorrect(q, answer);
  const typeLabel = { single: 'Choose one', multi: 'Choose all that apply', order: 'Put in order', match: 'Match the pairs' }[q.type];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {index !== undefined && <span className="text-xs font-mono text-gray-500">Q{index + 1}</span>}
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{typeLabel}</span>
      </div>
      {q.scenario && <p className="text-sm text-gray-400 mb-2 italic"><Rich text={q.scenario} /></p>}
      <p className="text-base sm:text-lg font-semibold text-white leading-relaxed mb-4"><Rich text={q.prompt} /></p>

      {(q.type === 'single' || q.type === 'multi') && (
        <div className="space-y-2" role={q.type === 'single' ? 'radiogroup' : 'group'} aria-label={q.prompt}>
          {opts.map((o) => {
            const sel = q.type === 'single' ? answer === o.id : (answer as string[] | undefined)?.includes(o.id);
            const isRight = q.correct!.includes(o.id);
            const tone = !revealed ? (sel ? 'border-[color:var(--accent)] bg-white/[0.07]' : 'border-white/10 hover:border-white/25 bg-white/[0.02]')
              : isRight ? 'border-emerald-400/60 bg-emerald-500/10' : sel ? 'border-red-400/60 bg-red-500/10' : 'border-white/5 opacity-70';
            return (
              <button key={o.id} role={q.type === 'single' ? 'radio' : 'checkbox'} aria-checked={!!sel} disabled={revealed}
                onClick={() => q.type === 'single' ? onChange(o.id) : onChange(sel ? (answer as string[]).filter((x) => x !== o.id) : [...((answer as string[]) ?? []), o.id])}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${tone}`}>
                <span className="flex items-start gap-3">
                  <span className={`mt-0.5 w-4 h-4 shrink-0 border grid place-items-center ${q.type === 'single' ? 'rounded-full' : 'rounded'} ${sel ? 'border-transparent' : 'border-white/30'}`} style={sel ? { background: 'var(--accent)' } : undefined}>
                    {sel && <Check className="w-3 h-3 text-[#050a17]" />}
                  </span>
                  <span className="flex-1 text-sm text-gray-100"><Rich text={o.text} /></span>
                  {revealed && isRight && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {revealed && sel && !isRight && <X className="w-4 h-4 text-red-400 shrink-0" />}
                </span>
                {revealed && o.why && (sel || isRight) && <span className={`block mt-1.5 ml-7 text-xs ${isRight ? 'text-emerald-200/80' : 'text-red-200/80'}`}><Rich text={o.why} /></span>}
              </button>
            );
          })}
        </div>
      )}

      {q.type === 'order' && (
        <ol className="space-y-2">
          {(answer as string[]).map((item, i, arr) => {
            const right = revealed && q.order![i] === item;
            const move = (d: number) => { const n = [...arr]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
            return (
              <li key={item} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${!revealed ? 'border-white/10 bg-white/[0.03]' : right ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-red-400/60 bg-red-500/10'}`}>
                <span className="font-mono text-xs text-gray-500 w-5">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-100">{item}</span>
                {!revealed && (
                  <span className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20" disabled={i === 0} onClick={() => move(-1)} aria-label={`Move "${item}" up`}><ArrowUp className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20" disabled={i === arr.length - 1} onClick={() => move(1)} aria-label={`Move "${item}" down`}><ArrowDown className="w-4 h-4" /></button>
                  </span>
                )}
                {revealed && !right && <span className="text-[11px] text-emerald-300">should be #{q.order!.indexOf(item) + 1}</span>}
              </li>
            );
          })}
        </ol>
      )}

      {q.type === 'match' && (
        <div className="space-y-2">
          {q.pairs!.map((p) => {
            const val = (answer as Record<string, string> | undefined)?.[p.left] ?? '';
            const right = revealed && val === p.right;
            return (
              <div key={p.left} className={`grid sm:grid-cols-[1fr_1fr] gap-2 items-center rounded-xl border px-3 py-2.5 ${!revealed ? 'border-white/10 bg-white/[0.03]' : right ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-red-400/60 bg-red-500/10'}`}>
                <span className="text-sm text-gray-100">{p.left}</span>
                <div>
                  <select aria-label={`Match for ${p.left}`} value={val} disabled={revealed} onChange={(e) => onChange({ ...((answer as Record<string, string>) ?? {}), [p.left]: e.target.value })}
                    className="w-full rounded-lg bg-black/40 border border-white/15 px-2 py-2 text-sm text-gray-100">
                    <option value="" disabled>Choose…</option>
                    {rights.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {revealed && !right && <p className="text-[11px] text-emerald-300 mt-1">Correct: {p.right}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {revealed && (
        <div className={`mt-4 rounded-xl p-4 border ${correct ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
          <p className={`font-semibold text-sm ${correct ? 'text-emerald-300' : 'text-red-300'}`}>{correct ? 'Correct' : 'Not quite'}</p>
          {q.explanation && <p className="text-sm text-gray-200 mt-1"><Rich text={q.explanation} /></p>}
        </div>
      )}
    </div>
  );
}
