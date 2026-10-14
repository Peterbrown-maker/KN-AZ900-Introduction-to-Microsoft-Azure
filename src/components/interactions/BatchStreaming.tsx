import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Radio, Clock, Zap, RotateCcw, Pause, Play } from 'lucide-react';

export function BatchStreaming() {
  const [mode, setMode] = useState<'batch' | 'streaming'>('batch');
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<{ id: number; x: number; processed: boolean }[]>([]);
  const [latency, setLatency] = useState(0);
  const eventCount = useRef(0);
  const batchBuffer = useRef<number[]>([]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      eventCount.current += 1;
      const id = eventCount.current;
      if (mode === 'streaming') {
        setEvents((prev) => [...prev.slice(-8), { id, x: 0, processed: false }]);
        setLatency(50 + Math.random() * 50);
        setTimeout(() => {
          setEvents((prev) => prev.map((e) => e.id === id ? { ...e, processed: true } : e));
        }, 600);
      } else {
        batchBuffer.current.push(id);
        setEvents((prev) => [...prev.slice(-8), { id, x: 0, processed: false }]);
      }
    }, mode === 'streaming' ? 800 : 400);
    return () => clearInterval(interval);
  }, [running, mode]);

  useEffect(() => {
    if (!running || mode !== 'batch') return;
    const batchInterval = setInterval(() => {
      const count = batchBuffer.current.length;
      if (count > 0) {
        setLatency(5000 + count * 200);
        const ids = batchBuffer.current.slice();
        batchBuffer.current = [];
        ids.forEach((id, i) => {
          setTimeout(() => {
            setEvents((prev) => prev.map((e) => e.id === id ? { ...e, processed: true } : e));
          }, i * 100);
        });
      }
    }, 5000);
    return () => clearInterval(batchInterval);
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setEvents([]);
    setLatency(0);
    eventCount.current = 0;
    batchBuffer.current = [];
  };

  const switchMode = (m: 'batch' | 'streaming') => {
    setMode(m);
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Batch vs Streaming</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Watch how data events are processed in each mode. Toggle and run to see the latency difference.
        </p>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => switchMode('batch')}
              className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold transition-all ${
                mode === 'batch' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Boxes className="w-4 h-4" /> Batch
            </button>
            <button
              onClick={() => switchMode('streaming')}
              className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold transition-all ${
                mode === 'streaming' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4" /> Streaming
            </button>
          </div>
        </div>

        {/* Visualization area */}
        <div className="rounded-xl bg-black/30 border border-white/10 p-6 mb-4 min-h-[180px] flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 font-mono">Source</span>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 font-mono">Processor</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: event.processed ? 200 : 50 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0 transition-all"
                    style={{
                      background: event.processed
                        ? mode === 'batch' ? '#22c55e' : '#22d3ee'
                        : mode === 'batch' ? '#f59e0b' : '#3b82f6',
                      opacity: event.processed ? 0.5 : 1,
                    }}
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    Event #{event.id} {event.processed ? '✓ processed' : '...waiting'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {!running && events.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">Press "Start" to generate events</p>
            )}
          </div>
        </div>

        {/* Latency display */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass-light rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Latency</span>
            </div>
            <p className={`text-lg font-bold ${latency > 1000 ? 'text-amber-400' : latency > 0 ? 'text-cyan-400' : 'text-gray-600'}`}>
              {latency > 1000 ? `${(latency / 1000).toFixed(1)}s` : latency > 0 ? `${Math.round(latency)}ms` : '—'}
            </p>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Events</span>
            </div>
            <p className="text-lg font-bold text-white">{eventCount.current}</p>
          </div>
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-3 mb-4 text-center text-xs"
            style={{
              background: mode === 'batch' ? '#f59e0b10' : '#22d3ee10',
              border: `1px solid ${mode === 'batch' ? '#f59e0b25' : '#22d3ee25'}`,
            }}
          >
            <p className="text-gray-400">
              {mode === 'batch' ? (
                <span>Batch: events accumulate and process in groups on a schedule. <span className="text-amber-400">High latency, high throughput.</span></span>
              ) : (
                <span>Streaming: each event is processed immediately as it arrives. <span className="text-cyan-400">Low latency, continuous flow.</span></span>
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!running ? (
            <button onClick={() => setRunning(true)} className="btn-primary text-sm flex items-center gap-2">
              <Play className="w-4 h-4" /> Start Events
            </button>
          ) : (
            <button onClick={() => setRunning(false)} className="btn-ghost text-sm flex items-center gap-2">
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          <button onClick={reset} className="btn-ghost text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
