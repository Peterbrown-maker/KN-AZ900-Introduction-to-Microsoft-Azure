import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Pause, Play, Brain, Cpu, Box, PackageOpen, Copy } from 'lucide-react';
import { ElectricBrainCanvas } from '../sims/foundations';
import { navigate } from '../router';
import { lessonRefs } from '../data';

const soft = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };

function Heading({ kicker, children, delay = 0 }: { kicker: string; children: React.ReactNode; delay?: number }) {
  return (
    <>
      <motion.p initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.35em' }} transition={{ ...soft, delay }} className="text-[11px] sm:text-xs uppercase text-cyan-200/80">{kicker}</motion.p>
      <motion.h2 initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ ...soft, delay: delay + 0.2 }} className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mt-3 leading-[1.05]">{children}</motion.h2>
    </>
  );
}
const Body = ({ children, delay = 0.9 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...soft, delay }} className="text-base sm:text-lg text-gray-300 leading-relaxed mt-6 max-w-2xl mx-auto space-y-4">{children}</motion.div>
);

function NeuronAnim() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto mt-6" aria-hidden="true">
      {[30, 90, 150].map((y, i) => (
        <g key={y}>
          <circle cx={40} cy={y} r={14} fill="#22d3ee33" stroke="#22d3ee" />
          <text x={40} y={y + 4} textAnchor="middle" fontSize={10} fill="#e2e8f0">x{i + 1}</text>
          <line x1={54} y1={y} x2={196} y2={90} stroke="#22d3ee" strokeOpacity={0.4} strokeWidth={[3, 1.5, 2.2][i]} />
          <text x={120} y={y + (90 - y) * 0.45 - 6} fontSize={10} fill="#94a3b8">w{i + 1}</text>
          {!reduce && <motion.circle r={4} fill="#a78bfa" initial={{ cx: 54, cy: y }} animate={{ cx: [54, 196], cy: [y, 90] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35, repeatDelay: 1 }} />}
        </g>
      ))}
      <motion.circle cx={230} cy={90} r={34} fill="#a78bfa22" stroke="#a78bfa" strokeWidth={2} animate={reduce ? undefined : { scale: [1, 1.12, 1] }} transition={{ duration: 2.6, repeat: Infinity, delay: 1.5 }} style={{ transformOrigin: '230px 90px' }} />
      <text x={230} y={86} textAnchor="middle" fontSize={12} fill="#fff">Σ wᵢxᵢ</text>
      <text x={230} y={102} textAnchor="middle" fontSize={10} fill="#c4b5fd">≥ threshold?</text>
      <line x1={264} y1={90} x2={360} y2={90} stroke="#a78bfa" strokeWidth={2} />
      <motion.circle cx={380} cy={90} r={16} fill="#a78bfa" animate={reduce ? undefined : { opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.6, repeat: Infinity, delay: 1.8 }} />
      <text x={380} y={124} textAnchor="middle" fontSize={10} fill="#94a3b8">fires (1)</text>
    </svg>
  );
}

