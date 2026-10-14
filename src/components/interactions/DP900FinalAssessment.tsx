import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, RotateCcw } from 'lucide-react';
import { dp900FinalAssessmentQuestions } from '@/data/dp900/scenarios';

export function DP900FinalAssessment({ onComplete }: { onComplete?: (score: number, total: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = dp900FinalAssessmentQuestions[current];
  const correct = selectedId === q.correctId;
  const isLast = current === dp900FinalAssessmentQuestions.length - 1;

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelectedId(id);
    setAnswered(true);
    const isCorrect = id === q.correctId;
    if (isCorrect) setScore(score + 1);
    setAnswers([...answers, isCorrect]);
  };

  const next = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.(score, dp900FinalAssessmentQuestions.length);
    } else {
      setCurrent(current + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelectedId(null);
    setAnswered(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / dp900FinalAssessmentQuestions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">DP-900 Assessment Complete</h2>
          <p className="text-sm text-gray-400 mb-8">You answered {score} out of {dp900FinalAssessmentQuestions.length} correctly.</p>

          <div className="text-5xl font-bold text-green-400 mb-2">{pct}%</div>
          <p className="text-sm text-gray-400 mb-8">
            {pct >= 80 ? 'Excellent! You are ready for DP-900 exam preparation.' : pct >= 60 ? 'Good progress. Review the areas you missed.' : 'Keep studying — revisit the chapters you find challenging.'}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {answers.map((correct, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  correct ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>

          <button onClick={reset} className="btn-ghost flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" />
            Retake Assessment
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">DP-900 Final Knowledge Assessment</h3>
          <p className="text-sm text-gray-400">A comprehensive test covering all four DP-900 learning paths.</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Question {current + 1} of {dp900FinalAssessmentQuestions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"
            animate={{ width: `${((current + (answered ? 1 : 0)) / dp900FinalAssessmentQuestions.length) * 100}%` }}
          />
        </div>

        <p className="text-base md:text-lg font-semibold text-white mb-6 leading-relaxed">{q.scenario}</p>

        <div className="space-y-3 mb-6">
          {q.options.map((opt) => {
            const isCorrect = opt.id === q.correctId;
            const isSelected = opt.id === selectedId;
            return (
              <motion.button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                whileTap={!answered ? { scale: 0.99 } : {}}
                disabled={answered}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                  answered && isCorrect ? 'bg-green-500/15 border-green-500/40' :
                  answered && isSelected ? 'bg-red-500/15 border-red-500/40' :
                  'glass-light border-white/10 hover:border-emerald-400/30'
                }`}
              >
                <span className={`text-sm ${answered && isCorrect ? 'text-green-400' : answered && isSelected ? 'text-red-400' : 'text-gray-300'}`}>
                  {opt.text}
                </span>
                {answered && isCorrect && <Check className="w-4 h-4 text-green-400 inline ml-2" />}
                {answered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 inline ml-2" />}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <div className={`p-4 rounded-xl ${correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className={`font-semibold mb-1 ${correct ? 'text-green-400' : 'text-red-400'}`}>{correct ? 'Correct!' : 'Not quite.'}</p>
                <p className="text-sm text-gray-300">{q.explanation}</p>
              </div>
              <button onClick={next} className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-400/30 hover:bg-emerald-500/30 transition-all active:scale-95">
                {isLast ? 'Finish Assessment →' : 'Next Question →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
