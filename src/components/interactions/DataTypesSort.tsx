import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table2, Braces, FileVideo, Check, RotateCcw, Database } from 'lucide-react';

interface DataItem {
  id: string;
  label: string;
  icon: typeof Table2;
  correctBin: 'structured' | 'semi' | 'unstructured';
}

const items: DataItem[] = [
  { id: '1', label: 'Customer table (SQL)', icon: Table2, correctBin: 'structured' },
  { id: '2', label: 'Product catalog (JSON)', icon: Braces, correctBin: 'semi' },
  { id: '3', label: 'Surveillance video', icon: FileVideo, correctBin: 'unstructured' },
  { id: '4', label: 'Bank transactions (SQL)', icon: Table2, correctBin: 'structured' },
  { id: '5', label: 'REST API response (JSON)', icon: Braces, correctBin: 'semi' },
  { id: '6', label: 'MRI scan image', icon: FileVideo, correctBin: 'unstructured' },
  { id: '7', label: 'Employee records (SQL)', icon: Table2, correctBin: 'structured' },
  { id: '8', label: 'Website HTML log', icon: Braces, correctBin: 'semi' },
  { id: '9', label: 'Audio podcast file', icon: FileVideo, correctBin: 'unstructured' },
];

const bins = [
  { id: 'structured' as const, label: 'Structured', icon: Table2, accent: '#3b82f6', desc: 'Tables, SQL, fixed schema' },
  { id: 'semi' as const, label: 'Semi-structured', icon: Braces, accent: '#f59e0b', desc: 'JSON, XML, flexible' },
  { id: 'unstructured' as const, label: 'Unstructured', icon: FileVideo, accent: '#ec4899', desc: 'Images, video, no schema' },
];

export function DataTypesSort() {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const unplaced = items.filter((item) => !placed[item.id]);
  const allPlaced = Object.keys(placed).length === items.length;

  const placeItem = (binId: string) => {
    if (!selectedItem) return;
    setPlaced({ ...placed, [selectedItem]: binId });
    setSelectedItem(null);
  };

  const score = items.filter((item) => placed[item.id] === item.correctBin).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Sort the Data Types</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Click an item, then click a category to place it. Sort all data examples correctly.
        </p>

        {/* Unplaced items */}
        <div className="min-h-[60px] mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Data Items ({unplaced.length} remaining)</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {unplaced.map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: selectedItem === item.id ? 1.05 : 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                    selectedItem === item.id
                      ? 'bg-azure-500/20 border-azure-400/50 text-white'
                      : 'glass-light border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </motion.button>
              ))}
            </AnimatePresence>
            {unplaced.length === 0 && !showResult && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-400">
                All items placed! Click "Check Answers" below.
              </motion.p>
            )}
          </div>
        </div>

        {/* Bins */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {bins.map((bin) => {
            const placedItems = items.filter((item) => placed[item.id] === bin.id);
            return (
              <button
                key={bin.id}
                onClick={() => selectedItem && placeItem(bin.id)}
                disabled={!selectedItem}
                className={`rounded-xl p-4 border-2 transition-all text-left ${
                  selectedItem
                    ? 'hover:scale-[1.02] cursor-pointer'
                    : 'cursor-default'
                }`}
                style={{
                  background: `${bin.accent}10`,
                  borderColor: selectedItem ? `${bin.accent}50` : `${bin.accent}25`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <bin.icon className="w-5 h-5" style={{ color: bin.accent }} />
                  <p className="text-sm font-bold" style={{ color: bin.accent }}>{bin.label}</p>
                </div>
                <p className="text-xs text-gray-500 mb-2">{bin.desc}</p>
                <div className="space-y-1">
                  {placedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-xs text-gray-300"
                    >
                      {showResult && (
                        placed[item.id] === item.correctBin
                          ? <Check className="w-3 h-3 text-green-400 shrink-0" />
                          : <span className="text-red-400 shrink-0">✗</span>
                      )}
                      <span className={showResult && placed[item.id] !== item.correctBin ? 'text-red-400' : ''}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {allPlaced && !showResult && (
            <button onClick={() => setShowResult(true)} className="btn-primary text-sm">Check Answers</button>
          )}
          {showResult && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                <p className={`text-lg font-bold ${score === items.length ? 'text-green-400' : score >= 6 ? 'text-azure-400' : 'text-amber-400'}`}>
                  {score} / {items.length} correct
                </p>
                <button
                  onClick={() => { setPlaced({}); setShowResult(false); setSelectedItem(null); }}
                  className="btn-ghost text-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </motion.div>
            </>
          )}
        </div>

        {showResult && score < items.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-azure-500/10 border border-azure-400/20 text-xs text-gray-400"
          >
            <p className="flex items-center gap-1.5 mb-1">
              <Database className="w-3 h-3 text-azure-400" /> Remember:
            </p>
            <p>Structured = SQL tables with fixed schema. Semi-structured = JSON/HTML with flexible fields. Unstructured = media files with no schema at all.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
