import { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X, Play, Zap, ArrowRight, Pencil, GraduationCap, Sparkles } from 'lucide-react';
import { useLab } from './store';
import { ACTIVATIONS, fmt, getConnection, getNeuron, incoming, outgoing, type Activation, type ParamOrigin } from './engine';

export function Origin({ o }: { o: ParamOrigin }) {
  const m = { initial: ['Initial', 'bg-white/10 text-gray-300', Sparkles], edited: ['Manually edited', 'bg-amber-500/20 text-amber-200', Pencil], trained: ['Learned by training', 'bg-violet-500/25 text-violet-200', GraduationCap] } as const;
  const [label, cls, Icon] = m[o];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}><Icon className="w-3 h-3" />{label}</span>;
}

export function NumberField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const id = useId();
  // A local draft exists only while the user is typing; otherwise the field shows the model's value.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? fmt(value, 4);
  const setText = (t: string) => setDraft(t);
  return (
    <div>
      <label htmlFor={id} className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={Math.max(min, Math.min(max, value))} onChange={(e) => onChange(Number(e.target.value))} className="ai-range flex-1" />
        <input id={id} type="number" step={step} value={text} onBlur={() => setDraft(null)} onChange={(e) => { setText(e.target.value); const v = Number(e.target.value); if (e.target.value !== '' && Number.isFinite(v)) onChange(v); }}
          className="w-24 rounded-lg bg-black/50 border border-white/15 px-2 py-1 text-sm font-mono text-gray-100" />
      </div>
    </div>
  );
}

export function ActivationGraph({ act, z }: { act: Activation; z?: number }) {
  const f = ACTIVATIONS[act].f;
  const xs = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1);
  const lo = act === 'tanh' ? -1.2 : -0.2, hi = act === 'relu' ? 4 : 1.2;
  const sx = (x: number) => 10 + ((x + 4) / 8) * 180, sy = (y: number) => 80 - ((Math.min(hi, y) - lo) / (hi - lo)) * 70;
  const pts = xs.map((x) => `${sx(x)},${sy(f(x))}`).join(' ');
  return (
    <svg viewBox="0 0 200 90" className="w-full max-w-[240px]" role="img" aria-label={`${ACTIVATIONS[act].label} graph${z !== undefined ? `, current z ${fmt(z)}` : ''}`}>
      <line x1={10} x2={190} y1={sy(0)} y2={sy(0)} stroke="#334155" /><line x1={sx(0)} x2={sx(0)} y1={8} y2={82} stroke="#334155" />
      <polyline points={pts} fill="none" stroke="#22d3ee" strokeWidth={2} />
      {z !== undefined && Math.abs(z) <= 4 && <circle cx={sx(z)} cy={sy(f(z))} r={4} fill="#f59e0b" />}
      {z !== undefined && Math.abs(z) > 4 && <text x={z > 0 ? 186 : 14} y={14} fontSize={9} fill="#f59e0b" textAnchor={z > 0 ? 'end' : 'start'}>z = {fmt(z, 2)} {z > 0 ? '→' : '←'}</text>}
      <text x={192} y={sy(0) - 3} fontSize={8} fill="#64748b" textAnchor="end">z</text>
    </svg>
  );
}

const STAGES = ['Inputs', 'Multiplication', 'Summation', 'Bias', 'Activation', 'Output'];

export function Inspector() {
  const { sel, d, s } = useLab();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') d({ t: 'clear' }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [d]);
  if (!sel) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {s.selection.length > 1 && <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'back' })}><ArrowLeft className="w-3.5 h-3.5" /> Back</button>}
        <span className="flex-1" />
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'clear' })} aria-label="Close inspector (Escape)"><X className="w-3.5 h-3.5" /> Overview</button>
      </div>
      {sel.type === 'neuron' ? <NeuronInspector id={sel.id} key={sel.id} /> : <ConnectionInspector id={sel.id} key={sel.id} />}
    </div>
  );
}

