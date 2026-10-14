import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Layers, ShieldCheck, Eye } from 'lucide-react';

type Redundancy = 'LRS' | 'ZRS' | 'GRS' | 'GZRS' | 'RA-GRS' | 'RA-GZRS';

const configs: Record<Redundancy, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; description: string }> = {
  LRS: { label: 'LRS', icon: Globe, color: '#0078d4', description: '3 copies in 1 datacenter. Protects against disk failure.' },
  ZRS: { label: 'ZRS', icon: Layers, color: '#22d3ee', description: '3 copies across 3 zones. Protects against datacenter failure.' },
  GRS: { label: 'GRS', icon: Globe, color: '#8b5cf6', description: '3 copies in primary region + 3 in paired region. Protects against regional outage.' },
  GZRS: { label: 'GZRS', icon: ShieldCheck, color: '#22c55e', description: 'Zone redundancy in primary + geo-redundancy to paired region. Maximum durability.' },
  'RA-GRS': { label: 'RA-GRS', icon: Eye, color: '#0078d4', description: 'GRS + read access to secondary at all times. Failover reads without waiting.' },
  'RA-GZRS': { label: 'RA-GZRS', icon: Eye, color: '#22c55e', description: 'GZRS + read access to secondary. The highest availability option.' },
};

export function StorageRedundancy() {
  const [selected, setSelected] = useState<Redundancy>('LRS');
  const cfg = configs[selected];

  const hasZones = selected.includes('Z') || selected.includes('GZ');
  const hasGeo = selected.includes('G') && !selected.includes('ZRS') || selected.includes('GZ') || selected === 'GRS' || selected === 'RA-GRS';
  const hasReadAccess = selected.startsWith('RA');

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Storage Redundancy</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Select a redundancy option and watch how copies are distributed.</p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(Object.keys(configs) as Redundancy[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                selected === key
                  ? 'text-white'
                  : 'glass-light text-gray-400 hover:text-gray-200'
              }`}
              style={selected === key ? { background: `${configs[key].color}25`, border: `1px solid ${configs[key].color}40`, color: configs[key].color } : {}}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="relative h-[280px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 280">
            {/* Region boundary */}
            <rect x="20" y="40" width="220" height="200" rx="16" fill="none" stroke="#0078d4" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <text x="130" y="35" fill="#0078d4" fontSize="10" textAnchor="middle" opacity="0.6">PRIMARY REGION</text>

            {/* Secondary region */}
            {(hasGeo) && (
              <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <rect x="260" y="40" width="220" height="200" rx="16" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <text x="370" y="35" fill="#8b5cf6" fontSize="10" textAnchor="middle" opacity="0.6">PAIRED REGION</text>
                <line x1="240" y1="140" x2="260" y2="140" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5">
                  <animate attributeName="stroke-dashoffset" from="6" to="0" dur="0.8s" repeatCount="indefinite" />
                </line>
              </motion.g>
            )}

            {/* Data copies in primary */}
            {hasZones ? (
              // Zone-distributed copies
              <>
                {[0, 1, 2].map((i) => (
                  <motion.g key={`zone-${i}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                    <rect x={40 + i * 60} y={70} width={50} height={120} rx={6} fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.2" />
                    <text x={65 + i * 60} y={200} fill="#22d3ee" fontSize="8" textAnchor="middle" opacity="0.5">Z{i + 1}</text>
                    <circle cx={65 + i * 60} cy={130} r="8" fill="#22d3ee" opacity="0.5" />
                  </motion.g>
                ))}
              </>
            ) : (
              // Single datacenter, 3 copies
              <>
                <rect x="80" y="70" width="100" height="120" rx={6} fill="none" stroke="#0078d4" strokeWidth="1" opacity="0.2" />
                <text x="130" y="200" fill="#0078d4" fontSize="8" textAnchor="middle" opacity="0.5">DC</text>
                {[0, 1, 2].map((i) => (
                  <motion.circle key={`copy-${i}`} cx={130} cy={100 + i * 25} r="7" fill="#0078d4" opacity="0.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
                ))}
              </>
            )}

            {/* Secondary region copies */}
            {hasGeo && (
              <>
                {selected.includes('GZ') ? (
                  // GZRS - zones in secondary too
                  [0, 1, 2].map((i) => (
                    <motion.g key={`sec-zone-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                      <rect x={280 + i * 55} y={70} width={45} height={120} rx={6} fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.2" />
                      <circle cx={302 + i * 55} cy={130} r="7" fill="#8b5cf6" opacity="0.4" />
                    </motion.g>
                  ))
                ) : (
                  // GRS - single DC in secondary
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <rect x={310} y={70} width={100} height={120} rx={6} fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.2" />
                    {[0, 1, 2].map((i) => (
                      <motion.circle key={`sec-copy-${i}`} cx={360} cy={100 + i * 25} r="7" fill="#8b5cf6" opacity="0.4"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }} />
                    ))}
                  </motion.g>
                )}
                {hasReadAccess && (
                  <motion.text x={370} y={220} fill="#22c55e" fontSize="8" textAnchor="middle"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1 }}>
                    READ ACCESS
                  </motion.text>
                )}
              </>
            )}
          </svg>
        </div>

        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl text-center"
          style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: cfg.color }}>{cfg.label}</p>
          <p className="text-xs text-gray-400">{cfg.description}</p>
        </motion.div>
      </div>
    </div>
  );
}
