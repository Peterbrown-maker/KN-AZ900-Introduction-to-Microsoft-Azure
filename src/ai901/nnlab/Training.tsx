import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, StepForward, Eraser, Waves, AlertTriangle } from 'lucide-react';
import { useLab } from './store';
import { SNACK_DATA, forward, loss, lossKindFor, fmt, datasetLoss } from './engine';
import { Slider } from '../ui';

function LossChart() {
  const { s } = useLab();
  const h = s.training.lossHistory;
  if (h.length < 2) return <p className="text-xs text-gray-500">The loss chart appears after two or more training steps.</p>;
  const max = Math.max(...h.map((p) => Math.max(p.loss, p.dataset)), 0.01);
  const sx = (i: number) => 30 + (i / (h.length - 1)) * 360, sy = (v: number) => 130 - (v / max) * 115;
  const stride = Math.max(1, Math.floor(h.length / 400));
  const pick = h.filter((_, i) => i % stride === 0 || i === h.length - 1);
  const idx = (p: (typeof h)[number]) => h.indexOf(p);
  return (
    <svg viewBox="0 0 400 150" className="w-full" role="img" aria-label={`Loss over ${h.length} training steps, dataset loss from ${fmt(h[0].dataset, 3)} to ${fmt(h[h.length - 1].dataset, 3)}`}>
      <line x1={30} x2={390} y1={130} y2={130} stroke="#334155" /><line x1={30} x2={30} y1={10} y2={130} stroke="#334155" />
      <text x={26} y={16} fontSize={9} fill="#64748b" textAnchor="end">{fmt(max, 2)}</text><text x={26} y={132} fontSize={9} fill="#64748b" textAnchor="end">0</text>
      <polyline points={pick.map((p) => `${sx(idx(p))},${sy(p.loss)}`).join(' ')} fill="none" stroke="#f59e0b" strokeOpacity={0.45} strokeWidth={1} />
      <polyline points={pick.map((p) => `${sx(idx(p))},${sy(p.dataset)}`).join(' ')} fill="none" stroke="#22d3ee" strokeWidth={2} />
      <text x={390} y={146} fontSize={9} fill="#64748b" textAnchor="end">training step {h[h.length - 1].step}</text>
      <g fontSize={9}><rect x={240} y={12} width={8} height={2} fill="#f59e0b" /><text x={252} y={16} fill="#cbd5e1">this-example loss</text><rect x={240} y={24} width={8} height={2} fill="#22d3ee" /><text x={252} y={28} fill="#cbd5e1">average loss, all 8 examples</text></g>
    </svg>
  );
}

