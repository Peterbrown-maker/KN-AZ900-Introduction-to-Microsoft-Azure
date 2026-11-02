// A small, dependency-free feed-forward neural network engine.
// Everything the Neural Network Lab displays is computed here; the UI never invents numbers.

export type Activation = 'step' | 'relu' | 'sigmoid' | 'tanh';
export type ParamOrigin = 'initial' | 'edited' | 'trained';
export type NeuronKind = 'input' | 'hidden' | 'output';

export const ACTIVATIONS: Record<Activation, {
  label: string;
  formula: string;
  range: string;
  f: (z: number) => number;
  /** Derivative expressed with both z and a = f(z) available. */
  df: (z: number, a: number) => number;
  note: string;
}> = {
  step: { label: 'Step', formula: 'f(z) = 1 if z > 0; otherwise 0', range: '{0, 1}', f: (z) => (z > 0 ? 1 : 0), df: () => 0,
    note: 'A hard yes/no switch. Its gradient is 0 everywhere (undefined at 0), so gradient descent cannot learn through it.' },
  relu: { label: 'ReLU', formula: 'f(z) = max(0, z)', range: '[0, ∞)', f: (z) => Math.max(0, z), df: (z) => (z > 0 ? 1 : 0),
    note: 'Passes positive values unchanged and blocks negatives. Cheap and widely used in hidden layers.' },
  sigmoid: { label: 'Sigmoid', formula: 'f(z) = 1 / (1 + exp(−z))', range: '(0, 1)', f: (z) => 1 / (1 + Math.exp(-z)), df: (_z, a) => a * (1 - a),
    note: 'Squashes any value into (0, 1). In a suitably trained model the output can be read as a probability, but it is not automatically well calibrated.' },
  tanh: { label: 'Tanh', formula: 'f(z) = tanh(z)', range: '(−1, 1)', f: (z) => Math.tanh(z), df: (_z, a) => 1 - a * a,
    note: 'Squashes values into (−1, 1) and is centred on zero, so hidden outputs can be negative.' },
};

export interface Neuron {
  id: string;
  layer: number; // 0 = input layer
  index: number; // 0-based position within the layer
  kind: NeuronKind;
  label: string;
  bias: number;
  activation: Activation;
  biasOrigin: ParamOrigin;
  activationOrigin: ParamOrigin;
}

export interface Connection {
  id: string; // `${from}__${to}`
  from: string;
  to: string;
  weight: number;
  origin: ParamOrigin;
}

export interface Network {
  name: string;
  sizes: number[];
  layerNames: string[];
  neurons: Neuron[];
  connections: Connection[];
}

export const neuronId = (sizes: number[], layer: number, index: number) => {
  if (layer === 0) return `input-${index + 1}`;
  if (layer === sizes.length - 1) return `output-${index + 1}`;
  return `hidden-${layer}-${index + 1}`;
};
export const connectionId = (from: string, to: string) => `${from}__${to}`;

/** Deterministic pseudo-random numbers so "reset" always restores the same initial parameters. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface CreateOptions {
  name?: string;
  seed?: number;
  hidden?: Activation;
  output?: Activation;
  inputLabels?: string[];
}

export function createNetwork(sizes: number[], opts: CreateOptions = {}): Network {
  const rnd = seeded(opts.seed ?? 7);
  const neurons: Neuron[] = [];
  const connections: Connection[] = [];
  const last = sizes.length - 1;
  sizes.forEach((n, layer) => {
    for (let i = 0; i < n; i++) {
      const kind: NeuronKind = layer === 0 ? 'input' : layer === last ? 'output' : 'hidden';
      neurons.push({
        id: neuronId(sizes, layer, i), layer, index: i, kind,
        label: layer === 0 ? opts.inputLabels?.[i] ?? `Input ${i + 1}` : kind === 'output' ? `Output ${i + 1}` : `Hidden ${layer}.${i + 1}`,
        bias: 0,
        activation: kind === 'output' ? opts.output ?? 'sigmoid' : opts.hidden ?? 'tanh',
        biasOrigin: 'initial', activationOrigin: 'initial',
      });
    }
  });
  for (let l = 1; l <= last; l++) {
    // Xavier/Glorot uniform initialisation keeps signals in a sensible range.
    const limit = Math.sqrt(6 / (sizes[l - 1] + sizes[l]));
    for (let j = 0; j < sizes[l]; j++) {
      const to = neuronId(sizes, l, j);
      for (let i = 0; i < sizes[l - 1]; i++) {
        const from = neuronId(sizes, l - 1, i);
        connections.push({ id: connectionId(from, to), from, to, weight: round((rnd() * 2 - 1) * limit), origin: 'initial' });
      }
    }
  }
  const layerNames = sizes.map((_, l) => (l === 0 ? 'Input' : l === last ? 'Output' : `Hidden ${l}`));
  return { name: opts.name ?? 'Network', sizes, layerNames, neurons, connections };
}

const round = (x: number) => Math.round(x * 1000) / 1000;

export const APPLE_FEATURES = ['Is it healthy?', 'Will it be filling?', 'Is it cheap?'];

/** The hand-set single-neuron example. These weights were chosen for teaching, not learned. */
export function createAppleNeuron(): Network {
  const net = createNetwork([3, 1], { name: 'Apple neuron', output: 'step', inputLabels: APPLE_FEATURES });
  const w = [10, 5, 7];
  return {
    ...net,
    neurons: net.neurons.map((n) => (n.kind === 'output' ? { ...n, bias: -10, label: 'Snack decision' } : n)),
    connections: net.connections.map((c, i) => ({ ...c, weight: w[i] })),
  };
}

