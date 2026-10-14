import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Smartphone, User, AppWindow, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

interface Factor {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: { value: string; risk: number }[];
  selected: number;
}

const initialFactors: Factor[] = [
  {
    id: 'location',
    label: 'Location',
    icon: MapPin,
    selected: 0,
    options: [
      { value: 'Office (known)', risk: 0 },
      { value: 'Home (trusted)', risk: 1 },
      { value: 'Unknown city', risk: 2 },
      { value: 'Foreign country', risk: 3 },
    ],
  },
  {
    id: 'device',
    label: 'Device',
    icon: Smartphone,
    selected: 0,
    options: [
      { value: 'Managed laptop', risk: 0 },
      { value: 'Personal phone', risk: 1 },
      { value: 'Unknown device', risk: 3 },
    ],
  },
  {
    id: 'user',
    label: 'User',
    icon: User,
    selected: 0,
    options: [
      { value: 'Regular employee', risk: 0 },
      { value: 'New hire', risk: 1 },
      { value: 'Guest', risk: 2 },
    ],
  },
  {
    id: 'app',
    label: 'Application',
    icon: AppWindow,
    selected: 0,
    options: [
      { value: 'Internal wiki', risk: 0 },
      { value: 'HR system', risk: 1 },
      { value: 'Production database', risk: 3 },
    ],
  },
];

export function ConditionalAccess() {
  const [factors, setFactors] = useState(initialFactors);
  const [showDecision, setShowDecision] = useState(false);

  const totalRisk = factors.reduce((sum, f) => sum + f.options[f.selected].risk, 0);
  const decision = totalRisk <= 2 ? 'allow' : totalRisk <= 5 ? 'mfa' : 'block';

  const updateFactor = (id: string, idx: number) => {
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, selected: idx } : f)));
    setShowDecision(false);
  };

  const decisionConfig = {
    allow: { color: '#22c55e', label: 'ACCESS GRANTED', icon: Check, desc: 'Risk is low. Access approved.' },
    mfa: { color: '#f59e0b', label: 'MFA REQUIRED', icon: ShieldAlert, desc: 'Moderate risk. Additional verification needed.' },
    block: { color: '#ef4444', label: 'ACCESS BLOCKED', icon: X, desc: 'High risk. Access denied for security.' },
  };

  const dc = decisionConfig[decision];
  const DecisionIcon = dc.icon;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Conditional Access</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Change the conditions and watch the access decision update in real time.</p>

        <div className="space-y-4 mb-6">
          {factors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div key={factor.id} className="glass-light rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-azure-400" />
                  <p className="text-sm font-semibold text-gray-300">{factor.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {factor.options.map((opt, idx) => (
                    <button
                      key={opt.value}
                      onClick={() => updateFactor(factor.id, idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                        factor.selected === idx
                          ? opt.risk === 0
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : opt.risk <= 2
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'glass-light text-gray-500 border border-white/5 hover:text-gray-300'
                      }`}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowDecision(true)}
          className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95"
        >
          Evaluate Access
        </button>

        <AnimatePresence>
          {showDecision && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 p-5 rounded-xl text-center"
              style={{ background: `${dc.color}15`, border: `1px solid ${dc.color}30` }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${dc.color}25` }}>
                  <DecisionIcon className="w-5 h-5" style={{ color: dc.color }} />
                </div>
                <p className="text-lg font-bold" style={{ color: dc.color }}>{dc.label}</p>
              </div>
              <p className="text-sm text-gray-400">{dc.desc}</p>
              <p className="text-xs text-gray-600 mt-2">Risk score: {totalRisk}/12</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
