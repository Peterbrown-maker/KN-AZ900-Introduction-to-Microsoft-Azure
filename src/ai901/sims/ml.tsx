import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SimFrame, Seg, Slider, Bar } from '../ui';

// ---------------- Training vs inference ----------------
const history = [[14, 52], [17, 70], [19, 85], [21, 96], [23, 110], [25, 122], [27, 140], [29, 148], [31, 165]];

export function TrainInfer() {
  const [phase, setPhase] = useState<'train' | 'infer'>('train');
  const [w, setW] = useState(0.5);
  const [b, setB] = useState(10);
  const [epochs, setEpochs] = useState(0);
  const [temp, setTemp] = useState(26);
  const loss = history.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / history.length;
  const step = (n: number) => {
    let ww = w, bb = b;
    for (let k = 0; k < n; k++) {
      let gw = 0, gb = 0;
      for (const [x, y] of history) { const e = ww * x + bb - y; gw += e * x; gb += e; }
      ww -= 0.0009 * (gw / history.length); bb -= 0.02 * (gb / history.length);
    }
    setW(ww); setB(bb); setEpochs((e) => e + n);
  };
  const sx = (x: number) => 30 + (x - 10) * 13, sy = (y: number) => 190 - y;
  return (
    <SimFrame title="Training vs inference" icon="GraduationCap"
      controls={<Seg label="Phase" value={phase} onChange={setPhase} options={[{ value: 'train', label: '1 · Train' }, { value: 'infer', label: '2 · Infer' }]} />}
      onReset={() => { setW(0.5); setB(10); setEpochs(0); setPhase('train'); }}
      shows="Training repeatedly adjusts the model's parameters (slope and intercept) to reduce error on labelled history. Inference just applies the finished model to a new input — nothing is learned."
      omits="Real models have millions or billions of parameters, and training uses far more data and compute.">
      <div className="grid md:grid-cols-[1.3fr_1fr] gap-5">
        <svg viewBox="0 0 330 210" className="w-full rounded-xl bg-black/30" role="img" aria-label="Scatter plot of temperature against ice cream sales with a fitted line">
          <text x={165} y={205} textAnchor="middle" fontSize={10} fill="#64748b">temperature (°C) — feature</text>
          <text x={10} y={100} fontSize={10} fill="#64748b" transform="rotate(-90 10 100)">sales — label</text>
          {history.map(([x, y]) => <circle key={x} cx={sx(x)} cy={sy(y)} r={5} fill="#10b981" />)}
          <line x1={sx(10)} y1={sy(w * 10 + b)} x2={sx(34)} y2={sy(w * 34 + b)} stroke="#a78bfa" strokeWidth={2.5} />
          {phase === 'infer' && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line x1={sx(temp)} y1={190} x2={sx(temp)} y2={sy(w * temp + b)} stroke="#f59e0b" strokeDasharray="4 3" />
              <circle cx={sx(temp)} cy={sy(w * temp + b)} r={7} fill="#f59e0b" />
            </motion.g>
          )}
        </svg>
        {phase === 'train' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">Historical data with <b>known labels</b>. The model starts with a poor guess.</p>
            <div className="font-mono text-sm rounded-xl bg-white/5 p-3 space-y-1">
              <p>sales ≈ <span className="text-violet-300">{w.toFixed(2)}</span> × temp + <span className="text-violet-300">{b.toFixed(1)}</span></p>
              <p className="text-gray-400">epochs: {epochs} · loss (MSE): {loss.toFixed(0)}</p>
            </div>
            <div className="flex gap-2"><button className="ai-btn" onClick={() => step(1)}>Train 1 epoch</button><button className="ai-btn-ghost" onClick={() => step(25)}>Train 25</button></div>
            <p className="text-xs text-gray-500">Watch the loss fall as the line moves toward the data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">New day, <b>unknown</b> sales. The parameters are frozen.</p>
            <Slider label="Tomorrow's temperature" value={temp} min={10} max={34} onChange={setTemp} format={(v) => `${v} °C`} />
            <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3">
              <p className="text-xs text-amber-200">Prediction</p>
              <p className="text-2xl font-bold text-white">{Math.max(0, Math.round(w * temp + b))} ice creams</p>
            </div>
            {epochs < 5 && <p className="text-xs text-red-300">The model is barely trained — go back to phase 1 and train it first.</p>}
          </div>
        )}
      </div>
    </SimFrame>
  );
}