export function createSnackNetwork(seed = 7): Network {
  return createNetwork([3, 4, 3, 1], { name: 'Snack network', seed, hidden: 'tanh', output: 'sigmoid', inputLabels: APPLE_FEATURES });
}

// ---------- Lookups ----------
export const getNeuron = (net: Network, id: string) => net.neurons.find((n) => n.id === id);
export const getConnection = (net: Network, id: string) => net.connections.find((c) => c.id === id);
export const incoming = (net: Network, id: string) => net.connections.filter((c) => c.to === id);
export const outgoing = (net: Network, id: string) => net.connections.filter((c) => c.from === id);
export const layerNeurons = (net: Network, layer: number) => net.neurons.filter((n) => n.layer === layer);

// ---------- Immutable parameter edits ----------
export function setWeight(net: Network, id: string, weight: number, origin: ParamOrigin = 'edited'): Network {
  return { ...net, connections: net.connections.map((c) => (c.id === id ? { ...c, weight, origin } : c)) };
}
export function setBias(net: Network, id: string, bias: number, origin: ParamOrigin = 'edited'): Network {
  return { ...net, neurons: net.neurons.map((n) => (n.id === id && n.kind !== 'input' ? { ...n, bias, biasOrigin: origin } : n)) };
}
export function setActivation(net: Network, id: string, activation: Activation): Network {
  return { ...net, neurons: net.neurons.map((n) => (n.id === id && n.kind !== 'input' ? { ...n, activation, activationOrigin: 'edited' } : n)) };
}

// ---------- Forward propagation ----------
export type OpKind = 'input' | 'multiply' | 'sum' | 'bias' | 'activation' | 'output' | 'loss' | 'gradient' | 'update';

export interface Op {
  seq: number;
  kind: OpKind;
  layer: number;
  /** The neuron or connection this operation concerns. */
  target: { type: 'neuron' | 'connection'; id: string };
  neuronId: string;
  text: string;
  value: number;
  weight?: number;
  inputs?: number[];
}

export interface Term { connectionId: string; from: string; source: number; weight: number; product: number }

export interface NeuronValue {
  id: string;
  kind: NeuronKind;
  terms: Term[];
  sum: number; // Σ wᵢxᵢ (before bias)
  bias: number;
  z: number; // pre-activation
  activation: Activation | null;
  a: number; // output
}

export interface ForwardResult {
  values: Record<string, NeuronValue>;
  ops: Op[];
  output: number;
}

export const fmt = (x: number, d = 3) => {
  if (!Number.isFinite(x)) return String(x);
  const r = Number(x.toFixed(d));
  return Object.is(r, -0) ? '0' : String(r);
};