const SLIDES = [
  { k: 'what', dur: 11000, render: () => (
    <>
      <Heading kicker="Prologue">What is artificial intelligence?</Heading>
      <Body>
        <p>AI is intelligence demonstrated by machines. Its story begins in the 1950s, alongside the first modern computers.</p>
        <p>It moved from <span className="text-white">symbolic AI</span> — hand-written rules and logic — to AI built on <span className="text-white">data and statistics</span>. Today, <span className="text-cyan-200">machine learning</span> uses large data sets to train models, such as artificial neural networks, to perform tasks without being explicitly programmed to do so.</p>
      </Body>
    </>
  ) },
  { k: 'brain', dur: 13000, brain: true, render: () => (
    <>
      <div className="h-6" />
      <Heading kicker="1936 – 1943" delay={2.2}>An electric brain</Heading>
      <Body delay={3}>
        <p>Alan Turing showed that a machine manipulating symbols with the right rules could carry out any computation.</p>
        <p>In 1943, Warren McCulloch and Walter Pitts showed that networks of simple units modelled on neurons — passing signals back and forth — could compute logic like a Turing machine. Perhaps the brain is a kind of <span className="text-white">living computer</span>.</p>
      </Body>
    </>
  ) },
  { k: 'realize', dur: 13000, render: () => (
    <>
      <Heading kicker="Multiple realizability">The same pattern, different hardware</Heading>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...soft, delay: 0.8 }} className="flex items-center justify-center gap-6 sm:gap-12 mt-8">
        <div className="text-center"><Brain className="w-16 h-16 sm:w-20 sm:h-20 text-pink-300 mx-auto" strokeWidth={1.2} /><p className="text-xs text-gray-400 mt-2">brain = hardware</p></div>
        <div className="flex gap-1.5">{[0, 1, 2, 3, 4].map((i) => <motion.span key={i} className="w-2 h-2 rounded-full bg-cyan-300" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }} />)}</div>
        <div className="text-center"><Cpu className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-300 mx-auto" strokeWidth={1.2} /><p className="text-xs text-gray-400 mt-2">computer = hardware</p></div>
      </motion.div>
      <Body delay={1.6}>
        <p>Think of the brain as hardware, and the mind as the <span className="text-white">pattern of information processing</span> running on it. If the pattern is what matters, it could in principle run on other hardware — an electric brain.</p>
        <p className="text-sm text-gray-500">A philosophical idea (named later, notably by Hilary Putnam) — not a proven fact.</p>
      </Body>
    </>
  ) },
  { k: 'neuron', dur: 13000, render: () => (
    <>
      <Heading kicker="Threshold logic unit">Artificial neurons</Heading>
      <NeuronAnim />
      <Body delay={1.2}>
        <p>Each of our ~86 billion neurons is a tiny processor: signals in, a signal out. An artificial neuron multiplies each input by a <span className="text-white">weight</span>, adds them up, and fires if the total passes a <span className="text-white">threshold</span> — its <span className="text-cyan-200">activation function</span>.</p>
      </Body>
    </>
  ) },
  { k: 'mind', dur: 11000, render: () => (
    <>
      <Heading kicker="Replicating the mind">Could a mind be copied?</Heading>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...soft, delay: 0.8 }} className="flex justify-center gap-3 mt-8">
        {[0, 1, 2].map((i) => <motion.div key={i} initial={{ x: 0, opacity: 0 }} animate={{ x: (i - 1) * 24, opacity: 1 - i * 0.25 }} transition={{ ...soft, delay: 1 + i * 0.4 }}><Copy className="w-12 h-12 text-violet-300" strokeWidth={1.2} /></motion.div>)}
      </motion.div>
      <Body delay={1.6}>
        <p>Computationalists argue that if thought is computable, a program replicating a mind could be copied and moved like any software.</p>
        <p className="text-sm text-gray-500">This remains speculation. Today's AI models learn statistical patterns — they do not replicate human minds.</p>
      </Body>
    </>
  ) },
  { k: 'box', dur: 13000, render: () => (
    <>
      <Heading kicker="Transparent thinking">The beetle in the box</Heading>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...soft, delay: 0.8 }} className="flex items-end justify-center gap-10 mt-8">
        <div className="text-center"><Box className="w-16 h-16 text-gray-400 mx-auto" strokeWidth={1.2} /><p className="text-xs text-gray-500 mt-2">a human mind: closed</p></div>
        <div className="text-center"><PackageOpen className="w-16 h-16 text-emerald-300 mx-auto" strokeWidth={1.2} /><p className="text-xs text-gray-500 mt-2">a machine: can be opened</p></div>
      </motion.div>
      <Body delay={1.6}>
        <p>Ludwig Wittgenstein compared our thoughts to a beetle in a box only we can see — I can never be sure your "beetle" means what mine does.</p>
        <p>A machine's representations, though, can be <span className="text-white">inspected</span>: open the box and see exactly what it means by "beetle".</p>
      </Body>
    </>
  ) },
  { k: 'white', dur: 12000, render: () => (
    <>
      <Heading kicker="Transparent processing">From black box to white box</Heading>
      <motion.div className="mx-auto mt-8 w-28 h-28 rounded-2xl border-2" initial={{ background: '#000', borderColor: '#334155' }} animate={{ background: 'rgba(34,211,238,0.08)', borderColor: '#22d3ee' }} transition={{ duration: 3, delay: 1.5 }} />
      <Body delay={1.2}>
        <p>Large neural networks are often a <span className="text-white">black box</span> — too complex to observe, so errors and biases are hard to check.</p>
        <p><span className="text-cyan-200">Interpretable machine learning</span> ("white-box AI") shows not just the result, but how it was reached.</p>
      </Body>
    </>
  ) },
  { k: 'go', dur: 0, render: (start: () => void) => (
    <>
      <Heading kicker="AI-901 · Introduction to AI in Azure">Your journey begins</Heading>
      <Body>
        <p>Fourteen chapters. From the first artificial neuron to agents running in Microsoft Foundry — explained with animations, simulations and clear notes.</p>
      </Body>
      <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...soft, delay: 1.4 }} onClick={start} className="ai-btn text-base px-7 py-3 mt-10">Begin Chapter 1</motion.button>
    </>
  ) },
];

