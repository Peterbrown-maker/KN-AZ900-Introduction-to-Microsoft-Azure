import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Brain, HardDrive, Gauge, Zap, Server, Check, X } from 'lucide-react';

const families = [
  { id: 'general', label: 'General Purpose', icon: Gauge, color: '#0078d4', desc: 'Balanced CPU/memory. Dev, test, small DBs, web servers.', series: 'D-series, B-series', workloads: ['Web server', 'Small database', 'Dev/Test'] },
  { id: 'compute', label: 'Compute Optimized', icon: Cpu, color: '#22d3ee', desc: 'High CPU ratio. Batch processing, gaming, high-traffic web.', series: 'F-series', workloads: ['Batch processing', 'Gaming server', 'High-traffic web'] },
  { id: 'memory', label: 'Memory Optimized', icon: Brain, color: '#8b5cf6', desc: 'High memory ratio. Relational DBs, in-memory analytics, caches.', series: 'E-series, M-series', workloads: ['Relational database', 'In-memory analytics', 'Large cache'] },
  { id: 'storage', label: 'Storage Optimized', icon: HardDrive, color: '#22c55e', desc: 'High disk IO. Big data, SQL Server, NoSQL, transactional.', series: 'L-series', workloads: ['Big data', 'SQL Server', 'NoSQL database'] },
  { id: 'gpu', label: 'GPU', icon: Zap, color: '#f59e0b', desc: 'Graphics processing. ML, deep learning, video rendering.', series: 'N-series', workloads: ['Machine learning', 'Video rendering', 'Deep learning'] },
  { id: 'hpc', label: 'HPC', icon: Server, color: '#ef4444', desc: 'High Performance Computing. Fluid dynamics, weather, finance.', series: 'H-series', workloads: ['Fluid dynamics', 'Weather modeling', 'Financial risk'] },
];

export function VMFamilies() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = families.find((f) => f.id === selected);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">VM Families</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Different workloads need different VM types. Click to explore each family.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {families.map((fam) => {
            const Icon = fam.icon;
            return (
              <motion.button
                key={fam.id}
                onClick={() => setSelected(fam.id)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selected === fam.id ? 'border-2' : 'glass-light border-white/10'
                }`}
                style={selected === fam.id ? { background: `${fam.color}15`, borderColor: `${fam.color}50` } : {}}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: fam.color }} />
                <p className="text-xs font-semibold" style={{ color: selected === fam.id ? fam.color : '#ccc' }}>{fam.label}</p>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {sel && (
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 rounded-xl"
              style={{ background: `${sel.color}10`, border: `1px solid ${sel.color}20` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <sel.icon className="w-5 h-5" style={{ color: sel.color }} />
                <p className="font-bold" style={{ color: sel.color }}>{sel.label}</p>
                <span className="text-xs text-gray-500 ml-auto">{sel.series}</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{sel.desc}</p>
              <div className="flex flex-wrap gap-2">
                {sel.workloads.map((w) => (
                  <span key={w} className="px-3 py-1 rounded-full text-xs" style={{ background: `${sel.color}15`, color: sel.color }}>
                    {w}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ChooserQuestion {
  scenario: string;
  options: { id: string; text: string; icon: React.ComponentType<{ className?: string }> }[];
  correctId: string;
  explanation: string;
}

const computeQuestions: ChooserQuestion[] = [
  {
    scenario: 'I need to run a Python web API without managing the operating system.',
    options: [
      { id: 'vm', text: 'Virtual Machine', icon: Server },
      { id: 'app', text: 'App Service', icon: Cpu },
      { id: 'aks', text: 'Kubernetes', icon: Server },
      { id: 'fn', text: 'Functions', icon: Zap },
    ],
    correctId: 'app',
    explanation: 'App Service is a managed PaaS platform — no OS management, just deploy your Python code.',
  },
  {
    scenario: 'I need to run code whenever a file is uploaded to a storage account.',
    options: [
      { id: 'vm', text: 'Virtual Machine', icon: Server },
      { id: 'app', text: 'App Service', icon: Cpu },
      { id: 'fn', text: 'Azure Functions', icon: Zap },
      { id: 'aks', text: 'Kubernetes', icon: Server },
    ],
    correctId: 'fn',
    explanation: 'Functions are serverless and event-driven — perfect for running code in response to file uploads.',
  },
  {
    scenario: 'I need full control over the OS and runtime for a legacy application.',
    options: [
      { id: 'vm', text: 'Virtual Machine', icon: Server },
      { id: 'app', text: 'App Service', icon: Cpu },
      { id: 'fn', text: 'Functions', icon: Zap },
      { id: 'ci', text: 'Container Instances', icon: Cpu },
    ],
    correctId: 'vm',
    explanation: 'A VM gives you full control over the OS, runtime, and everything above the hardware.',
  },
  {
    scenario: 'I need to orchestrate hundreds of containers with automatic scaling and failover.',
    options: [
      { id: 'vm', text: 'Virtual Machine', icon: Server },
      { id: 'ci', text: 'Container Instances', icon: Cpu },
      { id: 'aks', text: 'Azure Kubernetes Service', icon: Server },
      { id: 'fn', text: 'Functions', icon: Zap },
    ],
    correctId: 'aks',
    explanation: 'AKS orchestrates container clusters at scale — scheduling, scaling, and failover are automatic.',
  },
];

export function ComputeChooser() {
  return <Chooser questions={computeQuestions} title="Choosing the Right Compute" />;
}

export function Chooser({ questions, title }: { questions: ChooserQuestion[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[current];
  const correct = selectedId === q.correctId;

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelectedId(id);
    setAnswered(true);
    if (id === q.correctId) setScore(score + 1);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  };

  const isLast = current === questions.length - 1 && answered;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-400 text-center mb-2">Question {current + 1} of {questions.length}</p>
        <div className="w-full h-1 rounded-full bg-white/10 mb-6">
          <motion.div className="h-full bg-azure-500 rounded-full" animate={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        <p className="text-lg font-semibold text-white mb-6 text-center">{q.scenario}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {q.options.map((opt) => {
            const Icon = opt.icon;
            const isCorrect = opt.id === q.correctId;
            const isSelected = opt.id === selectedId;
            return (
              <motion.button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                whileHover={!answered ? { scale: 1.02 } : {}}
                whileTap={!answered ? { scale: 0.98 } : {}}
                disabled={answered}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  answered && isCorrect ? 'bg-green-500/15 border-green-500/40' :
                  answered && isSelected ? 'bg-red-500/15 border-red-500/40' :
                  'glass-light border-white/10 hover:border-azure-400/30'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${answered && isCorrect ? 'text-green-400' : answered && isSelected ? 'text-red-400' : 'text-gray-400'}`} />
                <span className={`text-sm text-left ${answered && isCorrect ? 'text-green-400' : answered && isSelected ? 'text-red-400' : 'text-gray-300'}`}>
                  {opt.text}
                </span>
                {answered && isCorrect && <Check className="w-4 h-4 text-green-400 ml-auto shrink-0" />}
                {answered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 ml-auto shrink-0" />}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-xl ${correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className={`font-semibold mb-1 ${correct ? 'text-green-400' : 'text-red-400'}`}>{correct ? 'Correct!' : 'Not quite.'}</p>
                <p className="text-sm text-gray-300">{q.explanation}</p>
              </div>
              {!isLast && (
                <button onClick={next} className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95">
                  Next Question →
                </button>
              )}
              {isLast && (
                <div className="p-4 rounded-xl bg-azure-500/10 border border-azure-400/20 text-center">
                  <p className="text-lg font-bold text-azure-400">Score: {score} / {questions.length}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