function NeuronInspector({ id }: { id: string }) {
  const { s, d, net, fwd, revealed } = useLab();
  const reduce = useReducedMotion();
  const n = getNeuron(net, id);
  const [stage, setStage] = useState(STAGES.length);
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    if (!anim) return;
    if (stage >= STAGES.length) { setAnim(false); return; }
    const t = setTimeout(() => setStage((x) => x + 1), reduce ? 0 : 750);
    return () => clearTimeout(t);
  }, [anim, stage, reduce]);
  if (!n) return <p className="text-sm text-gray-400">This neuron does not exist in the current network.</p>;
  const v = fwd.values[id];
  const shown = revealed(id);
  const ins = incoming(net, id), outs = outgoing(net, id);
  const back = s.mode === 'full' ? s.training.last?.back : undefined;
  const layerCount = net.sizes[n.layer];
  const sel = (type: 'neuron' | 'connection', x: string) => d({ t: 'select', sel: { type, id: x } });
  const NotYet = () => <span className="text-gray-500 italic">Not calculated yet</span>;

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <header>
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{n.kind === 'input' ? 'Input feature' : 'Computational neuron'}</p>
        <h3 className="text-xl font-bold text-white font-mono">{n.id}</h3>
        <p className="text-xs text-gray-400">{net.layerNames[n.layer]} layer · position {n.index + 1} of {layerCount}{n.kind === 'input' ? ` · “${n.label}”` : ''}</p>
      </header>

      {n.kind === 'input' ? (
        <section className="nn-card space-y-3">
          <p className="text-sm text-gray-300">An input node is <b className="text-white">not</b> a calculating neuron. It simply holds a number from the data — here the answer to the developer-defined feature <i>“{n.label}”</i> — and passes it to every neuron in the next layer.</p>
          <NumberField label="Input value" value={s.inputs[s.mode][n.index]} min={-2} max={2} step={0.1} onChange={(value) => d({ t: 'input', index: n.index, value })} />
          <p className="text-xs text-gray-500">Output = input value = <span className="font-mono text-gray-200">{fmt(s.inputs[s.mode][n.index])}</span></p>
        </section>
      ) : (
        <>
          <section className="nn-card">
            <div className="flex items-center justify-between mb-2">
              <p className="nn-h">Calculation</p>
              <button className="ai-btn-ghost text-xs" disabled={!shown} onClick={() => { setStage(0); setAnim(true); }}><Play className="w-3.5 h-3.5" /> Animate</button>
            </div>
            <ol className="flex flex-wrap gap-1 mb-3 text-[10px]">{STAGES.map((st, i) => <li key={st} className={`px-1.5 py-0.5 rounded ${i < stage && shown ? 'bg-cyan-500/25 text-cyan-100' : 'bg-white/5 text-gray-500'}`}>{i + 1}. {st}</li>)}</ol>
            {!shown ? (
              <div className="text-sm text-gray-400 space-y-2"><p><NotYet /> — run a forward pass to compute this neuron.</p><button className="ai-btn text-xs" onClick={() => d({ t: 'run' })}><Zap className="w-3.5 h-3.5" /> Run input</button></div>
            ) : (
              <div className="font-mono text-xs space-y-1.5">
                {stage >= 1 && v.terms.map((t) => (
                  <motion.button key={t.connectionId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => sel('connection', t.connectionId)} className="w-full text-left flex justify-between gap-2 rounded px-2 py-1 bg-white/[0.03] hover:bg-white/10">
                    <span className="text-gray-400 truncate">{t.from}</span>
                    <span className="text-gray-200">{fmt(t.source)}{stage >= 2 ? <> × <span className={t.weight < 0 ? 'text-amber-300' : 'text-cyan-300'}>{fmt(t.weight)}</span> = <b className="text-white">{fmt(t.product)}</b></> : ''}</span>
                  </motion.button>
                ))}
                {stage >= 3 && <p className="px-2 pt-1 text-gray-200">Σ wᵢxᵢ = {v.terms.map((t) => fmt(t.product)).join(' + ')} = <b className="text-white">{fmt(v.sum)}</b></p>}
                {stage >= 4 && <p className="px-2 text-gray-200">z = {fmt(v.sum)} + ({fmt(v.bias)}) = <b className="text-white">{fmt(v.z)}</b></p>}
                {stage >= 5 && <p className="px-2 text-gray-200">{ACTIVATIONS[n.activation].label}({fmt(v.z)}) = <b className="text-white">{fmt(v.a, 4)}</b></p>}
                {stage >= 6 && <p className="px-2 pt-1 text-sm text-emerald-300 font-sans">Output: <b className="font-mono">{fmt(v.a, 4)}</b>{s.mode === 'simple' ? ` → ${v.a > 0.5 ? 'YES' : 'NO'}` : ''}</p>}
              </div>
            )}
          </section>

          <section className="nn-card space-y-3">
            <div className="flex items-center justify-between"><p className="nn-h">Bias</p><Origin o={n.biasOrigin} /></div>
            <NumberField label="b" value={n.bias} min={s.mode === 'simple' ? -20 : -4} max={s.mode === 'simple' ? 20 : 4} step={s.mode === 'simple' ? 1 : 0.05} onChange={(value) => d({ t: 'bias', id, value })} />
            <p className="text-xs text-gray-500">The bias shifts z up or down before the activation. A negative bias makes the neuron harder to “switch on”.</p>
          </section>

          <section className="nn-card space-y-2">
            <div className="flex items-center justify-between"><p className="nn-h">Activation function</p><Origin o={n.activationOrigin} /></div>
            <div role="radiogroup" aria-label="Activation function" className="flex flex-wrap gap-1">
              {(Object.keys(ACTIVATIONS) as Activation[]).map((a) => (
                <button key={a} role="radio" aria-checked={n.activation === a} onClick={() => d({ t: 'activation', id, value: a })} className={`px-2.5 py-1 rounded-lg text-xs ${n.activation === a ? 'bg-cyan-400 text-[#050a17] font-semibold' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{ACTIVATIONS[a].label}</button>
              ))}
            </div>
            <p className="font-mono text-sm text-white">{ACTIVATIONS[n.activation].formula}</p>
            <ActivationGraph act={n.activation} z={shown ? v.z : undefined} />
            <p className="text-xs text-gray-400">Output range {ACTIVATIONS[n.activation].range}. {ACTIVATIONS[n.activation].note}</p>
          </section>
        </>
      )}

      {ins.length > 0 && (
        <section className="nn-card">
          <p className="nn-h mb-2">Incoming signals ({ins.length})</p>
          <table className="w-full text-xs font-mono"><thead><tr className="text-gray-500 text-left font-sans"><th className="pb-1">From</th><th>Output</th><th>Weight</th><th className="text-right">Product</th></tr></thead>
            <tbody>{ins.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="py-1"><button className="text-cyan-300 hover:underline" onClick={() => sel('neuron', c.from)}>{c.from}</button></td>
                <td>{revealed(c.from) ? fmt(fwd.values[c.from].a) : <span className="text-gray-600">—</span>}</td>
                <td><button className={c.weight < 0 ? 'text-amber-300 hover:underline' : 'text-cyan-200 hover:underline'} onClick={() => sel('connection', c.id)}>{fmt(c.weight)}</button></td>
                <td className="text-right">{revealed(c.from) ? fmt(fwd.values[c.from].a * c.weight) : '—'}</td>
              </tr>
            ))}</tbody></table>
        </section>
      )}
      {outs.length > 0 && (
        <section className="nn-card">
          <p className="nn-h mb-2">Outgoing signals ({outs.length})</p>
          <table className="w-full text-xs font-mono"><thead><tr className="text-gray-500 text-left font-sans"><th className="pb-1">To</th><th>Weight</th><th className="text-right">Contribution (a × w)</th></tr></thead>
            <tbody>{outs.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="py-1"><button className="text-cyan-300 hover:underline" onClick={() => sel('neuron', c.to)}>{c.to}</button></td>
                <td><button className={c.weight < 0 ? 'text-amber-300 hover:underline' : 'text-cyan-200 hover:underline'} onClick={() => sel('connection', c.id)}>{fmt(c.weight)}</button></td>
                <td className="text-right">{revealed(id) ? fmt(fwd.values[id].a * c.weight) : <span className="text-gray-600 font-sans italic">not calculated</span>}</td>
              </tr>
            ))}</tbody></table>
        </section>
      )}
      {n.kind !== 'input' && (
        <section className="nn-card text-xs space-y-1">
          <p className="nn-h mb-1">Training information</p>
          {s.mode === 'simple' ? <p className="text-gray-400">The apple neuron uses hand-chosen weights and a step activation. Its weights were <b className="text-gray-200">not learned</b> — the step function has zero gradient, so gradient descent could not train it. See Training mode for the trainable network.</p> : back ? <>
            <p className="text-gray-300">δ = ∂L/∂z: <span className="font-mono text-violet-200">{fmt(back.deltas[id] ?? 0, 5)}</span></p>
            <p className="text-gray-300">∂L/∂b: <span className="font-mono text-violet-200">{fmt(back.gradB[id] ?? 0, 5)}</span> <span className="text-gray-500">(from training step {s.training.steps})</span></p>
            {(s.training.paramLog[id] ?? []).slice(-4).reverse().map((h) => <p key={h.step} className="font-mono text-gray-400">step {h.step}: b {fmt(h.before, 4)} → {fmt(h.after, 4)}</p>)}
            {n.activation === 'step' && <p className="text-amber-300">Step activation: its derivative is 0, so no gradient flows through this neuron.</p>}
          </> : <p className="text-gray-500">No training step has run yet. Gradients appear here after a step in Training mode.</p>}
        </section>
      )}
    </motion.div>
  );
}

function ConnectionInspector({ id }: { id: string }) {
  const { s, d, net, fwd, revealed } = useLab();
  const c = getConnection(net, id);
  if (!c) return <p className="text-sm text-gray-400">This connection does not exist in the current network.</p>;
  const to = getNeuron(net, c.to)!;
  const srcShown = revealed(c.from), dstShown = revealed(c.to);
  const srcOut = fwd.values[c.from].a;
  const product = srcOut * c.weight;
  const dv = fwd.values[c.to];
  const back = s.mode === 'full' ? s.training.last?.back : undefined;
  const range = s.mode === 'simple' ? 15 : 4;
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <header>
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Weighted connection</p>
        <h3 className="text-base font-bold text-white font-mono break-all">{c.id}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'select', sel: { type: 'neuron', id: c.from } })}>Source: {c.from}</button>
          <ArrowRight className="w-4 h-4 self-center text-gray-500" />
          <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'select', sel: { type: 'neuron', id: c.to } })}>Destination: {c.to}</button>
        </div>
      </header>
      <section className="nn-card space-y-3">
        <div className="flex items-center justify-between"><p className="nn-h">Weight</p><Origin o={c.origin} /></div>
        <NumberField label="w" value={c.weight} min={-range} max={range} step={s.mode === 'simple' ? 0.5 : 0.01} onChange={(value) => d({ t: 'weight', id, value })} />
        <button className="ai-btn text-xs" onClick={() => d({ t: 'trace', id })}><Zap className="w-3.5 h-3.5" /> Trace signal along this connection</button>
      </section>
      <section className="nn-card font-mono text-xs space-y-1.5">
        <p className="nn-h font-sans mb-1">Contribution</p>
        {srcShown ? <>
          <p>Source output a = <b className="text-white">{fmt(srcOut, 4)}</b></p>
          <p>Contribution = {fmt(srcOut, 4)} × ({fmt(c.weight, 4)}) = <b className={product < 0 ? 'text-amber-300' : 'text-cyan-200'}>{fmt(product, 4)}</b></p>
        </> : <p className="font-sans text-gray-500 italic">Not calculated yet — run a forward pass.</p>}
        <p className="font-sans text-gray-400 pt-1">
          {srcShown && srcOut === 0 ? 'The source output is 0, so this connection contributes 0 whatever its weight.'
            : c.weight < 0 ? 'A negative weight turns a positive source output into a negative contribution, pushing the receiving neuron toward “off”. That can be just as useful as a positive weight.'
              : 'A positive weight passes a positive source output on as a positive contribution.'}
          {' '}Whether a connection matters depends on the source output and the rest of the network, not on the weight alone.
        </p>
      </section>
      <section className="nn-card text-xs space-y-1">
        <p className="nn-h mb-1">Receiving neuron {c.to}</p>
        {dstShown ? <div className="font-mono space-y-1">
          <p>Σ of all {incoming(net, c.to).length} contributions = {fmt(dv.sum, 4)}</p>
          <p>Bias = {fmt(to.bias, 4)} → z = {fmt(dv.z, 4)}</p>
          <p>{ACTIVATIONS[to.activation].label}(z) = <b className="text-white">{fmt(dv.a, 4)}</b></p>
        </div> : <p className="text-gray-500 italic">Not calculated yet.</p>}
        <p className="text-gray-500">Activation: {ACTIVATIONS[to.activation].formula} · bias <span className="font-mono">{fmt(to.bias, 3)}</span></p>
      </section>
      <section className="nn-card text-xs space-y-1">
        <p className="nn-h mb-1">Training information</p>
        {back ? <>
          <p>∂L/∂w = a({c.from}) × δ({c.to}) = <span className="font-mono text-violet-200">{fmt(fwd.values[c.from] ? s.training.last!.before.values[c.from].a : 0, 4)} × {fmt(back.deltas[c.to] ?? 0, 5)} = {fmt(back.gradW[id] ?? 0, 5)}</span></p>
          {(s.training.paramLog[id] ?? []).slice(-4).reverse().map((h) => <p key={h.step} className="font-mono text-gray-400">step {h.step}: w {fmt(h.before, 4)} → {fmt(h.after, 4)}</p>)}
        </> : <p className="text-gray-500">{s.mode === 'simple' ? 'Hand-set teaching weight — not learned.' : 'No training step yet.'}</p>}
      </section>
    </motion.div>
  );
}
