import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListOrdered, Zap, AlertCircle } from 'lucide-react';

export function QueuePressure() {
  const [queueActive, setQueueActive] = useState(false);
  const [functionsActive, setFunctionsActive] = useState(false);
  const [jobs, setJobs] = useState<{ id: number; status: 'incoming' | 'queued' | 'processing' | 'done' }[]>([]);
  const [overloaded, setOverloaded] = useState(false);
  const jobId = useRef(0);
  const [stats, setStats] = useState({ processed: 0, queued: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const id = jobId.current++;
      setJobs((prev) => {
        const newJobs = [...prev, { id, status: 'incoming' as const }];
        if (!queueActive && !functionsActive) {
          if (newJobs.length > 15) setOverloaded(true);
        }
        return newJobs;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [queueActive, functionsActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prev) => {
        let next = [...prev];
        if (queueActive) {
          next = next.map((j) => (j.status === 'incoming' ? { ...j, status: 'queued' as const } : j));
        }
        if (functionsActive) {
          const queuedIdx = next.findIndex((j) => j.status === 'queued');
          if (queuedIdx >= 0) {
            next[queuedIdx] = { ...next[queuedIdx], status: 'processing' as const };
          } else if (!queueActive) {
            const incomingIdx = next.findIndex((j) => j.status === 'incoming');
            if (incomingIdx >= 0) {
              next[incomingIdx] = { ...next[incomingIdx], status: 'processing' as const };
            }
          }
          next = next.filter((j) => {
            if (j.status === 'processing' && Math.random() > 0.5) {
              setStats((s) => ({ ...s, processed: s.processed + 1 }));
              return false;
            }
            return true;
          });
        }
        if (!queueActive && !functionsActive) {
          next = next.slice(-20);
        } else {
          next = next.slice(-30);
        }
        setStats((s) => ({ ...s, queued: next.filter((j) => j.status === 'queued').length }));
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [queueActive, functionsActive]);

  useEffect(() => {
    if (queueActive || functionsActive) setOverloaded(false);
  }, [queueActive, functionsActive]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Queue + Functions: Asynchronous Processing</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Jobs keep arriving. Activate a queue to line them up, then functions to process them.</p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setQueueActive(!queueActive)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 ${
              queueActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass-light text-gray-400 border border-white/10'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            {queueActive ? 'Queue: ON' : 'Activate Queue'}
          </button>
          <button
            onClick={() => setFunctionsActive(!functionsActive)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 ${
              functionsActive ? 'bg-azure-500/20 text-azure-400 border border-azure-400/30' : 'glass-light text-gray-400 border border-white/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            {functionsActive ? 'Functions: ON' : 'Activate Functions'}
          </button>
        </div>

        <div className="relative h-[200px] glass-light rounded-xl p-4 overflow-hidden">
          <div className="absolute top-2 left-3 text-xs text-gray-500">Incoming jobs →</div>
          <div className="flex flex-wrap gap-1.5 items-center h-full pt-4">
            <AnimatePresence>
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background:
                      job.status === 'incoming' ? 'rgba(239,68,68,0.2)' :
                      job.status === 'queued' ? 'rgba(245,158,11,0.2)' :
                      job.status === 'processing' ? 'rgba(0,120,212,0.3)' :
                      'rgba(34,197,94,0.2)',
                    color:
                      job.status === 'incoming' ? '#ef4444' :
                      job.status === 'queued' ? '#f59e0b' :
                      job.status === 'processing' ? '#0078d4' : '#22c55e',
                    border: `1px solid ${
                      job.status === 'incoming' ? 'rgba(239,68,68,0.3)' :
                      job.status === 'queued' ? 'rgba(245,158,11,0.3)' :
                      job.status === 'processing' ? 'rgba(0,120,212,0.4)' : 'rgba(34,197,94,0.3)'
                    }`,
                  }}
                >
                  {job.status === 'processing' ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>⚡</motion.span> : ''}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {overloaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-red-500/10"
            >
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertCircle className="w-5 h-5" />
                SYSTEM OVERLOADED — NO QUEUE
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="glass-light rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">In System</p>
            <p className="text-lg font-bold text-white">{jobs.length}</p>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Queued</p>
            <p className="text-lg font-bold text-amber-400">{stats.queued}</p>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Processed</p>
            <p className="text-lg font-bold text-green-400">{stats.processed}</p>
          </div>
        </div>

        {(queueActive && functionsActive) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-center text-gray-300"
          >
            Queue + Functions = async processing. Jobs line up, workers handle them. No overload.
          </motion.div>
        )}
      </div>
    </div>
  );
}
