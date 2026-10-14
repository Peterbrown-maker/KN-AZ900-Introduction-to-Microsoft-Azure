import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ScenarioQuestion {
  scenario: string;
  options: { id: string; text: string; icon?: string }[];
  correctId: string;
  explanation: string;
}

export function ScenarioInteraction({ questions, title, description }: { questions: ScenarioQuestion[]; title: string; description: string }) {
  const [current, setCurrent] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[current];
  const correct = selectedId === q.correctId;
  const isLast = current === questions.length - 1;
  const allDone = isLast && answered;

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelectedId(id);
    setAnswered(true);
    if (id === q.correctId) setScore(score + 1);
  };

  const next = () => {
    setCurrent(current + 1);
    setSelectedId(null);
    setAnswered(false);
  };

  const reset = () => {
    setCurrent(0);
    setSelectedId(null);
    setAnswered(false);
    setScore(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-400 text-center mb-4">{description}</p>

        {!allDone && (
          <>
            <p className="text-xs text-gray-500 text-center mb-4">Question {current + 1} of {questions.length}</p>
            <div className="w-full h-1 rounded-full bg-white/10 mb-6">
              <motion.div className="h-full bg-azure-500 rounded-full" animate={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
            </div>
          </>
        )}

        {!allDone && (
          <>
            <p className="text-base md:text-lg font-semibold text-white mb-6 text-center leading-relaxed">{q.scenario}</p>
            <div className="space-y-3 mb-6">
              {q.options.map((opt) => {
                const Icon = opt.icon ? (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[opt.icon] ?? HelpCircle : HelpCircle;
                const isCorrect = opt.id === q.correctId;
                const isSelected = opt.id === selectedId;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    disabled={answered}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      answered && isCorrect ? 'bg-green-500/15 border-green-500/40' :
                      answered && isSelected ? 'bg-red-500/15 border-red-500/40' :
                      'glass-light border-white/10 hover:border-azure-400/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${answered && isCorrect ? 'text-green-400' : answered && isSelected ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className={`text-sm text-left flex-1 ${answered && isCorrect ? 'text-green-400' : answered && isSelected ? 'text-red-400' : 'text-gray-300'}`}>
                      {opt.text}
                    </span>
                    {answered && isCorrect && <Check className="w-4 h-4 text-green-400 shrink-0" />}
                    {answered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        <AnimatePresence>
          {answered && !allDone && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <div className={`p-4 rounded-xl ${correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className={`font-semibold mb-1 ${correct ? 'text-green-400' : 'text-red-400'}`}>{correct ? 'Correct!' : 'Not quite.'}</p>
                <p className="text-sm text-gray-300">{q.explanation}</p>
              </div>
              {!isLast && (
                <button onClick={next} className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95">
                  Next Question →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
            <p className="text-3xl font-bold text-azure-400">{score} / {questions.length}</p>
            <p className="text-sm text-gray-400">
              {score === questions.length ? 'Perfect score! You have mastered this area.' : 'Review the explanations and try again.'}
            </p>
            <button onClick={reset} className="btn-ghost text-sm">Retry</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