export function Prologue() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const exit = useCallback(() => navigate({ view: 'home' }), []);
  const start = () => navigate({ view: 'lesson', id: lessonRefs[0].lesson.id });
  const s = SLIDES[i];
  useEffect(() => {
    if (!playing || !s.dur) return;
    const t = setTimeout(() => setI((x) => Math.min(SLIDES.length - 1, x + 1)), s.dur);
    return () => clearTimeout(t);
  }, [i, playing, s.dur]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
      if (e.key === 'ArrowRight') setI((x) => Math.min(SLIDES.length - 1, x + 1));
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [exit]);
  return (
    <div className="fixed inset-0 z-[60] bg-[#03060f] overflow-y-auto" role="dialog" aria-modal="true" aria-label="AI-901 cinematic opening">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.14), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(167,139,250,0.12), transparent 50%)' }} />
      <AnimatePresence>
        {s.brain && <motion.div key="brain" className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}><ElectricBrainCanvas height={typeof window !== 'undefined' ? window.innerHeight : 700} intensity={2} /></motion.div>}
      </AnimatePresence>
      <button onClick={exit} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }} aria-label="Close opening"><X className="w-5 h-5 text-gray-300" /></button>
      <div className="relative min-h-full flex items-center justify-center px-6 py-24">
        <AnimatePresence mode="wait">
          <motion.div key={s.k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.8 }} className={`text-center max-w-3xl ${s.brain ? 'bg-[#03060f]/55 backdrop-blur-[2px] rounded-3xl p-6' : ''}`}>
            {s.render(start)}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="fixed bottom-0 inset-x-0 z-10 flex items-center justify-center gap-4 pb-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={!i} className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30" aria-label="Previous scene"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex gap-1.5">{SLIDES.map((x, j) => <button key={x.k} onClick={() => setI(j)} aria-label={`Scene ${j + 1}`} className={`h-1.5 rounded-full transition-all ${j === i ? 'w-8 bg-cyan-300' : 'w-1.5 bg-white/25'}`} />)}</div>
        <button onClick={() => setPlaying(!playing)} className="p-2 rounded-full bg-white/5 hover:bg-white/10" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
        <button onClick={() => setI(Math.min(SLIDES.length - 1, i + 1))} disabled={i === SLIDES.length - 1} className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30" aria-label="Next scene"><ChevronRight className="w-5 h-5" /></button>
        <button onClick={exit} className="text-xs text-gray-500 hover:text-gray-300 ml-2">Skip</button>
      </div>
    </div>
  );
}
