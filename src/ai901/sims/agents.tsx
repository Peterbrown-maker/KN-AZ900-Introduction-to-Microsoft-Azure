import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { User, ScrollText, Brain, Wrench, Database, MessageSquare, CheckCircle2, XCircle, Plane, Hotel, Wallet, Network } from 'lucide-react';
import { SimFrame, Seg } from '../ui';

// ---------------- Model vs agent ----------------
export function ModelVsAgent() {
  const [go, setGo] = useState(false);
  const reduce = useReducedMotion();
  const steps = ['Instructions: "You are a scheduling assistant. Confirm before booking."', 'Reason: need room availability → call knowledge tool', 'Tool: rooms.find(date="tomorrow", time="15:00") → Room 4B free', 'Reason: user asked to book → action tool, but confirm first', 'Response: "Room 4B is free at 3 pm tomorrow. Shall I book it?"'];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go || n >= steps.length) return;
    const t = setTimeout(() => setN((x) => x + 1), reduce ? 0 : 700);
    return () => clearTimeout(t);
  }, [go, n, steps.length, reduce]);
  return (
    <SimFrame title="Model vs agent" icon="Bot" controls={<button className="ai-btn text-xs" onClick={() => { setGo(true); setN(0); }}>Send request</button>}
      shows="A bare model can only generate text from the prompt. An agent adds instructions and tools, so it can look things up and take actions."
      omits="Real agents may loop through many reasoning and tool steps.">
      <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3 text-sm text-cyan-50 mb-4"><b>User:</b> Book a meeting room for 3 pm tomorrow and tell me which one.</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Model only (raw inference)</p>
          {go && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-200">I can't access your calendar or booking system. You could check your organisation's room-booking tool and look for availability at 3 pm tomorrow.</motion.p>}
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Agent (model + instructions + tools)</p>
          <ol className="space-y-1.5">
            {steps.slice(0, n).map((s, i) => <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className={`text-xs rounded-lg px-2.5 py-1.5 ${i === steps.length - 1 ? 'bg-emerald-500/15 text-emerald-100 text-sm' : 'bg-black/30 text-gray-300 font-mono'}`}>{s}</motion.li>)}
          </ol>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Agent simulator ----------------
type Tool = { name: string; kind: 'knowledge' | 'action' | 'none'; call: string; result: string };
const scenarios: { req: string; tool: Tool; reason: string; reply: string; risky?: boolean }[] = [
  { req: 'What\'s the status of order 1042?', tool: { name: 'orders_lookup', kind: 'knowledge', call: 'orders_lookup(order_id=1042)', result: '{ "status": "shipped", "carrier": "DHL", "eta": "Thu" }' }, reason: 'Needs live order data → knowledge tool.', reply: 'Order 1042 has shipped with DHL and should arrive on Thursday.' },
  { req: 'What is your returns policy for sale items?', tool: { name: 'policy_search (Foundry IQ)', kind: 'knowledge', call: 'knowledge.search("returns policy sale items")', result: '[Returns §2] Sale items can be returned within 14 days for store credit.' }, reason: 'Policy question → retrieve from the knowledge base (RAG).', reply: 'Sale items can be returned within 14 days for store credit. [Returns policy §2]' },
  { req: 'Refund order 1042, it arrived damaged.', tool: { name: 'issue_refund', kind: 'action', call: 'issue_refund(order_id=1042, amount=129.00)', result: '{ "refund_id": "RF-88", "status": "processed" }' }, reason: 'Changes money → action tool. Instructions require human approval over $50.', reply: 'I\'ve issued a refund of $129.00 (RF-88). It will reach your card in 3–5 days.', risky: true },
  { req: 'Tell me a fun fact about penguins.', tool: { name: '—', kind: 'none', call: '', result: '' }, reason: 'General knowledge — the model can answer directly; no tool needed.', reply: 'Emperor penguins can dive deeper than 500 metres!' },
];
const NODES = [
  { icon: User, label: 'User request' },
  { icon: ScrollText, label: 'Instructions' },
  { icon: Brain, label: 'Model reasons' },
  { icon: Wrench, label: 'Tool call' },
  { icon: Database, label: 'Tool result' },
  { icon: MessageSquare, label: 'Final response' },
];

export function AgentSimulator() {
  const [si, setSi] = useState(0);
  const [step, setStep] = useState(0);
  const [approval, setApproval] = useState(true);
  const [decision, setDecision] = useState<'pending' | 'approved' | 'denied'>('pending');
  const s = scenarios[si];
  const noTool = s.tool.kind === 'none';
  const needsApproval = approval && s.risky;
  const blocked = needsApproval && step >= 3 && decision === 'pending';
  const advance = () => {
    if (blocked) return;
    let next = step + 1;
    if (noTool && next === 3) next = 5;
    setStep(Math.min(5, next));
  };
  const select = (i: number) => { setSi(i); setStep(0); setDecision('pending'); };
  const detail = [
    s.req,
    'System prompt: "You are Contoso\'s customer-service agent. Use tools for order data and policies. Refunds over $50 require human approval. Be concise."',
    s.reason,
    noTool ? 'No tool required.' : needsApproval && decision === 'pending' ? `Proposed: ${s.tool.call} — waiting for human approval…` : decision === 'denied' ? `Denied by reviewer: ${s.tool.call} was not executed.` : `${s.tool.call}`,
    noTool ? '—' : decision === 'denied' ? '(no result)' : s.tool.result,
    decision === 'denied' ? 'A team member will review your refund request and contact you within one business day.' : s.reply,
  ];
  return (
    <SimFrame title="AI agent simulator" icon="Bot" onReset={() => select(si)}
      controls={<Seg label="Human approval" value={approval ? 'on' : 'off'} onChange={(v) => { setApproval(v === 'on'); setDecision('pending'); }} options={[{ value: 'on', label: 'Approval on' }, { value: 'off', label: 'Approval off' }]} />}
      shows="Follow a request through instructions, the model's decision, tool selection (knowledge vs action), the returned result and the final response. Risky action tools can be gated behind a human."
      omits="The model's reasoning is summarised in plain English; real agents produce structured tool calls and may chain several tools.">
      <div className="flex flex-wrap gap-2 mb-4">
        {scenarios.map((x, i) => <button key={i} onClick={() => select(i)} className={`text-xs px-3 py-1.5 rounded-full border ${i === si ? 'text-[#050a17] border-transparent' : 'border-white/10 text-gray-300'}`} style={i === si ? { background: 'var(--accent)' } : undefined}>{x.req}</button>)}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {NODES.map((n, i) => {
          const active = i <= step && !(noTool && (i === 3 || i === 4));
          const isTool = i === 3 && !noTool;
          return (
            <motion.button key={n.label} onClick={() => !(noTool && (i === 3 || i === 4)) && (!needsApproval || decision !== 'pending' || i <= 3) && setStep(i)} animate={{ scale: i === step ? 1.05 : 1 }}
              className={`rounded-xl p-2.5 border text-center ${active ? 'border-transparent' : 'border-white/10 opacity-50'} ${noTool && (i === 3 || i === 4) ? 'line-through opacity-30' : ''}`}
              style={active ? { background: i === step ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'rgba(255,255,255,0.06)' } : undefined}>
              <n.icon className="w-5 h-5 mx-auto mb-1" style={{ color: active ? 'var(--accent)' : '#64748b' }} />
              <p className="text-[10px] text-gray-200 leading-tight">{n.label}</p>
              {isTool && active && <p className={`text-[9px] mt-0.5 ${s.tool.kind === 'action' ? 'text-amber-300' : 'text-cyan-300'}`}>{s.tool.kind} tool</p>}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${si}-${step}-${decision}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-black/30 border border-white/10 p-4 min-h-[88px]">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{NODES[step].label}</p>
          <p className={`text-sm ${step === 3 || step === 4 ? 'font-mono text-gray-200' : 'text-gray-100'}`}>{detail[step]}</p>
          {blocked && (
            <div className="flex gap-2 mt-3">
              <button className="ai-btn text-xs" onClick={() => setDecision('approved')}><CheckCircle2 className="w-4 h-4" /> Approve refund</button>
              <button className="ai-btn-ghost text-xs" onClick={() => { setDecision('denied'); }}><XCircle className="w-4 h-4" /> Deny</button>
            </div>
          )}
          {s.risky && !approval && step >= 3 && <p className="text-xs text-red-300 mt-2">⚠ Approval is off: the agent moved money with no human check. Is that acceptable for your organisation?</p>}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-end mt-3"><button className="ai-btn text-sm" onClick={advance} disabled={step >= 5 || blocked}>{step >= 5 ? 'Done' : 'Next step'}</button></div>
    </SimFrame>
  );
}

// ---------------- Multi-agent ----------------
const msgs = [
  { from: 'User', to: 'Orchestrator', t: 'Plan a 2-day trip to Lisbon next month under €900.' },
  { from: 'Orchestrator', to: 'Flight agent', t: 'Find return flights for the dates.' },
  { from: 'Orchestrator', to: 'Hotel agent', t: 'Find 2 nights near the centre.' },
  { from: 'Flight agent', to: 'Orchestrator', t: 'TAP €310 return.' },
  { from: 'Hotel agent', to: 'Orchestrator', t: 'Hotel Baixa €2×180 = €360.' },
  { from: 'Orchestrator', to: 'Budget agent', t: 'Check €670 against €900 limit.' },
  { from: 'Budget agent', to: 'Orchestrator', t: 'Within budget; €230 left for meals and transport.' },
  { from: 'Orchestrator', to: 'User', t: 'Proposed plan: TAP flights + Hotel Baixa, total €670. Shall I hold these bookings for your approval?' },
];
const AG = [
  { k: 'User', icon: User, x: 50, y: 20 },
  { k: 'Orchestrator', icon: Network, x: 50, y: 50 },
  { k: 'Flight agent', icon: Plane, x: 15, y: 85 },
  { k: 'Hotel agent', icon: Hotel, x: 50, y: 85 },
  { k: 'Budget agent', icon: Wallet, x: 85, y: 85 },
];
export function MultiAgent() {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play || n >= msgs.length) return;
    const t = setTimeout(() => setN((x) => x + 1), reduce ? 0 : 1100);
    return () => clearTimeout(t);
  }, [play, n, reduce]);
  const cur = msgs[n - 1];
  const pos = (k: string) => AG.find((a) => a.k === k)!;
  return (
    <SimFrame title="Multi-agent system" icon="Network" controls={<button className="ai-btn text-xs" onClick={() => { setN(0); setPlay(true); }}>Play</button>}
      shows="An orchestrator splits a goal into tasks, delegates them to specialist agents through prompts, and combines the results — ending with a human approval point."
      omits="Real multi-agent frameworks also manage shared state, retries and error handling.">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
        <div className="relative h-64 rounded-xl bg-black/30">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {AG.slice(2).map((a) => <line key={a.k} x1={50} y1={50} x2={a.x} y2={a.y} stroke="#334155" strokeWidth={0.4} />)}
            <line x1={50} y1={20} x2={50} y2={50} stroke="#334155" strokeWidth={0.4} />
            {cur && <line x1={pos(cur.from).x} y1={pos(cur.from).y} x2={pos(cur.to).x} y2={pos(cur.to).y} stroke="var(--accent)" strokeWidth={1} strokeDasharray="2 1.5" />}
          </svg>
          {AG.map((a) => {
            const on = cur && (cur.from === a.k || cur.to === a.k);
            return (
              <div key={a.k} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
                <motion.div animate={{ scale: on ? 1.15 : 1 }} className="w-11 h-11 rounded-full grid place-items-center mx-auto border" style={{ background: on ? 'color-mix(in srgb, var(--accent) 35%, #050a17)' : '#0b1328', borderColor: on ? 'var(--accent)' : '#334155' }}>
                  <a.icon className="w-5 h-5 text-gray-100" />
                </motion.div>
                <p className="text-[10px] text-gray-300 mt-1 whitespace-nowrap">{a.k}</p>
              </div>
            );
          })}
        </div>
        <ol className="space-y-1.5 max-h-64 overflow-y-auto text-xs">
          {msgs.slice(0, n).map((m, i) => <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg bg-white/5 px-2.5 py-1.5"><span className="text-gray-400">{m.from} → {m.to}:</span> <span className="text-gray-100">{m.t}</span></motion.li>)}
          {n === 0 && <li className="text-gray-500">Press Play.</li>}
        </ol>
      </div>
    </SimFrame>
  );
}