// ---------------- Supervised k-NN playground ----------------
type P = { x: number; y: number; c: 0 | 1 };
const preset: Record<string, P[]> = {
  balanced: [[40, 40], [60, 70], [80, 50], [50, 110], [90, 90], [70, 30], [220, 120], [250, 150], [200, 160], [260, 100], [230, 70], [280, 140]].map(([x, y], i) => ({ x, y, c: (i < 6 ? 0 : 1) as 0 | 1 })),
  noisy: [[40, 40], [60, 70], [80, 50], [50, 110], [90, 90], [70, 30], [220, 120], [250, 150], [200, 160], [260, 100], [230, 70], [280, 140], [240, 130], [75, 65]].map(([x, y], i) => ({ x, y, c: (i < 6 || i === 12 ? 0 : 1) as 0 | 1 })),
  biased: [[40, 40], [60, 70], [80, 50], [50, 110], [90, 90], [70, 30], [130, 150], [150, 170]].map(([x, y], i) => ({ x, y, c: (i < 6 ? 0 : 1) as 0 | 1 })),
};
const CLS = [{ name: 'Legitimate', color: '#22d3ee' }, { name: 'Fraud', color: '#f472b6' }];

function knn(points: P[], x: number, y: number, k: number) {
  const near = points.map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
  const votes = near.filter((n) => n.p.c === 1).length;
  return { c: (votes * 2 > near.length ? 1 : 0) as 0 | 1, near, conf: Math.max(votes, near.length - votes) / Math.max(1, near.length) };
}

export function SupervisedPlayground() {
  const [points, setPoints] = useState<P[]>(preset.balanced);
  const [mode, setMode] = useState<'0' | '1' | 'test'>('0');
  const [k, setK] = useState(3);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>({ x: 150, y: 100 });
  const W = 320, H = 200, cell = 10;
  const grid = useMemo(() => {
    if (!points.length) return [];
    const out: { x: number; y: number; c: number }[] = [];
    for (let gx = 0; gx < W; gx += cell) for (let gy = 0; gy < H; gy += cell) out.push({ x: gx, y: gy, c: knn(points, gx + cell / 2, gy + cell / 2, k).c });
    return out;
  }, [points, k]);
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    if (mode === 'test') setProbe({ x, y });
    else setPoints((p) => [...p, { x, y, c: Number(mode) as 0 | 1 }]);
  };
  const res = probe && points.length ? knn(points, probe.x, probe.y, k) : null;
  return (
    <SimFrame title="Supervised learning playground" icon="MousePointerClick" onReset={() => { setPoints(preset.balanced); setProbe({ x: 150, y: 100 }); }}
      shows="Labelled examples define the decision regions. Add a few mislabelled or unrepresentative points and predictions for new transactions change."
      omits="Real fraud models use dozens of features, not two, and are evaluated on held-out data.">
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <Seg label="Click mode" value={mode} onChange={setMode} options={[{ value: '0', label: '+ Legitimate' }, { value: '1', label: '+ Fraud' }, { value: 'test', label: 'Test a transaction' }]} />
        <div className="w-36"><Slider label="k neighbours" value={k} min={1} max={7} step={2} onChange={setK} /></div>
      </div>
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-black/40 cursor-crosshair touch-none" onClick={click} role="img" aria-label="Scatter plot. Click to add labelled examples or test a point.">
          {grid.map((g, i) => <rect key={i} x={g.x} y={g.y} width={cell} height={cell} fill={CLS[g.c].color} opacity={0.1} />)}
          {res && probe && res.near.map((n, i) => <line key={i} x1={probe.x} y1={probe.y} x2={n.p.x} y2={n.p.y} stroke="#fff" strokeOpacity={0.35} strokeDasharray="3 3" />)}
          {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={CLS[p.c].color} stroke="#050a17" strokeWidth={1.5} />)}
          {probe && <g><circle cx={probe.x} cy={probe.y} r={8} fill="none" stroke="#fff" strokeWidth={2} /><circle cx={probe.x} cy={probe.y} r={2} fill="#fff" /></g>}
          <text x={6} y={H - 6} fontSize={9} fill="#64748b">x: amount vs usual →</text>
          <text x={6} y={12} fontSize={9} fill="#64748b">y: distance from home ↓</text>
        </svg>
        <div className="space-y-3 text-sm">
          {res ? (
            <div className="rounded-xl p-3 border" style={{ borderColor: `${CLS[res.c].color}66`, background: `${CLS[res.c].color}14` }}>
              <p className="text-xs text-gray-400">Prediction for the test transaction</p>
              <p className="text-xl font-bold" style={{ color: CLS[res.c].color }}>{CLS[res.c].name}</p>
              <p className="text-xs text-gray-400 mt-1">{Math.round(res.conf * 100)}% of the {k} nearest examples agree</p>
            </div>
          ) : <p className="text-gray-400">Add some examples.</p>}
          <p className="text-gray-400">Try a preset:</p>
          <div className="flex flex-wrap gap-2">
            <button className="ai-btn-ghost text-xs" onClick={() => setPoints(preset.balanced)}>Representative</button>
            <button className="ai-btn-ghost text-xs" onClick={() => setPoints(preset.noisy)}>With label errors</button>
            <button className="ai-btn-ghost text-xs" onClick={() => setPoints(preset.biased)}>Unrepresentative</button>
          </div>
          <p className="text-xs text-gray-500">With "Unrepresentative", there are almost no fraud examples on the right — so the model can't learn that region properly.</p>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- k-means clustering ----------------
