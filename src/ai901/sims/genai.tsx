import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Dices } from 'lucide-react';
import { SimFrame, Seg, Slider, Bar } from '../ui';

// ---------------- Prompt → model → response (cinematic) ----------------
const scripts = [
  { prompt: 'Explain what a cloud region is in one sentence.', reply: ['A', ' cloud', ' region', ' is', ' a', ' geographic', ' area', ' containing', ' one', ' or', ' more', ' data', 'centres', '.'], alts: { 5: ['geographic', 'physical', 'specific'], 11: ['data', 'server', 'Azure'] } as Record<number, string[]> },
  { prompt: 'Write a haiku about learning AI.', reply: ['Numbers', ' learn', ' to', ' dream', ' —', '\n', 'patterns', ' bloom', ' from', ' quiet', ' data', ',', '\n', 'my', ' mind', ' lights', ' up', ' too', '.'], alts: { 0: ['Numbers', 'Silent', 'Tokens'], 9: ['quiet', 'endless', 'patient'] } as Record<number, string[]> },
  { prompt: 'Summarise: "Revenue rose 12% while costs fell 3%."', reply: ['Revenue', ' grew', ' 12', '%', ' and', ' costs', ' dropped', ' 3', '%,', ' improving', ' margins', '.'], alts: { 1: ['grew', 'rose', 'increased'], 9: ['improving', 'boosting', 'widening'] } as Record<number, string[]> },
];