export function forward(net: Network, inputs: number[]): ForwardResult {
  const values: Record<string, NeuronValue> = {};
  const ops: Op[] = [];
  const push = (o: Omit<Op, 'seq'>) => ops.push({ ...o, seq: ops.length + 1 });

  for (const n of layerNeurons(net, 0)) {
    const x = inputs[n.index] ?? 0;
    values[n.id] = { id: n.id, kind: 'input', terms: [], sum: x, bias: 0, z: x, activation: null, a: x };
    push({ kind: 'input', layer: 0, target: { type: 'neuron', id: n.id }, neuronId: n.id, text: `${n.id} ← ${fmt(x)} (${n.label})`, value: x });
  }
  for (let l = 1; l < net.sizes.length; l++) {
    for (const n of layerNeurons(net, l)) {
      const terms: Term[] = incoming(net, n.id).map((c) => {
        const source = values[c.from].a;
        const product = source * c.weight;
        push({ kind: 'multiply', layer: l, target: { type: 'connection', id: c.id }, neuronId: n.id, text: `${fmt(source)} × ${fmt(c.weight)} = ${fmt(product)}`, value: product, weight: c.weight, inputs: [source] });
        return { connectionId: c.id, from: c.from, source, weight: c.weight, product };
      });
      const sum = terms.reduce((s, t) => s + t.product, 0);
      push({ kind: 'sum', layer: l, target: { type: 'neuron', id: n.id }, neuronId: n.id, text: `Σ = ${terms.map((t) => fmt(t.product)).join(' + ')} = ${fmt(sum)}`, value: sum, inputs: terms.map((t) => t.product) });
      const z = sum + n.bias;
      push({ kind: 'bias', layer: l, target: { type: 'neuron', id: n.id }, neuronId: n.id, text: `z = ${fmt(sum)} + (${fmt(n.bias)}) = ${fmt(z)}`, value: z, weight: n.bias, inputs: [sum] });
      const a = ACTIVATIONS[n.activation].f(z);
      push({ kind: 'activation', layer: l, target: { type: 'neuron', id: n.id }, neuronId: n.id, text: `${ACTIVATIONS[n.activation].label}(${fmt(z)}) = ${fmt(a)}`, value: a, inputs: [z] });
      push({ kind: 'output', layer: l, target: { type: 'neuron', id: n.id }, neuronId: n.id, text: `${n.id} outputs ${fmt(a)}`, value: a });
      values[n.id] = { id: n.id, kind: n.kind, terms, sum, bias: n.bias, z, activation: n.activation, a };
    }
  }
  const out = layerNeurons(net, net.sizes.length - 1)[0];
  return { values, ops, output: values[out.id].a };
}

// ---------- Loss and backpropagation ----------
export type LossKind = 'bce' | 'mse';
const EPS = 1e-7;
export const lossKindFor = (net: Network): LossKind => (layerNeurons(net, net.sizes.length - 1)[0].activation === 'sigmoid' ? 'bce' : 'mse');

export function loss(kind: LossKind, a: number, y: number) {
  if (kind === 'bce') {
    const p = Math.min(1 - EPS, Math.max(EPS, a));
    return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  }
  return (a - y) ** 2;
}

export interface BackwardResult {
  lossKind: LossKind;
  loss: number;
  target: number;
  /** δ = ∂L/∂z for every computational neuron. */
  deltas: Record<string, number>;
  gradW: Record<string, number>;
  gradB: Record<string, number>;
  ops: Op[];
}

export function backward(net: Network, fwd: ForwardResult, target: number): BackwardResult {
  const kind = lossKindFor(net);
  const last = net.sizes.length - 1;
  const out = layerNeurons(net, last)[0];
  const ov = fwd.values[out.id];
  const L = loss(kind, ov.a, target);
  const deltas: Record<string, number> = {};
  const gradW: Record<string, number> = {};
  const gradB: Record<string, number> = {};
  const ops: Op[] = [];
  const push = (o: Omit<Op, 'seq'>) => ops.push({ ...o, seq: ops.length + 1 });

  push({ kind: 'loss', layer: last, target: { type: 'neuron', id: out.id }, neuronId: out.id, text: `${kind === 'bce' ? 'Binary cross-entropy' : 'Squared error'}(prediction ${fmt(ov.a)}, target ${target}) = ${fmt(L, 4)}`, value: L });

  // Output delta. For sigmoid + BCE the chain rule simplifies exactly to (a − y).
  deltas[out.id] = kind === 'bce' ? ov.a - target : 2 * (ov.a - target) * ACTIVATIONS[out.activation].df(ov.z, ov.a);
  push({ kind: 'gradient', layer: last, target: { type: 'neuron', id: out.id }, neuronId: out.id, text: `δ(${out.id}) = ∂L/∂z = ${kind === 'bce' ? `${fmt(ov.a)} − ${target}` : `2(${fmt(ov.a)} − ${target})·f′(z)`} = ${fmt(deltas[out.id], 4)}`, value: deltas[out.id] });

  for (let l = last - 1; l >= 1; l--) {
    for (const n of layerNeurons(net, l)) {
      const v = fwd.values[n.id];
      const back = outgoing(net, n.id).reduce((s, c) => s + c.weight * deltas[c.to], 0);
      deltas[n.id] = back * ACTIVATIONS[n.activation].df(v.z, v.a);
      push({ kind: 'gradient', layer: l, target: { type: 'neuron', id: n.id }, neuronId: n.id, text: `δ(${n.id}) = (Σ w·δ = ${fmt(back, 4)}) × f′(z) ${fmt(ACTIVATIONS[n.activation].df(v.z, v.a), 4)} = ${fmt(deltas[n.id], 4)}`, value: deltas[n.id] });
    }
  }
  for (const c of net.connections) {
    gradW[c.id] = fwd.values[c.from].a * deltas[c.to];
    push({ kind: 'gradient', layer: getNeuron(net, c.to)!.layer, target: { type: 'connection', id: c.id }, neuronId: c.to, text: `∂L/∂w = a(${c.from}) ${fmt(fwd.values[c.from].a)} × δ(${c.to}) ${fmt(deltas[c.to], 4)} = ${fmt(gradW[c.id], 4)}`, value: gradW[c.id] });
  }
  for (const n of net.neurons) if (n.kind !== 'input') gradB[n.id] = deltas[n.id];
  return { lossKind: kind, loss: L, target, deltas, gradW, gradB, ops };
}

