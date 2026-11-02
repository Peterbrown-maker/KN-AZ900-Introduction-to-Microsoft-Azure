# KN-AZ900-DP900

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-8vs2b19e)

## Running locally

```bash
npm install      # install dependencies
npm run dev      # start the app at http://localhost:5173
npm run build    # production build
npm test         # neural-network engine tests (Node's built-in test runner)
npm run typecheck
```

## AI-901 Neural Network Laboratory

Open it from **Choose Your Path → Neural Network Lab**, from the AI-901 header (**NN Lab**), or directly at `/#/ai901/lab`.

- `src/ai901/nnlab/engine.ts` — the network engine (forward pass, loss, backpropagation, SGD). It has no UI code; everything the lab displays comes from it.
- `src/ai901/nnlab/store.tsx` — the shared state used by the canvas, inspectors, explorer, log and training panel.
- `tests/nnlab.engine.test.ts` — engine tests, including the apple example (17 − 10 = 7 → step output 1) and a finite-difference gradient check.

**Resetting:** *Reset model* restores the current network's initial parameters. *Clear log* and *Reset training history* clear history only and leave the model unchanged. AI-901 course progress is reset from **Progress → Reset AI-901 progress**; AZ-900 and DP-900 progress is stored separately.
