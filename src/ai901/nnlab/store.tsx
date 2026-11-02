import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import {
  type Activation, type Network, type Op, type TrainStepResult, type ForwardResult,
  createAppleNeuron, createSnackNetwork, forward, setActivation, setBias, setWeight, trainStep, SNACK_DATA, datasetLoss, getNeuron, getConnection, fmt,
} from './engine';

export type Mode = 'simple' | 'full';
export type Selection = { type: 'neuron' | 'connection'; id: string };
export interface LogEntry extends Op { uid: number; mode: Mode; group: string; trainStep?: number }

export interface LabState {
  mode: Mode;
  nets: Record<Mode, Network>;
  inputs: Record<Mode, number[]>;
  hasRun: Record<Mode, boolean>;
  /** Selection stack: the last item is current; earlier items let you go back. */
  selection: Selection[];
  playback: { index: number; playing: boolean; active: boolean };
  speed: number;
  view: { weights: boolean; outputs: boolean; layers: boolean; log: boolean; gradients: boolean };
  history: LogEntry[];
  uid: number;
  runs: number;
  trace: { id: string; key: number } | null;
  build: number | null;
  backAnim: { key: number } | null;
  training: {
    steps: number;
    lr: number;
    example: number;
    lossHistory: { step: number; loss: number; dataset: number }[];
    last: TrainStepResult | null;
    paramLog: Record<string, { step: number; before: number; after: number }[]>;
    running: boolean;
  };
}

const SEED = 7;
const initial = (): LabState => ({
  mode: 'simple',
  nets: { simple: createAppleNeuron(), full: createSnackNetwork(SEED) },
  inputs: { simple: [1, 0, 1], full: [1, 0, 1] },
  hasRun: { simple: false, full: false },
  selection: [],
  playback: { index: 0, playing: false, active: false },
  speed: 2,
  view: { weights: true, outputs: true, layers: true, log: true, gradients: false },
  history: [],
  uid: 1,
  runs: 0,
  trace: null,
  build: 0,
  backAnim: null,
  training: { steps: 0, lr: 0.5, example: 0, lossHistory: [], last: null, paramLog: {}, running: false },
});

export type Action =
  | { t: 'mode'; mode: Mode }
  | { t: 'input'; index: number; value: number }
  | { t: 'weight'; id: string; value: number }
  | { t: 'bias'; id: string; value: number }
  | { t: 'activation'; id: string; value: Activation }
  | { t: 'run' }
  | { t: 'play' } | { t: 'pause' } | { t: 'tick' } | { t: 'step' } | { t: 'restart' } | { t: 'skip' } | { t: 'seek'; index: number }
  | { t: 'speed'; value: number }
  | { t: 'select'; sel: Selection }
  | { t: 'back' } | { t: 'clear' }
  | { t: 'view'; key: keyof LabState['view'] }
  | { t: 'clearHistory' }
  | { t: 'resetModel' }
  | { t: 'trace'; id: string }
  | { t: 'build'; stage: number | null }
  | { t: 'trainStep' }
  | { t: 'trainEpoch' }
  | { t: 'trainRunning'; value: boolean }
  | { t: 'lr'; value: number }
  | { t: 'example'; index: number }
  | { t: 'resetTraining' }
  | { t: 'backAnim' };

const HISTORY_CAP = 3000;

function log(s: LabState, ops: Op[], group: string, step?: number): Pick<LabState, 'history' | 'uid'> {
  let uid = s.uid;
  const entries = ops.map((o) => ({ ...o, uid: uid++, mode: s.mode, group, trainStep: step }));
  return { history: [...s.history, ...entries].slice(-HISTORY_CAP), uid };
}

const note = (s: LabState, text: string, target: Selection, kind: Op['kind'] = 'update'): Op => ({
  seq: 0, kind, layer: 0, target, neuronId: target.type === 'neuron' ? target.id : getConnection(s.nets[s.mode], target.id)?.to ?? '', text, value: 0,
});

/** After any change to the model we either keep values hidden (never run) or show the freshly recalculated pass. */
const settle = (): Partial<LabState> => ({ playback: { index: Number.MAX_SAFE_INTEGER, playing: false, active: false } });

