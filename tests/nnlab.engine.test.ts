import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAppleNeuron, createSnackNetwork, forward, backward, trainStep, setWeight, setBias, setActivation,
  datasetLoss, SNACK_DATA, loss, ACTIVATIONS, incoming, type Network,
} from '../src/ai901/nnlab/engine';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('apple neuron: 10 + 0 + 7 − 10 = 7 and step outputs 1', () => {
  const net = createAppleNeuron();
  const r = forward(net, [1, 0, 1]);
  const v = r.values['output-1'];
  assert.deepEqual(v.terms.map((t) => t.product), [10, 0, 7]);
  assert.equal(v.sum, 17);
  assert.equal(v.bias, -10);
  assert.equal(v.z, 7);
  assert.equal(v.a, 1);
  assert.equal(r.output, 1);
});

test('a zero input contributes zero regardless of weight; negatives multiply correctly', () => {
  const net = setWeight(createAppleNeuron(), 'input-2__output-1', 999);
  assert.equal(forward(net, [1, 0, 1]).values['output-1'].terms[1].product, 0);
  const neg = forward(setWeight(createAppleNeuron(), 'input-1__output-1', -0.5), [-0.8, 0, 0]);
  close(neg.values['output-1'].terms[0].product, 0.4);
});

test('architecture is Input(3) → Hidden(4) → Hidden(3) → Output(1), fully connected', () => {
  const net = createSnackNetwork();
  assert.deepEqual(net.sizes, [3, 4, 3, 1]);
  assert.equal(net.neurons.length, 11);
  assert.equal(net.connections.length, 3 * 4 + 4 * 3 + 3 * 1);
  assert.equal(new Set(net.connections.map((c) => c.id)).size, net.connections.length);
  assert.ok(net.connections.some((c) => c.id === 'input-1__hidden-1-1'));
  assert.equal(incoming(net, 'hidden-2-1').length, 4);
});

test('every neuron output equals activation(Σ source·weight + bias)', () => {
  const net = createSnackNetwork(3);
  const r = forward(net, [0.3, -1, 2]);
  for (const n of net.neurons.filter((x) => x.kind !== 'input')) {
    const z = incoming(net, n.id).reduce((s, c) => s + r.values[c.from].a * c.weight, 0) + n.bias;
    close(r.values[n.id].z, z);
    close(r.values[n.id].a, ACTIVATIONS[n.activation].f(z));
  }
});

test('editing a weight, bias or activation changes downstream outputs', () => {
  const net = createSnackNetwork();
  const base = forward(net, [1, 1, 0]).output;
  assert.notEqual(forward(setWeight(net, 'input-1__hidden-1-1', 3), [1, 1, 0]).output, base);
  assert.notEqual(forward(setBias(net, 'hidden-2-2', 2), [1, 1, 0]).output, base);
  assert.notEqual(forward(setActivation(net, 'hidden-1-1', 'relu'), [1, 1, 0]).output, base);
  assert.equal(setWeight(net, 'input-1__hidden-1-1', 3).connections.find((c) => c.id === 'input-1__hidden-1-1')!.origin, 'edited');
});

test('backpropagation gradients match finite differences', () => {
  const net = createSnackNetwork(11);
  const x = [1, 0, 1], y = 1, h = 1e-6;
  const back = backward(net, forward(net, x), y);
  const L = (n: Network) => loss(back.lossKind, forward(n, x).output, y);
  for (const c of net.connections) {
    const num = (L(setWeight(net, c.id, c.weight + h)) - L(setWeight(net, c.id, c.weight - h))) / (2 * h);
    close(back.gradW[c.id], num, 1e-5);
  }
  for (const n of net.neurons.filter((x2) => x2.kind !== 'input')) {
    const num = (L(setBias(net, n.id, n.bias + h)) - L(setBias(net, n.id, n.bias - h))) / (2 * h);
    close(back.gradB[n.id], num, 1e-5);
  }
});

test('a training step applies θ ← θ − η·gradient and marks parameters as trained', () => {
  const net = createSnackNetwork();
  const r = trainStep(net, [1, 1, 1], 1, 0.5);
  for (const ch of r.changes) close(ch.after, ch.before - 0.5 * ch.grad);
  assert.ok(r.net.connections.every((c) => c.origin === 'trained' || r.back.gradW[c.id] === 0));
  assert.ok(Number.isFinite(r.lossAfter));
});

test('step activation has zero gradient', () => {
  assert.equal(ACTIVATIONS.step.df(3, 1), 0);
});

test('training on the snack dataset reduces average loss (seeded, deterministic)', () => {
  let net = createSnackNetwork();
  const start = datasetLoss(net);
  for (let epoch = 0; epoch < 400; epoch++) for (const e of SNACK_DATA) net = trainStep(net, e.inputs, e.target, 0.3).net;
  const end = datasetLoss(net);
  assert.ok(end < start * 0.2, `loss ${start} → ${end}`);
  for (const e of SNACK_DATA) assert.equal(forward(net, e.inputs).output > 0.5 ? 1 : 0, e.target, e.name);
});
