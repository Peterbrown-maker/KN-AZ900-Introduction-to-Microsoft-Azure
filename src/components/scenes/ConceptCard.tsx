import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { ConceptScene } from '@/types/course';

interface ConceptCardProps {
  scene: ConceptScene;
}

export function ConceptCard({ scene }: ConceptCardProps) {
  const accent = scene.accent ?? '#0078d4';
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>>)[scene.icon] ?? Icons.Circle;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8 md:p-12"
        whileHover={{ y: -2 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
            boxShadow: `0 0 30px ${accent}40`,
          }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-4xl font-bold text-white mb-2"
        >
          {scene.title}
        </motion.h2>

        {scene.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-400 mb-4"
          >
            {scene.subtitle}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base md:text-lg text-gray-300 leading-relaxed"
        >
          {scene.body}
        </motion.p>
      </motion.div>
    </div>
  );
}