function reducer(s: LabState, a: Action): LabState {
  const net = s.nets[s.mode];
  const withNet = (n: Network, extra: Partial<LabState> = {}): LabState => ({ ...s, nets: { ...s.nets, [s.mode]: n }, ...settle(), ...extra });
  switch (a.t) {
    case 'mode':
      return { ...s, mode: a.mode, selection: [], playback: { index: 0, playing: false, active: false }, trace: null };
    case 'input': {
      const inputs = s.inputs[s.mode].map((x, i) => (i === a.index ? a.value : x));
      return { ...s, inputs: { ...s.inputs, [s.mode]: inputs }, ...settle(), ...log(s, [note(s, `Input ${a.index + 1} set to ${fmt(a.value)}${s.hasRun[s.mode] ? ' — forward pass recalculated' : ''}`, { type: 'neuron', id: `input-${a.index + 1}` }, 'input')], 'Edit') };
    }
    case 'weight': {
      const c = getConnection(net, a.id);
      if (!c) return s;
      return withNet(setWeight(net, a.id, a.value), log(s, [note(s, `Weight ${a.id}: ${fmt(c.weight)} → ${fmt(a.value)} (manual edit)${s.hasRun[s.mode] ? ' — downstream recalculated' : ''}`, { type: 'connection', id: a.id })], 'Edit'));
    }
    case 'bias': {
      const n = getNeuron(net, a.id);
      if (!n) return s;
      return withNet(setBias(net, a.id, a.value), log(s, [note(s, `Bias ${a.id}: ${fmt(n.bias)} → ${fmt(a.value)} (manual edit)`, { type: 'neuron', id: a.id })], 'Edit'));
    }
    case 'activation':
      return withNet(setActivation(net, a.id, a.value), log(s, [note(s, `Activation ${a.id} → ${a.value}`, { type: 'neuron', id: a.id })], 'Edit'));
    case 'run': {
      const f = forward(net, s.inputs[s.mode]);
      const runs = s.runs + 1;
      return { ...s, runs, hasRun: { ...s.hasRun, [s.mode]: true }, playback: { index: 0, playing: true, active: true }, ...log(s, f.ops, `Forward pass #${runs}`) };
    }
    case 'play': {
      if (!s.hasRun[s.mode]) return reducer(s, { t: 'run' });
      const total = forward(net, s.inputs[s.mode]).ops.length;
      const done = s.playback.index >= total;
      return { ...s, playback: { index: done ? 0 : s.playback.index, playing: true, active: true } };
    }
    case 'pause':
      return { ...s, playback: { ...s.playback, playing: false } };
    case 'tick':
    case 'step': {
      if (!s.hasRun[s.mode]) return a.t === 'step' ? { ...reducer(s, { t: 'run' }), playback: { index: 1, playing: false, active: true } } : s;
      const total = forward(net, s.inputs[s.mode]).ops.length;
      const base = s.playback.active ? s.playback.index : 0;
      const index = Math.min(total, base + 1);
      return { ...s, playback: { index, playing: a.t === 'tick' && index < total, active: index < total } };
    }
    case 'restart':
      return s.hasRun[s.mode] ? { ...s, playback: { index: 0, playing: true, active: true } } : reducer(s, { t: 'run' });
    case 'skip':
      return { ...s, playback: { index: Number.MAX_SAFE_INTEGER, playing: false, active: false } };
    case 'seek':
      return { ...s, playback: { index: a.index, playing: false, active: true } };
    case 'speed':
      return { ...s, speed: a.value };
    case 'select': {
      const cur = s.selection[s.selection.length - 1];
      if (cur && cur.type === a.sel.type && cur.id === a.sel.id) return s;
      return { ...s, selection: [...s.selection, a.sel].slice(-20) };
    }
    case 'back':
      return { ...s, selection: s.selection.slice(0, -1) };
    case 'clear':
      return { ...s, selection: [] };
    case 'view':
      return { ...s, view: { ...s.view, [a.key]: !s.view[a.key] } };
    case 'clearHistory':
      return { ...s, history: [] };
    case 'resetModel': {
      const fresh = s.mode === 'simple' ? createAppleNeuron() : createSnackNetwork(SEED);
      return { ...s, nets: { ...s.nets, [s.mode]: fresh }, hasRun: { ...s.hasRun, [s.mode]: false }, playback: { index: 0, playing: false, active: false },
        training: s.mode === 'full' ? { ...s.training, last: null, paramLog: {}, steps: 0, lossHistory: [] } : s.training,
        ...log(s, [note(s, `Model reset: all ${s.mode === 'simple' ? 'apple-neuron' : 'network'} parameters restored to their initial values`, { type: 'neuron', id: 'output-1' })], 'Reset') };
    }
    case 'trace':
      return { ...s, trace: { id: a.id, key: Date.now() } };
    case 'build':
      return { ...s, build: a.stage, ...(a.stage !== null ? { mode: 'full' as Mode } : {}) };
    case 'trainStep':
    case 'trainEpoch': {
      const full = s.nets.full;
      const examples = a.t === 'trainStep' ? [SNACK_DATA[s.training.example]] : SNACK_DATA;
      let n = full, last: TrainStepResult | null = null, steps = s.training.steps;
      const paramLog = { ...s.training.paramLog };
      const lossHistory = [...s.training.lossHistory];
      for (const e of examples) {
        last = trainStep(n, e.inputs, e.target, s.training.lr);
        n = last.net;
        steps++;
        for (const ch of last.changes) paramLog[ch.id] = [...(paramLog[ch.id] ?? []), { step: steps, before: ch.before, after: ch.after }].slice(-50);
        lossHistory.push({ step: steps, loss: last.lossBefore, dataset: datasetLoss(n) });
      }
      const logged = a.t === 'trainStep'
        ? log({ ...s, mode: 'full' }, [...last!.back.ops, ...last!.updateOps], `Training step ${steps}`, steps)
        : log({ ...s, mode: 'full' }, [note({ ...s, mode: 'full' }, `Epoch: ${examples.length} SGD steps (steps ${steps - examples.length + 1}–${steps}); dataset loss now ${fmt(lossHistory[lossHistory.length - 1].dataset, 4)}`, { type: 'neuron', id: 'output-1' })], `Training epoch`, steps);
      return {
        ...s, mode: 'full', nets: { ...s.nets, full: n }, hasRun: { ...s.hasRun, full: true }, ...settle(), ...logged,
        training: { ...s.training, steps, last, paramLog, lossHistory: lossHistory.slice(-4000) },
      };
    }
    case 'trainRunning':
      return { ...s, training: { ...s.training, running: a.value } };
    case 'lr':
      return { ...s, training: { ...s.training, lr: a.value } };
    case 'example':
      return { ...s, training: { ...s.training, example: a.index }, inputs: { ...s.inputs, full: [...SNACK_DATA[a.index].inputs] } };
    case 'resetTraining':
      return { ...s, training: { ...s.training, lossHistory: [], last: null, paramLog: {}, steps: 0 } };
    case 'backAnim':
      return { ...s, backAnim: { key: Date.now() } };
  }
}

