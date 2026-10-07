import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const slaLevels = [
  { pct: 99, color: '#ef4444', downtime: '7.2 hours', desc: 'Non-critical workloads' },
  { pct: 99.9, color: '#f59e0b', downtime: '43.2 minutes', desc: 'Standard business apps' },
  { pct: 99.99, color: '#22c55e', downtime: '4.32 minutes', desc: 'Critical applications' },
  { pct: 99.999, color: '#0078d4', downtime: '26 seconds', desc: 'Mission-critical systems' },
];

export function SLACalculator() {
  const [selected, setSelected] = useState(1);
  const sla = slaLevels[selected];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">SLA Calculator</h3>
        <p className="text-sm text-gray-400 text-center mb-6">See exactly how much downtime each SLA level allows per month.</p>

        <div className="flex gap-2 justify-center mb-8">
          {slaLevels.map((level, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                selected === i ? 'text-white' : 'glass-light text-gray-400'
              }`}
              style={selected === i ? { background: `${level.color}25`, border: `1px solid ${level.color}40`, color: level.color } : {}}
            >
              {level.pct}%
            </button>
          ))}
        </div>

        <motion.div
          key={selected}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.p
            className="text-5xl md:text-6xl font-bold"
            style={{ color: sla.color, textShadow: `0 0 40px ${sla.color}40` }}
          >
            {sla.pct}%
          </motion.p>

          <div className="flex items-center justify-center gap-3">
            <Clock className="w-5 h-5" style={{ color: sla.color }} />
            <p className="text-2xl font-bold text-white">{sla.downtime}</p>
          </div>

          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Maximum acceptable downtime <span className="text-white font-semibold">per month</span>. {sla.desc}.
          </p>
        </motion.div>

        {/* Visual downtime bar */}
        <div className="mt-8">
          <div className="h-8 rounded-lg overflow-hidden bg-white/5 relative">
            <motion.div
              key={`bar-${selected}`}
              className="h-full rounded-lg flex items-center justify-end px-2"
              style={{ background: `linear-gradient(90deg, ${sla.color}40, ${sla.color})`, width: `${100 - sla.pct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(100 - sla.pct, 0.5)}%` }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[10px] font-bold text-white whitespace-nowrap">DOWNTIME</span>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-500">{sla.pct}% UPTIME</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">Visual representation (downtime exaggerated for visibility)</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="glass-light rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Per Year</p>
            <p className="text-sm font-bold text-white">
              {sla.pct === 99 ? '3.65 days' : sla.pct === 99.9 ? '8.76 hours' : sla.pct === 99.99 ? '52.6 minutes' : '5.26 minutes'}
            </p>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Per Month</p>
            <p className="text-sm font-bold" style={{ color: sla.color }}>{sla.downtime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