export interface ParamChange { type: 'weight' | 'bias'; id: string; before: number; after: number; grad: number }

/** Plain stochastic gradient descent: θ ← θ − η·∂L/∂θ. */
export function sgd(net: Network, back: BackwardResult, lr: number): { net: Network; changes: ParamChange[] } {
  const changes: ParamChange[] = [];
  const connections = net.connections.map((c) => {
    const g = back.gradW[c.id] ?? 0;
    if (g === 0) return c;
    const after = c.weight - lr * g;
    changes.push({ type: 'weight', id: c.id, before: c.weight, after, grad: g });
    return { ...c, weight: after, origin: 'trained' as const };
  });
  const neurons = net.neurons.map((n) => {
    const g = back.gradB[n.id];
    if (!g) return n;
    const after = n.bias - lr * g;
    changes.push({ type: 'bias', id: n.id, before: n.bias, after, grad: g });
    return { ...n, bias: after, biasOrigin: 'trained' as const };
  });
  return { net: { ...net, connections, neurons }, changes };
}

export interface TrainStepResult {
  inputs: number[];
  target: number;
  before: ForwardResult;
  back: BackwardResult;
  net: Network;
  after: ForwardResult;
  lossBefore: number;
  lossAfter: number;
  changes: ParamChange[];
  updateOps: Op[];
}

export function trainStep(net: Network, inputs: number[], target: number, lr: number): TrainStepResult {
  const before = forward(net, inputs);
  const back = backward(net, before, target);
  const { net: next, changes } = sgd(net, back, lr);
  const after = forward(next, inputs);
  const updateOps: Op[] = changes.map((ch, i) => ({
    seq: i + 1, kind: 'update', layer: ch.type === 'weight' ? getNeuron(net, getConnection(net, ch.id)!.to)!.layer : getNeuron(net, ch.id)!.layer,
    target: { type: ch.type === 'weight' ? 'connection' : 'neuron', id: ch.id }, neuronId: ch.type === 'weight' ? getConnection(net, ch.id)!.to : ch.id,
    text: `${ch.type === 'weight' ? 'w' : 'b'} ← ${fmt(ch.before, 4)} − ${lr} × ${fmt(ch.grad, 4)} = ${fmt(ch.after, 4)}`, value: ch.after,
  }));
  return { inputs, target, before, back, net: next, after, lossBefore: back.loss, lossAfter: loss(back.lossKind, after.output, target), changes, updateOps };
}

// ---------- Teaching dataset ----------
export interface Example { name: string; inputs: number[]; target: number }

/** Illustrative only — a made-up rule (healthy AND (filling OR cheap)), not nutritional advice. */
export const SNACK_DATA: Example[] = [
  { name: 'Fresh apple — healthy, filling, cheap', inputs: [1, 1, 1], target: 1 },
  { name: 'Banana — healthy, filling, pricier', inputs: [1, 1, 0], target: 1 },
  { name: 'Carrot sticks — healthy, light, cheap', inputs: [1, 0, 1], target: 1 },
  { name: 'Imported berries — healthy, light, pricey', inputs: [1, 0, 0], target: 0 },
  { name: 'Large fries — unhealthy, filling, cheap', inputs: [0, 1, 1], target: 0 },
  { name: 'Fancy pastry — unhealthy, filling, pricey', inputs: [0, 1, 0], target: 0 },
  { name: 'Candy — unhealthy, light, cheap', inputs: [0, 0, 1], target: 0 },
  { name: 'Diet soda — unhealthy, light, pricey', inputs: [0, 0, 0], target: 0 },
];

export function datasetLoss(net: Network, data: Example[] = SNACK_DATA) {
  const k = lossKindFor(net);
  return data.reduce((s, e) => s + loss(k, forward(net, e.inputs).output, e.target), 0) / data.length;
}
