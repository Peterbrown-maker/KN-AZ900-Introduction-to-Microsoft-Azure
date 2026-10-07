import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle } from 'lucide-react';
import type { KnowledgeCheckScene } from '@/types/course';

interface KnowledgeCheckProps {
  scene: KnowledgeCheckScene;
  onAnswer?: (correct: boolean) => void;
}

export function KnowledgeCheck({ scene, onAnswer }: KnowledgeCheckProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelectedId(id);
    setAnswered(true);
    onAnswer?.(id === scene.correctId);
  };

  const correct = selectedId === scene.correctId;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-azure-500/20 flex items-center justify-center border border-azure-400/30">
            <HelpCircle className="w-5 h-5 text-azure-400" />
          </div>
          <p className="text-sm font-bold text-azure-400 uppercase tracking-wider">Knowledge Check</p>
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed">
          {scene.question}
        </h3>

        <div className="space-y-3">
          {scene.options.map((option) => {
            const isCorrect = option.id === scene.correctId;
            const isSelected = option.id === selectedId;
            const showCorrect = answered && isCorrect;
            const showWrong = answered && isSelected && !isCorrect;

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                whileTap={!answered ? { scale: 0.99 } : {}}
                disabled={answered}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  showCorrect
                    ? 'bg-green-500/15 border-green-500/40'
                    : showWrong
                    ? 'bg-red-500/15 border-red-500/40'
                    : answered
                    ? 'glass-light border-white/8 opacity-50'
                    : 'glass-light border-white/10 hover:border-azure-400/30 hover:bg-azure-500/5'
                }`}
              >
                <span className={`text-sm md:text-base ${showCorrect ? 'text-green-400' : showWrong ? 'text-red-400' : 'text-gray-300'}`}>
                  {option.text}
                </span>
                {showCorrect && <Check className="w-5 h-5 text-green-400 shrink-0" />}
                {showWrong && <X className="w-5 h-5 text-red-400 shrink-0" />}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div
                className={`rounded-xl p-5 border ${
                  correct ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <p className={`font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  {correct ? 'Correct!' : 'Not quite.'}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{scene.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
