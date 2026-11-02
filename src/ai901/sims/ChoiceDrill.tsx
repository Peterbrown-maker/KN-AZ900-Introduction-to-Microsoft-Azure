import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Trophy } from 'lucide-react';
import { SimFrame, Rich, shuffle } from '../ui';

export interface DrillItem {
  prompt: string;
  /** Per-item options; falls back to the drill's shared `buckets`. */
  options?: string[];
  answer: string;
  why: string;
  /** Optional extra explanation per wrong option. */
  wrong?: Record<string, string>;
}

interface Props {
  title: string;
  icon?: string;
  intro?: string;
  buckets?: string[];
  items: DrillItem[];
  shows?: string;
  omits?: string;
}

/** A scenario-by-scenario decision drill with immediate feedback. */
export function ChoiceDrill({ title, icon, intro, buckets, items, shows, omits }: Props) {
  const [seed, setSeed] = useState(7);
  const order = useMemo(() => shuffle(items, seed), [items, seed]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= order.length;
  const item = order[i];

  const reset = () => { setSeed((s) => s + 13); setI(0); setPick(null); setScore(0); };
  const choose = (o: string) => {
    if (pick) return;
    setPick(o);
    if (o === item.answer) setScore((s) => s + 1);
  };

  return (
    <SimFrame title={title} icon={icon} onReset={reset} shows={shows} omits={omits}
      controls={<span className="text-xs font-mono text-gray-400">{Math.min(i + 1, order.length)}/{order.length} · score {score}</span>}>
      {intro && !done && i === 0 && !pick && <p className="text-sm text-gray-400 mb-4"><Rich text={intro} /></p>}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
            <p className="text-2xl font-bold text-white">{score} / {order.length}</p>
            <p className="text-sm text-gray-400 mt-1">{score === order.length ? 'Perfect — you can tell these apart.' : 'Reset to try again with a new order.'}</p>
            <button onClick={reset} className="ai-btn mt-5">Try again</button>
          </motion.div>
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <p className="text-base sm:text-lg text-white font-medium mb-4 leading-relaxed"><Rich text={item.prompt} /></p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(item.options ?? buckets ?? []).map((o) => {
                const right = pick && o === item.answer;
                const wrong = pick === o && o !== item.answer;
                return (
                  <button key={o} onClick={() => choose(o)} disabled={!!pick}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between gap-2 ${
                      right ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200' : wrong ? 'border-red-400/60 bg-red-500/15 text-red-200' : pick ? 'border-white/5 text-gray-500' : 'border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/30 hover:bg-white/[0.06]'
                    }`}>
                    <span>{o}</span>
                    {right && <Check className="w-4 h-4 shrink-0" />}
                    {wrong && <X className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {pick && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl p-4 bg-white/[0.04] border border-white/10">
                <p className={`text-sm font-semibold mb-1 ${pick === item.answer ? 'text-emerald-300' : 'text-red-300'}`}>
                  {pick === item.answer ? 'Correct' : `Not quite — the answer is ${item.answer}`}
                </p>
                {pick !== item.answer && item.wrong?.[pick] && <p className="text-sm text-gray-400 mb-1"><Rich text={item.wrong[pick]} /></p>}
                <p className="text-sm text-gray-300"><Rich text={item.why} /></p>
                <button onClick={() => { setI(i + 1); setPick(null); }} className="ai-btn mt-3 text-sm">
                  {i + 1 < order.length ? 'Next' : 'See score'} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SimFrame>
  );
}