const KC = ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399'];
const initialPts = () => {
  let s = 5; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return [[70, 60], [240, 70], [150, 160]].flatMap(([cx, cy]) => Array.from({ length: 9 }, () => ({ x: cx + (r() - 0.5) * 80, y: cy + (r() - 0.5) * 60 })));
};

export function ClusterPlayground() {
  const [pts, setPts] = useState(initialPts);
  const [k, setK] = useState(3);
  const [cents, setCents] = useState<{ x: number; y: number }[]>([]);
  const [iter, setIter] = useState(0);
  const drag = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const assign = (c = cents) => pts.map((p) => (c.length ? c.map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) })).sort((a, b) => a.d - b.d)[0].j : -1));
  const labels = assign();
  const init = (kk = k) => { setCents(Array.from({ length: kk }, (_, j) => ({ x: 40 + j * 70, y: 30 + (j % 2) * 140 }))); setIter(0); };
  useEffect(() => { init(k); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = () => {
    const l = assign();
    setCents(cents.map((c, j) => {
      const mine = pts.filter((_, i) => l[i] === j);
      return mine.length ? { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length } : c;
    }));
    setIter((i) => i + 1);
  };
  const toSvg = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 320, y: ((e.clientY - r.top) / r.height) * 220 };
  };
  const inertia = pts.reduce((s, p, i) => (labels[i] >= 0 ? s + Math.hypot(p.x - cents[labels[i]].x, p.y - cents[labels[i]].y) : s), 0);
  return (
    <SimFrame title="Clustering playground (k-means)" icon="Boxes" onReset={() => { setPts(initialPts()); init(); }}
      shows="Without any labels, k-means discovers groups by alternating 'assign to nearest centroid' and 'move centroid to the mean'. Drag points to reshape the data."
      omits="Choosing k, scaling features and interpreting what clusters mean are left to people.">
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-4">
        <svg ref={svgRef} viewBox="0 0 320 220" className="w-full rounded-xl bg-black/40 touch-none select-none" role="img" aria-label="Points and cluster centroids. Drag points to move them."
          onPointerMove={(e) => { if (drag.current !== null) { const q = toSvg(e); setPts((p) => p.map((o, i) => (i === drag.current ? q : o))); } }}
          onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
          {pts.map((p, i) => labels[i] >= 0 && <line key={`l${i}`} x1={p.x} y1={p.y} x2={cents[labels[i]].x} y2={cents[labels[i]].y} stroke={KC[labels[i]]} strokeOpacity={0.2} />)}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={6} fill={iter === 0 ? '#94a3b8' : KC[labels[i]]} className="cursor-grab" onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); drag.current = i; }} />
          ))}
          {cents.map((c, j) => (
            <motion.g key={j} animate={{ x: c.x, y: c.y }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
              <path d="M -9 0 L 9 0 M 0 -9 L 0 9" stroke={KC[j]} strokeWidth={4} /><circle r={11} fill="none" stroke={KC[j]} strokeWidth={2} />
            </motion.g>
          ))}
        </svg>
        <div className="space-y-3">
          <Slider label="Number of clusters (k)" value={k} min={2} max={4} onChange={setK} />
          <div className="flex gap-2"><button className="ai-btn" onClick={step}>Step</button><button className="ai-btn-ghost" onClick={() => init()}>Re-seed</button></div>
          <p className="text-sm text-gray-300">Iteration <b>{iter}</b> · total distance to centroids <b>{Math.round(inertia)}</b></p>
          <p className="text-xs text-gray-500">Points are grey before the first step — there are no labels. Press Step repeatedly until the centroids stop moving. Try k=2 or 4 and see that the algorithm always finds k groups, whether or not they make sense.</p>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Reinforcement learning gridworld ----------------
const G = 5;
const WALLS = new Set(['1,1', '2,3', '3,1']);
const GOAL = '4,0', PIT = '4,2', START = '0,4';
const ACTS = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const; // up right down left
const ARROWS = ['↑', '→', '↓', '←'];

export function RLGridworld() {
  const [Q, setQ] = useState<Record<string, number[]>>({});
  const [eps, setEps] = useState(0);
  const [path, setPath] = useState<string[]>([]);
  const q = (s: string) => Q[s] ?? [0, 0, 0, 0];
  const move = (s: string, a: number) => {
    const [x, y] = s.split(',').map(Number);
    const nx = Math.min(G - 1, Math.max(0, x + ACTS[a][0])), ny = Math.min(G - 1, Math.max(0, y + ACTS[a][1]));
    const ns = WALLS.has(`${nx},${ny}`) ? s : `${nx},${ny}`;
    const r = ns === GOAL ? 10 : ns === PIT ? -10 : -1;
    return { ns, r, done: ns === GOAL || ns === PIT };
  };
  const train = (n: number) => {
    const T: Record<string, number[]> = JSON.parse(JSON.stringify(Q));
    const get = (s: string) => (T[s] ??= [0, 0, 0, 0]);
    for (let e = 0; e < n; e++) {
      let s = START;
      for (let t = 0; t < 60; t++) {
        const a = Math.random() < 0.25 ? Math.floor(Math.random() * 4) : get(s).indexOf(Math.max(...get(s)));
        const { ns, r, done } = move(s, a);
        const target = r + (done ? 0 : 0.9 * Math.max(...get(ns)));
        get(s)[a] += 0.5 * (target - get(s)[a]);
        s = ns;
        if (done) break;
      }
    }
    setQ(T); setEps((x) => x + n); setPath([]);
  };
  const run = () => {
    let s = START; const p = [s];
    for (let t = 0; t < 20 && s !== GOAL && s !== PIT; t++) { const a = q(s).indexOf(Math.max(...q(s))); s = move(s, a).ns; p.push(s); }
    setPath(p);
  };
  const maxQ = Math.max(1, ...Object.values(Q).flatMap((v) => v.map(Math.abs)));
  return (
    <SimFrame title="Reinforcement learning gridworld" icon="Gamepad2" onReset={() => { setQ({}); setEps(0); setPath([]); }}
      shows="No labelled answers — the agent learns from rewards (+10 goal, −10 pit, −1 per step). Value spreads backwards from the goal as episodes accumulate, and the arrows become the learned policy."
      omits="Real RL problems have enormous state spaces and use neural networks to approximate values.">
      <div className="grid md:grid-cols-[auto_1fr] gap-5 items-start">
        <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${G}, 3rem)` }} role="grid" aria-label="Gridworld">
          {Array.from({ length: G * G }, (_, i) => {
            const x = i % G, y = Math.floor(i / G), s = `${x},${y}`;
            const v = Math.max(...q(s));
            const best = q(s).indexOf(v);
            const onPath = path.includes(s);
            const bg = WALLS.has(s) ? '#1e293b' : s === GOAL ? '#10b98155' : s === PIT ? '#ef444455' : v > 0 ? `rgba(16,185,129,${(v / maxQ) * 0.5})` : v < 0 ? `rgba(239,68,68,${(-v / maxQ) * 0.4})` : 'rgba(255,255,255,0.04)';
            return (
              <div key={s} role="gridcell" className={`w-12 h-12 rounded-lg grid place-items-center text-sm font-bold relative ${onPath ? 'ring-2 ring-amber-300' : ''}`} style={{ background: bg }}>
                {s === GOAL ? '🏁' : s === PIT ? '🕳️' : s === START ? '🤖' : WALLS.has(s) ? '' : eps > 0 ? <span className="text-gray-300">{ARROWS[best]}</span> : ''}
              </div>
            );
          })}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button className="ai-btn" onClick={() => train(1)}>Train 1 episode</button>
            <button className="ai-btn-ghost" onClick={() => train(20)}>Train 20</button>
            <button className="ai-btn-ghost" onClick={run} disabled={!eps}>Run learned policy</button>
          </div>
          <p className="text-sm text-gray-300">Episodes trained: <b>{eps}</b></p>
          {path.length > 0 && <p className="text-sm">{path[path.length - 1] === GOAL ? <span className="text-emerald-300">Reached the goal in {path.length - 1} steps.</span> : <span className="text-amber-300">Didn't reach the goal yet — train more.</span>}</p>}
          <div className="text-xs text-gray-400 space-y-1">
            <p><b className="text-gray-200">Agent</b> 🤖 · <b className="text-gray-200">Environment</b> the grid · <b className="text-gray-200">Actions</b> ↑→↓← · <b className="text-gray-200">Reward</b> +10 / −10 / −1</p>
            <p>Green cells have learned high value. The arrows show the action the agent now prefers in each state (its policy).</p>
          </div>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Comparing approaches ----------------
export function LearningCompare() {
  const [m, setM] = useState<'sup' | 'unsup' | 'rl'>('sup');
  const info = {
    sup: { signal: 'Labelled examples', q: 'What is the label for this new item?', t: 'Every training point already has the right answer (colour). The model learns the boundary.' },
    unsup: { signal: 'No labels at all', q: 'What natural groups exist?', t: 'The same points arrive grey. The algorithm groups them by similarity; people name the groups afterwards.' },
    rl: { signal: 'Rewards from actions', q: 'What should I do next?', t: 'There is no dataset of answers. An agent acts, receives rewards, and learns a strategy.' },
  }[m];
  const pts = Array.from({ length: 18 }, (_, i) => ({ x: i < 9 ? 50 + (i % 3) * 25 : 190 + (i % 3) * 25, y: 50 + Math.floor((i % 9) / 3) * 30, c: i < 9 ? 0 : 1 }));
  return (
    <SimFrame title="Three ways to learn" icon="GitCompare" controls={<Seg label="Approach" value={m} onChange={setM} options={[{ value: 'sup', label: 'Supervised' }, { value: 'unsup', label: 'Unsupervised' }, { value: 'rl', label: 'Reinforcement' }]} />}
      shows="The training signal is what distinguishes the three approaches." omits="Hybrid approaches (semi-supervised, self-supervised) also exist.">
      <div className="grid md:grid-cols-2 gap-5 items-center">
        <svg viewBox="0 0 300 180" className="w-full rounded-xl bg-black/30">
          {m !== 'rl' && pts.map((p, i) => (
            <motion.circle key={i} cx={p.x} cy={p.y} r={8} animate={{ fill: m === 'sup' ? (p.c ? '#f472b6' : '#22d3ee') : '#94a3b8' }} />
          ))}
          {m === 'sup' && <line x1={150} y1={20} x2={150} y2={160} stroke="#fff" strokeDasharray="4 4" strokeOpacity={0.5} />}
          {m === 'unsup' && <><ellipse cx={75} cy={80} rx={55} ry={50} fill="none" stroke="#a78bfa" strokeDasharray="4 3" /><ellipse cx={215} cy={80} rx={55} ry={50} fill="none" stroke="#a78bfa" strokeDasharray="4 3" /></>}
          {m === 'rl' && (
            <g>
              <rect x={20} y={130} width={36} height={36} rx={8} fill="#22d3ee33" /><text x={38} y={153} textAnchor="middle">🤖</text>
              <rect x={240} y={20} width={36} height={36} rx={8} fill="#10b98144" /><text x={258} y={43} textAnchor="middle">🏁</text>
              <motion.path d="M 56 148 C 120 148, 160 40, 240 38" fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} />
              <text x={150} y={110} fill="#f59e0b" fontSize={12} textAnchor="middle">action → reward +10</text>
            </g>
          )}
        </svg>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-gray-500">Training signal</p>
          <p className="text-xl font-bold text-white">{info.signal}</p>
          <p className="text-sm italic" style={{ color: 'var(--accent)' }}>"{info.q}"</p>
          <p className="text-gray-300 text-sm">{info.t}</p>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Forex overfitting lab ----------------
function series() {
  let s = 42; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: number[] = []; let v = 1.08;
  for (let i = 0; i < 60; i++) { v += (r() - 0.5) * 0.006 + Math.sin(i / 9) * 0.0008; out.push(v); }
  return out;
}
function polyfit(xs: number[], ys: number[], deg: number) {
  const n = deg + 1;
  const A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  xs.forEach((x, i) => { for (let r = 0; r < n; r++) { for (let c = 0; c < n; c++) A[r][c] += x ** (r + c); A[r][n] += ys[i] * x ** r; } });
  for (let r = 0; r < n; r++) A[r][r] += 1e-9; // tiny ridge for stability
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
  }
  const coef = A.map((row, i) => row[n] / row[i]);
  return (x: number) => coef.reduce((s, c, i) => s + c * x ** i, 0);
}

export function ForexLab() {
  const data = useMemo(series, []);
  const [deg, setDeg] = useState(1);
  const split = 42;
  const xs = data.map((_, i) => (i / (data.length - 1)) * 2 - 1);
  const mean = data.slice(0, split).reduce((a, b) => a + b, 0) / split;
  const f = useMemo(() => polyfit(xs.slice(0, split), data.slice(0, split).map((d) => d - mean), deg), [deg]); // eslint-disable-line react-hooks/exhaustive-deps
  const pred = xs.map((x) => f(x) + mean);
  const err = (a: number, b: number) => Math.sqrt(data.slice(a, b).reduce((s, d, i) => s + (d - pred[a + i]) ** 2, 0) / (b - a)) * 10000;
  const trainErr = err(0, split), testErr = err(split, data.length);
  const lo = Math.min(...data) - 0.004, hi = Math.max(...data) + 0.004;
  const sy = (v: number) => 170 - ((Math.min(hi + 0.01, Math.max(lo - 0.01, v)) - lo) / (hi - lo)) * 150;
  const sx = (i: number) => 10 + i * 5.2;
  return (
    <SimFrame title="Honest forex experiment: overfitting" icon="CandlestickChart"
      shows="As model complexity rises, error on the training period keeps falling but error on the unseen future period gets worse. Perfect hindsight is not foresight."
      omits="This is a synthetic EUR/USD-like series and a polynomial curve, not a real trading model. It is a learning example — it does not show that markets are predictable or that any strategy is profitable.">
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-4">
        <svg viewBox="0 0 330 185" className="w-full rounded-xl bg-black/40" role="img" aria-label={`Price series with degree ${deg} fit. Training error ${trainErr.toFixed(1)} pips, test error ${testErr.toFixed(1)} pips.`}>
          <rect x={sx(split)} y={0} width={330 - sx(split)} height={185} fill="#f59e0b0d" />
          <text x={sx(split) + 4} y={14} fontSize={9} fill="#f59e0b">unseen future (test)</text>
          <text x={14} y={14} fontSize={9} fill="#10b981">history (training)</text>
          <polyline points={data.map((d, i) => `${sx(i)},${sy(d)}`).join(' ')} fill="none" stroke="#64748b" strokeWidth={1.5} />
          {data.map((d, i) => <circle key={i} cx={sx(i)} cy={sy(d)} r={1.8} fill={i < split ? '#10b981' : '#f59e0b'} />)}
          <polyline points={pred.map((d, i) => `${sx(i)},${sy(d)}`).join(' ')} fill="none" stroke="#a78bfa" strokeWidth={2.2} />
        </svg>
        <div className="space-y-3">
          <Slider label="Model complexity (polynomial degree)" value={deg} min={1} max={12} onChange={setDeg} />
          <div className="space-y-2 text-sm">
            <div><div className="flex justify-between"><span className="text-emerald-300">Training error</span><span className="font-mono">{trainErr.toFixed(1)} pips</span></div><Bar value={trainErr / 60} color="#10b981" /></div>
            <div><div className="flex justify-between"><span className="text-amber-300">Unseen-data error</span><span className="font-mono">{testErr > 999 ? '>999' : testErr.toFixed(1)} pips</span></div><Bar value={testErr / 60} color="#f59e0b" /></div>
          </div>
          <p className="text-xs text-gray-400">{deg >= 7 ? 'Overfitting: the curve bends to fit every wiggle of history and then flies off in the future.' : deg <= 1 ? 'A simple trend line: imperfect on history, but no wild guesses.' : 'Increase the degree and watch the gap between the two errors.'}</p>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Neural network forward pass ----------------
const sig = (z: number) => 1 / (1 + Math.exp(-z));
const W1 = [[2.2, -1.4], [-1.8, 2.4], [1.1, 1.3]];
const B1 = [-0.4, -0.2, -1.2];
const W2 = [[2.6, -2.2, 0.6], [-2.4, 2.5, 0.4]];

export function NeuralNet() {
  const [x, setX] = useState([0.8, 0.3]);
  const h = W1.map((w, i) => sig(w[0] * x[0] + w[1] * x[1] + B1[i]));
  const z = W2.map((w) => w.reduce((s, wi, j) => s + wi * h[j], 0));
  const ex = z.map(Math.exp), sm = ex.map((e) => e / ex.reduce((a, b) => a + b, 0));
  const pos = { in: [[40, 70], [40, 150]], hid: [[160, 50], [160, 110], [160, 170]], out: [[280, 80], [280, 140]] };
  const edge = (w: number, a: number) => ({ stroke: w > 0 ? '#22d3ee' : '#f472b6', strokeOpacity: 0.15 + 0.7 * a, strokeWidth: 0.5 + Math.abs(w) });
  return (
    <SimFrame title="Neural network forward pass" icon="Workflow"
      shows="Inputs flow through weighted connections; each hidden neuron applies an activation function; softmax turns output scores into probabilities that sum to 1."
      omits="Weights here are fixed for illustration; training (backpropagation) would learn them from labelled examples.">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 items-center">
        <svg viewBox="0 0 330 220" className="w-full">
          {pos.in.map((a, i) => pos.hid.map((b, j) => <line key={`${i}${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...edge(W1[j][i], x[i])} />))}
          {pos.hid.map((a, j) => pos.out.map((b, k) => <line key={`${j}${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...edge(W2[k][j], h[j])} />))}
          {pos.in.map(([cx, cy], i) => <g key={i}><circle cx={cx} cy={cy} r={18} fill={`rgba(34,211,238,${x[i]})`} stroke="#22d3ee" /><text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="#fff">{x[i].toFixed(1)}</text></g>)}
          {pos.hid.map(([cx, cy], j) => <g key={j}><circle cx={cx} cy={cy} r={16} fill={`rgba(167,139,250,${h[j]})`} stroke="#a78bfa" /><text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="#fff">{h[j].toFixed(2)}</text></g>)}
          {pos.out.map(([cx, cy], k) => <g key={k}><circle cx={cx} cy={cy} r={20} fill={`rgba(245,158,11,${sm[k]})`} stroke="#f59e0b" /><text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="#fff">{Math.round(sm[k] * 100)}%</text></g>)}
          <text x={40} y={200} textAnchor="middle" fontSize={10} fill="#64748b">input layer</text>
          <text x={160} y={210} textAnchor="middle" fontSize={10} fill="#64748b">hidden layer</text>
          <text x={280} y={200} textAnchor="middle" fontSize={10} fill="#64748b">output (softmax)</text>
        </svg>
        <div className="space-y-3">
          <Slider label="Input 1: ear pointiness" value={x[0]} min={0} max={1} step={0.1} onChange={(v) => setX([v, x[1]])} />
          <Slider label="Input 2: body size" value={x[1]} min={0} max={1} step={0.1} onChange={(v) => setX([x[0], v])} />
          <div className="rounded-xl bg-white/5 p-3 text-sm">
            <p>Cat: <b>{Math.round(sm[0] * 100)}%</b> · Dog: <b>{Math.round(sm[1] * 100)}%</b></p>
            <p className="text-xs text-gray-400 mt-1">Cyan edges = positive weights, pink = negative. Brighter = stronger signal.</p>
          </div>
        </div>
      </div>
    </SimFrame>
  );
}
