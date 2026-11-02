import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimFrame, Seg, Slider, Bar } from '../ui';

// ---------------- Shared fruit scene ----------------
function Fruit({ seg }: { seg?: boolean }) {
  return (
    <g>
      {/* banana */}
      <path d="M 40 150 Q 80 210 160 170 Q 150 160 140 165 Q 80 185 55 140 Z" fill={seg ? '#facc1599' : '#facc15'} stroke={seg ? '#fde047' : '#ca8a04'} strokeWidth={seg ? 2 : 1.5} />
      {/* apple */}
      <circle cx={215} cy={120} r={42} fill={seg ? '#ef444499' : '#dc2626'} stroke={seg ? '#fca5a5' : 'none'} strokeWidth={2} />
      <path d="M 215 80 q 4 -14 14 -18" stroke="#78350f" strokeWidth={4} fill="none" />
      <ellipse cx={230} cy={70} rx={10} ry={5} fill={seg ? '#22c55e99' : '#16a34a'} transform="rotate(-25 230 70)" />
      {/* orange */}
      <circle cx={300} cy={160} r={34} fill={seg ? '#fb923c99' : '#f97316'} stroke={seg ? '#fdba74' : 'none'} strokeWidth={2} />
      {!seg && <circle cx={292} cy={150} r={4} fill="#fdba74" />}
    </g>
  );
}
const DET = [
  { label: 'banana', conf: 0.94, box: [36, 132, 128, 70], c: '#facc15' },
  { label: 'apple', conf: 0.91, box: [170, 60, 90, 104], c: '#ef4444' },
  { label: 'orange', conf: 0.88, box: [264, 124, 72, 72], c: '#fb923c' },
  { label: 'lemon', conf: 0.31, box: [266, 126, 70, 70], c: '#fde047' },
  { label: 'cup', conf: 0.12, box: [180, 150, 60, 40], c: '#94a3b8' },
];

