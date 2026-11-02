import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useLab } from './store';
import { fmt, layerNeurons, type OpKind } from './engine';

export function Explorer() {
  const { s, d, net, fwd, sel, revealed } = useLab();
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sel) return;
    const el = ref.current?.querySelector<HTMLElement>(`[data-obj="${CSS.escape(sel.id)}"]`);
    const box = el?.closest<HTMLElement>('[data-scroll]');
    // Scroll only the list itself, never the page.
    if (el && box) box.scrollTop = el.offsetTop - box.offsetTop - box.clientHeight / 2;
  }, [sel]);
  const ql = q.toLowerCase();
  const conns = net.connections.filter((c) => !ql || c.id.toLowerCase().includes(ql));
  const isSel = (id: string) => sel?.id === id;
  return (
    <div ref={ref} className="space-y-3">
      <label className="relative block"><span className="sr-only">Search neurons and connections</span>
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. hidden-2 or input-1__" className="w-full rounded-lg bg-black/40 border border-white/10 pl-8 pr-2 py-1.5 text-sm" />
      </label>
      <div>
        <p className="nn-h mb-1">Neurons</p>
        {net.sizes.map((_, l) => {
          const ns = layerNeurons(net, l).filter((n) => !ql || n.id.includes(ql) || n.label.toLowerCase().includes(ql));
          if (!ns.length) return null;
          return (
            <div key={l} className="mb-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{net.layerNames[l]}</p>
              {ns.map((n) => (
                <button key={n.id} data-obj={n.id} onClick={() => d({ t: 'select', sel: { type: 'neuron', id: n.id } })} aria-pressed={isSel(n.id)}
                  className={`w-full flex justify-between text-xs font-mono px-2 py-1 rounded ${isSel(n.id) ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                  <span>{n.id}</span><span className="text-gray-400">{n.kind === 'input' ? fmt(s.inputs[s.mode][n.index]) : revealed(n.id) ? fmt(fwd.values[n.id].a) : '—'}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div>
        <p className="nn-h mb-1">Connections ({conns.length})</p>
        <div data-scroll className="relative max-h-64 overflow-y-auto pr-1">
          {conns.map((c) => (
            <button key={c.id} data-obj={c.id} onClick={() => d({ t: 'select', sel: { type: 'connection', id: c.id } })} aria-pressed={isSel(c.id)}
              className={`w-full grid grid-cols-[1fr_auto] gap-2 text-[11px] font-mono px-2 py-1 rounded text-left ${isSel(c.id) ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
              <span className="truncate">{c.from} → {c.to}</span><span className={c.weight < 0 ? 'text-amber-300' : 'text-cyan-200'}>{c.weight >= 0 ? '+' : ''}{fmt(c.weight)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const KINDS: { k: OpKind | 'all'; label: string }[] = [
  { k: 'all', label: 'All' }, { k: 'input', label: 'Inputs' }, { k: 'multiply', label: 'Multiply' }, { k: 'sum', label: 'Sum' }, { k: 'bias', label: 'Bias' },
  { k: 'activation', label: 'Activation' }, { k: 'loss', label: 'Loss' }, { k: 'gradient', label: 'Gradient' }, { k: 'update', label: 'Update / edit' },
];

export function CalcLog() {
  const { s, d, fwd, sel, currentOp } = useLab();
  const [kind, setKind] = useState<OpKind | 'all'>('all');
  const list = useMemo(() => s.history.filter((h) => h.mode === s.mode && (kind === 'all' || h.kind === kind || (kind === 'activation' && h.kind === 'output'))), [s.history, s.mode, kind]);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [list.length]);
  const latestRun = [...s.history].reverse().find((h) => h.mode === s.mode && h.group.startsWith('Forward'))?.group;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {KINDS.map((x) => <button key={x.k} onClick={() => setKind(x.k)} className={`text-[11px] px-2 py-0.5 rounded-full ${kind === x.k ? 'bg-cyan-400 text-[#050a17]' : 'bg-white/5 text-gray-400'}`}>{x.label}</button>)}
        <span className="flex-1" />
        <button className="ai-btn-ghost text-[11px] !px-2 !py-0.5" onClick={() => d({ t: 'clearHistory' })} title="Clears this log only. Model parameters are not changed."><Trash2 className="w-3 h-3" /> Clear log (keeps model)</button>
      </div>
      <div ref={boxRef} className="max-h-60 overflow-y-auto rounded-lg bg-black/40 border border-white/5 font-mono text-[11px]" role="log" aria-label="Calculation log">
        {list.length === 0 && <p className="p-3 text-gray-500 font-sans text-xs">No operations yet. Press <b>Run input</b> to record a forward pass.</p>}
        {list.map((h, i) => {
          const prev = list[i - 1];
          const isCurrent = currentOp && h.group === latestRun && h.seq === currentOp.seq;
          const selected = sel?.id === h.target.id;
          return (
            <div key={h.uid}>
              {(!prev || prev.group !== h.group) && <p className="px-2 pt-2 pb-0.5 text-[10px] uppercase tracking-wider text-gray-500 font-sans">{h.group}</p>}
              <button onClick={() => { d({ t: 'select', sel: h.target }); if (h.group === latestRun && h.seq <= fwd.ops.length) d({ t: 'seek', index: h.seq }); }}
                className={`w-full text-left grid grid-cols-[2.2rem_5.2rem_1fr] gap-2 px-2 py-0.5 hover:bg-white/5 ${isCurrent ? 'bg-cyan-500/25' : selected ? 'bg-white/[0.07]' : ''}`}>
                <span className="text-gray-600">#{h.seq || '·'}</span>
                <span className={{ multiply: 'text-cyan-300', loss: 'text-red-300', gradient: 'text-violet-300', update: 'text-amber-300' }[h.kind as string] ?? 'text-gray-400'}>{h.kind}</span>
                <span className="text-gray-200 truncate" title={h.text}>{h.target.type === 'connection' ? '' : `${h.target.id}: `}{h.text}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
