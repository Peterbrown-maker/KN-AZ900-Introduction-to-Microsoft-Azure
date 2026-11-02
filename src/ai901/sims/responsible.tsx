import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Scale } from 'lucide-react';
import { SimFrame, Slider, Bar } from '../ui';

interface Scenario { ctx: string; title: string; text: string; choices: { c: string; good: boolean; outcome: string }[]; principle: string; lesson: string }
const SCENARIOS: Scenario[] = [
  { ctx: 'Banking', title: 'Loan approval disclosure', text: 'Your bank\'s new AI model pre-screens loan applications. Marketing wants to avoid mentioning AI so customers "don\'t worry".', principle: 'Transparency',
    choices: [{ c: 'Disclose that AI is used, explain the main factors considered and how to request a human review.', good: true, outcome: 'Customers understand decisions and trust rises; regulators are satisfied.' }, { c: 'Say nothing — decisions are accurate anyway.', good: false, outcome: 'A journalist discovers the undisclosed AI; complaints and regulatory scrutiny follow.' }],
    lesson: 'People should know when AI affects them and understand its limits. Disclose AI use and data characteristics without revealing confidential details.' },
  { ctx: 'Education', title: 'Admissions screening', text: 'An admissions model trained on 10 years of past decisions is 91% accurate. Testing shows it scores applicants from two postcodes lower, even with identical grades.', principle: 'Fairness',
    choices: [{ c: 'Remove the proxy features, re-test outcomes across demographic groups, and keep human review of borderline cases.', good: true, outcome: 'Score gaps close; decisions are based on relevant academic criteria.' }, { c: 'Deploy it — 91% accuracy is excellent.', good: false, outcome: 'Historic bias is automated at scale; qualified applicants are unfairly rejected.' }],
    lesson: 'Overall accuracy can hide unfair outcomes for groups. Test by group and avoid features that act as proxies for protected characteristics.' },
  { ctx: 'Robotics', title: 'Warehouse picking robot', text: 'A vision-guided robot arm sometimes misidentifies fragile glass items as plastic (confidence ~0.6). Throughput targets are tight.', principle: 'Reliability & safety',
    choices: [{ c: 'Only act above a high confidence threshold; below it, pause and request a human check.', good: true, outcome: 'Breakages drop sharply; a few more items need manual handling.' }, { c: 'Act on every prediction to hit throughput targets.', good: false, outcome: 'Broken stock and a near-miss injury halt the line.' }],
    lesson: 'Use confidence thresholds before physical actions; design fallbacks for uncertain cases.' },
  { ctx: 'Airport security', title: 'Facial identification images', text: 'A fast-track gate captures travellers\' faces for temporary access. The vendor suggests keeping all images "for future model improvements".', principle: 'Privacy & security',
    choices: [{ c: 'Delete images once no longer required and restrict access to staff with a genuine need.', good: true, outcome: 'Minimal data is held; breach impact and privacy risk are low.' }, { c: 'Keep everything indefinitely and let all operators browse images.', good: false, outcome: 'A data breach exposes millions of biometric images.' }],
    lesson: 'Collect and retain only what is needed; secure it and limit access.' },
  { ctx: 'Customer service', title: 'Voice-only assistant', text: 'Your new support agent works only by voice. Some customers are deaf or hard of hearing; others call from noisy environments.', principle: 'Inclusiveness',
    choices: [{ c: 'Provide text captions and a chat alternative alongside voice.', good: true, outcome: 'Everyone can use the service, including people with hearing impairments.' }, { c: 'Voice only — it\'s the future.', good: false, outcome: 'A group of customers is excluded and complaints rise.' }],
    lesson: 'Design for everyone: offer alternative input and output methods.' },
  { ctx: 'Healthcare', title: 'Who signs off?', text: 'A triage model suggests which patients a nurse should see first. When a suggestion is wrong, nobody is sure who is responsible.', principle: 'Accountability',
    choices: [{ c: 'Assign a clinical owner, keep clinicians as final decision-makers, log decisions and set up an incident process.', good: true, outcome: 'Clear ownership; errors are caught, reviewed and fixed.' }, { c: '"The model decided" — it\'s the vendor\'s problem.', good: false, outcome: 'Harm occurs and no one can explain or correct it.' }],
    lesson: 'People and organisations remain accountable for AI systems and their outcomes.' },
  { ctx: 'Cybersecurity', title: 'Auto-blocking accounts', text: 'An anomaly-detection model can automatically lock employee accounts it flags as compromised. It has a 4% false-positive rate.', principle: 'Reliability & safety',
    choices: [{ c: 'Auto-lock only at very high risk scores; route medium scores to the SOC for review; let users appeal quickly.', good: true, outcome: 'Real attacks are stopped; false lock-outs are rare and resolved fast.' }, { c: 'Lock every flagged account immediately.', good: false, outcome: 'Hundreds of staff are locked out during a critical deadline.' }],
    lesson: 'Match automation level to the cost of errors; combine thresholds with human review and appeal.' },
  { ctx: 'Forex project', title: 'Publishing your model', text: 'Your experimental EUR/USD model had 56% directional accuracy in a backtest. A friend suggests selling signals as "AI-guaranteed profits".', principle: 'Transparency',
    choices: [{ c: 'Describe it honestly as an experiment, publish its limitations and test conditions, and make no profit claims.', good: true, outcome: 'Others can learn from it without being misled.' }, { c: 'Market it as guaranteed profits — the AI is accurate.', good: false, outcome: 'Users lose money in a regime change; the claims were misleading.' }],
    lesson: 'Be clear about what a model can and cannot do. Backtests are not guarantees.' },
];

