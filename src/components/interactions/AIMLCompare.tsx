import { motion } from 'framer-motion';
import { Brain, Cpu, Radio, Globe } from 'lucide-react';
import { useState } from 'react';

export function AIvsML() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">AI vs ML</h3>
        <p className="text-sm text-gray-400 text-center mb-8">AI is the umbrella. ML is the method. Explore the difference.</p>

        <div className="relative h-[280px] flex items-center justify-center">
          {/* AI umbrella */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: hovered === 'ai' ? 1.05 : 1 }}
          >
            <div
              className="w-64 h-64 rounded-full border-2 border-amber-500/30 bg-amber-500/5 flex items-center justify-center"
              onMouseEnter={() => setHovered('ai')}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="text-center">
                <Brain className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-amber-400">ARTIFICIAL INTELLIGENCE</p>
                <p className="text-xs text-gray-500 mt-1">The broad field of intelligent systems</p>
              </div>
            </div>
          </motion.div>

          {/* ML subset */}
          <motion.div
            className="absolute"
            animate={{ scale: hovered === 'ml' ? 1.05 : 1 }}
            style={{ top: '40%', left: '52%' }}
          >
            <div
              className="w-32 h-32 rounded-full border-2 border-azure-500/40 bg-azure-500/10 flex items-center justify-center"
              onMouseEnter={() => setHovered('ml')}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="text-center">
                <Cpu className="w-7 h-7 text-azure-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-azure-400">MACHINE LEARNING</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-light rounded-xl p-4"
          >
            <Brain className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-sm font-semibold text-amber-400 mb-1">AI includes:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Rule-based systems</li>
              <li>• Expert systems</li>
              <li>• Machine Learning</li>
              <li>• Natural language processing</li>
              <li>• Computer vision</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-light rounded-xl p-4"
          >
            <Cpu className="w-5 h-5 text-azure-400 mb-2" />
            <p className="text-sm font-semibold text-azure-400 mb-1">ML is specifically:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Learning from data</li>
              <li>• Finding patterns</li>
              <li>• Making predictions</li>
              <li>• Improving with experience</li>
              <li>• No explicit programming</li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-azure-500/10 border border-azure-400/20 text-xs text-gray-400 text-center">
          All ML is AI, but not all AI is ML. ML is one approach within the broader AI field.
        </div>
      </div>
    </div>
  );
}

export function IoTEdge() {
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'IoT SENSORS', icon: Radio, color: '#22d3ee', desc: 'Devices collect data from the physical world — temperature, vibration, pressure.' },
    { label: 'EDGE PROCESSING', icon: Cpu, color: '#0078d4', desc: 'Data is processed locally at the edge for real-time decisions with minimal latency.' },
    { label: 'CLOUD ANALYTICS', icon: Globe, color: '#8b5cf6', desc: 'Summaries and patterns are sent to the cloud for long-term storage and deep analysis.' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">IoT + Edge Architecture</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Data flows from devices through edge processing to the cloud. Click to explore each stage.</p>

        <div className="flex flex-col items-center gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            return (
              <div key={s.label} className="flex flex-col items-center w-full">
                <motion.button
                  onClick={() => setStep(i)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full max-w-md flex items-center gap-4 p-5 rounded-xl border transition-all ${
                    isActive ? 'border-2' : i < step ? 'border' : 'glass-light border-white/10 opacity-50'
                  }`}
                  style={isActive ? { background: `${s.color}15`, borderColor: `${s.color}50` } : i < step ? { background: `${s.color}08`, borderColor: `${s.color}20` } : {}}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm" style={{ color: isActive ? s.color : '#ccc' }}>{s.label}</p>
                    {isActive && <p className="text-xs text-gray-400 mt-1">{s.desc}</p>}
                  </div>
                </motion.button>
                {i < steps.length - 1 && (
                  <motion.div
                    className="w-px h-6"
                    style={{ background: i < step ? '#22c55e' : '#333' }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {step === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-gray-400 text-center"
          >
            Edge = real-time decisions near the source. Cloud = long-term storage and deep analysis. Both work together.
          </motion.div>
        )}
      </div>
    </div>
  );
}
