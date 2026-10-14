import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, RotateCcw } from 'lucide-react';

interface Layer {
  id: string;
  label: string;
  color: string;
  removed: boolean;
}

const initialLayers: Layer[] = [
  { id: 'firewall', label: 'Firewall', color: '#0078d4', removed: false },
  { id: 'identity', label: 'Identity Protection', color: '#8b5cf6', removed: false },
  { id: 'encryption', label: 'Encryption', color: '#22d3ee', removed: false },
  { id: 'network', label: 'Network Security', color: '#22c55e', removed: false },
];

export function DefenseInDepth() {
  const [layers, setLayers] = useState(initialLayers);
  const [threatPos, setThreatPos] = useState(0);

  const removeLayer = (id: string) => {
    setLayers((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, removed: true } : l));
      const removedCount = next.filter((l) => l.removed).length;
      setThreatPos(removedCount);
      return next;
    });
  };

  const restore = () => {
    setLayers(initialLayers);
    setThreatPos(0);
  };

  const activeLayers = layers.filter((l) => !l.removed);
  const allRemoved = activeLayers.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Defense in Depth</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Remove security layers one by one. Watch the threat get closer to the core.</p>

        <div className="relative h-[340px] flex flex-col-reverse items-center justify-center gap-2">
          {/* Core data */}
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shrink-0 z-10"
            animate={allRemoved ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: allRemoved ? Infinity : 0 }}
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-xs text-gray-400 z-10">YOUR DATA</p>

          {/* Security layers */}
          {layers.map((layer, i) => {
            const layerIndex = layers.length - 1 - i;
            const isBreached = threatPos > layerIndex;
            return (
              <motion.div
                key={layer.id}
                animate={{
                  opacity: layer.removed ? 0.15 : 1,
                  scale: layer.removed ? 0.9 : 1,
                }}
                className="relative"
                style={{ zIndex: 5 + i }}
              >
                {!layer.removed ? (
                  <motion.div
                    className="px-6 py-3 rounded-2xl border-2 font-semibold text-sm text-center cursor-pointer"
                    style={{
                      borderColor: `${layer.color}50`,
                      background: `${layer.color}15`,
                      color: layer.color,
                      width: `${200 + i * 20}px`,
                    }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => removeLayer(layer.id)}
                  >
                    {layer.label}
                    <span className="block text-[10px] text-gray-500 mt-0.5">Click to remove</span>
                  </motion.div>
                ) : (
                  <div
                    className="px-6 py-3 rounded-2xl border-2 border-dashed text-sm text-center"
                    style={{
                      borderColor: '#ef444430',
                      color: '#ef444440',
                      width: `${200 + i * 20}px`,
                    }}
                  >
                    {layer.label} — REMOVED
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Threat */}
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-20"
            animate={{ bottom: `${threatPos * 70 + 20}px` }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"
            >
              <Flame className="w-6 h-6 text-red-500" />
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence>
          {allRemoved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
            >
              <p className="text-sm font-bold text-red-400">ALL LAYERS REMOVED — THREAT REACHED THE DATA</p>
              <p className="text-xs text-gray-400 mt-1">No single security measure is sufficient. Defense must be layered.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 mt-6">
          {activeLayers.length > 0 ? (
            <p className="text-xs text-gray-500">{activeLayers.length} layers protecting your data</p>
          ) : (
            <button
              onClick={restore}
              className="px-6 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-semibold border border-green-500/30 hover:bg-green-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restore All Security
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