export function PromptToResponse() {
  const reduce = useReducedMotion();
  const [s, setS] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'tokenise' | 'think' | 'generate' | 'done'>('idle');
  const [n, setN] = useState(0);
  const sc = scripts[s];
  const promptTokens = sc.prompt.match(/\w+|[^\w\s]/g) ?? [];
  useEffect(() => {
    if (phase === 'tokenise') { const t = setTimeout(() => setPhase('think'), reduce ? 0 : 1300); return () => clearTimeout(t); }
    if (phase === 'think') { const t = setTimeout(() => setPhase('generate'), reduce ? 0 : 1400); return () => clearTimeout(t); }
    if (phase === 'generate') {
      if (n >= sc.reply.length) { setPhase('done'); return; }
      const t = setTimeout(() => setN((x) => x + 1), reduce ? 0 : 260);
      return () => clearTimeout(t);
    }
  }, [phase, n, sc.reply.length, reduce]);
  const start = () => { setN(0); setPhase('tokenise'); };
  const altAt = Object.keys(sc.alts).map(Number).filter((k) => k < n).pop();
  return (
    <SimFrame title="Prompt → model → response" icon="Wand2"
      controls={<button className="ai-btn text-xs" onClick={start}><Play className="w-3.5 h-3.5" /> {phase === 'idle' ? 'Play' : 'Replay'}</button>}
      shows="The prompt is split into tokens, processed by the model, and the response is produced one token at a time — each one chosen from a probability distribution over possible next tokens."
      omits="The inner workings (embeddings, attention, many layers) are hidden in the glowing core here; Chapter 4 opens it up.">
      <div className="flex flex-wrap gap-2 mb-4">
        {scripts.map((x, i) => <button key={i} onClick={() => { setS(i); setPhase('idle'); setN(0); }} className={`text-xs px-3 py-1.5 rounded-full border ${i === s ? 'border-transparent text-[#050a17]' : 'border-white/10 text-gray-400'}`} style={i === s ? { background: 'var(--accent)' } : undefined}>{x.prompt.slice(0, 30)}…</button>)}
      </div>
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="rounded-xl bg-white/5 p-4 min-h-[140px]">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Prompt</p>
          {phase === 'idle' ? <p className="text-gray-200">{sc.prompt}</p> : (
            <div className="flex flex-wrap gap-1">
              {promptTokens.map((t, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: phase === 'tokenise' ? 1 : 0.35, y: 0, x: phase === 'tokenise' ? 0 : 30 }} transition={{ delay: reduce ? 0 : i * 0.06 }}
                  className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 text-xs font-mono">{t}</motion.span>
              ))}
            </div>
          )}
        </div>
        <div className="relative w-32 h-32 mx-auto">
          {[0, 1, 2].map((r) => (
            <motion.div key={r} className="absolute rounded-full border" style={{ inset: r * 14, borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)' }}
              animate={phase === 'think' || phase === 'generate' ? { rotate: r % 2 ? -360 : 360, opacity: [0.4, 1, 0.4] } : { rotate: 0, opacity: 0.3 }}
              transition={{ duration: 3 + r, repeat: Infinity, ease: 'linear' }} />
          ))}
          <motion.div className="absolute inset-[44px] rounded-full" style={{ background: 'var(--accent)' }} animate={{ scale: phase === 'think' ? [1, 1.3, 1] : 1, opacity: phase === 'idle' ? 0.3 : 0.9 }} transition={{ duration: 0.8, repeat: phase === 'think' ? Infinity : 0 }} />
          <p className="absolute -bottom-6 inset-x-0 text-center text-[10px] uppercase tracking-widest text-gray-500">{phase === 'think' ? 'attending…' : phase === 'generate' ? 'predicting next token' : 'language model'}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4 min-h-[140px]">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Completion</p>
          <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
            {sc.reply.slice(0, n).map((t, i) => <motion.span key={i} initial={{ opacity: 0, color: '#a78bfa' }} animate={{ opacity: 1, color: '#e5e7eb' }} transition={{ duration: 0.6 }}>{t}</motion.span>)}
            {phase === 'generate' && <span className="inline-block w-2 h-4 align-middle ml-0.5 animate-pulse" style={{ background: 'var(--accent)' }} />}
          </p>
          {altAt !== undefined && (
            <p className="text-[11px] text-gray-500 mt-3">At token {altAt + 1}, candidates were: {sc.alts[altAt].map((a, i) => <span key={a} className={i === 0 ? 'text-violet-300' : ''}>{a}{i < 2 ? ', ' : ''}</span>)}</p>
          )}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Next-token prediction with temperature ----------------
const contexts: { ctx: string; cands: [string, number][] }[] = [
  { ctx: 'I heard a dog', cands: [['bark', 0.62], ['barking', 0.12], ['howl', 0.09], ['growl', 0.07], ['whine', 0.05], ['sing', 0.03], ['meow', 0.02]] },
  { ctx: 'When my dog was a', cands: [['puppy', 0.71], ['baby', 0.08], ['pup', 0.07], ['kid', 0.05], ['cat', 0.03], ['student', 0.03], ['skateboard', 0.03]] },
  { ctx: 'Azure is Microsoft\'s cloud computing', cands: [['platform', 0.78], ['service', 0.1], ['offering', 0.05], ['solution', 0.04], ['brand', 0.02], ['banana', 0.01]] },
  { ctx: 'Tomorrow EUR/USD will close at', cands: [['1.08', 0.18], ['1.09', 0.17], ['1.07', 0.15], ['around', 0.14], ['a', 0.12], ['1.10', 0.12], ['exactly', 0.12]] },
];

export function NextToken() {
  const [c, setC] = useState(0);
  const [T, setT] = useState(1);
  const [samples, setSamples] = useState<string[]>([]);
  const probs = useMemo(() => {
    const logits = contexts[c].cands.map(([, p]) => Math.log(p) / Math.max(0.05, T));
    const m = Math.max(...logits), e = logits.map((l) => Math.exp(l - m)), s = e.reduce((a, b) => a + b, 0);
    return contexts[c].cands.map(([w], i) => [w, e[i] / s] as [string, number]);
  }, [c, T]);
  const sample = (k = 1) => {
    const out: string[] = [];
    for (let j = 0; j < k; j++) { let r = Math.random(); out.push((probs.find(([, p]) => (r -= p) <= 0) ?? probs[0])[0]); }
    setSamples((s) => [...out, ...s].slice(0, 24));
  };
  return (
    <SimFrame title="Next-token prediction" icon="ListOrdered" onReset={() => { setSamples([]); setT(1); }}
      shows="A language model outputs a probability for every candidate next token. Low temperature concentrates probability on the top choice (predictable); high temperature flattens it (creative, riskier)."
      omits="Real models score the entire vocabulary (hundreds of thousands of tokens); these probabilities are illustrative.">
      <div className="flex flex-wrap gap-2 mb-4">
        {contexts.map((x, i) => <button key={i} onClick={() => { setC(i); setSamples([]); }} className={`text-xs px-3 py-1.5 rounded-full border ${i === c ? 'border-transparent text-[#050a17]' : 'border-white/10 text-gray-400'}`} style={i === c ? { background: 'var(--accent)' } : undefined}>"{x.ctx} …"</button>)}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <p className="text-lg text-white font-medium">"{contexts[c].ctx} <span style={{ color: 'var(--accent)' }}>___</span>"</p>
          {probs.map(([w, p]) => (
            <div key={w} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-2 text-sm">
              <span className="font-mono text-gray-200 truncate">{w}</span><Bar value={p} /><span className="text-right font-mono text-gray-400">{(p * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Slider label="Temperature" value={T} min={0.1} max={2} step={0.1} onChange={setT} format={(v) => v.toFixed(1)} />
          <div className="flex gap-2"><button className="ai-btn" onClick={() => sample(1)}><Dices className="w-4 h-4" /> Sample</button><button className="ai-btn-ghost" onClick={() => sample(10)}>Sample ×10</button></div>
          <div className="flex flex-wrap gap-1 min-h-[2rem]">{samples.map((s, i) => <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-xs font-mono text-gray-200">{s}</span>)}</div>
          {c === 3 && <p className="text-xs text-amber-300">Notice: the model happily produces a precise-looking price. It has no market data — any number here is a plausible-sounding guess, not a forecast.</p>}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Verify the claims ----------------
const claims = [
  { t: 'Contoso Bank allows refunds within 30 days of purchase.', kind: 'specific', note: 'A specific policy detail. The model has no access to Contoso\'s private policy — verify against the source.' },
  { t: 'Refund policies usually require proof of purchase.', kind: 'general', note: 'General background knowledge; low risk, but still not company-specific.' },
  { t: 'CEO Maria Lopez said in 2024: "Customers come first, always."', kind: 'fabricated', note: 'Named person + date + quote is a classic hallucination pattern. No source supplied — treat as unverified.' },
  { t: 'The refund fee is exactly 2.5% for international cards.', kind: 'specific', note: 'Precise numbers are high-risk. Verify.' },
  { t: 'Banks are often regulated by financial authorities.', kind: 'general', note: 'Broadly true general knowledge.' },
  { t: 'Contoso processed 1.2 million refunds last year.', kind: 'fabricated', note: 'An invented statistic with no source.' },
];

export function VerifyClaims() {
  const [flags, setFlags] = useState<boolean[]>(claims.map(() => false));
  const [checked, setChecked] = useState(false);
  const should = claims.map((c) => c.kind !== 'general');
  const score = flags.filter((f, i) => f === should[i]).length;
  return (
    <SimFrame title="Spot the claims that need verification" icon="SearchCheck" onReset={() => { setFlags(claims.map(() => false)); setChecked(false); }}
      shows="Fluent answers mix general knowledge with specific details the model cannot know. Specific names, numbers, quotes and dates without sources should be verified."
      omits="In a grounded (RAG) app, each specific claim would carry a citation you could check.">
      <div className="rounded-xl bg-white/5 p-3 mb-3 text-sm text-gray-400"><b className="text-gray-200">User:</b> What is Contoso Bank's refund policy? <span className="text-xs">(No documents were provided to the model.)</span></div>
      <ul className="space-y-2">
        {claims.map((c, i) => (
          <li key={i}>
            <button onClick={() => !checked && setFlags((f) => f.map((x, j) => (j === i ? !x : x)))} aria-pressed={flags[i]}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${flags[i] ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
              <span className="text-gray-100">{c.t}</span>
              <span className="float-right text-xs text-gray-400">{flags[i] ? '⚑ verify' : 'click to flag'}</span>
              {checked && <span className={`block mt-1 text-xs ${flags[i] === should[i] ? 'text-emerald-300' : 'text-red-300'}`}>{c.note}</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3">
        <button className="ai-btn" onClick={() => setChecked(true)} disabled={checked}>Check my flags</button>
        {checked && <span className="text-sm text-gray-300">{score} / {claims.length} judged correctly</span>}
      </div>
    </SimFrame>
  );
}

// ---------------- Tokenizer explorer ----------------
const VOCAB = ['the', 'a', 'i', 'we', 'to', 'of', 'and', 'is', 'in', 'my', 'was', 'heard', 'dog', 'cat', 'bark', 'loudly', 'at', 'puppy', 'go', 'moon', 'choose', 'cloud', 'azure', 'model', 'learn', 'data', 'token', 'forecast', 'believe', 'like', 'happy', 'ai', 'skate', 'board', 'car', 'price', 'market', 'trade', 'eur', 'usd', 'when', 'it', 'this', 'that', 'not', 'you', 'can', 'will', 'be', 'for', 'on', 'with', 'are', 'compute', 'micro', 'soft'];
const PREFIX = ['un', 're', 'pre', 'dis', 'over', 'under', 'trans'];
const SUFFIX = ['ing', 'ed', 'able', 'ible', 'ly', 'ness', 'tion', 'ers', 'er', 'est', 's', 'ful', 'less', 'ment'];
const PIECES = [...VOCAB, ...PREFIX, ...SUFFIX].sort((a, b) => b.length - a.length);
const idOf = (t: string) => {
  const core = t.replace(/^▁/, '').toLowerCase();
  const v = VOCAB.indexOf(core);
  if (v >= 0) return (t.startsWith('▁') ? 300 : 9000) + v;
  let h = 7; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) % 49000;
  return 1000 + h;
};
function tokenize(text: string) {
  const out: string[] = [];
  const parts = text.match(/\s*[A-Za-z]+|\s*\d|\s*[^\sA-Za-z\d]/g) ?? [];
  for (const raw of parts) {
    const space = /^\s/.test(raw);
    let w = raw.trim();
    const lw = w.toLowerCase();
    if (!/[A-Za-z]/.test(w) || VOCAB.includes(lw)) { out.push((space ? '▁' : '') + w); continue; }
    let first = true;
    while (w.length) {
      const piece = PIECES.find((p) => w.toLowerCase().startsWith(p)) ?? w[0];
      out.push((first && space ? '▁' : '') + w.slice(0, piece.length));
      w = w.slice(piece.length); first = false;
    }
  }
  return out;
}
const TOKCOL = ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399', '#f472b6', '#60a5fa'];

export function Tokenizer() {
  const [text, setText] = useState('I heard a dog bark loudly. Unbelievably, the puppy was unforecastable!');
  const [showIds, setShowIds] = useState(false);
  const toks = useMemo(() => tokenize(text), [text]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <SimFrame title="Tokenisation explorer" icon="Scissors" controls={<Seg label="Display" value={showIds ? 'ids' : 'text'} onChange={(v) => setShowIds(v === 'ids')} options={[{ value: 'text', label: 'Tokens' }, { value: 'ids', label: 'Token IDs' }]} />}
      shows="Common words become single tokens; rare or long words split into sub-word pieces (un + believ + ably). '▁' marks a token that starts with a space. Each distinct token maps to one integer ID."
      omits="This uses a tiny invented vocabulary and greedy matching. Real tokenisers (e.g. byte-pair encoding) learn ~100,000+ pieces from data, so splits and IDs differ.">
      <label className="text-xs text-gray-400" htmlFor="tok-in">Type any text</label>
      <textarea id="tok-in" value={text} onChange={(e) => setText(e.target.value)} rows={2} className="w-full mt-1 rounded-xl bg-black/40 border border-white/10 p-3 text-gray-100 focus:outline-none focus:border-cyan-400/50" />
      <div className="flex flex-wrap gap-1 mt-3" aria-live="polite">
        {toks.map((t, i) => (
          <span key={i} className="px-1.5 py-1 rounded-md text-sm font-mono border" style={{ background: `${TOKCOL[i % TOKCOL.length]}22`, borderColor: `${TOKCOL[i % TOKCOL.length]}55`, color: '#f1f5f9' }}>
            {showIds ? idOf(t) : t}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {[['Characters', text.length], ['Words', words], ['Tokens', toks.length]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white/5 py-2"><p className="text-xl font-bold text-white">{v}</p><p className="text-xs text-gray-400">{k}</p></div>
        ))}
      </div>
    </SimFrame>
  );
}

// ---------------- Embedding space ----------------
export const EMB: Record<string, [number, number, number]> = {
  dog: [0.8, 0.6, 0.1], cat: [0.7, 0.5, 0.2], puppy: [0.9, 0.7, 0.4], kitten: [0.8, 0.6, 0.5], young: [0.1, 0.1, 0.3],
  tree: [0.2, 0.1, 0.9], ball: [0.15, 0.85, 0.1], skateboard: [0.05, 0.75, -0.2], car: [-0.05, 0.6, -0.4],
};
const GROUP: Record<string, string> = { dog: '#22d3ee', cat: '#22d3ee', puppy: '#a78bfa', kitten: '#a78bfa', young: '#f472b6', tree: '#34d399', ball: '#f59e0b', skateboard: '#f59e0b', car: '#f59e0b' };
export const cosine = (a: number[], b: number[]) => {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0), na = Math.hypot(...a), nb = Math.hypot(...b);
  return dot / (na * nb);
};

export function EmbeddingExplorer() {
  const reduce = useReducedMotion();
  const [yaw, setYaw] = useState(-0.6);
  const [pitch, setPitch] = useState(0.35);
  const [sel, setSel] = useState('dog');
  const [spin, setSpin] = useState(!reduce);
  useEffect(() => {
    if (!spin) return;
    let raf = 0; const tick = () => { setYaw((y) => y + 0.004); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [spin]);
  const proj = ([x, y, z]: number[]) => {
    const cx = x * Math.cos(yaw) - z * Math.sin(yaw), cz = x * Math.sin(yaw) + z * Math.cos(yaw);
    const cy = y * Math.cos(pitch) - cz * Math.sin(pitch);
    return [160 + cx * 130, 150 - cy * 130];
  };
  const O = proj([0, 0, 0]);
  const ranked = Object.keys(EMB).filter((w) => w !== sel).map((w) => [w, cosine(EMB[sel], EMB[w])] as const).sort((a, b) => b[1] - a[1]);
  return (
    <SimFrame title="Embedding space" icon="Orbit" controls={<button className="ai-btn-ghost text-xs" onClick={() => setSpin((s) => !s)}>{spin ? 'Stop rotating' : 'Rotate'}</button>}
      shows="Each word is a vector from the origin. Words used in similar contexts point in similar directions (dog ↔ cat, puppy ↔ kitten) while unrelated words (tree, car) point elsewhere."
      omits="These are 3-D toy vectors (from the course notes, plus a few added for contrast). Real embeddings have thousands of dimensions and can't be drawn directly.">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4">
        <div>
          <svg viewBox="0 0 320 260" className="w-full rounded-xl bg-black/40" role="img" aria-label="3D embedding vectors">
            {[[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((a, i) => { const p = proj(a); return <g key={i}><line x1={O[0]} y1={O[1]} x2={p[0]} y2={p[1]} stroke="#334155" /><text x={p[0]} y={p[1]} fontSize={9} fill="#475569">d{i + 1}</text></g>; })}
            {Object.entries(EMB).map(([w, v]) => {
              const p = proj(v); const on = w === sel; const near = ranked[0][0] === w || ranked[1][0] === w;
              return (
                <g key={w} onClick={() => setSel(w)} className="cursor-pointer">
                  <line x1={O[0]} y1={O[1]} x2={p[0]} y2={p[1]} stroke={GROUP[w]} strokeWidth={on ? 3 : near ? 2 : 1.2} strokeOpacity={on || near ? 1 : 0.45} />
                  <circle cx={p[0]} cy={p[1]} r={on ? 6 : 4} fill={GROUP[w]} />
                  <text x={p[0] + 6} y={p[1] - 6} fontSize={11} fill={on ? '#fff' : '#cbd5e1'} fontWeight={on ? 700 : 400}>{w}</text>
                </g>
              );
            })}
          </svg>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Slider label="Rotate" value={Math.round(((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 100) / 100} min={0} max={6.28} step={0.02} onChange={(v) => { setSpin(false); setYaw(v); }} format={(v) => `${Math.round((v * 180) / Math.PI)}°`} />
            <Slider label="Tilt" value={pitch} min={-1.2} max={1.2} step={0.05} onChange={setPitch} format={(v) => `${Math.round((v * 180) / Math.PI)}°`} />
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-1 mb-3">{Object.keys(EMB).map((w) => <button key={w} onClick={() => setSel(w)} className={`text-xs px-2 py-1 rounded-full border ${w === sel ? 'text-[#050a17] border-transparent' : 'border-white/10 text-gray-300'}`} style={w === sel ? { background: GROUP[w] } : undefined}>{w}</button>)}</div>
          <p className="font-mono text-sm text-gray-200 mb-2">{sel} = [{EMB[sel].join(', ')}]</p>
          <p className="text-xs text-gray-400 mb-1">Most similar (cosine similarity):</p>
          <ul className="space-y-1">{ranked.map(([w, c]) => <li key={w} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-xs"><span className="text-gray-200">{w}</span><Bar value={(c + 1) / 2} color={GROUP[w]} /><span className="font-mono text-right text-gray-400">{c.toFixed(2)}</span></li>)}</ul>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Cosine & vector arithmetic lab ----------------
export function CosineLab() {
  const [mode, setMode] = useState<'cos' | 'math'>('cos');
  const [a, setA] = useState('dog');
  const [b, setB] = useState('cat');
  const [expr, setExpr] = useState<[string, '+' | '-', string, '+' | '-' | '', string]>(['kitten', '-', 'puppy', '+', 'dog']);
  const A = EMB[a], B = EMB[b];
  const dot = A.reduce((s, x, i) => s + x * B[i], 0), na = Math.hypot(...A), nb = Math.hypot(...B), cos = dot / (na * nb);
  const angle = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  const words = Object.keys(EMB);
  const res = (() => {
    let v = [...EMB[expr[0]]];
    const ap = (op: string, w: string) => { if (!op || !w) return; v = v.map((x, i) => (op === '+' ? x + EMB[w][i] : x - EMB[w][i])); };
    ap(expr[1], expr[2]); ap(expr[3], expr[4]);
    const used = new Set([expr[0], expr[2], expr[4]]);
    const best = words.filter((w) => !used.has(w)).map((w) => [w, cosine(v, EMB[w])] as const).sort((x, y) => y[1] - x[1])[0];
    return { v, best };
  })();
  const sel = (val: string, on: (v: string) => void, label: string) => (
    <select aria-label={label} value={val} onChange={(e) => on(e.target.value)} className="rounded-lg bg-black/40 border border-white/15 px-2 py-1.5 text-sm text-gray-100">{words.map((w) => <option key={w}>{w}</option>)}</select>
  );
  return (
    <SimFrame title="Cosine similarity & vector arithmetic" icon="Calculator" controls={<Seg label="Mode" value={mode} onChange={setMode} options={[{ value: 'cos', label: 'Cosine' }, { value: 'math', label: 'Arithmetic' }]} />}
      shows="cosine = (A·B)/(‖A‖‖B‖). Values near 1 mean the vectors point the same way. Adding and subtracting vectors can express relationships like 'young'."
      omits="In real models, arithmetic rarely lands exactly on a word — you look for the nearest vector, as done here.">
      {mode === 'cos' ? (
        <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center">
          <div className="space-y-3 font-mono text-sm">
            <div className="flex flex-wrap items-center gap-2 font-sans">A {sel(a, setA, 'Vector A')} B {sel(b, setB, 'Vector B')}</div>
            <p className="text-gray-300">A = [{A.join(', ')}] · B = [{B.join(', ')}]</p>
            <p className="text-gray-300">A·B = {A.map((x, i) => `(${x}×${B[i]})`).join(' + ')} = <b className="text-white">{dot.toFixed(3)}</b></p>
            <p className="text-gray-300">‖A‖ = √({A.map((x) => `${x}²`).join('+')}) = <b className="text-white">{na.toFixed(3)}</b> · ‖B‖ = <b className="text-white">{nb.toFixed(3)}</b></p>
            <p className="text-lg">cosine = {dot.toFixed(3)} / ({na.toFixed(3)} × {nb.toFixed(3)}) = <b style={{ color: 'var(--accent)' }}>{cos.toFixed(3)}</b></p>
            <p className="font-sans text-sm text-gray-400">{cos > 0.9 ? 'High similarity — closely related.' : cos > 0.6 ? 'Moderate similarity.' : 'Low similarity — likely unrelated.'}</p>
          </div>
          <svg viewBox="0 0 160 120" className="w-44">
            <line x1={20} y1={100} x2={150} y2={100} stroke="#22d3ee" strokeWidth={3} />
            <line x1={20} y1={100} x2={20 + 130 * Math.cos((angle * Math.PI) / 180)} y2={100 - 130 * Math.sin((angle * Math.PI) / 180)} stroke="#a78bfa" strokeWidth={3} />
            <text x={60} y={92} fontSize={11} fill="#e2e8f0">{angle.toFixed(0)}°</text>
            <text x={130} y={114} fontSize={10} fill="#22d3ee">A</text>
          </svg>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {sel(expr[0], (v) => setExpr([v, expr[1], expr[2], expr[3], expr[4]]), 'First word')}
            <select aria-label="Operator 1" value={expr[1]} onChange={(e) => setExpr([expr[0], e.target.value as '+' | '-', expr[2], expr[3], expr[4]])} className="rounded-lg bg-black/40 border border-white/15 px-2 py-1.5"><option>+</option><option>-</option></select>
            {sel(expr[2], (v) => setExpr([expr[0], expr[1], v, expr[3], expr[4]]), 'Second word')}
            <select aria-label="Operator 2" value={expr[3]} onChange={(e) => setExpr([expr[0], expr[1], expr[2], e.target.value as '+' | '-' | '', expr[4]])} className="rounded-lg bg-black/40 border border-white/15 px-2 py-1.5"><option value="">(none)</option><option>+</option><option>-</option></select>
            {expr[3] && sel(expr[4], (v) => setExpr([expr[0], expr[1], expr[2], expr[3], v]), 'Third word')}
          </div>
          <p className="font-mono text-sm text-gray-300">= [{res.v.map((x) => x.toFixed(2)).join(', ')}]</p>
          <p className="text-lg text-white">Nearest word: <b style={{ color: 'var(--accent)' }}>{res.best[0]}</b> <span className="text-sm text-gray-400">(cosine {res.best[1].toFixed(3)})</span></p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="ai-btn-ghost" onClick={() => setExpr(['dog', '+', 'young', '', 'dog'])}>dog + young</button>
            <button className="ai-btn-ghost" onClick={() => setExpr(['cat', '+', 'young', '', 'dog'])}>cat + young</button>
            <button className="ai-btn-ghost" onClick={() => setExpr(['puppy', '-', 'young', '', 'dog'])}>puppy − young</button>
            <button className="ai-btn-ghost" onClick={() => setExpr(['kitten', '-', 'puppy', '+', 'dog'])}>kitten − puppy + dog</button>
          </div>
        </div>
      )}
    </SimFrame>
  );
}

// ---------------- Attention visualiser ----------------
const sentences = {
  dog: { toks: ['I', 'heard', 'a', 'dog', 'bark'], heads: {
    meaning: [[.5, .2, .05, .15, .1], [.1, .4, .05, .2, .25], [.1, .1, .3, .4, .1], [.05, .2, .1, .4, .25], [.03, .37, .05, .45, .1]],
    grammar: [[.4, .4, .05, .1, .05], [.35, .3, .05, .2, .1], [.05, .05, .2, .65, .05], [.05, .1, .4, .3, .15], [.1, .2, .05, .55, .1]],
    position: [[.7, .3, 0, 0, 0], [.3, .5, .2, 0, 0], [0, .3, .4, .3, 0], [0, 0, .3, .4, .3], [0, 0, 0, .4, .6]],
  } },
  tree: { toks: ['the', 'bark', 'of', 'the', 'oak', 'tree'], heads: {
    meaning: [[.4, .2, .05, .05, .15, .15], [.03, .25, .05, .02, .3, .35], [.1, .3, .2, .1, .1, .2], [.05, .1, .05, .3, .2, .3], [.02, .25, .03, .05, .3, .35], [.02, .3, .03, .05, .3, .3]],
    grammar: [[.3, .5, .05, .05, .05, .05], [.4, .2, .3, .02, .03, .05], [.05, .4, .2, .3, .02, .03], [.02, .03, .1, .2, .25, .4], [.05, .05, .05, .3, .2, .35], [.05, .1, .1, .3, .3, .15]],
    position: [[.7, .3, 0, 0, 0, 0], [.3, .4, .3, 0, 0, 0], [0, .3, .4, .3, 0, 0], [0, 0, .3, .4, .3, 0], [0, 0, 0, .3, .4, .3], [0, 0, 0, 0, .4, .6]],
  } },
};

export function Attention() {
  const [s, setS] = useState<'dog' | 'tree'>('dog');
  const [head, setHead] = useState<'meaning' | 'grammar' | 'position'>('meaning');
  const [q, setQ] = useState(4);
  const { toks, heads } = sentences[s];
  const qi = Math.min(q, toks.length - 1);
  const row = heads[head][qi];
  const xs = toks.map((_, i) => 30 + i * (300 / (toks.length - 1 || 1)));
  return (
    <SimFrame title="Attention" icon="Spline"
      controls={<Seg label="Sentence" value={s} onChange={(v) => { setS(v); setQ(1); }} options={[{ value: 'dog', label: 'dog bark' }, { value: 'tree', label: 'tree bark' }]} />}
      shows="For the selected token, line thickness shows how much each other token influences its new embedding. Different heads capture different relationships. Notice how 'bark' attends to 'dog' in one sentence and 'oak/tree' in the other — the same token gets a different contextual meaning."
      omits="Weights are hand-set illustrations, not outputs of a trained model. Real attention computes query/key/value projections for every token pair in every layer.">
      <div className="mb-3"><Seg label="Attention head" value={head} onChange={setHead} options={[{ value: 'meaning', label: 'Head 1 · meaning' }, { value: 'grammar', label: 'Head 2 · grammar' }, { value: 'position', label: 'Head 3 · nearby words' }]} /></div>
      <svg viewBox="0 0 360 170" className="w-full">
        {row.map((w, j) => j !== qi && w > 0.01 && (
          <motion.path key={`${s}${head}${qi}${j}`} d={`M ${xs[qi]} 120 Q ${(xs[qi] + xs[j]) / 2} ${120 - 30 - Math.abs(xs[qi] - xs[j]) * 0.35} ${xs[j]} 120`} fill="none" stroke="var(--accent)" strokeWidth={1 + w * 14} strokeOpacity={0.25 + w} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
        ))}
        {toks.map((t, i) => (
          <g key={i} onClick={() => setQ(i)} className="cursor-pointer" role="button" tabIndex={0} aria-label={`Focus token ${t}`} onKeyDown={(e) => e.key === 'Enter' && setQ(i)}>
            <rect x={xs[i] - 26} y={124} width={52} height={28} rx={8} fill={i === qi ? 'var(--accent)' : `rgba(255,255,255,${0.05 + row[i] * 0.6})`} stroke="rgba(255,255,255,0.2)" />
            <text x={xs[i]} y={143} textAnchor="middle" fontSize={13} fill={i === qi ? '#050a17' : '#f1f5f9'} fontWeight={600}>{t}</text>
            <text x={xs[i]} y={166} textAnchor="middle" fontSize={9} fill="#94a3b8">{(row[i] * 100).toFixed(0)}%</text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-gray-400 text-center">Click a token to focus it. Percentages = attention weights from <b className="text-gray-200">"{toks[qi]}"</b> (they sum to 100%).</p>
    </SimFrame>
  );
}

// ---------------- Transformer flow ----------------
const TF_TOKS = ['When', 'my', 'dog', 'was', 'a'];
const tfStages = [
  { t: 'Tokenise', d: 'The prompt is split into tokens with IDs.' },
  { t: 'Embed', d: 'Each token ID is looked up to get its vector (random at the start of training, learned afterwards).' },
  { t: 'Add position', d: 'A positional encoding is added so the model knows token order.' },
  { t: 'Attention', d: 'Multi-head attention mixes in information from the other tokens; "dog" strongly influences what comes next.' },
  { t: 'Feed-forward', d: 'A fully connected network refines each contextual vector.' },
  { t: 'Predict (masked)', d: 'Using only previous tokens, the decoder scores every vocabulary token as the next one.' },
  { t: 'Append & repeat', d: 'The most probable token, "puppy", is appended and the loop repeats until the model predicts the end.' },
];

export function TransformerFlow() {
  const [st, setSt] = useState(0);
  const vec = (i: number, add = 0) => [0.3 + ((i * 37) % 7) / 10 + add, 0.2 + ((i * 53) % 6) / 10, 0.1 + ((i * 29) % 8) / 10 - add / 2].map((x) => Math.min(1, Math.max(0.05, x)));
  return (
    <SimFrame title="Inside the transformer" icon="Cpu" onReset={() => setSt(0)}
      controls={<div className="flex gap-1"><button className="ai-btn-ghost text-xs" disabled={st === 0} onClick={() => setSt(st - 1)}>Back</button><button className="ai-btn text-xs" disabled={st === tfStages.length - 1} onClick={() => setSt(st + 1)}>Next step</button></div>}
      shows="The full journey of a prompt through a transformer, ending in next-token prediction and the generation loop."
      omits="Real models stack dozens of attention + feed-forward layers and use vectors with thousands of dimensions. Many modern LLMs are decoder-only.">
      <ol className="flex flex-wrap gap-1 mb-4">
        {tfStages.map((s, i) => <li key={i}><button onClick={() => setSt(i)} className={`text-[11px] px-2 py-1 rounded-full border ${i === st ? 'text-[#050a17] border-transparent' : i < st ? 'border-white/20 text-gray-300' : 'border-white/10 text-gray-500'}`} style={i === st ? { background: 'var(--accent)' } : undefined}>{i + 1}. {s.t}</button></li>)}
      </ol>
      <div className="min-h-[190px] rounded-xl bg-black/30 p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {[...TF_TOKS, ...(st === 6 ? ['puppy'] : [])].map((t, i) => (
            <motion.div key={t + i} layout initial={i === 5 ? { opacity: 0, y: -20 } : false} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1.5">
              <span className={`px-2 py-1 rounded-md text-sm font-mono ${i === 5 ? 'bg-violet-500/40 text-white' : st === 3 && t === 'dog' ? 'bg-amber-500/40 text-white' : 'bg-white/10 text-gray-100'}`}>{t}</span>
              {st === 0 && <span className="text-[10px] font-mono text-gray-400">#{[611, 434, 3290, 573, 257][i] ?? 15707}</span>}
              {st >= 1 && st <= 4 && (
                <div className="flex gap-0.5 items-end h-10">{vec(i, st >= 2 ? 0.1 * i : 0).map((v, k) => <motion.div key={k} animate={{ height: `${(st >= 3 && i > 2 ? Math.min(1, v + 0.25) : v) * 40}px` }} className="w-2.5 rounded-sm" style={{ background: ['#22d3ee', '#a78bfa', '#f472b6'][k] }} />)}</div>
              )}
              {st === 2 && <span className="text-[10px] text-cyan-300">+ pos {i}</span>}
            </motion.div>
          ))}
        </div>
        {st === 3 && <p className="text-center text-xs text-amber-300 mt-3">"was" and "a" attend strongly to "dog" → the context is about a dog's past.</p>}
        {st === 5 && (
          <div className="max-w-sm mx-auto mt-4 space-y-1.5">
            {[['puppy', 0.71], ['baby', 0.08], ['pup', 0.07], ['cat', 0.03], ['skateboard', 0.01]].map(([w, p]) => (
              <div key={w as string} className="grid grid-cols-[6rem_1fr_3rem] gap-2 items-center text-xs"><span className="font-mono">{w}</span><Bar value={p as number} /><span className="font-mono text-right">{((p as number) * 100).toFixed(0)}%</span></div>
            ))}
            <p className="text-[11px] text-gray-500 pt-1">Masked attention: tokens after "a" are invisible — the model can't peek at the answer.</p>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait"><motion.p key={st} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-gray-300"><b className="text-white">{tfStages[st].t}: </b>{tfStages[st].d}</motion.p></AnimatePresence>
    </SimFrame>
  );
}

