import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Download, Wand2, Upload, Database, Factory, RotateCcw } from 'lucide-react';

export function ETLvsELT() {
  const [mode, setMode] = useState<'etl' | 'elt'>('etl');
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const steps = mode === 'etl'
    ? [
        { icon: Download, label: 'Extract', desc: 'Pull raw data from sources', color: '#3b82f6' },
        { icon: Wand2, label: 'Transform (staging)', desc: 'Clean & transform in a staging area — BEFORE loading', color: '#f59e0b' },
        { icon: Upload, label: 'Load', desc: 'Load transformed data into the warehouse', color: '#22c55e' },
      ]
    : [
        { icon: Download, label: 'Extract', desc: 'Pull raw data from sources', color: '#3b82f6' },
        { icon: Upload, label: 'Load', desc: 'Load raw data into the target (data lake/warehouse)', color: '#22c55e' },
        { icon: Wand2, label: 'Transform (in target)', desc: 'Transform INSIDE the warehouse using its compute', color: '#f59e0b' },
      ];

  const run = () => {
    setRunning(true);
    setStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => setStep(i), i * 1800);
    });
    setTimeout(() => setRunning(false), steps.length * 1800);
  };

  const reset = () => { setStep(0); setRunning(false); };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">ETL vs ELT</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          The transformation happens in different places. Toggle and run to see the difference.
        </p>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => { setMode('etl'); reset(); }}
              className={`px-5 py-2 text-sm font-semibold transition-all ${
                mode === 'etl' ? 'bg-azure-500/20 text-azure-300' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              ETL
            </button>
            <button
              onClick={() => { setMode('elt'); reset(); }}
              className={`px-5 py-2 text-sm font-semibold transition-all ${
                mode === 'elt' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              ELT
            </button>
          </div>
        </div>

        {/* Pipeline visualization */}
        <div className="space-y-3 mb-6">
          {steps.map((s, i) => (
            <motion.div
              key={`${mode}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                step >= i && running ? 'scale-[1.02]' : ''
              }`}
              style={{
                background: step >= i ? `${s.color}15` : 'rgba(255,255,255,0.02)',
                borderColor: step >= i ? `${s.color}40` : 'rgba(255,255,255,0.05)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: step >= i ? s.color : '#9ca3af' }}>{s.label}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
              {step > i && running && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <s.icon className="w-4 h-4 text-green-400" />
                </motion.div>
              )}
              {step === i && running && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Key difference */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-4 mb-6 text-center"
            style={{
              background: mode === 'etl' ? '#3b82f610' : '#8b5cf610',
              border: `1px solid ${mode === 'etl' ? '#3b82f630' : '#8b5cf630'}`,
            }}
          >
            <p className="text-xs text-gray-400">
              {mode === 'etl' ? (
                <>ETL: Transform happens <span className="text-blue-400 font-semibold">before</span> loading — needs a separate staging area.</>
              ) : (
                <>ELT: Transform happens <span className="text-purple-400 font-semibold">after</span> loading — leverages the warehouse's compute power.</>
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!running && step === 0 && (
            <button onClick={run} className="btn-primary text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" /> Run Pipeline
            </button>
          )}
          {running && (
            <p className="text-sm text-azure-400 animate-pulse">Processing...</p>
          )}
          {!running && step > 0 && (
            <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
