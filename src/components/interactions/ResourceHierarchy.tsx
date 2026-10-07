import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, CreditCard, FolderTree, Box, Check, X } from 'lucide-react';

const hierarchy = [
  { id: 'mg', label: 'Management Group', icon: Network, color: '#8b5cf6' },
  { id: 'sub', label: 'Subscription', icon: CreditCard, color: '#0078d4' },
  { id: 'rg', label: 'Resource Group', icon: FolderTree, color: '#22d3ee' },
  { id: 'res', label: 'Resource', icon: Box, color: '#22c55e' },
];

export function ResourceHierarchy() {
  const [placed, setPlaced] = useState<number>(0);
  const [wrong, setWrong] = useState(false);

  const placeNext = (id: string) => {
    if (id === hierarchy[placed].id) {
      setPlaced(placed + 1);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1200);
    }
  };

  const reset = () => { setPlaced(0); setWrong(false); };

  const remaining = hierarchy.slice(placed);
  const allPlaced = placed >= hierarchy.length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Azure Resource Hierarchy</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Build the hierarchy bottom-up. Click the correct layer to place it.</p>

        <div className="flex flex-col items-center gap-3 mb-8">
          {hierarchy.map((item, i) => {
            const isPlaced = i < placed;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isPlaced ? 1 : 0.3, scale: 1 }}
                className="flex items-center gap-3"
              >
                {isPlaced && (
                  <div
                    className="px-6 py-3 rounded-xl border flex items-center gap-3"
                    style={{ background: `${item.color}15`, borderColor: `${item.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</span>
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                )}
                {!isPlaced && (
                  <div className="px-6 py-3 rounded-xl border border-dashed border-white/10 flex items-center gap-3 opacity-30">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                )}
                {i < hierarchy.length - 1 && isPlaced && (
                  <div className="text-gray-600 text-xl">↑</div>
                )}
              </motion.div>
            );
          }).reverse()}
        </div>

        {!allPlaced && (
          <div>
            <p className="text-xs text-gray-500 text-center mb-3">Click the next layer in the hierarchy:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {remaining.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => placeNext(item.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2.5 rounded-xl glass-light border flex items-center gap-2 text-sm font-medium text-gray-200 transition-all ${
                      wrong ? 'border-red-500/40' : 'border-white/10 hover:border-azure-400/30'
                    }`}
                    animate={wrong ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {wrong && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-red-400 text-center flex items-center justify-center gap-1"
          >
            <X className="w-4 h-4" /> Wrong order! Think top-down: Management Group → Subscription → Resource Group → Resource.
          </motion.p>
        )}

        {allPlaced && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
          >
            <p className="text-lg font-bold text-green-400">Hierarchy Complete!</p>
            <p className="text-sm text-gray-400 mt-1">Management Group → Subscription → Resource Group → Resource</p>
            <button onClick={reset} className="text-sm text-azure-400 hover:underline mt-2">Reset →</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