export function VisionLab() {
  const [mode, setMode] = useState<'cls' | 'det' | 'seg' | 'mm'>('cls');
  const [th, setTh] = useState(0.5);
  return (
    <SimFrame title="Vision laboratory" icon="ScanEye"
      controls={<Seg label="Task" value={mode} onChange={setMode} options={[{ value: 'cls', label: 'Classification' }, { value: 'det', label: 'Detection' }, { value: 'seg', label: 'Segmentation' }, { value: 'mm', label: 'Multimodal' }]} />}
      shows="The same image analysed four ways: one label for the whole image; labelled bounding boxes; per-pixel masks; and a natural-language description. Lower the confidence threshold to see weaker (wrong) detections appear."
      omits="Predictions and confidences are illustrative. Real models output many more candidate boxes, refined by techniques such as non-maximum suppression.">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4">
        <svg viewBox="0 0 360 230" className="w-full rounded-xl" style={{ background: 'linear-gradient(#1e293b, #0f172a)' }} role="img" aria-label="Photo of a banana, an apple and an orange">
          <rect x={0} y={190} width={360} height={40} fill="#334155" />
          <Fruit seg={mode === 'seg'} />
          {mode === 'det' && DET.filter((d) => d.conf >= th).map((d) => (
            <motion.g key={d.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${d.box[0]}px ${d.box[1]}px` }}>
              <rect x={d.box[0]} y={d.box[1]} width={d.box[2]} height={d.box[3]} fill="none" stroke={d.c} strokeWidth={2.5} strokeDasharray={d.conf < 0.5 ? '5 4' : undefined} />
              <rect x={d.box[0]} y={d.box[1] - 15} width={d.label.length * 7 + 34} height={15} fill={d.c} />
              <text x={d.box[0] + 3} y={d.box[1] - 4} fontSize={10} fill="#050a17" fontWeight={700}>{d.label} {d.conf.toFixed(2)}</text>
            </motion.g>
          ))}
          {mode === 'cls' && <g><rect x={10} y={10} width={150} height={26} rx={6} fill="#050a17cc" /><text x={20} y={28} fontSize={13} fill="#fff" fontWeight={700}>apple · 0.47</text></g>}
          {mode === 'mm' && <g><rect x={10} y={10} width={340} height={26} rx={6} fill="#050a17cc" /><text x={20} y={28} fontSize={12} fill="#fff">"A banana, a red apple and an orange on a table."</text></g>}
        </svg>
        <div className="space-y-3 text-sm">
          {mode === 'cls' && (
            <div className="space-y-2">
              <p className="text-gray-300">Classification returns <b>one</b> label for the main subject — so with three fruits it can only say one thing:</p>
              {[['apple', 0.47], ['banana', 0.29], ['orange', 0.21], ['lemon', 0.03]].map(([l, p]) => <div key={l as string} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-2 text-xs"><span>{l}</span><Bar value={p as number} /><span className="font-mono text-right">{p}</span></div>)}
              <p className="text-xs text-gray-500">Softmax probabilities sum to 1.</p>
            </div>
          )}
          {mode === 'det' && (
            <div className="space-y-3">
              <Slider label="Confidence threshold" value={th} min={0.05} max={0.95} step={0.05} onChange={setTh} format={(v) => v.toFixed(2)} />
              <ul className="text-xs space-y-1">{DET.map((d) => <li key={d.label} className={d.conf >= th ? 'text-gray-100' : 'text-gray-600 line-through'}>{d.label} — {d.conf.toFixed(2)} — box [{d.box.join(', ')}]</li>)}</ul>
              {th < 0.35 && <p className="text-xs text-amber-300">Low threshold: false positives ("lemon", "cup") appear.</p>}
            </div>
          )}
          {mode === 'seg' && <p className="text-gray-300">Every pixel is assigned a class. The coloured masks follow each fruit's exact outline — far more precise than a box. Used for medical scans, road-surface detection and background removal.</p>}
          {mode === 'mm' && <p className="text-gray-300">A multimodal model combines vision and language embeddings, so it can describe the scene, answer questions about it, or suggest tags: <span className="text-gray-100">#fruit #healthy #still-life</span>.</p>}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Convolution lab ----------------
const IMG = Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (_, c) => (r >= 2 && r <= 4 && c >= 2 && c <= 4 ? 255 : 0)));
const KERNELS: Record<string, { k: number[][]; name: string; note: string }> = {
  laplace: { k: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], name: 'Laplace (edges)', note: 'Highlights edges: flat regions → 0, boundaries → large values.' },
  blur: { k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map((r) => r.map((v) => v / 9)), name: 'Box blur', note: 'Averages neighbours, softening detail.' },
  sharpen: { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], name: 'Sharpen', note: 'Boosts the centre relative to neighbours.' },
  identity: { k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], name: 'Identity', note: 'Leaves the image unchanged.' },
};
function convolve(img: number[][], k: number[][]) {
  const H = img.length, W = img[0].length;
  return Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => {
    if (r === 0 || c === 0 || r === H - 1 || c === W - 1) return null;
    let s = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) s += img[r + i][c + j] * k[i + 1][j + 1];
    return s;
  }));
}
function ImageCanvas({ kernel }: { kernel: number[][] }) {
  const a = useRef<HTMLCanvasElement>(null), b = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const N = 64;
    const img = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => {
      const inCircle = (x - 22) ** 2 + (y - 26) ** 2 < 150, inRect = x > 34 && x < 56 && y > 30 && y < 54, tri = y > 6 && y < 22 && x > 36 + (y - 6) * 0 && x < 60 - (22 - y) * 0.9 && x > 40;
      return inCircle ? 230 : inRect ? 150 : tri ? 90 : 20 + ((x * 7 + y * 3) % 10);
    }));
    const out = convolve(img, kernel);
    const paint = (cv: HTMLCanvasElement | null, data: (number | null)[][]) => {
      if (!cv) return; const ctx = cv.getContext('2d')!; cv.width = N; cv.height = N;
      const id = ctx.createImageData(N, N);
      data.forEach((row, y) => row.forEach((v, x) => { const g = Math.max(0, Math.min(255, v ?? 0)); const i = (y * N + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = g; id.data[i + 3] = 255; }));
      ctx.putImageData(id, 0, 0);
    };
    paint(a.current, img); paint(b.current, out);
  }, [kernel]);
  return (
    <div className="grid grid-cols-2 gap-2">
      <figure><canvas ref={a} className="w-full rounded-lg" style={{ imageRendering: 'pixelated' }} /><figcaption className="text-[10px] text-gray-500 text-center">original</figcaption></figure>
      <figure><canvas ref={b} className="w-full rounded-lg" style={{ imageRendering: 'pixelated' }} /><figcaption className="text-[10px] text-gray-500 text-center">filtered</figcaption></figure>
    </div>
  );
}
export function ConvolutionLab() {
  const [kn, setKn] = useState('laplace');
  const [pos, setPos] = useState(0);
  const K = KERNELS[kn].k;
  const out = useMemo(() => convolve(IMG, K), [K]);
  const r = 1 + Math.floor(pos / 5), c = 1 + (pos % 5);
  const terms = [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => [IMG[r + i][c + j], K[i + 1][j + 1]]));
  const sum = terms.reduce((s, [p, k]) => s + p * k, 0);
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));
  const cell = (v: number | null, hi: boolean, raw?: boolean) => (
    <div className={`aspect-square grid place-items-center text-[9px] sm:text-[10px] font-mono rounded-[3px] ${hi ? 'ring-2 ring-amber-300' : ''}`}
      style={{ background: v === null ? '#0f172a' : `rgb(${Math.max(0, Math.min(255, v))},${Math.max(0, Math.min(255, v))},${Math.max(0, Math.min(255, v))})`, color: v !== null && v > 140 ? '#050a17' : '#cbd5e1' }}>{v === null ? 'pad' : raw ? Math.round(v) : Math.round(v)}</div>
  );
  return (
    <SimFrame title="Convolutional filter lab" icon="Grid3x3"
      controls={<Seg label="Kernel" value={kn} onChange={setKn} options={Object.entries(KERNELS).map(([k, v]) => ({ value: k, label: v.name }))} />}
      shows="The 3×3 kernel slides across the 7×7 image from the notes. At each position, multiply the nine pixels by the nine weights and add them up — that sum becomes one output pixel."
      omits="Out-of-range values are clipped to 0–255 for display; edge pixels are padded. CNNs learn kernel weights rather than using fixed ones.">
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div>
          <p className="text-xs text-gray-400 mb-1">Input (7×7)</p>
          <div className="grid grid-cols-7 gap-0.5">{IMG.flatMap((row, i) => row.map((v, j) => <div key={`${i}${j}`}>{cell(v, Math.abs(i - r) <= 1 && Math.abs(j - c) <= 1)}</div>))}</div>
          <div className="mt-2"><Slider label="Kernel position" value={pos} min={0} max={24} onChange={setPos} format={(v) => `row ${1 + Math.floor(v / 5)}, col ${1 + (v % 5)}`} /></div>
        </div>
        <div className="text-xs">
          <p className="text-gray-400 mb-1">Kernel · {KERNELS[kn].note}</p>
          <div className="grid grid-cols-3 gap-0.5 w-32 mb-3">{K.flat().map((v, i) => <div key={i} className="aspect-square grid place-items-center font-mono rounded bg-violet-500/20 text-violet-100">{fmt(v)}</div>)}</div>
          <p className="font-mono text-gray-300 leading-relaxed">{terms.map(([p, k], i) => `(${p}×${fmt(k)})${i < 8 ? ' + ' : ''}`).join('')}</p>
          <p className="font-mono text-white text-sm mt-1">= {fmt(sum)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Output (clipped to 0–255)</p>
          <div className="grid grid-cols-7 gap-0.5">{out.flatMap((row, i) => row.map((v, j) => <div key={`${i}${j}`}>{cell(v, i === r && j === c)}</div>))}</div>
        </div>
      </div>
      <div className="mt-5 max-w-sm mx-auto"><p className="text-xs text-gray-400 mb-1 text-center">The same kernel on a larger image</p><ImageCanvas kernel={K} /></div>
    </SimFrame>
  );
}

// ---------------- CNN flow ----------------
const CNN = [
  { t: 'Input image', d: 'A labelled training image: banana (class 1).' },
  { t: 'Convolution', d: 'Several learned filters each produce a feature map — edges, curves, colour blobs.' },
  { t: 'Pooling', d: 'Feature maps are downsized, keeping the strongest responses.' },
  { t: 'Flatten', d: 'All feature-map values are flattened into one long array.' },
  { t: 'Fully connected', d: 'A dense neural network combines the features.' },
  { t: 'Softmax output', d: 'Probabilities per class. Compared with the true label [0, 1, 0] to compute loss; weights (including filter kernels) are updated. Repeat for many epochs.' },
];
export function CNNFlow() {
  const [st, setSt] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const probs = [[0.34, 0.33, 0.33], [0.25, 0.5, 0.25], [0.12, 0.76, 0.12], [0.04, 0.93, 0.03]][Math.min(3, epoch)];
  return (
    <SimFrame title="Convolutional neural network" icon="Layers3"
      controls={<div className="flex gap-1"><button className="ai-btn-ghost text-xs" disabled={!st} onClick={() => setSt(st - 1)}>Back</button><button className="ai-btn text-xs" disabled={st === 5} onClick={() => setSt(st + 1)}>Next</button></div>}
      shows="Filters extract feature maps, pooling shrinks them, flattening feeds a dense network, and softmax gives class probabilities. Training many epochs pushes the right class toward 1."
      omits="Real CNNs stack many convolution and pooling layers with dozens to hundreds of filters each.">
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2">
        {CNN.map((s, i) => (
          <button key={i} onClick={() => setSt(i)} className={`shrink-0 transition-opacity ${i <= st ? 'opacity-100' : 'opacity-25'}`} aria-label={s.t}>
            <div className="h-24 flex items-center justify-center">
              {i === 0 && <svg viewBox="0 0 60 60" className="w-16"><rect width={60} height={60} rx={6} fill="#1e293b" /><path d="M 8 30 Q 25 55 52 36 Q 48 32 44 34 Q 24 44 14 26 Z" fill="#facc15" /></svg>}
              {i === 1 && <div className="relative w-20 h-20">{[0, 1, 2, 3].map((k) => <div key={k} className="absolute w-14 h-14 rounded border border-cyan-400/50" style={{ left: k * 5, top: k * 5, background: `rgba(34,211,238,${0.1 + k * 0.08})` }} />)}</div>}
              {i === 2 && <div className="relative w-14 h-14">{[0, 1, 2, 3].map((k) => <div key={k} className="absolute w-9 h-9 rounded border border-violet-400/50" style={{ left: k * 4, top: k * 4, background: `rgba(167,139,250,${0.1 + k * 0.1})` }} />)}</div>}
              {i === 3 && <div className="flex flex-col gap-0.5">{Array.from({ length: 12 }).map((_, k) => <div key={k} className="w-3 h-1.5 rounded-sm" style={{ background: `rgba(245,158,11,${0.2 + ((k * 37) % 8) / 10})` }} />)}</div>}
              {i === 4 && <svg viewBox="0 0 60 80" className="w-14">{[0, 1, 2, 3].map((a) => [0, 1, 2].map((b) => <line key={`${a}${b}`} x1={8} y1={10 + a * 20} x2={52} y2={20 + b * 20} stroke="#34d39966" />))}{[0, 1, 2, 3].map((a) => <circle key={a} cx={8} cy={10 + a * 20} r={4} fill="#34d399" />)}{[0, 1, 2].map((b) => <circle key={b} cx={52} cy={20 + b * 20} r={4} fill="#34d399" />)}</svg>}
              {i === 5 && <div className="space-y-1 w-24">{['apple', 'banana', 'orange'].map((l, k) => <div key={l} className="text-[10px]"><div className="flex justify-between"><span>{l}</span><span className="font-mono">{probs[k].toFixed(2)}</span></div><Bar value={probs[k]} color={k === 1 ? '#facc15' : '#64748b'} /></div>)}</div>}
            </div>
            <p className="text-[10px] text-gray-300 text-center mt-1">{s.t}</p>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait"><motion.p key={st} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-300 mt-2"><b className="text-white">{CNN[st].t}: </b>{CNN[st].d}</motion.p></AnimatePresence>
      {st === 5 && <div className="flex items-center gap-3 mt-3"><button className="ai-btn text-xs" onClick={() => setEpoch((e) => e + 1)}>Train another epoch</button><span className="text-xs text-gray-400">epochs: {epoch} · loss {(-Math.log(probs[1])).toFixed(2)}</span></div>}
    </SimFrame>
  );
}

// ---------------- Vision transformer patches ----------------
export function ViTPatches() {
  const [sel, setSel] = useState(5);
  const N = 4;
  // Hand-set attention for illustration: patches showing the same object attend to each other.
  const obj = [0, 0, 1, 1, 0, 2, 1, 1, 2, 2, 0, 3, 2, 2, 3, 3];
  const att = (i: number) => (i === sel ? 0 : obj[i] === obj[sel] ? 0.8 : Math.abs((i % N) - (sel % N)) + Math.abs(Math.floor(i / N) - Math.floor(sel / N)) === 1 ? 0.35 : 0.08);
  const vec = (i: number) => [0, 1, 2, 3].map((k) => (Math.sin(i * 1.7 + k * 2.1 + obj[i] * 3) + 1) / 2);
  return (
    <SimFrame title="Vision transformer: patches as tokens" icon="LayoutGrid"
      shows="The image is cut into patches; each patch becomes a vector (like a word token). Attention links patches that belong together — here, patches of the same fruit attend strongly to each other."
      omits="Real ViTs use e.g. 16×16-pixel patches, positional encodings, and hundreds of dimensions per patch embedding. Weights here are illustrative.">
      <div className="grid md:grid-cols-[1fr_1fr] gap-5 items-center">
        <div className="relative max-w-xs mx-auto w-full">
          <svg viewBox="0 0 360 230" className="w-full rounded-xl" style={{ background: 'linear-gradient(#1e293b, #0f172a)' }}><Fruit /></svg>
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
            {Array.from({ length: N * N }, (_, i) => (
              <button key={i} onClick={() => setSel(i)} aria-label={`Patch ${i + 1}`} className="border border-white/20 transition-colors" style={{ background: i === sel ? 'color-mix(in srgb, var(--accent) 45%, transparent)' : `rgba(245,158,11,${att(i) * 0.45})` }} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Selected patch <b>#{sel + 1}</b> → embedding vector:</p>
          <div className="flex gap-1 items-end h-16">{vec(sel).map((v, k) => <motion.div key={k} animate={{ height: `${v * 100}%` }} className="w-6 rounded-t" style={{ background: ['#22d3ee', '#a78bfa', '#f472b6', '#f59e0b'][k] }} />)}</div>
          <p className="text-xs font-mono text-gray-400">[{vec(sel).map((v) => v.toFixed(2)).join(', ')}, …]</p>
          <p className="text-xs text-gray-500">Amber shading = attention from the selected patch. Click another patch.</p>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Diffusion ----------------
export function Diffusion() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef<ImageData | null>(null);
  const STEPS = 10;
  useEffect(() => {
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 72;
    const g = cv.getContext('2d')!;
    const sky = g.createLinearGradient(0, 0, 0, 72); sky.addColorStop(0, '#7dd3fc'); sky.addColorStop(1, '#bbf7d0'); g.fillStyle = sky; g.fillRect(0, 0, 96, 72);
    g.fillStyle = '#4ade80'; g.fillRect(0, 54, 96, 18);
    g.fillStyle = '#92400e'; g.beginPath(); g.ellipse(46, 44, 20, 10, 0, 0, Math.PI * 2); g.fill(); // body
    g.beginPath(); g.ellipse(68, 34, 9, 8, 0, 0, Math.PI * 2); g.fill(); // head
    g.fillRect(30, 48, 4, 12); g.fillRect(40, 50, 4, 10); g.fillRect(52, 50, 4, 10); g.fillRect(60, 48, 4, 12); // legs
    g.beginPath(); g.ellipse(72, 27, 3, 5, 0.4, 0, Math.PI * 2); g.fillStyle = '#78350f'; g.fill(); // ear
    g.strokeStyle = '#a16207'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 40); g.lineTo(90, 36); g.stroke(); // stick
    g.fillStyle = '#111'; g.fillRect(72, 31, 2, 2);
    target.current = g.getImageData(0, 0, 96, 72);
  }, []);
  useEffect(() => {
    const cv = ref.current; if (!cv || !target.current) return;
    cv.width = 96; cv.height = 72;
    const ctx = cv.getContext('2d')!;
    const out = ctx.createImageData(96, 72);
    const a = 1 - step / STEPS;
    let s = 99;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const t = target.current.data;
    const blur = Math.round(a * 6);
    for (let y = 0; y < 72; y++) for (let x = 0; x < 96; x++) {
      const sx = Math.min(95, Math.floor(x / (blur + 1)) * (blur + 1)), sy = Math.min(71, Math.floor(y / (blur + 1)) * (blur + 1));
      const ti = (sy * 96 + sx) * 4, i = (y * 96 + x) * 4;
      for (let k = 0; k < 3; k++) out.data[i + k] = t[ti + k] * (1 - a) + rnd() * 255 * a;
      out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [step]);
  return (
    <SimFrame title="Diffusion: from noise to image" icon="Sparkle"
      shows="Generation starts from random noise. At each step the model removes some noise, guided by the prompt, until a coherent image emerges."
      omits="This blends a pre-drawn picture with noise to illustrate the idea; a real diffusion model predicts and subtracts noise with a neural network at every step, typically over 20–50 steps.">
      <p className="text-sm text-gray-300 mb-3">Prompt: <span className="text-white font-medium">"A dog carrying a stick in its mouth"</span></p>
      <div className="grid md:grid-cols-[1.3fr_1fr] gap-4 items-center">
        <canvas ref={ref} className="w-full rounded-xl" style={{ imageRendering: step < 6 ? 'pixelated' : 'auto', aspectRatio: '4 / 3' }} aria-label={`Diffusion step ${step} of ${STEPS}`} role="img" />
        <div className="space-y-3">
          <Slider label="Denoising step" value={step} min={0} max={STEPS} onChange={setStep} format={(v) => `${v} / ${STEPS}`} />
          <div className="flex gap-2"><button className="ai-btn" onClick={() => setStep((x) => Math.min(STEPS, x + 1))}>Denoise one step</button><button className="ai-btn-ghost" onClick={() => setStep(0)}>Back to noise</button></div>
          <p className="text-xs text-gray-400">{step === 0 ? 'Pure noise.' : step < 4 ? 'Rough colour regions emerge: sky, grass.' : step < 8 ? 'Shapes form: a body, legs, a stick.' : 'Fine detail: the image now matches the prompt.'}</p>
        </div>
      </div>
    </SimFrame>
  );
}
