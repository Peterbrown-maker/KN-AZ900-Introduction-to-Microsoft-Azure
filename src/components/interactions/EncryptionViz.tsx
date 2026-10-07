import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Send, ArrowRight } from 'lucide-react';

export function EncryptionViz() {
  const [stage, setStage] = useState<'plain' | 'encrypting' | 'encrypted' | 'decrypting' | 'decrypted'>('plain');
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const stages: typeof stage[] = ['plain', 'encrypting', 'encrypted', 'decrypting', 'decrypted'];
    let idx = stages.indexOf(stage);
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setStage(stages[idx]);
    }, 2200);
    return () => clearInterval(interval);
  }, [stage, autoPlay]);

  const plaintext = 'HELLO AZURE';
  const ciphertext = 'X#9@K2!F7$LmQ';
  const encrypted = stage === 'encrypted' || stage === 'decrypting';
  const encrypting = stage === 'encrypting';
  const decrypting = stage === 'decrypting';
  const showPlain = stage === 'plain' || stage === 'encrypting' || stage === 'decrypted';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Encryption</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Watch data transform into unreadable ciphertext while travelling, then decrypt at the destination.</p>

        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Sender */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-azure-500/20 border border-azure-400/30 flex items-center justify-center">
              <Send className="w-6 h-6 text-azure-400" />
            </div>
            <p className="text-xs text-gray-400">Sender</p>
          </div>

          {/* Data in transit */}
          <div className="flex-1 relative h-16 flex items-center justify-center">
            <div className="w-full h-0.5 bg-white/10 absolute" />
            <motion.div
              className="w-full h-0.5 absolute"
              style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative z-10 px-4 py-2 rounded-lg glass-light">
              <AnimatePresence mode="wait">
                {encrypting && (
                  <motion.div key="enc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="font-mono text-sm text-azure-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                      {plaintext}
                    </motion.div>
                  </motion.div>
                )}
                {encrypted && (
                  <motion.div key="cipher" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="font-mono text-sm text-purple-400 break-all">{ciphertext}</div>
                  </motion.div>
                )}
                {decrypting && (
                  <motion.div key="dec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="font-mono text-sm text-purple-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                      {ciphertext}
                    </motion.div>
                  </motion.div>
                )}
                {(showPlain && !encrypting) && (
                  <motion.div key="plain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="font-mono text-sm text-green-400">{plaintext}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Receiver */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
              stage === 'decrypted' ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5 border-white/10'
            }`}>
              {stage === 'decrypted' ? <Unlock className="w-6 h-6 text-green-400" /> : <Lock className="w-6 h-6 text-gray-500" />}
            </div>
            <p className="text-xs text-gray-400">Receiver</p>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium"
              style={{
                color: stage === 'encrypted' ? '#8b5cf6' : stage === 'decrypted' ? '#22c55e' : stage === 'encrypting' ? '#0078d4' : '#22d3ee',
              }}
            >
              {stage === 'plain' && 'PLAINTEXT — readable data'}
              {stage === 'encrypting' && 'ENCRYPTING... scrambling with a key'}
              {stage === 'encrypted' && 'CIPHERTEXT — unreadable in transit'}
              {stage === 'decrypting' && 'DECRYPTING... reversing with the key'}
              {stage === 'decrypted' && 'DECRYPTED — readable at destination'}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="text-xs px-4 py-1.5 rounded-lg glass-light text-gray-300 hover:bg-white/10 transition-all"
          >
            {autoPlay ? 'Pause' : 'Auto-play'}
          </button>
          <button
            onClick={() => setStage('plain')}
            className="text-xs px-4 py-1.5 rounded-lg glass-light text-gray-300 hover:bg-white/10 transition-all"
          >
            Restart
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-gray-400 text-center">
          Even if intercepted in transit, ciphertext is meaningless without the decryption key.
        </div>
      </div>
    </div>
  );
}