interface Ctx {
  s: LabState;
  d: React.Dispatch<Action>;
  net: Network;
  fwd: ForwardResult;
  sel: Selection | null;
  /** True when a neuron's current value has been computed and revealed (respecting playback). */
  revealed: (neuronId: string) => boolean;
  currentOp: Op | null;
}

const LabCtx = createContext<Ctx | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, initial);
  const net = s.nets[s.mode];
  const fwd = useMemo(() => forward(net, s.inputs[s.mode]), [net, s.inputs, s.mode]);
  const value = useMemo<Ctx>(() => {
    const total = fwd.ops.length;
    const idx = s.playback.active ? Math.min(s.playback.index, total) : total;
    const doneSeq: Record<string, number> = {};
    for (const o of fwd.ops) if (o.kind === 'output' || o.kind === 'input') doneSeq[o.neuronId] = o.seq;
    return {
      s, d, net, fwd,
      sel: s.selection[s.selection.length - 1] ?? null,
      revealed: (id) => s.hasRun[s.mode] && (doneSeq[id] ?? Infinity) <= idx,
      currentOp: s.hasRun[s.mode] && s.playback.active && idx > 0 ? fwd.ops[idx - 1] : null,
    };
  }, [s, net, fwd]);
  return <LabCtx.Provider value={value}>{children}</LabCtx.Provider>;
}

export function useLab() {
  const c = useContext(LabCtx);
  if (!c) throw new Error('useLab must be used inside LabProvider');
  return c;
}
