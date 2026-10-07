import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Server, Check, X } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface Connection {
  from: string;
  to: string;
  correct: boolean;
}

const nodes: Node[] = [
  { id: 'vnet', label: 'VNet', x: 100, y: 50, icon: Network },
  { id: 'subnet', label: 'Subnet', x: 280, y: 150, icon: Network },
  { id: 'vm', label: 'VM', x: 460, y: 250, icon: Server },
];

const correctConnections: Connection[] = [
  { from: 'vnet', to: 'subnet', correct: true },
  { from: 'subnet', to: 'vm', correct: true },
];

export function BuildNetwork() {
  const [connections, setConnections] = useState<{ from: string; to: string }[]>([]);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ from: string; to: string; correct: boolean } | null>(null);

  const isCorrect = (from: string, to: string) =>
    correctConnections.some((c) => c.from === from && c.to === to);

  const handleNodeClick = (id: string) => {
    if (!dragFrom) {
      setDragFrom(id);
    } else if (dragFrom === id) {
      setDragFrom(null);
    } else {
      const correct = isCorrect(dragFrom, id);
      const exists = connections.some((c) => c.from === dragFrom && c.to === id);
      if (!exists) {
        if (correct) {
          setConnections([...connections, { from: dragFrom, to: id }]);
        }
        setFeedback({ from: dragFrom, to: id, correct });
        setTimeout(() => setFeedback(null), 1200);
      }
      setDragFrom(null);
    }
  };

  const allConnected = correctConnections.every((c) =>
    connections.some((conn) => conn.from === c.from && conn.to === c.to)
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Build a Network</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Click a node, then click another to connect. Correct connections glow. Incorrect ones shake.</p>

        <div className="relative h-[340px]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 560 340">
            {connections.map((conn) => {
              const from = nodes.find((n) => n.id === conn.from);
              const to = nodes.find((n) => n.id === conn.to);
              if (!from || !to) return null;
              return (
                <motion.line
                  key={`${conn.from}-${conn.to}`}
                  x1={from.x + 40}
                  y1={from.y + 20}
                  x2={to.x + 40}
                  y2={to.y + 20}
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
              );
            })}
            {feedback && !feedback.correct && (
              <motion.line
                x1={nodes.find((n) => n.id === feedback.from)!.x + 40}
                y1={nodes.find((n) => n.id === feedback.from)!.y + 20}
                x2={nodes.find((n) => n.id === feedback.to)!.x + 40}
                y2={nodes.find((n) => n.id === feedback.to)!.y + 20}
                stroke="#ef4444"
                strokeWidth="2"
                animate={{ opacity: [1, 0, 1, 0] }}
                transition={{ duration: 0.8 }}
              />
            )}
          </svg>

          {nodes.map((node) => {
            const Icon = node.icon;
            const isActive = dragFrom === node.id;
            const isConnected = connections.some((c) => c.from === node.id || c.to === node.id);
            return (
              <motion.button
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                className={`absolute flex flex-col items-center gap-2 ${isActive ? 'z-20' : 'z-10'}`}
                style={{ left: node.x, top: node.y }}
                animate={feedback && !feedback.correct && (feedback.from === node.id || feedback.to === node.id) ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div
                  className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-azure-400 bg-azure-500/20 scale-110 shadow-lg shadow-azure-500/30'
                      : isConnected
                      ? 'border-green-500/40 bg-green-500/10'
                      : 'border-white/15 glass-light hover:border-azure-400/40'
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isActive ? 'text-azure-400' : isConnected ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <p className={`text-xs font-semibold ${isActive ? 'text-azure-400' : isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                  {node.label}
                </p>
              </motion.button>
            );
          })}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 p-2 rounded-lg text-center text-sm flex items-center justify-center gap-2 ${
              feedback.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {feedback.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {feedback.correct ? 'Correct connection! Locked in.' : 'Wrong connection — rejected.'}
          </motion.div>
        )}

        {allConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
          >
            <p className="text-lg font-bold text-green-400">Network Built!</p>
            <p className="text-sm text-gray-400 mt-1">VNet → Subnet → VM. This is how Azure networking flows.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
