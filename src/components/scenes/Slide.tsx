import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { SlideScene } from '@/types/course';

interface SlideProps {
  scene: SlideScene;
  accent: string;
}

function VisualElement({ visual, accent }: { visual?: string; accent: string }) {
  if (!visual) return null;

  const visuals: Record<string, React.ReactNode> = {
    'cloud-intro': (
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative"
      >
        <div className="w-32 h-20 rounded-full blur-xl absolute inset-0" style={{ background: accent, opacity: 0.2 }} />
        <div className="relative flex items-center justify-center">
          <Icons.Cloud className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
        </div>
      </motion.div>
    ),
    'world-map': (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <Icons.Globe className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    'data-flow': (
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            className="w-2 h-2 rounded-full"
            style={{ background: accent }}
          />
        ))}
      </div>
    ),
    server: (
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <Icons.Server className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    network: (
      <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
        <Icons.Network className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    storage: (
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <Icons.Database className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    database: (
      <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        <Icons.Database className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    identity: (
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <Icons.Fingerprint className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    security: (
      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <Icons.Shield className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    governance: (
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        <Icons.Scale className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    management: (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
        <Icons.Settings className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    pricing: (
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <Icons.Wallet className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    reliability: (
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <Icons.ShieldCheck className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    ai: (
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <Icons.Brain className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
    edge: (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
        <Icons.Cpu className="w-24 h-24" style={{ color: accent, opacity: 0.6 }} strokeWidth={1} />
      </motion.div>
    ),
  };

  return <div className="flex items-center justify-center mb-8">{visuals[visual] ?? null}</div>;
}

export function Slide({ scene, accent }: SlideProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <VisualElement visual={scene.visual} accent={accent} />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3 text-center"
        >
          {scene.title}
        </motion.h2>

        {scene.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 text-center mb-6"
          >
            {scene.subtitle}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-lg text-gray-300 leading-relaxed text-center mb-8 max-w-2xl mx-auto"
        >
          {scene.body}
        </motion.p>

        {scene.bullets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
          >
            {scene.bullets.map((bullet, i) => {
              const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>>)[bullet.icon] ?? Icons.Circle;
              return (
                <motion.div
                  key={bullet.label}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="glass rounded-xl p-5 flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{bullet.label}</p>
                    <p className="text-sm text-gray-400 mt-1">{bullet.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
