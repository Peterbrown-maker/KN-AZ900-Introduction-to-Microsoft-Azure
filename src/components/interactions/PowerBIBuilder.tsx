import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, BarChart3, PieChart, TrendingUp, Map, Table2, Check, RotateCcw, Monitor, Share2, Cloud } from 'lucide-react';

const steps = [
  { id: 'connect', label: 'Connect Data', icon: Database, accent: '#3b82f6' },
  { id: 'visual', label: 'Choose Visuals', icon: BarChart3, accent: '#22d3ee' },
  { id: 'publish', label: 'Publish & Share', icon: Cloud, accent: '#ec4899' },
];

const dataSources = [
  { id: 'sql', label: 'Azure SQL Database', icon: Database },
  { id: 'excel', label: 'Excel workbook', icon: Table2 },
  { id: 'cosmos', label: 'Cosmos DB', icon: Database },
  { id: 'web', label: 'Web API', icon: Share2 },
];

const visuals = [
  { id: 'bar', label: 'Bar Chart', icon: BarChart3, desc: 'Compare categories' },
  { id: 'pie', label: 'Pie Chart', icon: PieChart, desc: 'Show proportions' },
  { id: 'line', label: 'Line Chart', icon: TrendingUp, desc: 'Show trends over time' },
  { id: 'map', label: 'Map', icon: Map, desc: 'Geographic data' },
  { id: 'table', label: 'Table', icon: Table2, desc: 'Detailed rows' },
];

export function PowerBIBuilder() {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<string | null>(null);
  const [selectedVisuals, setSelectedVisuals] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  const toggleVisual = (id: string) => {
    setSelectedVisuals((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  };

  const next = () => setStep(step + 1);
  const reset = () => { setStep(0); setSource(null); setSelectedVisuals([]); setPublished(false); };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Power BI Report Builder</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Build a report step by step — connect, visualize, publish.</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: step >= i ? `${s.accent}15` : 'transparent',
                  color: step >= i ? s.accent : '#6b7280',
                  border: `1px solid ${step >= i ? `${s.accent}30` : '#ffffff10'}`,
                }}
              >
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              {i < steps.length - 1 && <div className="w-4 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Connect */}
          {step === 0 && (
            <motion.div key="connect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-gray-400 mb-4 text-center">Choose a data source to connect to your report:</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {dataSources.map((src) => (
                  <button
                    key={src.id}
                    onClick={() => setSource(src.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      source === src.id ? 'bg-azure-500/15 border-azure-400/40' : 'glass-light border-white/10 hover:border-white/20'
                    }`}
                  >
                    <src.icon className={`w-5 h-5 ${source === src.id ? 'text-azure-400' : 'text-gray-400'}`} />
                    <span className={`text-sm ${source === src.id ? 'text-azure-300' : 'text-gray-300'}`}>{src.label}</span>
                    {source === src.id && <Check className="w-4 h-4 text-azure-400 ml-auto" />}
                  </button>
                ))}
              </div>
              <button
                onClick={next}
                disabled={!source}
                className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Connect & Continue →
              </button>
            </motion.div>
          )}

          {/* Step 2: Visuals */}
          {step === 1 && (
            <motion.div key="visual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-gray-400 mb-4 text-center">Select visuals for your report (choose at least 2):</p>
              <div className="grid grid-cols-1 gap-2 mb-6">
                {visuals.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleVisual(v.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedVisuals.includes(v.id) ? 'bg-cyan-500/15 border-cyan-400/40' : 'glass-light border-white/10 hover:border-white/20'
                    }`}
                  >
                    <v.icon className={`w-5 h-5 ${selectedVisuals.includes(v.id) ? 'text-cyan-400' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className={`text-sm ${selectedVisuals.includes(v.id) ? 'text-cyan-300' : 'text-gray-300'}`}>{v.label}</p>
                      <p className="text-xs text-gray-500">{v.desc}</p>
                    </div>
                    {selectedVisuals.includes(v.id) && <Check className="w-4 h-4 text-cyan-400 ml-auto" />}
                  </button>
                ))}
              </div>
              <button
                onClick={next}
                disabled={selectedVisuals.length < 2}
                className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Create Report →
              </button>
            </motion.div>
          )}

          {/* Step 3: Publish */}
          {step === 2 && (
            <motion.div key="publish" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              {!published ? (
                <>
                  <div className="glass-light rounded-xl p-6 mb-6">
                    <p className="text-xs text-gray-500 mb-3">Your Report Summary:</p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-azure-400" />
                      <span className="text-sm text-gray-300">{dataSources.find(s => s.id === source)?.label}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {selectedVisuals.map((vId) => {
                        const v = visuals.find((v) => v.id === vId)!;
                        return (
                          <span key={vId} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <v.icon className="w-3 h-3" /> {v.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setPublished(true)}
                    className="btn-primary text-sm flex items-center gap-2 mx-auto"
                  >
                    <Cloud className="w-4 h-4" /> Publish to Power BI Service
                  </button>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4"
                    style={{ boxShadow: '0 0 40px rgba(34,197,94,0.3)' }}
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-lg font-bold text-green-400 mb-2">Report Published!</p>
                  <p className="text-sm text-gray-400 mb-6">
                    Your report is now in the Power BI Service. Create a dashboard by pinning visuals, then share with your team in a workspace.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
                    <Monitor className="w-3 h-3" /> Desktop → <Cloud className="w-3 h-3" /> Service → <Share2 className="w-3 h-3" /> Shared
                  </div>
                  <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2 mx-auto">
                    <RotateCcw className="w-4 h-4" /> Build Another Report
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
