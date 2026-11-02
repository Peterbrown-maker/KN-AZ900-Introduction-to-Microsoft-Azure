import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, SkipForward, RotateCcw, Check, X, ArrowRight } from 'lucide-react';
import { useLab } from './store';

// ---------------- Developer builds the network ----------------
export const BUILD_STEPS = [
  { t: 'Choose a prediction task', d: 'The developer decides what the model should predict: “Is this apple a suitable snack?” — a yes/no (binary) prediction.' },
  { t: 'Define the input features', d: 'The developer chooses which facts about a snack become numbers: Is it healthy? Will it be filling? Is it cheap? Each answer is encoded as a value such as 1 (yes) or 0 (no).' },
  { t: 'Select the architecture', d: 'The developer picks the shape: Input (3) → Hidden (4) → Hidden (3) → Output (1), fully connected between adjacent layers.' },
  { t: 'Create the input layer', d: 'Three input nodes appear. They do not calculate anything — they hold the feature values entering the model (dashed outlines).' },
  { t: 'Create the hidden layers', d: 'Four computational neurons, then three more. Hidden layers let the network combine features in ways a single neuron cannot.' },
  { t: 'Create the output layer', d: 'One output neuron will produce the final prediction.' },
  { t: 'Connect the neurons', d: 'Every neuron is connected to every neuron in the next layer: 3×4 + 4×3 + 3×1 = 27 connections.' },
  { t: 'Give each connection a weight', d: 'Each connection receives a starting weight. Here they are small random values (Xavier initialisation) — the network has learned nothing yet.' },
  { t: 'Give each neuron a bias and activation', d: 'Every computational neuron gets a bias (starting at 0) and an activation function: tanh for hidden neurons, sigmoid for the output.' },
  { t: 'Ready to process input', d: 'The network exists in the engine and can make a prediction — although with random weights, that prediction is meaningless until it is trained.' },
];

export function BuildPanel() {
  const { s, d } = useLab();
  const reduce = useReducedMotion();
  const stage = s.build ?? 10;
  const [auto, setAuto] = useState(!reduce);
  useEffect(() => {
    if (!auto || s.build === null) return;
    if (stage >= 10) { setAuto(false); return; }
    const t = setTimeout(() => d({ t: 'build', stage: stage + 1 }), 2600);
    return () => clearTimeout(t);
  }, [auto, stage, s.build, d]);
  const step = BUILD_STEPS[Math.max(0, stage - 1)];
  return (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">Step {Math.max(1, stage)} of 10 · building the network</p>
      <AnimatePresence mode="wait">
        <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h3 className="text-2xl font-extrabold text-white">{stage === 0 ? 'A developer creates a neural network' : step.t}</h3>
          <p className="text-gray-300 mt-2 leading-relaxed">{stage === 0 ? 'Watch every decision a developer makes before a network can make a single prediction. The network you see is built in the real engine — the same one you will inspect and train.' : step.d}</p>
          {stage === 1 && <div className="nn-card mt-3 text-sm text-white">🍎 “Predict whether an apple is a suitable snack based on the provided features.”</div>}
          {stage === 2 && <ul className="nn-card mt-3 space-y-1 text-sm">{['Is it healthy?', 'Will it be filling?', 'Is it cheap?'].map((f, i) => <li key={f} className="font-mono text-cyan-200">x{i + 1} = {f}</li>)}</ul>}
          {stage === 3 && <p className="nn-card mt-3 font-mono text-lg text-white text-center">Input (3) → Hidden (4) → Hidden (3) → Output (1)</p>}
        </motion.div>
      </AnimatePresence>
      <div className="flex flex-wrap gap-2">
        <button className="ai-btn-ghost text-xs" disabled={stage <= 0} onClick={() => { setAuto(false); d({ t: 'build', stage: stage - 1 }); }}><ChevronLeft className="w-3.5 h-3.5" /> Back</button>
        <button className="ai-btn text-xs" disabled={stage >= 10} onClick={() => { setAuto(false); d({ t: 'build', stage: stage + 1 }); }}>Next <ChevronRight className="w-3.5 h-3.5" /></button>
        <button className="ai-btn-ghost text-xs" onClick={() => setAuto(!auto)}>{auto ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Auto-play</>}</button>
        <button className="ai-btn-ghost text-xs" onClick={() => { d({ t: 'build', stage: 0 }); setAuto(true); }}><RotateCcw className="w-3.5 h-3.5" /> Restart</button>
        <button className="ai-btn-ghost text-xs" onClick={() => d({ t: 'build', stage: null })}><SkipForward className="w-3.5 h-3.5" /> {stage >= 10 ? 'Explore the network' : 'Skip to completed network'}</button>
      </div>
      <ol className="space-y-1 text-xs">{BUILD_STEPS.map((b, i) => <li key={b.t}><button onClick={() => { setAuto(false); d({ t: 'build', stage: i + 1 }); }} className={`text-left ${i + 1 === stage ? 'text-white font-semibold' : i + 1 < stage ? 'text-gray-400' : 'text-gray-600'}`}>{i + 1}. {b.t}</button></li>)}</ol>
    </div>
  );
}

