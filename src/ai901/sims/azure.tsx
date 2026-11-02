import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SimFrame, Seg, Slider, Bar } from '../ui';

// ---------------- Azure organisational hierarchy ----------------
const LEVELS = [
  { k: 'tenant', label: 'Tenant', eg: 'contoso.onmicrosoft.com', color: '#8b5cf6', holds: 'Users, groups, identities and access policies (Microsoft Entra ID).', controls: 'Who your organisation is and how people sign in.' },
  { k: 'sub', label: 'Subscription', eg: 'Contoso-AI-Production', color: '#0078d4', holds: 'One or more resource groups. A tenant can have many subscriptions.', controls: 'Billing, cost limits, quotas and access boundaries.' },
  { k: 'rg', label: 'Resource group', eg: 'rg-expenses-assistant', color: '#22d3ee', holds: 'Related resources for one solution, managed together.', controls: 'Group-level permissions and policies; delete the group to delete everything in it.' },
  { k: 'res', label: 'Resources', eg: 'Foundry resource · Key Vault · App Service · Storage account', color: '#34d399', holds: 'Individual services, each with a type, name, ID, region, tier and access controls.', controls: 'What actually runs — and what you pay for.' },
];
export function AzureHierarchy() {
  const [sel, setSel] = useState(3);
  const L = LEVELS[sel];
  return (
    <SimFrame title="How Azure is organised" icon="FolderTree"
      shows="Each level nests inside the one above it: a Foundry resource lives in a resource group, inside a subscription, inside your organisation's tenant."
      omits="Management groups (above subscriptions) and Azure Policy are covered in AZ-900.">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-5 items-center">
        <div className="space-y-0">
          {LEVELS.map((l, i) => (
            <button key={l.k} onClick={() => setSel(i)} aria-pressed={sel === i}
              className="block w-full text-left rounded-xl border p-3 transition-colors"
              style={{ marginLeft: `${i * 6}%`, width: `${100 - i * 6}%`, marginTop: i ? 6 : 0, borderColor: sel === i ? l.color : `${l.color}44`, background: sel === i ? `${l.color}26` : `${l.color}0d` }}>
              <span className="block text-sm font-bold" style={{ color: l.color }}>{l.label}</span>
              <span className="block text-[11px] font-mono text-gray-400 truncate">{l.eg}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={L.k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2 text-sm">
            <p className="text-xl font-bold" style={{ color: L.color }}>{L.label}</p>
            <p className="text-gray-300"><b className="text-white">Contains: </b>{L.holds}</p>
            <p className="text-gray-300"><b className="text-white">Controls: </b>{L.controls}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </SimFrame>
  );
}

// ---------------- Foundry architecture ----------------
const NODES: Record<string, { x: number; y: number; w: number; label: string; sub: string; color: string; text: string }> = {
  user: { x: 10, y: 120, w: 70, label: 'User', sub: 'browser / phone', color: '#94a3b8', text: 'Interacts with your client application by typing, speaking or uploading images.' },
  app: { x: 100, y: 120, w: 90, label: 'Client app', sub: 'lightweight client', color: '#22d3ee', text: 'Presents a UI, collects input, formats the request, calls the endpoint and displays results. Authenticates with Microsoft Entra ID (or a key).' },
  entra: { x: 100, y: 230, w: 90, label: 'Entra ID', sub: 'identity', color: '#8b5cf6', text: 'Issues tokens so the app can call Foundry endpoints without hard-coded secrets. RBAC controls who can do what.' },
  project: { x: 215, y: 25, w: 250, label: 'Foundry project', sub: 'inside a Foundry resource', color: '#0078d4', text: 'The workspace for one use case: agents, evaluations, files & datasets, vector indexes, connections. It lives inside a Foundry resource that provides models, quotas, governance and security boundaries.' },
  agent: { x: 235, y: 95, w: 95, label: 'Agent', sub: 'instructions + tools', color: '#34d399', text: 'A packaged worker: a model, instructions (system prompt) and tools. Called through the Project API.' },
  model: { x: 350, y: 95, w: 95, label: 'Model deployment', sub: 'e.g. GPT-4.1', color: '#a78bfa', text: 'A deployed model from the catalog with a deployment type, version and TPM limit. Called via the Responses API.' },
  safety: { x: 350, y: 170, w: 95, label: 'Content safety', sub: 'filters', color: '#f87171', text: 'Filters prompts and completions for harmful content and prompt attacks.' },
  tools: { x: 235, y: 170, w: 95, label: 'Foundry Tools', sub: 'Language, Speech, Vision, CU', color: '#f59e0b', text: 'Prebuilt AI services the agent or app can call for predictable, structured results.' },
  iq: { x: 235, y: 245, w: 95, label: 'Foundry IQ', sub: 'knowledge base', color: '#fb923c', text: 'Permission-aware knowledge layer: indexes your data and performs agentic retrieval with citations.' },
  data: { x: 350, y: 245, w: 95, label: 'Data sources', sub: 'Blob, SharePoint, OneLake', color: '#64748b', text: 'Your organisation\'s documents and data, connected as knowledge sources.' },
  monitor: { x: 485, y: 120, w: 80, label: 'Monitor', sub: 'evaluate & observe', color: '#60a5fa', text: 'Usage, latency, errors, cost and evaluations (groundedness, safety). Re-evaluate whenever anything changes.' },
};
const EDGES: [string, string][] = [['user', 'app'], ['app', 'entra'], ['app', 'agent'], ['agent', 'model'], ['model', 'safety'], ['agent', 'tools'], ['agent', 'iq'], ['iq', 'data'], ['model', 'monitor']];
const TRACE = ['user', 'app', 'entra', 'agent', 'iq', 'data', 'agent', 'model', 'safety', 'model', 'agent', 'app', 'user'];
const TRACE_TXT = ['User asks: "What\'s our travel hotel limit?"', 'Client app formats the request', 'App gets an Entra ID token', 'Request reaches the agent', 'Agent queries Foundry IQ', 'Relevant policy chunks retrieved (with permissions)', 'Agent assembles the grounded prompt', 'Model deployment generates the answer', 'Content filters check the output', 'Response passes safety checks', 'Agent adds citations', 'App renders answer + sources', 'User reads a cited answer'];

export function FoundryArchitecture() {
  const [sel, setSel] = useState('project');
  const [t, setT] = useState(-1);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (t < 0 || t >= TRACE.length - 1) return;
    const id = setTimeout(() => setT((x) => x + 1), reduce ? 300 : 1100);
    return () => clearTimeout(id);
  }, [t, reduce]);
  const active = t >= 0 ? TRACE[t] : null;
  const c = (k: string) => { const n = NODES[k]; return [n.x + n.w / 2, n.y + 22]; };
  return (
    <SimFrame title="Microsoft Foundry solution architecture" icon="Network" controls={<button className="ai-btn text-xs" onClick={() => setT(0)}>Trace a request</button>}
      shows="How users, a client app, identity, a Foundry project (agent, model deployment, tools, knowledge, safety) and your data connect."
      omits="Networking (private endpoints), Key Vault, and multi-region deployment are left out for clarity.">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 575 295" className="w-full min-w-[560px]">
          <rect x={NODES.project.x} y={NODES.project.y} width={NODES.project.w} height={265} rx={14} fill="#0078d411" stroke="#0078d4" strokeDasharray="5 4" onClick={() => setSel('project')} className="cursor-pointer" />
          <text x={NODES.project.x + 12} y={NODES.project.y + 20} fontSize={12} fill="#60a5fa" fontWeight={700}>Foundry project</text>
          {EDGES.map(([a, b]) => { const [x1, y1] = c(a), [x2, y2] = c(b); const on = active && (TRACE[t] === a && TRACE[t - 1] === b || TRACE[t] === b && TRACE[t - 1] === a); return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? '#fff' : '#334155'} strokeWidth={on ? 2.5 : 1.2} />; })}
          {Object.entries(NODES).filter(([k]) => k !== 'project').map(([k, n]) => (
            <g key={k} onClick={() => setSel(k)} className="cursor-pointer" role="button" tabIndex={0} aria-label={n.label} onKeyDown={(e) => e.key === 'Enter' && setSel(k)}>
              <motion.rect x={n.x} y={n.y} width={n.w} height={44} rx={10} fill={active === k ? n.color : `${n.color}22`} stroke={sel === k ? '#fff' : n.color} strokeWidth={sel === k ? 2 : 1.2} animate={{ scale: active === k ? 1.06 : 1 }} style={{ transformOrigin: `${n.x + n.w / 2}px ${n.y + 22}px` }} />
              <text x={n.x + n.w / 2} y={n.y + 19} textAnchor="middle" fontSize={11} fontWeight={700} fill={active === k ? '#050a17' : '#f1f5f9'}>{n.label}</text>
              <text x={n.x + n.w / 2} y={n.y + 33} textAnchor="middle" fontSize={8.5} fill={active === k ? '#050a17' : '#94a3b8'}>{n.sub}</text>
            </g>
          ))}
        </svg>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={t >= 0 ? `t${t}` : sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/5 p-3 mt-2 text-sm">
          {t >= 0 ? <p><span className="font-mono text-xs text-gray-400 mr-2">{t + 1}/{TRACE.length}</span><span className="text-gray-100">{TRACE_TXT[t]}</span>{t === TRACE.length - 1 && <button className="ai-btn-ghost text-xs ml-3" onClick={() => setT(-1)}>Done</button>}</p>
            : <p><b style={{ color: NODES[sel].color }}>{NODES[sel].label}: </b><span className="text-gray-300">{NODES[sel].text}</span></p>}
        </motion.div>
      </AnimatePresence>
    </SimFrame>
  );
}

// ---------------- Deployment configuration ----------------
const TYPES = {
  standard: { label: 'Standard', lat: 'Low–moderate', price: 'Pay per token', note: 'Good default for interactive apps with variable traffic.' },
  provisioned: { label: 'Provisioned throughput', lat: 'Consistently low', price: 'Reserved capacity (hourly)', note: 'Predictable latency and capacity for steady high-volume production traffic.' },
  batch: { label: 'Global batch', lat: 'Hours (async)', price: 'Discounted per token', note: 'Large offline jobs where latency doesn\'t matter — e.g. nightly summarisation.' },
} as const;
export function DeploymentConfig() {
  const [type, setType] = useState<keyof typeof TYPES>('standard');
  const [tpm, setTpm] = useState(50);
  const [rpm, setRpm] = useState(60);
  const [maxOut, setMaxOut] = useState(400);
  const perReq = 600 + maxOut; // prompt + output tokens
  const demand = (rpm * perReq) / 1000; // thousand tokens per minute
  const capacity = type === 'batch' ? Infinity : tpm;
  const throttled = demand > capacity ? Math.round((1 - capacity / demand) * 100) : 0;
  return (
    <SimFrame title="Model deployment settings" icon="Server" controls={<Seg label="Deployment type" value={type} onChange={setType} options={(Object.keys(TYPES) as (keyof typeof TYPES)[]).map((k) => ({ value: k, label: TYPES[k].label }))} />}
      shows="Deployment type, TPM quota and request size together decide whether traffic is served or throttled (rate-limit errors). Lowering max output tokens or request rate reduces token demand."
      omits="Real quotas, prices and limits vary by model, region and subscription. Numbers are illustrative.">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 p-3 text-sm"><p className="text-white font-semibold">{TYPES[type].label}</p><p className="text-gray-400 text-xs mt-0.5">Latency: {TYPES[type].lat} · Pricing: {TYPES[type].price}</p><p className="text-gray-300 text-xs mt-1">{TYPES[type].note}</p></div>
          {type !== 'batch' && <Slider label="Tokens-per-minute quota (thousands)" value={tpm} min={10} max={300} step={10} onChange={setTpm} format={(v) => `${v}K TPM`} />}
          <Slider label="Requests per minute from your app" value={rpm} min={5} max={300} step={5} onChange={setRpm} />
          <Slider label="max_output_tokens" value={maxOut} min={100} max={2000} step={50} onChange={setMaxOut} />
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Each request ≈ 600 prompt tokens + up to {maxOut} output tokens = <b>{perReq.toLocaleString()}</b> tokens</p>
          <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Token demand</span><span className="font-mono">{demand.toFixed(0)}K / min</span></div><Bar value={type === 'batch' ? 0.3 : demand / Math.max(capacity, demand)} color={throttled ? '#f87171' : '#34d399'} /></div>
          {type === 'batch' ? <p className="text-sm text-emerald-300">Batch jobs are queued and processed asynchronously — no real-time throttling, but results arrive later.</p>
            : throttled ? <p className="text-sm text-red-300">≈ {throttled}% of requests throttled (HTTP 429). Fix: raise TPM, lower max_output_tokens, reduce concurrency, or add retries with back-off.</p>
              : <p className="text-sm text-emerald-300">All requests served within quota.</p>}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Client–server request ----------------
export function ClientServer() {
  const [step, setStep] = useState(0);
  const [auth, setAuth] = useState<'entra' | 'key' | 'none'>('entra');
  const reduce = useReducedMotion();
  useEffect(() => {
    if (step === 0 || step >= 4) return;
    const id = setTimeout(() => setStep((s) => (auth === 'none' && s === 2 ? 5 : s + 1)), reduce ? 200 : 1000);
    return () => clearTimeout(id);
  }, [step, auth, reduce]);
  const header = auth === 'entra' ? 'Authorization: Bearer eyJ0eXAi… (Entra ID token)' : auth === 'key' ? 'api-key: 3f9c…(from env var / Key Vault)' : '(no credentials)';
  return (
    <SimFrame title="Client ↔ server" icon="ArrowLeftRight" controls={<Seg label="Authentication" value={auth} onChange={(v) => { setAuth(v); setStep(0); }} options={[{ value: 'entra', label: 'Entra ID' }, { value: 'key', label: 'API key' }, { value: 'none', label: 'None' }]} />}
      shows="A REST request (headers + JSON body) travels to the protected endpoint; the model deployment runs inference and returns JSON. Without valid credentials, the endpoint rejects the request."
      omits="SDKs (Foundry SDK / OpenAI client) build these HTTP calls for you.">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs uppercase tracking-widest text-cyan-300 mb-1">Client (lightweight app)</p>
          <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap">{`POST /api/projects/<project>/openai/responses
Content-Type: application/json
${header}

{ "model": "gpt-4.1-mini",
  "input": "What is an AI application?" }`}</pre>
          <button className="ai-btn text-xs mt-2" onClick={() => setStep(1)}>Send request</button>
        </div>
        <div className="relative w-24 h-12 mx-auto">
          <div className="absolute top-1/2 inset-x-0 h-px bg-white/20" />
          {step >= 1 && step <= 2 && <motion.div className="absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full bg-cyan-300" initial={{ left: 0 }} animate={{ left: '90%' }} transition={{ duration: reduce ? 0 : 0.9 }} />}
          {step === 4 && <motion.div className="absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full bg-violet-300" initial={{ left: '90%' }} animate={{ left: 0 }} transition={{ duration: reduce ? 0 : 0.9 }} />}
        </div>
        <div className="rounded-xl bg-white/5 p-3 min-h-[150px]">
          <p className="text-xs uppercase tracking-widest text-violet-300 mb-1">Server (model deployment)</p>
          <ul className="text-xs space-y-1 text-gray-300">
            <li className={step >= 2 ? 'text-white' : 'opacity-40'}>{step === 5 ? '✗ 401 Unauthorized — no valid key or token' : '1. Validate credentials ✓'}</li>
            {step !== 5 && <><li className={step >= 3 ? 'text-white' : 'opacity-40'}>2. Apply system instructions & safety</li><li className={step >= 3 ? 'text-white' : 'opacity-40'}>3. Run inference</li><li className={step >= 4 ? 'text-white' : 'opacity-40'}>4. Return JSON response</li></>}
          </ul>
          {step >= 4 && step !== 5 && <pre className="text-[10px] font-mono text-gray-200 mt-2 whitespace-pre-wrap">{`{ "status": "completed",
  "output": [{ "type": "message", "content": [
    { "type": "output_text",
      "text": "An AI application is software that uses AI…" }]}] }`}</pre>}
        </div>
      </div>
    </SimFrame>
  );
}
