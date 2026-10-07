import { motion } from 'framer-motion';
import type { OpenerScene } from '@/types/course';

interface ChapterOpenerProps {
  scene: OpenerScene;
  accent: string;
}

export function ChapterOpener({ scene, accent }: ChapterOpenerProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
            boxShadow: `0 0 60px ${accent}40`,
          }}
        >
          <span className="text-4xl font-bold text-white">{scene.chapterNumber}</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: `1px solid ${accent}40` }}
          animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-sm font-mono uppercase tracking-[0.3em] text-gray-500 mb-4"
      >
        Chapter {scene.chapterNumber.toString().padStart(2, '0')}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
        style={{ textShadow: `0 0 40px ${accent}30` }}
      >
        {scene.chapterTitle}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-400 italic mb-10"
      >
        {scene.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3 max-w-2xl"
      >
        {scene.items.map((item, i) => (
          <motion.span
            key={item}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.08 }}
            className="px-4 py-2 rounded-full text-sm font-medium glass-light"
            style={{ color: accent, borderColor: `${accent}30` }}
          >
            {item}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