export function TrainingPanel() {
  const { s, d, net } = useLab();
  const [epochs, setEpochs] = useState(50);
  const remaining = useRef(0);
  const { running, last, lr, example, steps } = s.training;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      // A few epochs per frame keeps the interface responsive while training.
      for (let i = 0; i < 2 && remaining.current > 0; i++) { d({ t: 'trainEpoch' }); remaining.current--; }
      if (remaining.current > 0) raf = requestAnimationFrame(tick); else d({ t: 'trainRunning', value: false });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, d]);

  const k = lossKindFor(net);
  const rows = SNACK_DATA.map((e) => { const p = forward(net, e.inputs).output; return { e, p, l: loss(k, p, e.target), ok: (p > 0.5 ? 1 : 0) === e.target }; });
  const accuracy = rows.filter((r) => r.ok).length;
  const hasStep = net.neurons.some((n) => n.kind !== 'input' && n.activation === 'step');
  const top = last ? [...last.changes].sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before)).slice(0, 6) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-3 text-xs text-amber-100">
        Illustrative teaching dataset (rule: <i>healthy AND (filling OR cheap)</i>). It is not a validated nutrition model, and its predictions are not dietary advice.
      </div>
      {hasStep && <p className="text-xs text-red-300 flex gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0" />A neuron uses the step activation. Its gradient is 0, so backpropagation cannot adjust the parameters that feed it. Switch it to a differentiable activation (ReLU, sigmoid or tanh) to train.</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        <Slider label="Learning rate η" value={lr} min={0.01} max={2} step={0.01} onChange={(v) => d({ t: 'lr', value: v })} format={(v) => v.toFixed(2)} />
        <div className="text-xs text-gray-400 self-end">Loss: <b className="text-gray-200">{k === 'bce' ? 'binary cross-entropy' : 'squared error'}</b> · optimiser: <b className="text-gray-200">SGD</b> · steps: <b className="text-white font-mono">{steps}</b></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="ai-btn text-xs" onClick={() => d({ t: 'trainStep' })} disabled={running}><StepForward className="w-3.5 h-3.5" /> Train one step</button>
        <select aria-label="Number of epochs" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} className="rounded-lg bg-black/40 border border-white/15 px-2 text-xs">
          {[1, 10, 50, 200, 500].map((n) => <option key={n} value={n}>{n} epoch{n > 1 ? 's' : ''} ({n * 8} steps)</option>)}
        </select>
        {!running ? <button className="ai-btn-ghost text-xs" onClick={() => { remaining.current = epochs; d({ t: 'trainRunning', value: true }); }}><Play className="w-3.5 h-3.5" /> Train</button>
          : <button className="ai-btn-ghost text-xs" onClick={() => { remaining.current = 0; d({ t: 'trainRunning', value: false }); }}><Pause className="w-3.5 h-3.5" /> Pause training</button>}
        <button className="ai-btn-ghost text-xs" onClick={() => { d({ t: 'view', key: 'gradients' }); }} aria-pressed={s.view.gradients}>{s.view.gradients ? 'Hide' : 'Show'} gradients on canvas</button>
        <button className="ai-btn-ghost text-xs" disabled={!last} onClick={() => { if (!s.view.gradients) d({ t: 'view', key: 'gradients' }); d({ t: 'backAnim' }); }}><Waves className="w-3.5 h-3.5" /> Animate backpropagation</button>
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'resetModel' })}><RotateCcw className="w-3.5 h-3.5" /> Reset model parameters</button>
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'resetTraining' })} title="Clears the chart and step history; keeps current weights"><Eraser className="w-3.5 h-3.5" /> Reset training history</button>
      </div>

      <section className="nn-card">
        <div className="flex justify-between mb-2"><p className="nn-h">Training examples</p><p className="text-xs text-gray-400">accuracy {accuracy}/8 · avg loss <span className="font-mono">{fmt(datasetLoss(net), 4)}</span></p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[420px]"><thead><tr className="text-gray-500 text-left"><th className="pb-1">Example (healthy, filling, cheap)</th><th>Target</th><th>Prediction</th><th className="text-right">Loss</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={r.e.name} onClick={() => d({ t: 'example', index: i })} className={`border-t border-white/5 cursor-pointer ${i === example ? 'bg-cyan-500/15' : 'hover:bg-white/5'}`}>
                <td className="py-1 pr-2"><span className="font-mono text-gray-500 mr-1">[{r.e.inputs.join(',')}]</span><span className="text-gray-200">{r.e.name}</span></td>
                <td className="font-mono">{r.e.target}</td>
                <td className={`font-mono ${r.ok ? 'text-emerald-300' : 'text-red-300'}`}>{fmt(r.p, 3)} {r.ok ? '✓' : '✗'}</td>
                <td className="font-mono text-right">{fmt(r.l, 4)}</td>
              </tr>
            ))}</tbody></table>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Click a row to select the example for “Train one step” (this also loads its inputs into the network).</p>
      </section>

      <section className="nn-card"><p className="nn-h mb-2">Loss over training steps</p><LossChart /></section>

      {last && (
        <section className="nn-card text-xs space-y-1.5">
          <p className="nn-h mb-1">Last training step (#{steps}) — the real computation</p>
          <ol className="space-y-1 list-decimal pl-4 text-gray-300">
            <li>Example: <span className="font-mono">[{last.inputs.join(', ')}]</span></li>
            <li>Forward pass through Input → Hidden 1 → Hidden 2 → Output</li>
            <li>Prediction: <b className="font-mono text-white">{fmt(last.before.output, 4)}</b></li>
            <li>Target: <b className="font-mono text-white">{last.target}</b></li>
            <li>Loss ({last.back.lossKind === 'bce' ? 'cross-entropy' : 'squared error'}): <b className="font-mono text-red-300">{fmt(last.lossBefore, 5)}</b></li>
            <li>Backpropagation: δ(output) = <span className="font-mono text-violet-200">{fmt(last.back.deltas['output-1'], 5)}</span>, then gradients for every weight and bias, layer by layer backwards (Loss → Output → Hidden 2 → Hidden 1)</li>
            <li>SGD update with η = {lr}: θ ← θ − η·∂L/∂θ ({last.changes.length} parameters changed)</li>
            <li>Largest changes:
              <ul className="font-mono text-[11px] mt-0.5 space-y-0.5">{top.map((c) => (
                <li key={c.id}><button className="text-cyan-300 hover:underline" onClick={() => d({ t: 'select', sel: { type: c.type === 'weight' ? 'connection' : 'neuron', id: c.id } })}>{c.type === 'weight' ? 'w' : 'b'} {c.id}</button>: {fmt(c.before, 4)} → {fmt(c.after, 4)} <span className="text-gray-500">(∂ {fmt(c.grad, 4)})</span></li>
              ))}</ul>
            </li>
            <li>Same example again: prediction <b className="font-mono text-white">{fmt(last.after.output, 4)}</b></li>
            <li>Loss {fmt(last.lossBefore, 5)} → <b className={`font-mono ${last.lossAfter <= last.lossBefore ? 'text-emerald-300' : 'text-red-300'}`}>{fmt(last.lossAfter, 5)}</b>
              {last.lossAfter > last.lossBefore ? ' — this update increased the loss (e.g. learning rate too high). That happens; training is not guaranteed to improve every step.' : ''}</li>
          </ol>
          <p className="text-gray-500 pt-1">Backpropagation does not send the prediction backwards as an input. It computes derivatives — how much the loss would change if each parameter changed — and the optimiser uses them to update the parameters.</p>
        </section>
      )}
    </div>
  );
}
