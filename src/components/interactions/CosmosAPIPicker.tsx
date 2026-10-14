import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Share2, Grid3x3, Table, Globe, Check, RotateCcw, Zap } from 'lucide-react';

const apis = [
  { id: 'sql', label: 'SQL API', icon: FileText, accent: '#3b82f6', desc: 'JSON documents with SQL-like queries', use: 'Product catalogs, user profiles, content management' },
  { id: 'mongo', label: 'MongoDB API', icon: FileText, accent: '#22c55e', desc: 'Wire-protocol compatible with MongoDB', use: 'Migrating existing MongoDB apps to Azure' },
  { id: 'gremlin', label: 'Gremlin API', icon: Share2, accent: '#8b5cf6', desc: 'Graph queries — vertices, edges, traversals', use: 'Social networks, recommendation engines, fraud rings' },
  { id: 'cassandra', label: 'Cassandra API', icon: Grid3x3, accent: '#f59e0b', desc: 'Column-family with Cassandra Query Language', use: 'Time-series data, large-scale writes, IoT telemetry' },
  { id: 'table', label: 'Table API', icon: Table, accent: '#22d3ee', desc: 'Key-value storage, Table Storage compatible', use: 'Session state, simple lookups, configuration data' },
];

const scenarios = [
  { id: 's1', text: 'Social network: store users and friend connections, query "friends of friends"', correct: 'gremlin' },
  { id: 's2', text: 'Migrate an existing MongoDB-based app to Azure with minimal code changes', correct: 'mongo' },
  { id: 's3', text: 'IoT sensors writing millions of time-series readings per second', correct: 'cassandra' },
  { id: 's4', text: 'E-commerce product catalog with flexible JSON product attributes', correct: 'sql' },
  { id: 's5', text: 'Store user session tokens for a web app — simple key → value lookup', correct: 'table' },
];

export function CosmosAPIPicker() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const score = scenarios.filter((s) => answers[s.id] === s.correct).length;
  const allAnswered = scenarios.every((s) => answers[s.id]);

  const reset = () => { setAnswers({}); setShowResult(false); };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Cosmos DB API Picker</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Match each scenario to the best Cosmos DB API. Click an API button under each scenario.
        </p>

        {/* API legend */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {apis.map((api) => (
            <div key={api.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: `${api.accent}10`, border: `1px solid ${api.accent}25` }}>
              <api.icon className="w-3 h-3" style={{ color: api.accent }} />
              <span style={{ color: api.accent }}>{api.label}</span>
            </div>
          ))}
        </div>

        {/* Scenarios */}
        <div className="space-y-4 mb-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="glass-light rounded-xl p-4">
              <p className="text-sm text-gray-300 mb-3">{scenario.text}</p>
              <div className="flex flex-wrap gap-2">
                {apis.map((api) => {
                  const selected = answers[scenario.id] === api.id;
                  const isCorrect = scenario.correct === api.id;
                  const showColor = showResult && selected;
                  return (
                    <button
                      key={api.id}
                      onClick={() => { setAnswers({ ...answers, [scenario.id]: api.id }); }}
                      disabled={showResult}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        showColor
                          ? isCorrect
                            ? 'bg-green-500/20 border-green-500/40 text-green-300'
                            : 'bg-red-500/20 border-red-500/40 text-red-300'
                          : selected
                            ? 'bg-azure-500/20 border-azure-400/40 text-azure-300'
                            : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <api.icon className="w-3 h-3" />
                      {api.label}
                      {showResult && isCorrect && <Check className="w-3 h-3 text-green-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {allAnswered && !showResult && (
            <button onClick={() => setShowResult(true)} className="btn-primary text-sm">Check Answers</button>
          )}
          {showResult && (
            <div className="flex items-center gap-4">
              <p className={`text-lg font-bold ${score === scenarios.length ? 'text-green-400' : 'text-azure-400'}`}>
                {score} / {scenarios.length}
              </p>
              <button onClick={reset} className="btn-ghost text-sm flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}
        </div>

        {showResult && score < scenarios.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-azure-500/10 border border-azure-400/20 text-xs text-gray-400 space-y-1"
          >
            <p className="flex items-center gap-1.5 text-azure-400 font-semibold">
              <Globe className="w-3 h-3" /> API Guide:
            </p>
            {apis.map((api) => (
              <p key={api.id}><span style={{ color: api.accent }}>{api.label}</span>: {api.use}</p>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