// ---------------- Concept explorer ----------------
const CONCEPTS: { q: string; a: string; visual: 'unit' | 'features' | 'developer' | 'parts' | 'learned' | 'advice' }[] = [
  { q: 'Is a neuron a question?', a: 'No. An artificial neuron is a mathematical processing unit: it multiplies numerical inputs by weights, adds them and a bias, applies an activation function, and outputs a number. There is no question inside it — only arithmetic.', visual: 'unit' },
  { q: 'Does a neuron ask the input questions?', a: 'No. Input features carry information provided to the model. A developer may design features that correspond to questions like “Is the apple healthy?”, but the neuron only ever receives the answers as numbers.', visual: 'features' },
  { q: 'Who creates the questions?', a: 'The developer defines the task, how inputs are represented, the architecture and the training objective. Features can be answers to human-designed questions or simply numbers extracted from a dataset (pixel values, prices, sensor readings).', visual: 'developer' },
  { q: 'Is the algorithm the neural network itself?', a: 'They are different things. A neuron is a unit; a layer groups units; the network is the connected architecture with its parameters. Forward propagation computes predictions; a loss function scores them; backpropagation computes gradients; an optimiser updates parameters; training repeats this; inference uses the current parameters to predict.', visual: 'parts' },
  { q: 'Are the questions already created, or does training create them?', a: 'Training adjusts weights and biases — numbers — not English questions. The network learns numerical patterns that help with its task. A hidden neuron does not necessarily correspond to any human-interpretable concept.', visual: 'learned' },
  { q: 'Does the neuron decide whether I should eat the apple?', a: 'The model produces a prediction according to the objective it was trained on, using whatever data it was given. That output is not automatically a reliable nutritional recommendation — it is only as good as the features, labels and training behind it.', visual: 'advice' },
];

