import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, RotateCcw, Table2, Link } from 'lucide-react';

const columns = [
  { id: 'product', label: 'Product', table: 'Products' },
  { id: 'price', label: 'Price', table: 'Products' },
  { id: 'category', label: 'Category', table: 'Products' },
  { id: 'name', label: 'Customer Name', table: 'Customers' },
  { id: 'email', label: 'Customer Email', table: 'Customers' },
  { id: 'order_date', label: 'Order Date', table: 'Orders' },
  { id: 'quantity', label: 'Quantity', table: 'Orders' },
];

const conditions = [
  { id: 'price_gt_100', label: 'Price > 100', clause: 'WHERE price > 100' },
  { id: 'cat_electronics', label: "Category = 'Electronics'", clause: "WHERE category = 'Electronics'" },
  { id: 'qty_gt_2', label: 'Quantity > 2', clause: 'WHERE quantity > 2' },
  { id: 'date_2024', label: 'Order date in 2024', clause: "WHERE order_date >= '2024-01-01'" },
];

const sampleResults: Record<string, { query: string; rows: number; sample: string[] }> = {
  default: { query: 'SELECT * FROM Products', rows: 1247, sample: ['Laptop — $999', 'Mouse — $25', 'Keyboard — $50', 'Monitor — $300'] },
  price_gt_100: { query: 'SELECT * FROM Products WHERE price > 100', rows: 89, sample: ['Laptop — $999', 'Monitor — $300', 'Tablet — $450'] },
  cat_electronics: { query: "SELECT * FROM Products WHERE category = 'Electronics'", rows: 312, sample: ['Laptop — $999', 'Mouse — $25', 'Monitor — $300'] },
  qty_gt_2: { query: 'SELECT * FROM Orders WHERE quantity > 2', rows: 156, sample: ['Order #1023 — 5x Mouse', 'Order #1027 — 3x Keyboard'] },
  date_2024: { query: "SELECT * FROM Orders WHERE order_date >= '2024-01-01'", rows: 845, sample: ['Order #1023 — 2024-03-15', 'Order #1027 — 2024-05-22'] },
};

export function SQLQueryBuilder() {
  const [selectedCols, setSelectedCols] = useState<string[]>(['product', 'price']);
  const [selectedCond, setSelectedCond] = useState<string | null>(null);
  const [useJoin, setUseJoin] = useState(false);
  const [executed, setExecuted] = useState(false);

  const toggleCol = (id: string) => {
    setSelectedCols((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setExecuted(false);
  };

  const selectClause = selectedCols.map((c) => columns.find((col) => col.id === c)?.label ?? c).join(', ') || '*';

  const fromClause = useJoin
    ? 'Products JOIN Orders ON Products.id = Orders.product_id JOIN Customers ON Orders.customer_id = Customers.id'
    : 'Products';

  const whereClause = conditions.find((c) => c.id === selectedCond)?.clause ?? '';

  const query = `SELECT ${selectClause}\nFROM ${fromClause}${whereClause ? `\n${whereClause}` : ''}`;

  const resultKey = selectedCond ?? 'default';
  const result = useJoin ? { ...sampleResults[resultKey], rows: sampleResults[resultKey].rows + 23, sample: ['Laptop — $999 — Alice', 'Monitor — $300 — Bob'] } : sampleResults[resultKey];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Build a SQL Query</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Select columns, add a WHERE condition, and optionally JOIN tables. Then run the query.
        </p>

        {/* Columns */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Table2 className="w-3 h-3" /> SELECT (click to toggle)
          </p>
          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <button
                key={col.id}
                onClick={() => toggleCol(col.id)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  selectedCols.includes(col.id)
                    ? 'bg-azure-500/20 border-azure-400/40 text-azure-300'
                    : 'glass-light border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* JOIN toggle */}
        <div className="mb-5">
          <button
            onClick={() => { setUseJoin(!useJoin); setExecuted(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all ${
              useJoin ? 'bg-purple-500/20 border-purple-400/40 text-purple-300' : 'glass-light border-white/10 text-gray-400'
            }`}
          >
            <Link className="w-4 h-4" />
            {useJoin ? 'JOIN enabled (3 tables)' : 'Enable JOIN'}
          </button>
        </div>

        {/* Conditions */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">WHERE (optional)</p>
          <div className="flex flex-wrap gap-2">
            {conditions.map((cond) => (
              <button
                key={cond.id}
                onClick={() => { setSelectedCond(cond.id === selectedCond ? null : cond.id); setExecuted(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  selectedCond === cond.id
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                    : 'glass-light border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {cond.label}
              </button>
            ))}
          </div>
        </div>

        {/* Query preview */}
        <div className="rounded-xl bg-black/40 border border-white/10 p-4 mb-5">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{query}</pre>
        </div>

        {/* Run button */}
        <button
          onClick={() => setExecuted(true)}
          className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 mb-4"
        >
          <Play className="w-4 h-4" /> Run Query
        </button>

        {/* Results */}
        <AnimatePresence>
          {executed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Search className="w-3 h-3" />
                <span>{result.rows} rows returned</span>
              </div>
              <div className="rounded-xl bg-black/30 border border-white/10 overflow-hidden">
                <div className="px-4 py-2 bg-white/5 text-xs text-gray-500 font-mono border-b border-white/10">
                  Results preview
                </div>
                <div className="divide-y divide-white/5">
                  {result.sample.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-4 py-2.5 text-sm text-gray-300 font-mono"
                    >
                      {row}
                    </motion.div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setSelectedCols(['product', 'price']); setSelectedCond(null); setUseJoin(false); setExecuted(false); }}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
