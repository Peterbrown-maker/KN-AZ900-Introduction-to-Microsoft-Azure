import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Factory, Wand2, Warehouse, BarChart3, ArrowRight, Play, RotateCcw, Check } from 'lucide-react';

const stages = [
  { id: 'source', label: 'Data Source', icon: Database, accent: '#3b82f6', desc: 'SQL DB, Cosmos DB, APIs, files', options: ['SQL Database', 'Cosmos DB', 'REST API', 'CSV files'] },
  { id: 'ingest', label: 'Ingestion', icon: Factory, accent: '#22d3ee', desc: 'Azure Data Factory pipeline', options: ['Data Factory', 'Copy Activity', 'Scheduled trigger'] },
  { id: 'process', label: 'Processing', icon: Wand2, accent: '#f59e0b', desc: 'Transform & clean data', options: ['Spark Pool', 'Databricks', 'SQL stored proc'] },
  { id: 'store', label: 'Storage', icon: Warehouse, accent: '#8b5cf6', desc: 'Lake or warehouse', options: ['Data Lake Gen2', 'Synapse SQL Pool', 'Lakehouse'] },
  { id: 'visualize', label: 'Visualization', icon: BarChart3, accent: '#ec4899', desc: 'Present to users', options: ['Power BI', 'Dashboards', 'Reports'] },
];

export function AnalyticsPipeline() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);

  const allConnected = stages.every((s) => connected[s.id]);

  const toggleConnect = (id: string) => {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const run = () => {
    setRunning(true);
    setActiveStage(-1);
    stages.forEach((s, i) => {
      setTimeout(() => setActiveStage(i), i * 1500);
    });
    setTimeout(() => setRunning(false), stages.length * 1500);
  };

  const reset = () => { setConnected({}); setRunning(false); setActiveStage(-1); };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Build an Analytics Pipeline</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Connect all 5 stages to build a complete pipeline. Then run data through it.
        </p>

        {/* Pipeline stages */}
        <div className="space-y-2 mb-6">
          {stages.map((stage, i) => (
            <div key={stage.id}>
              <motion.div
                animate={activeStage === i && running ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  activeStage === i && running ? '' : ''
                }`}
                style={{
                  background: connected[stage.id] ? `${stage.accent}12` : 'rgba(255,255,255,0.02)',
                  borderColor: connected[stage.id] ? `${stage.accent}40` : 'rgba(255,255,255,0.08)',
                  opacity: activeStage >= i || !running ? 1 : 0.5,
                }}
                onClick={() => !running && toggleConnect(stage.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${stage.accent}20`, border: `1px solid ${stage.accent}30` }}
                  >
                    <stage.icon className="w-5 h-5" style={{ color: stage.accent }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: connected[stage.id] ? stage.accent : '#9ca3af' }}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-500">{stage.desc}</p>
                    {connected[stage.id] && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {stage.options.map((opt) => (
                          <span key={opt} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${stage.accent}15`, color: stage.accent }}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {connected[stage.id] && (
                    <Check className="w-5 h-5" style={{ color: stage.accent }} />
                  )}
                  {activeStage === i && running && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <stage.icon className="w-4 h-4" style={{ color: stage.accent }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Connector */}
              {i < stages.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <motion.div
                    animate={activeStage > i && running ? { y: [0, 3, 0] } : {}}
                    transition={{ repeat: activeStage > i && running ? Infinity : 0, duration: 0.8 }}
                    className={connected[stages[i].id] && connected[stages[i + 1].id] ? '' : 'opacity-30'}
                  >
                    <ArrowRight className="w-4 h-4 text-gray-600 rotate-90" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data flow animation */}
        {running && (
          <div className="rounded-xl bg-black/30 border border-white/10 p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Data flowing:</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: stages[i].accent }}
                  animate={{ opacity: activeStage >= i ? 1 : 0.2 }}
                />
              ))}
              <span className="text-xs text-azure-400 ml-auto">{stages[activeStage]?.label ?? 'Complete'}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!running && !allConnected && (
            <p className="text-sm text-gray-500">Connect all {stages.length} stages to run the pipeline</p>
          )}
          {!running && allConnected && (
            <button onClick={run} className="btn-primary text-sm flex items-center gap-2">
              <Play className="w-4 h-4" /> Run Pipeline
            </button>
          )}
          {running && <p className="text-sm text-azure-400 animate-pulse">Data flowing through pipeline...</p>}
          {!running && Object.keys(connected).length > 0 && (
            <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
