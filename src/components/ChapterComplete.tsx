import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ChapterCompleteScene } from '@/types/course';

interface ChapterCompleteProps {
  scene: ChapterCompleteScene;
  accent: string;
}

export function ChapterComplete({ scene, accent }: ChapterCompleteProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative mb-8"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
            boxShadow: `0 0 40px ${accent}50`,
          }}
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${accent}40` }}
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-5xl font-bold text-white mb-4"
      >
        Chapter {scene.chapterNumber} Complete
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 mb-10 max-w-md"
      >
        What did you just learn?
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-2 max-w-2xl mb-12"
      >
        {scene.concepts.map((concept, i) => (
          <motion.span
            key={concept}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.05 }}
            className="px-4 py-2 rounded-lg text-sm font-medium glass-light text-gray-200"
          >
            {concept}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="glass rounded-2xl p-8 max-w-md w-full"
      >
        <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-4 text-left">Memory Map</p>
        <div className="space-y-4 text-left">
          {scene.memoryMap.map((node) => (
            <div key={node.label}>
              <p className="font-bold text-sm mb-2" style={{ color: accent }}>
                {node.label}
              </p>
              {node.children && (
                <ul className="space-y-1 ml-4">
                  {node.children.map((child) => (
                    <li key={child} className="text-xs text-gray-400 flex items-start gap-2">
                      <span style={{ color: accent }}>└</span>
                      {child}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