function ConceptVisual({ v }: { v: (typeof CONCEPTS)[number]['visual'] }) {
  const box = 'rounded-lg border px-2 py-1 text-[11px] font-mono';
  switch (v) {
    case 'unit': return (
      <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
        <span className="relative px-3 py-2 rounded-xl border border-red-400/40 text-red-200 line-through">“Is it healthy?” 🤔</span>
        <span className="text-gray-500">≠</span>
        <span className={`${box} border-cyan-400/40 text-cyan-100`}>x₁·w₁ + x₂·w₂ + x₃·w₃ + b → f(z) → 0.97</span>
      </div>);
    case 'features': return (
      <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
        <span className="px-2 py-1 rounded-lg bg-white/5">Developer’s question: “Is it healthy?”</span><ArrowRight className="w-4 h-4 text-gray-500" />
        <span className={`${box} border-sky-400/40 text-sky-100`}>answer encoded: x₁ = 1</span><ArrowRight className="w-4 h-4 text-gray-500" />
        <span className={`${box} border-indigo-400/40 text-indigo-100`}>neuron sees only 1</span>
      </div>);
    case 'developer': return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-center">{['Task', 'Input representation', 'Architecture', 'Training objective'].map((t) => <span key={t} className="rounded-lg bg-cyan-500/10 border border-cyan-400/30 px-2 py-2 text-cyan-100">👩‍💻 {t}</span>)}</div>);
    case 'parts': return (
      <div className="flex flex-wrap items-center justify-center gap-1 text-[11px]">
        {['Forward pass → prediction', 'Loss vs target', 'Backpropagation → gradients', 'Optimiser updates θ'].map((t, i) => <span key={t} className="flex items-center gap-1"><span className={`${box} border-white/15 text-gray-200`}>{t}</span>{i < 3 && <ArrowRight className="w-3 h-3 text-gray-500" />}</span>)}
        <span className="w-full text-center text-gray-500 mt-1">repeated = training · forward pass alone = inference</span>
      </div>);
    case 'learned': return (
      <div className="flex items-center justify-center gap-3 text-[11px] font-mono flex-wrap">
        <span className="text-gray-400">before: w = 0.21</span><ArrowRight className="w-4 h-4 text-violet-300" /><span className="text-violet-200">after training: w = 1.87</span>
        <span className="w-full text-center text-gray-500 font-sans">hidden-1-3 means … nothing a human named. It is a useful number pattern.</span>
      </div>);
    case 'advice': return (
      <div className="flex items-center justify-center gap-2 text-xs flex-wrap"><span className={`${box} border-violet-400/40 text-violet-100`}>output 0.94</span><ArrowRight className="w-4 h-4 text-gray-500" /><span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-100">a prediction under this model’s objective — not a guarantee or dietary advice</span></div>);
  }
}

export function Concepts() {
  const [i, setI] = useState(0);
  const c = CONCEPTS[i];
  return (
    <div className="grid md:grid-cols-[16rem_1fr] gap-4">
      <div className="flex md:flex-col gap-1 overflow-x-auto" role="tablist" aria-label="Neuron concepts">
        {CONCEPTS.map((x, j) => <button key={x.q} role="tab" aria-selected={i === j} onClick={() => setI(j)} className={`shrink-0 text-left text-sm px-3 py-2 rounded-lg ${i === j ? 'bg-cyan-500/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{x.q}</button>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="nn-card space-y-4">
          <h3 className="text-xl font-bold text-white">{c.q}</h3>
          <div className="rounded-xl bg-black/40 p-4"><ConceptVisual v={c.visual} /></div>
          <p className="text-gray-300 leading-relaxed">{c.a}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------- Knowledge check ----------------
type Go = { label: string; tab: 'explore' | 'train' | 'concepts'; mode?: 'simple' | 'full'; sel?: { type: 'neuron' | 'connection'; id: string } };
const QUIZ: { q: string; opts: string[]; a: number; why: string; go: Go }[] = [
  { q: 'A neuron receives input 0 with weight 10. What is that input’s weighted contribution?', opts: ['10', '0', '1'], a: 1, why: 'Contribution = input × weight = 0 × 10 = 0. A zero input contributes nothing, whatever the weight.', go: { label: 'Open input-2 → output-1 (the “filling” connection)', tab: 'explore', mode: 'simple', sel: { type: 'connection', id: 'input-2__output-1' } } },
  { q: 'The weighted sum before bias is 17 and the bias is −10. What is the pre-activation z?', opts: ['27', '7', '−7'], a: 1, why: 'z = Σ + b = 17 + (−10) = 7.', go: { label: 'Open the apple neuron', tab: 'explore', mode: 'simple', sel: { type: 'neuron', id: 'output-1' } } },
  { q: 'With a step activation and z = 7, what is the output?', opts: ['7', '0', '1'], a: 2, why: 'Step outputs 1 when z > 0, otherwise 0. 7 > 0 → 1 (YES).', go: { label: 'Open the apple neuron', tab: 'explore', mode: 'simple', sel: { type: 'neuron', id: 'output-1' } } },
  { q: 'Is a neuron itself a question?', opts: ['Yes — each neuron asks one question', 'No — it is a mathematical unit that computes an output from numbers', 'Only hidden neurons are questions'], a: 1, why: 'A neuron multiplies, adds, applies an activation and outputs a number. Questions belong to how a developer designs features.', go: { label: 'See the concept explorer', tab: 'concepts' } },
  { q: 'What does a negative weight do to a positive input?', opts: ['Makes its contribution negative, pushing the neuron toward “off”', 'Deletes the connection', 'Means the input is unimportant'], a: 0, why: 'Positive × negative = negative contribution. Negative weights are just as meaningful as positive ones.', go: { label: 'Inspect a connection', tab: 'explore', mode: 'full', sel: { type: 'connection', id: 'input-1__hidden-1-1' } } },
  { q: 'What is the difference between a neuron and a neural network?', opts: ['None', 'A neuron is one computational unit; a network is many connected units with their parameters', 'A network is a single large neuron'], a: 1, why: 'Units are organised into layers, and connected layers with weights and biases form the network.', go: { label: 'Explore the full network', tab: 'explore', mode: 'full' } },
  { q: 'Forward propagation versus backpropagation?', opts: ['Forward computes predictions; backprop computes gradients of the loss', 'They are the same', 'Backprop sends the prediction back as a new input'], a: 0, why: 'Activations flow forward to a prediction; gradient information flows backward to tell each parameter how it affected the loss.', go: { label: 'Watch backpropagation in Training mode', tab: 'train' } },
  { q: 'Which process actually updates the weights during training?', opts: ['The forward pass', 'The optimiser (e.g. SGD), using gradients from backpropagation', 'The activation function'], a: 1, why: 'Backpropagation computes gradients; the optimiser applies θ ← θ − η·∂L/∂θ.', go: { label: 'Train one step', tab: 'train' } },
  { q: 'Does every hidden neuron have an obvious human-readable meaning?', opts: ['Yes, always', 'No — hidden neurons often encode patterns humans cannot name', 'Only after training'], a: 1, why: 'Training optimises numbers for the task, not for interpretability.', go: { label: 'Inspect a hidden neuron', tab: 'explore', mode: 'full', sel: { type: 'neuron', id: 'hidden-1-3' } } },
  { q: 'Why is a trained prediction not automatically a reliable recommendation?', opts: ['Because it depends on the features, data, labels and objective it was trained with', 'Because neural networks are random', 'It always is reliable'], a: 0, why: 'A model is only as good as what it learned from. This teaching dataset is illustrative, not nutritional science.', go: { label: 'See the training dataset', tab: 'train' } },
];

export function Quiz({ onGo }: { onGo: (g: Go) => void }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const score = Object.entries(ans).filter(([i, v]) => QUIZ[+i].a === v).length;
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">{Object.keys(ans).length}/{QUIZ.length} answered · {score} correct <button className="ml-2 underline text-xs" onClick={() => setAns({})}>reset</button></p>
      {QUIZ.map((x, i) => {
        const picked = ans[i];
        return (
          <div key={x.q} className="nn-card">
            <p className="text-white font-medium mb-2">{i + 1}. {x.q}</p>
            <div className="space-y-1.5">{x.opts.map((o, j) => {
              const state = picked === undefined ? '' : j === x.a ? 'border-emerald-400/60 bg-emerald-500/10' : picked === j ? 'border-red-400/60 bg-red-500/10' : 'opacity-50';
              return <button key={o} disabled={picked !== undefined} onClick={() => setAns({ ...ans, [i]: j })} className={`w-full text-left text-sm rounded-lg border border-white/10 px-3 py-2 flex justify-between ${state}`}>{o}{picked !== undefined && j === x.a && <Check className="w-4 h-4 text-emerald-300" />}{picked === j && j !== x.a && <X className="w-4 h-4 text-red-300" />}</button>;
            })}</div>
            {picked !== undefined && (
              <div className="mt-2 text-sm">
                <p className={picked === x.a ? 'text-emerald-300' : 'text-red-300'}>{picked === x.a ? 'Correct.' : 'Not quite.'} <span className="text-gray-300">{x.why}</span></p>
                <button className="ai-btn-ghost text-xs mt-2" onClick={() => onGo(x.go)}>{x.go.label} <ArrowRight className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Learning checklist ----------------
const CHECK = ['I understand what a neuron is.', 'I can open a neuron and inspect its internal calculation.', 'I understand inputs and weights.', 'I can calculate a weighted sum and bias.', 'I understand activation functions.', 'I can click and inspect every connecting line.', 'I understand how signals travel through layers.', 'I understand forward propagation.', 'I understand the difference between inference and training.', 'I understand how backpropagation calculates gradients.', 'I understand how the optimiser updates weights.', 'I can explain why a neuron is not literally a question.'];
const CK = 'ai901-nnlab-checklist';
export function Checklist() {
  const [done, setDone] = useState<boolean[]>(() => { try { return JSON.parse(localStorage.getItem(CK) ?? '[]'); } catch { return []; } });
  const save = (v: boolean[]) => { setDone(v); try { localStorage.setItem(CK, JSON.stringify(v)); } catch { /* storage unavailable */ } };
  return (
    <div className="nn-card">
      <div className="flex justify-between mb-2"><p className="nn-h">Learning checklist · {done.filter(Boolean).length}/{CHECK.length}</p><button className="text-xs underline text-gray-400" onClick={() => save([])}>Reset</button></div>
      <ul className="space-y-1">{CHECK.map((c, i) => (
        <li key={c}><label className="flex gap-2 items-start text-sm text-gray-200 cursor-pointer"><input type="checkbox" className="mt-1" checked={!!done[i]} onChange={(e) => { const v = [...done]; v[i] = e.target.checked; save(v); }} />{c}</label></li>
      ))}</ul>
    </div>
  );
}