export function RAIScenarios() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const s = SCENARIOS[i];
  const done = i >= SCENARIOS.length;
  return (
    <SimFrame title="Responsible AI decisions" icon="Scale" onReset={() => { setI(0); setPick(null); setScore(0); }}
      controls={<span className="text-xs font-mono text-gray-400">{Math.min(i + 1, SCENARIOS.length)}/{SCENARIOS.length} · {score} responsible</span>}
      shows="Realistic decisions, their consequences, and the responsible AI principle each one tests." omits="Real cases usually involve several principles and trade-offs at once.">
      {done ? (
        <div className="text-center py-8"><Scale className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--accent)' }} /><p className="text-2xl font-bold text-white">{score} / {SCENARIOS.length}</p><button className="ai-btn mt-4" onClick={() => { setI(0); setPick(null); setScore(0); }}>Replay</button></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-xs uppercase tracking-widest text-gray-500">{s.ctx}</p>
            <p className="text-lg font-bold text-white">{s.title}</p>
            <p className="text-gray-300 mt-1 mb-4">{s.text}</p>
            <div className="space-y-2">
              {s.choices.map((c, j) => (
                <button key={j} disabled={pick !== null} onClick={() => { setPick(j); if (c.good) setScore((x) => x + 1); }}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm ${pick === null ? 'border-white/10 hover:border-white/30 bg-white/[0.03]' : c.good ? 'border-emerald-400/50 bg-emerald-500/10' : pick === j ? 'border-red-400/50 bg-red-500/10' : 'border-white/5 opacity-60'}`}>
                  <span className="text-gray-100">{c.c}</span>
                  {pick !== null && <span className={`block mt-1 text-xs ${c.good ? 'text-emerald-300' : 'text-red-300'}`}>Consequence: {c.outcome}</span>}
                </button>
              ))}
            </div>
            {pick !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-white/5 p-4">
                <p className="text-sm"><span className="text-gray-400">Principle: </span><b style={{ color: 'var(--accent)' }}>{s.principle}</b></p>
                <p className="text-sm text-gray-300 mt-1">{s.lesson}</p>
                <button className="ai-btn mt-3 text-sm" onClick={() => { setI(i + 1); setPick(null); }}>Next scenario <ArrowRight className="w-4 h-4" /></button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </SimFrame>
  );
}

export function ConfidenceThreshold() {
  const [th, setTh] = useState(0.7);
  const items = useMemo(() => {
    let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 60 }, () => { const correct = r() < 0.82; const conf = correct ? 0.55 + r() * 0.45 : 0.3 + r() * 0.5; return { correct, conf }; });
  }, []);
  const auto = items.filter((x) => x.conf >= th), esc = items.filter((x) => x.conf < th);
  const mistakes = auto.filter((x) => !x.correct).length;
  return (
    <SimFrame title="Confidence threshold trade-off" icon="Gauge"
      shows="Raising the threshold reduces automated mistakes but sends more items to people. The 'right' threshold depends on how costly a mistake is."
      omits="Real systems calibrate confidence on validation data; raw model scores are not always well calibrated.">
      <Slider label="Act automatically when confidence ≥" value={th} min={0.3} max={0.99} step={0.01} onChange={setTh} format={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-12 sm:grid-cols-20 gap-1 my-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(1.4rem, 1fr))' }}>
        {items.map((x, i) => <div key={i} title={`confidence ${x.conf.toFixed(2)}`} className={`aspect-square rounded text-[9px] grid place-items-center ${x.conf < th ? 'bg-white/10 text-gray-400' : x.correct ? 'bg-emerald-500/50' : 'bg-red-500/70'}`}>{x.conf < th ? '👤' : ''}</div>)}
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-white/5 p-3"><p className="text-gray-400 text-xs">Automated</p><p className="text-xl font-bold text-white">{auto.length}</p><Bar value={auto.length / items.length} color="#34d399" /></div>
        <div className="rounded-xl bg-white/5 p-3"><p className="text-gray-400 text-xs">Automated mistakes</p><p className="text-xl font-bold text-red-300">{mistakes}</p><Bar value={mistakes / 12} color="#f87171" /></div>
        <div className="rounded-xl bg-white/5 p-3"><p className="text-gray-400 text-xs">Escalated to humans 👤</p><p className="text-xl font-bold text-gray-100">{esc.length}</p><Bar value={esc.length / items.length} color="#94a3b8" /></div>
      </div>
    </SimFrame>
  );
}
