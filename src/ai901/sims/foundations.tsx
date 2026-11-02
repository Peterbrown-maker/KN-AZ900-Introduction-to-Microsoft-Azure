import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SimFrame, Seg, Slider } from '../ui';

// ---------------- Electric brain (canvas) ----------------
export function ElectricBrainCanvas({ height = 260, intensity = 1 }: { height?: number; intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    type N = { x: number; y: number; e: number };
    let nodes: N[] = [];
    let edges: [number, number][] = [];
    const pulses: { e: number; t: number; speed: number }[] = [];

    const build = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      const count = Math.round(Math.min(110, (w * h) / 2600));
      let seed = 11;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      while (nodes.length < count) {
        // Two hemispheres: points inside two overlapping ellipses
        const x = rnd(), y = rnd();
        const cx = x < 0.5 ? 0.36 : 0.64;
        const dx = (x - cx) / 0.27, dy = (y - 0.5) / 0.42;
        if (dx * dx + dy * dy < 1 && Math.abs(x - 0.5) > 0.012) nodes.push({ x: x * w, y: y * h, e: 0 });
      }
      edges = [];
      nodes.forEach((a, i) => {
        const near = nodes.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) })).filter((o) => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 3);
        near.forEach((o) => { if (o.j > i) edges.push([i, o.j]); });
      });
    };
    build();
    const onResize = () => build();
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const [a, b] of edges) {
        ctx.strokeStyle = 'rgba(56,189,248,0.12)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
      }
      if (!reduce) {
        if (Math.random() < 0.18 * intensity && edges.length) pulses.push({ e: Math.floor(Math.random() * edges.length), t: 0, speed: 0.012 + Math.random() * 0.02 });
        for (let k = pulses.length - 1; k >= 0; k--) {
          const p = pulses[k];
          p.t += p.speed;
          const [a, b] = edges[p.e];
          const x = nodes[a].x + (nodes[b].x - nodes[a].x) * p.t;
          const y = nodes[a].y + (nodes[b].y - nodes[a].y) * p.t;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
          g.addColorStop(0, 'rgba(167,139,250,0.95)'); g.addColorStop(1, 'rgba(167,139,250,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
          if (p.t >= 1) {
            nodes[b].e = 1;
            pulses.splice(k, 1);
            // A firing neuron sometimes triggers a neighbour — a tiny cascade.
            if (Math.random() < 0.55) {
              const next = edges.findIndex(([s], idx) => s === b && idx !== p.e);
              if (next >= 0) pulses.push({ e: next, t: 0, speed: p.speed });
            }
          }
        }
      }
      for (const n of nodes) {
        n.e *= 0.94;
        ctx.fillStyle = `rgba(${Math.round(34 + 140 * n.e)},${Math.round(211 - 60 * n.e)},238,${0.45 + 0.55 * n.e})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.6 + 2.4 * n.e, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [reduce, intensity]);
  return <canvas ref={ref} className="w-full block" style={{ height }} aria-hidden="true" />;
}

export function ElectricBrain() {
  return (
    <SimFrame title="An electric brain" icon="Brain"
      shows="A network of simple units passing signals. When a unit receives enough input it fires and passes the signal on — the idea McCulloch and Pitts formalised in 1943."
      omits="Real brains have ~86 billion neurons with complex chemistry; artificial networks are drastically simplified mathematical models.">
      <ElectricBrainCanvas />
      <p className="text-center text-xs text-gray-500 mt-2">Each glowing dot is a unit that has just "fired". Each line is a weighted connection.</p>
    </SimFrame>
  );
}

// ---------------- Threshold logic unit ----------------
export function NeuronTLU() {
  const [inputs, setInputs] = useState([1, 0]);
  const [weights, setWeights] = useState([1, 1]);
  const [threshold, setThreshold] = useState(2);
  const sum = inputs[0] * weights[0] + inputs[1] * weights[1];
  const fires = sum >= threshold;
  const truth = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => (a * weights[0] + b * weights[1] >= threshold ? 1 : 0));
  const gate = truth.join('') === '0001' ? 'AND' : truth.join('') === '0111' ? 'OR' : truth.join('') === '0000' ? 'never fires' : truth.join('') === '1111' ? 'always fires' : 'custom';
  const reset = () => { setInputs([1, 0]); setWeights([1, 1]); setThreshold(2); };

  return (
    <SimFrame title="Threshold logic unit" icon="CircuitBoard" onReset={reset}
      shows="Multiply each input by its weight, add, compare with the threshold. Changing weights or threshold changes the logic the neuron computes."
      omits="Modern neurons use smooth activation functions and learn weights automatically from data.">
      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
        <svg viewBox="0 0 420 220" className="w-full max-w-lg mx-auto" role="img" aria-label={`Neuron with weighted sum ${sum} and threshold ${threshold}: ${fires ? 'fires' : 'silent'}`}>
          {[0, 1].map((i) => {
            const y = 60 + i * 100;
            return (
              <g key={i}>
                <line x1={70} y1={y} x2={230} y2={110} stroke={inputs[i] ? '#22d3ee' : '#334155'} strokeWidth={2 + weights[i] * 1.5} strokeDasharray={inputs[i] ? '6 6' : undefined}>
                  {inputs[i] ? <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" /> : null}
                </line>
                <circle cx={50} cy={y} r={22} fill={inputs[i] ? '#22d3ee33' : '#0f172a'} stroke={inputs[i] ? '#22d3ee' : '#475569'} strokeWidth={2} />
                <text x={50} y={y + 5} textAnchor="middle" fill="#e2e8f0" fontSize={16} fontWeight={700}>{inputs[i]}</text>
                <text x={150} y={y + (i ? 10 : -10)} textAnchor="middle" fill="#94a3b8" fontSize={12}>× w{i + 1} = {weights[i]}</text>
              </g>
            );
          })}
          <circle cx={260} cy={110} r={40} fill={fires ? '#a78bfa44' : '#0f172a'} stroke={fires ? '#a78bfa' : '#475569'} strokeWidth={3} />
          <text x={260} y={104} textAnchor="middle" fill="#e2e8f0" fontSize={13}>Σ = {sum}</text>
          <text x={260} y={122} textAnchor="middle" fill="#94a3b8" fontSize={11}>≥ {threshold}?</text>
          <line x1={300} y1={110} x2={370} y2={110} stroke={fires ? '#a78bfa' : '#334155'} strokeWidth={3} />
          <circle cx={390} cy={110} r={20} fill={fires ? '#a78bfa' : '#0f172a'} stroke={fires ? '#c4b5fd' : '#475569'} strokeWidth={2} />
          <text x={390} y={115} textAnchor="middle" fill={fires ? '#050a17' : '#e2e8f0'} fontSize={15} fontWeight={700}>{fires ? 1 : 0}</text>
          <text x={390} y={150} textAnchor="middle" fill="#94a3b8" fontSize={11}>output</text>
        </svg>
        <div className="space-y-4 min-w-[220px]">
          <div className="flex gap-2">
            {[0, 1].map((i) => (
              <button key={i} onClick={() => setInputs((v) => v.map((x, j) => (j === i ? 1 - x : x)))} className="ai-btn-ghost flex-1 justify-center" aria-pressed={inputs[i] === 1}>
                Input {i + 1}: {inputs[i] ? 'ON' : 'OFF'}
              </button>
            ))}
          </div>
          <Slider label="Weight 1" value={weights[0]} min={0} max={3} step={0.5} onChange={(v) => setWeights([v, weights[1]])} />
          <Slider label="Weight 2" value={weights[1]} min={0} max={3} step={0.5} onChange={(v) => setWeights([weights[0], v])} />
          <Slider label="Threshold" value={threshold} min={0} max={4} step={0.5} onChange={setThreshold} />
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-gray-400 mb-2">Truth table (inputs → output)</p>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
              {['00', '01', '10', '11'].map((k, i) => (
                <div key={k} className={`rounded py-1 ${truth[i] ? 'bg-violet-500/30 text-violet-200' : 'bg-white/5 text-gray-400'}`}>{k}→{truth[i]}</div>
              ))}
            </div>
            <p className="text-sm mt-2 text-gray-200">This neuron behaves like: <span className="font-bold" style={{ color: 'var(--accent)' }}>{gate}</span></p>
          </div>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Black box vs white box ----------------
export function BlackWhiteBox() {
  const [mode, setMode] = useState<'black' | 'white'>('black');
  const factors = [
    { f: 'Debt-to-income ratio 48%', w: -0.42 },
    { f: 'Missed payments (last 12 months): 2', w: -0.31 },
    { f: 'Employment length: 6 years', w: 0.18 },
    { f: 'Requested amount vs income', w: -0.12 },
    { f: 'Postcode', w: 0 },
  ];
  return (
    <SimFrame title="Black box vs white box" icon="Box" controls={<Seg label="Model type" value={mode} onChange={setMode} options={[{ value: 'black', label: 'Black box' }, { value: 'white', label: 'Interpretable' }]} />}
      shows="An interpretable model exposes which factors drove a decision, so people can check it for errors and bias."
      omits="Explanation methods for large neural networks are approximations; full transparency of very large models remains an open research problem.">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="rounded-xl bg-white/5 p-4 text-sm text-gray-300">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Applicant</p>
          <p>Loan request: €18,000</p><p>Income: €3,100 / month</p><p>History: 2 late payments</p>
        </div>
        <motion.div layout className={`rounded-2xl w-40 h-40 mx-auto grid place-items-center border-2 ${mode === 'black' ? 'bg-black border-gray-700' : 'bg-white/5 border-cyan-400/50'}`}>
          {mode === 'black' ? <span className="text-gray-600 text-sm">? ? ?</span> : (
            <svg viewBox="0 0 100 100" className="w-28 h-28">{Array.from({ length: 12 }).map((_, i) => <line key={i} x1={10 + (i % 3) * 40} y1={15 + Math.floor(i / 3) * 25} x2={50} y2={50} stroke="#22d3ee55" />)}<circle cx={50} cy={50} r={10} fill="#22d3ee" /></svg>
          )}
        </motion.div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Decision</p>
          <p className="text-lg font-bold text-red-300">Declined</p>
          <AnimatePresence mode="wait">
            {mode === 'black' ? (
              <motion.p key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-gray-400 mt-2">No explanation available. Is it fair? Is it a mistake? Nobody can tell.</motion.p>
            ) : (
              <motion.ul key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 space-y-1.5">
                {factors.map((x) => (
                  <li key={x.f} className="text-xs">
                    <div className="flex justify-between text-gray-300"><span>{x.f}</span><span className="font-mono">{x.w > 0 ? '+' : ''}{x.w.toFixed(2)}</span></div>
                    <div className="h-1.5 bg-white/5 rounded mt-0.5"><div className="h-full rounded" style={{ width: `${Math.abs(x.w) * 200}%`, background: x.w < 0 ? '#f87171' : '#34d399' }} /></div>
                  </li>
                ))}
                <li className="text-xs text-emerald-300 pt-1">✓ Postcode has zero influence — a useful fairness check.</li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- AI hierarchy ----------------
const layers = [
  { id: 'ai', label: 'Artificial intelligence', r: 150, color: '#22d3ee', text: 'Any technique that makes software perform tasks associated with human intelligence — including rule-based systems with no learning at all.', eg: 'Chess engine with hand-written rules, route planner, spam filter, chatbot' },
  { id: 'ml', label: 'Machine learning', r: 112, color: '#10b981', text: 'AI that learns patterns from data rather than following hand-written rules.', eg: 'Price prediction, fraud detection, customer clustering' },
  { id: 'dl', label: 'Deep learning', r: 76, color: '#a78bfa', text: 'Machine learning using neural networks with many layers. Powers modern vision, speech and language.', eg: 'Face recognition, speech-to-text, CNNs, transformers' },
  { id: 'gen', label: 'Generative AI', r: 42, color: '#f472b6', text: 'Deep learning models that create new content — text, images, code, audio — from prompts.', eg: 'Chat assistants, image generation, code completion' },
];

export function AIHierarchy() {
  const [sel, setSel] = useState('dl');
  const s = layers.find((l) => l.id === sel)!;
  return (
    <SimFrame title="AI ⊃ ML ⊃ Deep learning ⊃ Generative AI" icon="Layers"
      shows="Each field is a subset of the one around it." omits="Some generative techniques are not deep learning, and the boundaries are fuzzy in practice.">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <svg viewBox="0 0 320 320" className="w-full max-w-xs mx-auto" role="group" aria-label="Nested AI fields">
          {layers.map((l) => (
            <g key={l.id} onClick={() => setSel(l.id)} className="cursor-pointer" role="button" tabIndex={0} aria-label={l.label} aria-pressed={sel === l.id}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(l.id)}>
              <circle cx={160} cy={160 + (150 - l.r) * 0.55} r={l.r} fill={`${l.color}${sel === l.id ? '40' : '14'}`} stroke={l.color} strokeWidth={sel === l.id ? 3 : 1.5} />
              <text x={160} y={160 + (150 - l.r) * 0.55 - l.r + 22} textAnchor="middle" fill={l.color} fontSize={l.id === 'gen' ? 11 : 13} fontWeight={600}>{l.label}</text>
            </g>
          ))}
        </svg>
        <AnimatePresence mode="wait">
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.label}</p>
            <p className="text-gray-300 leading-relaxed">{s.text}</p>
            <p className="text-sm text-gray-400"><span className="text-gray-300 font-semibold">Examples: </span>{s.eg}</p>
            <p className="text-xs text-gray-500">Tip: click or press Enter on each ring.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </SimFrame>
  );
}

// ---------------- Data to insight ----------------
const stages = [
  { k: 'data', title: 'Raw data', text: 'Thousands of unlabelled observations — transactions, pixels, words, prices.' },
  { k: 'patterns', title: 'Patterns', text: 'A model finds structure: points group into clusters.' },
  { k: 'predict', title: 'Prediction', text: 'Learn a trend and estimate a number for a new input (regression).' },
  { k: 'classify', title: 'Classification', text: 'Learn a boundary and assign new items to a category.' },
  { k: 'generate', title: 'Generation', text: 'Use learned patterns to create something new that fits them.' },
] as const;

export function DataToInsight() {
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();
  const [auto, setAuto] = useState(!reduce);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % stages.length), 3200);
    return () => clearInterval(t);
  }, [auto]);
  const pts = Array.from({ length: 36 }, (_, i) => {
    const c = i % 3;
    const cx = [90, 200, 300][c], cy = [150, 70, 160][c];
    const a = (i * 2.4) % (Math.PI * 2), r = 12 + ((i * 7) % 26);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, c };
  });
  const colors = ['#22d3ee', '#a78bfa', '#f59e0b'];
  const st = stages[step].k;
  return (
    <SimFrame title="From data to intelligence" icon="Sparkles"
      controls={<button className="ai-btn-ghost text-xs" onClick={() => setAuto((a) => !a)}>{auto ? 'Pause' : 'Play'}</button>}
      shows="The same raw data can yield patterns, numeric predictions, category decisions, or new generated examples." omits="Real models work in many more dimensions than two.">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 items-center">
        <svg viewBox="0 0 380 230" className="w-full rounded-xl bg-black/30" role="img" aria-label={`Stage: ${stages[step].title}`}>
          {st === 'classify' && <path d="M 150 0 C 170 90, 230 120, 380 110 L 380 230 L 0 230 L 0 0 Z" fill="#a78bfa10" stroke="#a78bfa" strokeDasharray="5 4" />}
          {st === 'predict' && <line x1={20} y1={200} x2={360} y2={40} stroke="#10b981" strokeWidth={2.5} />}
          {pts.map((p, i) => (
            <motion.circle key={i} r={4} initial={false}
              animate={{ cx: st === 'data' ? 20 + ((i * 53) % 340) : st === 'predict' ? 20 + i * 9.6 : p.x, cy: st === 'data' ? 20 + ((i * 37) % 190) : st === 'predict' ? 200 - i * 4.4 + ((i * 13) % 22) - 11 : p.y, fill: st === 'data' ? '#64748b' : st === 'predict' ? '#10b981' : colors[p.c] }}
              transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : i * 0.008 }} />
          ))}
          {st === 'classify' && <><circle cx={270} cy={190} r={7} fill="none" stroke="#fff" strokeWidth={2} /><text x={282} y={194} fill="#e2e8f0" fontSize={11}>new → class B</text></>}
          {st === 'predict' && <><circle cx={250} cy={92} r={7} fill="none" stroke="#fff" strokeWidth={2} /><text x={262} y={88} fill="#e2e8f0" fontSize={11}>x=24 → ŷ≈136</text></>}
          {st === 'generate' && [0, 1, 2, 3].map((k) => (
            <motion.circle key={k} r={6} fill="none" stroke="#f472b6" strokeWidth={2} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, cx: [110, 190, 310, 80][k], cy: [140, 80, 150, 160][k] }} transition={{ delay: 0.3 + k * 0.25 }} />
          ))}
        </svg>
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <p className="text-xs uppercase tracking-widest text-gray-500">Stage {step + 1} of {stages.length}</p>
              <p className="text-2xl font-bold text-white mt-1">{stages[step].title}</p>
              <p className="text-gray-300 mt-2">{stages[step].text}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {stages.map((s, i) => (
              <button key={s.k} onClick={() => { setStep(i); setAuto(false); }} className={`px-2.5 py-1 rounded-full text-xs border ${i === step ? 'border-transparent text-[#050a17]' : 'border-white/10 text-gray-400 hover:text-white'}`} style={i === step ? { background: 'var(--accent)' } : undefined}>
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SimFrame>
  );
}
