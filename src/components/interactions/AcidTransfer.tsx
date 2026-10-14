import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom, CheckCircle, Lock, HardDrive, ArrowRight, RotateCcw, Zap, Database } from 'lucide-react';

type Phase = 'idle' | 'begin' | 'debit' | 'crash' | 'rollback' | 'committed';

const phases: { id: Phase; label: string; desc: string; color: string }[] = [
  { id: 'begin', label: 'BEGIN TRANSACTION', desc: 'Transaction starts. Both accounts at initial state.', color: '#3b82f6' },
  { id: 'debit', label: 'DEBIT $100 from Alice', desc: 'Alice: $500 → $400. Money is deducted. Transaction not yet committed.', color: '#f59e0b' },
  { id: 'crash', label: 'SYSTEM CRASH!', desc: 'Power failure! The credit to Bob never happened. Without Atomicity, $100 is lost forever.', color: '#ef4444' },
  { id: 'rollback', label: 'ROLLBACK (Atomicity)', desc: 'The database detects an incomplete transaction. The debit is reversed. Alice returns to $500.', color: '#22d3ee' },
  { id: 'committed', label: 'COMMIT (Success path)', desc: 'If no crash: both debit and credit succeed. Data is durable — it survives any future crash.', color: '#22c55e' },
];

export function AcidTransfer() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const aliceBalance = phase === 'debit' || phase === 'crash' ? 400 : 500;
  const bobBalance = phase === 'committed' && showSuccess ? 300 : 200;

  const step = (phases.findIndex((p) => p.id === phase));

  const runCrashPath = () => {
    setPhase('idle');
    setShowSuccess(false);
    setTimeout(() => setPhase('begin'), 500);
    setTimeout(() => setPhase('debit'), 2000);
    setTimeout(() => setPhase('crash'), 4000);
    setTimeout(() => setPhase('rollback'), 6500);
  };

  const runSuccessPath = () => {
    setPhase('idle');
    setShowSuccess(false);
    setTimeout(() => setPhase('begin'), 500);
    setTimeout(() => setPhase('debit'), 2000);
    setTimeout(() => { setPhase('committed'); setShowSuccess(true); }, 4000);
  };

  const reset = () => { setPhase('idle'); setShowSuccess(false); };

  const currentPhase = phases.find((p) => p.id === phase);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">ACID Bank Transfer</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Transfer $100 from Alice to Bob. See how ACID properties protect the transaction — even during a crash.
        </p>

        {/* Accounts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Alice */}
          <motion.div
            animate={phase === 'debit' || phase === 'crash' ? { x: [-5, 0] } : {}}
            className="rounded-xl p-5 text-center border-2"
            style={{
              background: phase === 'debit' || phase === 'crash' ? '#f59e0b15' : '#3b82f610',
              borderColor: phase === 'debit' || phase === 'crash' ? '#f59e0b40' : '#3b82f625',
            }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Alice</p>
            <motion.p
              key={aliceBalance}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold"
              style={{ color: phase === 'debit' || phase === 'crash' ? '#f59e0b' : '#3b82f6' }}
            >
              ${aliceBalance}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1">
              {phase === 'debit' || phase === 'crash' ? '-$100 debited' : 'Initial balance'}
            </p>
          </motion.div>

          {/* Bob */}
          <motion.div
            className="rounded-xl p-5 text-center border-2"
            style={{
              background: showSuccess ? '#22c55e15' : '#22d3ee10',
              borderColor: showSuccess ? '#22c55e40' : '#22d3ee25',
            }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bob</p>
            <motion.p
              key={bobBalance}
              initial={showSuccess ? { scale: 1.2 } : false}
              animate={{ scale: 1 }}
              className="text-3xl font-bold"
              style={{ color: showSuccess ? '#22c55e' : '#22d3ee' }}
            >
              ${bobBalance}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1">
              {showSuccess ? '+$100 credited' : 'Initial balance'}
            </p>
          </motion.div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={phase === 'debit' ? { x: [0, 10, 0] } : {}}
            transition={{ repeat: phase === 'debit' ? Infinity : 0, duration: 1 }}
          >
            <ArrowRight className="w-6 h-6 text-gray-500" />
          </motion.div>
        </div>

        {/* Phase display */}
        <AnimatePresence mode="wait">
          {currentPhase && phase !== 'idle' && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl p-4 mb-6 text-center"
              style={{ background: `${currentPhase.color}10`, border: `1px solid ${currentPhase.color}30` }}
            >
              <p className="font-mono text-sm font-bold mb-1" style={{ color: currentPhase.color }}>
                {currentPhase.label}
              </p>
              <p className="text-xs text-gray-400">{currentPhase.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        {phase !== 'idle' && (
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {phases.filter(p => showSuccess ? p.id !== 'crash' && p.id !== 'rollback' : p.id !== 'committed').map((p, i) => (
              <div
                key={p.id}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: step >= phases.indexOf(p) ? '24px' : '8px',
                  background: step >= phases.indexOf(p) ? p.color : '#ffffff15',
                }}
              />
            ))}
          </div>
        )}

        {/* ACID badges */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { icon: Atom, label: 'Atomicity', desc: 'All or nothing' },
            { icon: CheckCircle, label: 'Consistency', desc: 'Rules enforced' },
            { icon: Lock, label: 'Isolation', desc: 'No interference' },
            { icon: HardDrive, label: 'Durability', desc: 'Survives crashes' },
          ].map((prop) => (
            <div key={prop.label} className="glass-light rounded-lg p-2.5 text-center">
              <prop.icon className="w-4 h-4 text-azure-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-300">{prop.label}</p>
              <p className="text-[10px] text-gray-500">{prop.desc}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {phase === 'idle' && (
            <>
              <button onClick={runCrashPath} className="btn-primary text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" /> Run with Crash
              </button>
              <button onClick={runSuccessPath} className="btn-ghost text-sm flex items-center gap-2">
                <Database className="w-4 h-4" /> Run Success Path
              </button>
            </>
          )}
          {phase !== 'idle' && (
            <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {phase === 'crash' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-red-400 mt-4"
          >
            Without Atomicity, Alice would lose $100. The rollback ensures all-or-nothing.
          </motion.p>
        )}
      </div>
    </div>
  );
}
