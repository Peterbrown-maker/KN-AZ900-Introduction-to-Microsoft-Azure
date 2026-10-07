import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb } from 'lucide-react';
import { serviceSelectionQuestions } from '@/data/scenarios';
import * as Icons from 'lucide-react';

export function ServiceSelection() {
  const [current, setCurrent] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const q = serviceSelectionQuestions[current];
  const correct = selectedId === q.correctId;
  const isLast = current === serviceSelectionQuestions.length - 1;
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
        <h3 className="text-xl font-bold text-white text-center mb-2">Service Selection Challenge</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Real-world requirements. Choose the correct Azure service.</p>

        {!allDone && (
          <>
            <p className="text-xs text-gray-500 text-center mb-4">
              Challenge {current + 1} of {serviceSelectionQuestions.length}
            </p>
            <div className="w-full h-1 rounded-full bg-white/10 mb-6">
              <motion.div
                className="h-full bg-gradient-to-r from-azure-400 to-green-400 rounded-full"
                animate={{ width: `${((current + (answered ? 1 : 0)) / serviceSelectionQuestions.length) * 100}%` }}
              />
            </div>
          </>
        )}

        {!allDone && (
          <>
            <div className="glass-light rounded-xl p-5 mb-6 border border-azure-400/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-azure-400 shrink-0 mt-0.5" />
                <p className="text-base md:text-lg font-semibold text-white leading-relaxed">"{q.scenario}"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {q.options.map((opt) => {
                const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[opt.icon] ?? Icons.Circle;
                const isCorrect = opt.id === q.correctId;
                const isSelected = opt.id === selectedId;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    disabled={answered}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
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
                  Next Challenge →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
            <p className="text-3xl font-bold text-green-400">{score} / {serviceSelectionQuestions.length}</p>
            <p className="text-sm text-gray-400">
              {score === serviceSelectionQuestions.length ? 'Perfect! You can select the right Azure service for any requirement.' : 'Review the explanations and try again.'}
            </p>
            <button onClick={reset} className="btn-ghost text-sm">Retry Challenge</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
