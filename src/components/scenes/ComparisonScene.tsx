import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { ComparisonScene } from '@/types/course';

interface ComparisonSceneProps {
  scene: ComparisonScene;
}

export function ComparisonSceneView({ scene }: ComparisonSceneProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white text-center mb-10"
      >
        {scene.title}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scene.columns.map((col, i) => {
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>>)[col.icon] ?? Icons.Circle;
          return (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-6"
              style={{ borderTop: `3px solid ${col.accent}` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${col.accent}20`, border: `1px solid ${col.accent}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: col.accent }} />
                </div>
                <p className="font-bold text-lg" style={{ color: col.accent }}>
                  {col.label}
                </p>
              </div>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {scene.verdict && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-base md:text-lg text-gray-400 italic mt-8 max-w-2xl mx-auto"
        >
          {scene.verdict}
        </motion.p>
      )}
    </div>
  );
}
