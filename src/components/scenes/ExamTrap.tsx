import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';
import type { ExamTrapScene } from '@/types/course';

interface ExamTrapProps {
  scene: ExamTrapScene;
}

export function ExamTrap({ scene }: ExamTrapProps) {
  const [revealed, setRevealed] = useState(false);

  const verdictColor =
    scene.verdict === 'TRUE' ? '#22c55e' : scene.verdict === 'FALSE' ? '#ef4444' : '#f59e0b';
  const VerdictIcon = scene.verdict === 'TRUE' ? Check : scene.verdict === 'FALSE' ? X : AlertTriangle;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
      >
        <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">Exam Trap</p>
        </div>

        <div className="p-8">
          <p className="text-lg md:text-xl text-gray-300 italic mb-6 text-center">"{scene.claim}"</p>

          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.button
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRevealed(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block mx-auto px-8 py-3 rounded-xl font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all hover:bg-amber-500/30"
              >
                Reveal the Truth
              </motion.button>
            ) : (
              <motion.div
                key="verdict"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <div
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `${verdictColor}20`, border: `1px solid ${verdictColor}40` }}
                  >
                    <VerdictIcon className="w-6 h-6" style={{ color: verdictColor }} />
                  </div>
                  <p className="text-3xl font-bold" style={{ color: verdictColor }}>
                    {scene.verdict}
                  </p>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base text-gray-300 leading-relaxed text-center"
                >
                  {scene.explanation}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
