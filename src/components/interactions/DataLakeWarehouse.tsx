import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Warehouse, Layers, FileVideo, Table2, Database, Check, RotateCcw } from 'lucide-react';

const patterns = [
  {
    id: 'lake' as const,
    label: 'Data Lake',
    icon: Waves,
    accent: '#22d3ee',
    desc: 'Store raw data in any format — no schema required',
    items: [
      { icon: FileVideo, label: 'Raw videos', detail: 'Stored as blobs' },
      { icon: Table2, label: 'CSV exports', detail: 'No transformation' },
      { icon: Database, label: 'JSON logs', detail: 'As-is from sources' },
    ],
    pros: ['Any format', 'Massive scale', 'Low cost per GB', 'No schema needed'],
    cons: ['No built-in queries', 'Must process before analysis', 'No ACID'],
  },
  {
    id: 'warehouse' as const,
    label: 'Data Warehouse',
    icon: Warehouse,
    accent: '#8b5cf6',
    desc: 'Structured, transformed data optimized for SQL queries',
    items: [
      { icon: Table2, label: 'Fact tables', detail: 'Sales, clicks, events' },
      { icon: Table2, label: 'Dimension tables', detail: 'Products, customers' },
      { icon: Database, label: 'Star schema', detail: 'Optimized for queries' },
    ],
    pros: ['Fast SQL queries', 'ACID transactions', 'Star schema optimized', 'Structured & clean'],
    cons: ['Requires upfront ETL', 'Higher cost', 'Structured data only', 'Rigid schema'],
  },
  {
    id: 'lakehouse' as const,
    label: 'Lakehouse',
    icon: Layers,
    accent: '#10b981',
    desc: 'Lake storage + warehouse query power — best of both',
    items: [
      { icon: Waves, label: 'Lake storage', detail: 'Open formats (Parquet)' },
      { icon: Database, label: 'ACID on lake', detail: 'Delta Lake transactions' },
      { icon: Table2, label: 'SQL on files', detail: 'Query without loading' },
    ],
    pros: ['Lake flexibility', 'Warehouse performance', 'ACID on files', 'Open formats'],
    cons: ['Newer pattern', 'Requires Delta/Iceberg', 'More complex setup'],
  },
];

export function DataLakeWarehouse() {
  const [selected, setSelected] = useState<'lake' | 'warehouse' | 'lakehouse'>('lake');
  const pattern = patterns.find((p) => p.id === selected)!;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Data Lake vs Warehouse vs Lakehouse</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Explore each storage pattern. Click a tab to see what it stores, pros, and cons.
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                selected === p.id ? 'scale-105' : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                background: `${p.accent}15`,
                borderColor: `${p.accent}40`,
                color: p.accent,
              }}
            >
              <p.icon className="w-4 h-4" />
              {p.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Description */}
            <div className="rounded-xl p-4 mb-5 text-center" style={{ background: `${pattern.accent}10`, border: `1px solid ${pattern.accent}25` }}>
              <p className="text-sm text-gray-300">{pattern.desc}</p>
            </div>

            {/* Items */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {pattern.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-light rounded-xl p-4 text-center"
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2" style={{ color: pattern.accent }} />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                </motion.div>
              ))}
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-light rounded-xl p-4">
                <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> Advantages
                </p>
                <ul className="space-y-1.5">
                  {pattern.pros.map((pro) => (
                    <li key={pro} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-green-400">+</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-light rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <RotateCcw className="w-3 h-3" /> Trade-offs
                </p>
                <ul className="space-y-1.5">
                  {pattern.cons.map((con) => (
                    <li key={con} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-amber-400">−</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
