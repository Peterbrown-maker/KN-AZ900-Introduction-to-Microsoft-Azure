import { useEffect, useState } from 'react';
import { Play, Pause, StepForward, RotateCcw, SkipForward, Zap, Eye, EyeOff } from 'lucide-react';
import { LabProvider, useLab } from './store';
import { NetworkCanvas } from './Canvas';
import { Inspector, NumberField } from './Inspector';
import { Explorer, CalcLog } from './Panels';
import { TrainingPanel } from './Training';
import { BuildPanel, Concepts, Quiz, Checklist } from './Learn';
import { ACTIVATIONS, fmt, type Activation } from './engine';
import { Seg, Slider } from '../ui';

type Tab = 'build' | 'explore' | 'train' | 'concepts' | 'quiz';

export default function NNLab() {
  return <LabProvider><Lab /></LabProvider>;
}

function Lab() {
  const { s, d } = useLab();
  const [tab, setTab] = useState<Tab>('build');
  const [side, setSide] = useState<'inspect' | 'explorer'>('inspect');

  // Playback clock: advances through the recorded operations of the real forward pass.
  useEffect(() => {
    if (!s.playback.playing) return;
    const t = setInterval(() => d({ t: 'tick' }), Math.max(60, 900 / s.speed));
    return () => clearInterval(t);
  }, [s.playback.playing, s.speed, d]);
  useEffect(() => { if (s.selection.length) setSide('inspect'); }, [s.selection]);

  const go = (t: Tab) => {
    setTab(t);
    if (t === 'build' && s.build === null) d({ t: 'build', stage: 0 });
    if (t !== 'build' && s.build !== null) d({ t: 'build', stage: null });
    if (t === 'train' && s.mode !== 'full') d({ t: 'mode', mode: 'full' });
  };

  return (
    <div className="space-y-5" style={{ ['--accent' as string]: '#22d3ee' }}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Interactive laboratory</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Inside every neuron</h1>
          <p className="text-gray-400 mt-1 max-w-2xl text-sm">A real, working neural network. Every number on screen is calculated by the engine, and every neuron and every connection can be opened, edited and traced.</p>
        </div>
        <div role="tablist" aria-label="Lab sections" className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {([['build', '1 · Build'], ['explore', '2 · Explore'], ['train', '3 · Train'], ['concepts', '4 · Concepts'], ['quiz', '5 · Check']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => go(k)} className={`px-3 py-1.5 rounded-lg text-sm ${tab === k ? 'bg-cyan-400 text-[#050a17] font-semibold' : 'text-gray-300 hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </header>

      {tab === 'build' && (
        <div className="grid lg:grid-cols-[1fr_22rem] gap-4">
          <NetworkCanvas />
          <div className="nn-card"><BuildPanel /></div>
        </div>
      )}

      {(tab === 'explore' || tab === 'train') && (
        <>
          {tab === 'explore' && <Toolbar />}
          {tab === 'explore' && s.mode === 'simple' && <AppleEquation />}
          <div className="grid lg:grid-cols-[1fr_24rem] gap-4 items-start">
            <div className="space-y-3 min-w-0">
              <NetworkCanvas height={tab === 'train' ? 460 : 520} />
              {tab === 'explore' && <OpCaption />}
              {tab === 'explore' && s.view.log && <div className="nn-card"><p className="nn-h mb-2">Calculation log</p><CalcLog /></div>}
              {tab === 'train' && <div className="nn-card"><TrainingPanel /></div>}
            </div>
            <aside className="nn-card lg:sticky lg:top-20 max-h-none lg:max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="flex gap-1 mb-3" role="tablist" aria-label="Side panel">
                <button role="tab" aria-selected={side === 'inspect'} onClick={() => setSide('inspect')} className={`flex-1 text-xs py-1.5 rounded-lg ${side === 'inspect' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Inspector</button>
                <button role="tab" aria-selected={side === 'explorer'} onClick={() => setSide('explorer')} className={`flex-1 text-xs py-1.5 rounded-lg ${side === 'explorer' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Object explorer</button>
              </div>
              {side === 'explorer' ? <Explorer /> : s.selection.length ? <Inspector /> : (
                <div className="text-sm text-gray-400 space-y-2">
                  <p className="text-white font-semibold">Nothing selected</p>
                  <p>Click or tap any neuron or any connecting line. With the keyboard, press Tab to move between objects and Enter to open one; Escape returns to the overview.</p>
                  <p>Lines overlap? Use the <button className="underline text-cyan-300" onClick={() => setSide('explorer')}>object explorer</button> to pick any exact connection.</p>
                </div>
              )}
            </aside>
          </div>
        </>
      )}

      {tab === 'concepts' && <Concepts />}
      {tab === 'quiz' && (
        <div className="grid lg:grid-cols-[1fr_22rem] gap-4 items-start">
          <Quiz onGo={(g) => { go(g.tab); if (g.mode) d({ t: 'mode', mode: g.mode }); if (g.sel) setTimeout(() => d({ t: 'select', sel: g.sel! }), 0); }} />
          <Checklist />
        </div>
      )}
    </div>
  );
}

function Toolbar() {
  const { s, d, fwd } = useLab();
  const total = fwd.ops.length;
  const idx = s.playback.active ? Math.min(s.playback.index, total) : s.hasRun[s.mode] ? total : 0;
  const T = ({ k, label }: { k: keyof typeof s.view; label: string }) => (
    <button onClick={() => d({ t: 'view', key: k })} aria-pressed={s.view[k]} className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${s.view[k] ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{s.view[k] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}{label}</button>
  );
  return (
    <div className="nn-card flex flex-wrap items-center gap-3">
      <Seg label="Network mode" value={s.mode} onChange={(m) => d({ t: 'mode', mode: m })} options={[{ value: 'simple', label: 'Simple: 3 inputs → 1 neuron' }, { value: 'full', label: 'Full: 3 → 4 → 3 → 1' }]} />
      <div className="flex flex-wrap gap-1.5">
        <button className="ai-btn text-xs" onClick={() => d({ t: 'run' })}><Zap className="w-3.5 h-3.5" /> RUN INPUT</button>
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'step' })} aria-label="Step forward one operation"><StepForward className="w-3.5 h-3.5" /> Step</button>
        {s.playback.playing ? <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'pause' })}><Pause className="w-3.5 h-3.5" /> Pause</button>
          : <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'play' })}><Play className="w-3.5 h-3.5" /> {s.playback.active ? 'Resume' : 'Play'}</button>}
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'restart' })}><RotateCcw className="w-3.5 h-3.5" /> Restart</button>
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'skip' })} disabled={!s.playback.active}><SkipForward className="w-3.5 h-3.5" /> Skip to end</button>
      </div>
      <div className="w-36"><Slider label="Speed" value={s.speed} min={0.5} max={10} step={0.5} onChange={(v) => d({ t: 'speed', value: v })} format={(v) => `${v}×`} /></div>
      <span className="text-xs font-mono text-gray-400">op {idx}/{total}</span>
      <div className="flex flex-wrap gap-1 ml-auto"><T k="weights" label="Weights" /><T k="outputs" label="Outputs" /><T k="layers" label="Layers" /><T k="log" label="Log" /></div>
      <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'resetModel' })} title="Restores this network's initial parameters">Reset model</button>
    </div>
  );
}

function OpCaption() {
  const { s, currentOp, fwd } = useLab();
  const text = !s.hasRun[s.mode] ? 'Values are not calculated yet. Press RUN INPUT to send the current inputs through the network.'
    : currentOp ? `#${currentOp.seq} · ${currentOp.kind} · ${currentOp.target.id}: ${currentOp.text}`
      : `Forward pass complete. Prediction = ${fmt(fwd.output, 4)}${s.mode === 'simple' ? (fwd.output > 0.5 ? ' (YES)' : ' (NO)') : ''}. Values update automatically when you edit inputs or parameters.`;
  return <p className="text-sm font-mono text-gray-200 rounded-xl bg-black/40 border border-white/10 px-3 py-2" aria-live="polite">{text}</p>;
}

/** The apple neuron as a live equation, editable in place. Every value is read from the model. */
function AppleEquation() {
  const { s, d, net, fwd } = useLab();
  const out = net.neurons.find((n) => n.kind === 'output')!;
  const v = fwd.values[out.id];
  const shown = s.hasRun.simple;
  return (
    <div className="nn-card space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="nn-h">Apple-neuron laboratory</p>
        <p className="text-[11px] text-gray-500">These weights were chosen by hand for teaching — they were not learned through training.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-left text-xs text-gray-500"><th className="pb-1">Feature</th><th>Input</th><th>Weight</th><th className="text-right">Contribution</th></tr></thead>
          <tbody>{net.connections.map((c, i) => (
            <tr key={c.id} className="border-t border-white/5">
              <td className="py-1.5 text-gray-200">{net.neurons[i].label}</td>
              <td><select aria-label={`Input for ${net.neurons[i].label}`} value={s.inputs.simple[i]} onChange={(e) => d({ t: 'input', index: i, value: Number(e.target.value) })} className="rounded bg-black/40 border border-white/15 px-1.5 py-0.5 font-mono">
                {[0, 1].concat(s.inputs.simple[i] !== 0 && s.inputs.simple[i] !== 1 ? [s.inputs.simple[i]] : []).map((x) => <option key={x} value={x}>{fmt(x)}{x === 1 ? ' (yes)' : x === 0 ? ' (no)' : ''}</option>)}
              </select></td>
              <td><input aria-label={`Weight for ${net.neurons[i].label}`} type="number" value={c.weight} onChange={(e) => e.target.value !== '' && d({ t: 'weight', id: c.id, value: Number(e.target.value) })} className="w-20 rounded bg-black/40 border border-white/15 px-1.5 py-0.5 font-mono" /></td>
              <td className="text-right font-mono">{fmt(s.inputs.simple[i] * c.weight)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <NumberField label="Bias" value={out.bias} min={-20} max={20} step={1} onChange={(value) => d({ t: 'bias', id: out.id, value })} />
        <div role="radiogroup" aria-label="Activation" className="flex gap-1">{(Object.keys(ACTIVATIONS) as Activation[]).map((a) => <button key={a} role="radio" aria-checked={out.activation === a} onClick={() => d({ t: 'activation', id: out.id, value: a })} className={`px-2 py-1 rounded text-xs ${out.activation === a ? 'bg-cyan-400 text-[#050a17]' : 'bg-white/5 text-gray-300'}`}>{ACTIVATIONS[a].label}</button>)}</div>
      </div>
      <div className="font-mono text-sm sm:text-base text-gray-200 space-y-1 rounded-xl bg-black/40 p-3">
        <p>z = {v.terms.map((t) => `(${fmt(t.source)} × ${fmt(t.weight)})`).join(' + ')} + ({fmt(out.bias)})</p>
        <p>z = {v.terms.map((t) => fmt(t.product)).join(' + ')} {out.bias < 0 ? '−' : '+'} {fmt(Math.abs(out.bias))} = <b className="text-white">{fmt(v.z)}</b></p>
        <p>{ACTIVATIONS[out.activation].formula.replace('f(z)', `${ACTIVATIONS[out.activation].label}(${fmt(v.z)})`)} → <b className={v.a > 0.5 ? 'text-emerald-300' : 'text-red-300'}>{fmt(v.a, 4)}{out.activation === 'step' ? (v.a === 1 ? ' (YES)' : ' (NO)') : ''}</b></p>
        {!shown && <p className="text-xs text-gray-500 font-sans">This live equation always reflects the model. Press RUN INPUT to watch the calculation animate on the neuron below.</p>}
      </div>
    </div>
  );
}
