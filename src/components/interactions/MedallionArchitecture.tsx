import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Sparkles, Medal, ArrowDown, Play, RotateCcw, Database } from 'lucide-react';

const layers = [
  {
    id: 'bronze' as const,
    label: 'Bronze',
    icon: Circle,
    accent: '#a16207',
    desc: 'Raw ingestion — data as-is from sources, no transformation',
    sample: [
      { field: 'cust_id', value: 'C001', issue: 'leading zero stripped' },
      { field: 'email', value: 'alice@@example.com', issue: 'double @ typo' },
      { field: 'amount', value: '-50', issue: 'negative value' },
      { field: 'date', value: '2024-13-45', issue: 'invalid date' },
    ],
    quality: '0% — Raw',
  },
  {
    id: 'silver' as const,
    label: 'Silver',
    icon: Sparkles,
    accent: '#94a3b8',
    desc: 'Cleansed, conformed — types enforced, duplicates removed, errors fixed',
    sample: [
      { field: 'cust_id', value: '0C001', issue: 'fixed: leading zero restored' },
      { field: 'email', value: 'alice@example.com', issue: 'fixed: corrected typo' },
      { field: 'amount', value: '50', issue: 'fixed: absolute value' },
      { field: 'date', value: '2024-12-01', issue: 'fixed: valid date' },
    ],
    quality: '70% — Cleansed',
  },
  {
    id: 'gold' as const,
    label: 'Gold',
    icon: Medal,
    accent: '#fbbf24',
    desc: 'Business-ready — aggregated, curated, star schema for reporting',
    sample: [
      { field: 'customer', value: 'Alice Smith', issue: 'enriched: full name' },
      { field: 'total_orders', value: '12', issue: 'aggregated: count' },
      { field: 'total_revenue', value: '$2,450', issue: 'aggregated: sum' },
      { field: 'tier', value: 'Gold Member', issue: 'derived: from revenue' },
    ],
    quality: '100% — Business-ready',
  },
];

export function MedallionArchitecture() {
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setStage(0);
    layers.forEach((_, i) => {
      setTimeout(() => setStage(i), i * 2500);
    });
    setTimeout(() => setRunning(false), layers.length * 2500);
  };

  const reset = () => { setStage(0); setRunning(false); };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Medallion Architecture</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Watch raw data flow through Bronze, Silver, and Gold. Each layer improves data quality.
        </p>

        {/* Layers */}
        <div className="space-y-3 mb-6">
          {layers.map((layer, i) => (
            <div key={layer.id}>
              <motion.div
                animate={stage === i && running ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5 }}
                className="rounded-xl p-4 border-2 transition-all"
                style={{
                  background: stage >= i ? `${layer.accent}15` : 'rgba(255,255,255,0.02)',
                  borderColor: stage >= i ? `${layer.accent}40` : 'rgba(255,255,255,0.05)',
                  opacity: stage >= i || !running ? 1 : 0.4,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <layer.icon className="w-5 h-5" style={{ color: layer.accent }} />
                    <p className="text-sm font-bold" style={{ color: layer.accent }}>{layer.label}</p>
                    <span className="text-xs text-gray-500">{layer.quality}</span>
                  </div>
                  {stage === i && running && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Database className="w-4 h-4" style={{ color: layer.accent }} />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">{layer.desc}</p>

                {/* Sample data */}
                <div className="space-y-1">
                  {layer.sample.map((row, j) => (
                    <motion.div
                      key={j}
                      initial={stage === i && running ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.15 }}
                      className="flex items-center gap-2 text-xs font-mono"
                    >
                      <span className="text-gray-500 w-20">{row.field}:</span>
                      <span className="text-gray-300 flex-1">{row.value}</span>
                      <span className={`text-[10px] ${layer.id === 'bronze' ? 'text-red-400' : 'text-green-400'}`}>
                        {row.issue}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Arrow between layers */}
              {i < layers.length - 1 && (
                <div className="flex justify-center my-1">
                  <motion.div
                    animate={stage > i && running ? { y: [0, 4, 0] } : {}}
                    transition={{ repeat: stage > i && running ? Infinity : 0, duration: 1 }}
                  >
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!running && stage === 0 && (
            <button onClick={run} className="btn-primary text-sm flex items-center gap-2">
              <Play className="w-4 h-4" /> Run Data Flow
            </button>
          )}
          {running && <p className="text-sm text-azure-400 animate-pulse">Processing through layers...</p>}
          {!running && stage > 0 && (
            <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
