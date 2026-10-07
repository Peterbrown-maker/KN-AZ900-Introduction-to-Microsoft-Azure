import { motion } from 'framer-motion';
import type { MemoryScene } from '@/types/course';

interface MemoryMomentProps {
  scene: MemoryScene;
}

export function MemoryMoment({ scene }: MemoryMomentProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-xs font-mono uppercase tracking-[0.3em] text-gray-600 mb-12"
      >
        Memory Moment
      </motion.p>

      <div className="space-y-6">
        {scene.lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.4, duration: 0.6, type: 'spring' }}
          >
            {line.emphasis ? (
              <p className="text-2xl md:text-4xl font-bold tracking-tight text-glow" style={{ color: '#22d3ee' }}>
                {line.text}
              </p>
            ) : (
              <p className="text-base md:text-xl text-gray-400">{line.text}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
