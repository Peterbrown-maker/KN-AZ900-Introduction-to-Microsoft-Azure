import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileVideo, Database, ArrowDown } from 'lucide-react';

export function DragData() {
  const [stage, setStage] = useState<'idle' | 'uploading' | 'stored'>('idle');

  const startUpload = () => {
    setStage('uploading');
    setTimeout(() => setStage('stored'), 2500);
  };

  const reset = () => setStage('idle');

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Drag the Data</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Upload a video file to Blob Storage. Watch it travel through the network and land safely.</p>

        <div className="relative h-[320px] flex flex-col items-center justify-between">
          {/* File */}
          <motion.div
            animate={stage === 'uploading' ? { y: 180, opacity: [1, 0.8, 1] } : stage === 'stored' ? { y: 180, opacity: 0.3 } : { y: 0 }}
            transition={{ duration: stage === 'uploading' ? 2 : 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-20 h-20 rounded-2xl bg-azure-500/15 border border-azure-400/30 flex items-center justify-center">
              <FileVideo className="w-10 h-10 text-azure-400" />
            </div>
            <p className="text-xs text-gray-400">video.mp4</p>
          </motion.div>

          {/* Network path */}
          <div className="absolute top-20 bottom-20 left-1/2 -translate-x-1/2 w-1 bg-white/5 rounded-full overflow-hidden">
            {stage === 'uploading' && (
              <motion.div
                className="w-full bg-gradient-to-b from-azure-400 to-cyan-glow"
                initial={{ height: '0%' }}
                animate={{ height: '100%' }}
                transition={{ duration: 2 }}
              />
            )}
            {stage === 'uploading' && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-glow"
                    initial={{ top: '0%', opacity: 0 }}
                    animate={{ top: '100%', opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Network label */}
          {stage === 'uploading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 translate-x-4 -translate-y-1/2"
            >
              <p className="text-xs text-cyan-glow font-mono">travelling...</p>
            </motion.div>
          )}

          {/* Storage */}
          <motion.div
            animate={stage === 'stored' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all ${
              stage === 'stored' ? 'bg-green-500/15 border-green-500/40' : 'glass-light border-white/10'
            }`}>
              <Database className={`w-12 h-12 ${stage === 'stored' ? 'text-green-400' : 'text-gray-500'}`} />
            </div>
            <p className={`text-xs font-semibold ${stage === 'stored' ? 'text-green-400' : 'text-gray-500'}`}>
              {stage === 'stored' ? 'Stored in Blob' : 'Blob Storage'}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          {stage === 'idle' && (
            <button onClick={startUpload} className="btn-primary text-sm">
              Upload to Blob Storage
            </button>
          )}
          {stage === 'uploading' && (
            <p className="text-sm text-cyan-glow animate-pulse">Uploading...</p>
          )}
          {stage === 'stored' && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-400"
              >
                File stored successfully in Blob Storage!
              </motion.div>
              <button onClick={reset} className="text-sm text-azure-400 hover:underline">Upload another →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
