import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, RefreshCw } from 'lucide-react';

const regionPairs = [
  { primary: 'East US', secondary: 'West US', primaryX: 120, primaryY: 160, secondaryX: 60, secondaryY: 180 },
  { primary: 'North Europe', secondary: 'West Europe', primaryX: 310, primaryY: 90, secondaryX: 340, secondaryY: 110 },
  { primary: 'East Asia', secondary: 'Southeast Asia', primaryX: 440, primaryY: 200, secondaryX: 470, secondaryY: 230 },
];

export function RegionPairs() {
  const [replicating, setReplicating] = useState(false);
  const [replicated, setReplicated] = useState(false);

  const startReplication = () => {
    setReplicating(true);
    setTimeout(() => { setReplicating(false); setReplicated(true); }, 2500);
  };

  const reset = () => { setReplicated(false); setReplicating(false); };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Region Pairs</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Azure pairs each region with another at least 300 miles away. Replicate data for disaster recovery.</p>

        <div className="relative h-[280px] glass-light rounded-xl overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 560 280">
            {/* World outline suggestion */}
            <ellipse cx="280" cy="140" rx="240" ry="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {regionPairs.map((pair, i) => (
              <g key={i}>
                {/* Connection line */}
                <line
                  x1={pair.primaryX}
                  y1={pair.primaryY}
                  x2={pair.secondaryX}
                  y2={pair.secondaryY}
                  stroke={replicated ? '#22c55e' : replicating ? '#0078d4' : '#333'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity={replicated ? 0.5 : replicating ? 0.6 : 0.2}
                >
                  {(replicating || replicated) && (
                    <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.6s" repeatCount="indefinite" />
                  )}
                </line>

                {/* Data flow during replication */}
                {replicating && (
                  <motion.circle
                    cx={pair.primaryX}
                    cy={pair.primaryY}
                    r="3"
                    fill="#0078d4"
                    animate={{ cx: [pair.primaryX, pair.secondaryX], cy: [pair.primaryY, pair.secondaryY] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}

                {/* Primary region */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <circle cx={pair.primaryX} cy={pair.primaryY} r="8" fill="#0078d4" opacity="0.6" />
                  <circle cx={pair.primaryX} cy={pair.primaryY} r="4" fill="#0078d4" />
                  <text x={pair.primaryX} y={pair.primaryY - 14} fill="#0078d4" fontSize="8" textAnchor="middle">{pair.primary}</text>
                </motion.g>

                {/* Secondary region */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: replicated ? 1 : 0.4 }} transition={{ delay: i * 0.1 }}>
                  <circle cx={pair.secondaryX} cy={pair.secondaryY} r="8" fill={replicated ? '#22c55e' : '#8b5cf6'} opacity="0.5" />
                  <circle cx={pair.secondaryX} cy={pair.secondaryY} r="4" fill={replicated ? '#22c55e' : '#8b5cf6'} />
                  <text x={pair.secondaryX} y={pair.secondaryY + 22} fill={replicated ? '#22c55e' : '#666'} fontSize="8" textAnchor="middle">{pair.secondary}</text>
                </motion.g>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          {!replicated && !replicating && (
            <button onClick={startReplication} className="btn-primary text-sm">
              Replicate to Paired Regions
            </button>
          )}
          {replicating && <p className="text-sm text-azure-400 animate-pulse">Replicating data...</p>}
          {replicated && (
            <>
              <p className="text-sm text-green-400">Data replicated to all paired regions!</p>
              <button onClick={reset} className="text-sm text-azure-400 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </>
          )}
        </div>

        {replicated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-gray-400 text-center"
          >
            If a primary region goes down, the paired region has your data. This is disaster recovery.
          </motion.div>
        )}
      </div>
    </div>
  );
}
