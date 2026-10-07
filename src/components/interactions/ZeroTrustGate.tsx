import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Globe, Smartphone, Target, ShieldCheck, X } from 'lucide-react';

interface Check {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  question: string;
  value: string;
  pass: boolean;
}

export function ZeroTrustGate() {
  const [currentCheck, setCurrentCheck] = useState(0);
  const [passed, setPassed] = useState<boolean[]>([]);
  const [gateOpen, setGateOpen] = useState(false);

  const checks: Check[] = [
    { id: 'who', label: 'WHO ARE YOU?', icon: User, question: 'Identity verified via Entra ID', value: 'alice@company.com', pass: true },
    { id: 'where', label: 'WHERE ARE YOU?', icon: Globe, question: 'Location checked', value: 'Unknown location', pass: true },
    { id: 'device', label: 'WHAT ARE YOU USING?', icon: Smartphone, question: 'Device compliance checked', value: 'Managed laptop', pass: true },
    { id: 'access', label: 'WHAT ARE YOU ACCESSING?', icon: Target, question: 'Resource authorization checked', value: 'Production database', pass: true },
  ];

  const handleCheck = () => {
    const check = checks[currentCheck];
    const newPassed = [...passed, check.pass];
    setPassed(newPassed);
    if (currentCheck < checks.length - 1) {
      setCurrentCheck(currentCheck + 1);
    } else {
      setGateOpen(true);
    }
  };

  const reset = () => {
    setCurrentCheck(0);
    setPassed([]);
    setGateOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Zero Trust Gate</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Never trust, always verify. Every request must pass all checks.</p>

        <div className="relative">
          {/* The gate */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* User */}
            <motion.div
              animate={!gateOpen ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-azure-500/20 border border-azure-400/30 flex items-center justify-center">
                <User className="w-7 h-7 text-azure-400" />
              </div>
              <p className="text-xs text-gray-400">User</p>
            </motion.div>

            {/* Gate */}
            <div className="relative">
              <motion.div
                className="w-32 h-24 rounded-xl border-2 flex items-center justify-center"
                style={{
                  borderColor: gateOpen ? '#22c55e' : passed.length === checks.length ? '#22c55e' : '#8b5cf6',
                  background: gateOpen ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                }}
                animate={gateOpen ? { scaleY: 0.1 } : { scaleY: 1 }}
                transition={{ duration: 0.6 }}
              >
                {!gateOpen && (
                  <p className="text-xs font-bold text-purple-400 text-center px-2">ZERO TRUST GATE</p>
                )}
              </motion.div>
              {gateOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ShieldCheck className="w-8 h-8 text-green-400" />
                </motion.div>
              )}
            </div>

            {/* Resource */}
            <motion.div
              animate={gateOpen ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: gateOpen ? Infinity : 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                gateOpen ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5 border-white/10'
              }`}>
                <Target className={`w-7 h-7 ${gateOpen ? 'text-green-400' : 'text-gray-600'}`} />
              </div>
              <p className="text-xs text-gray-400">Resource</p>
            </motion.div>
          </div>

          {/* Checks */}
          <div className="space-y-3 mb-6">
            {checks.map((check, i) => {
              const isPassed = passed[i] !== undefined;
              const isCurrent = i === currentCheck && !gateOpen;
              const Icon = check.icon;
              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isPassed || isCurrent ? 1 : 0.3, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isPassed
                      ? 'bg-green-500/10 border-green-500/20'
                      : isCurrent
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'glass-light border-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isPassed ? 'bg-green-500/20' : isCurrent ? 'bg-purple-500/20' : 'bg-white/5'
                  }`}>
                    <Icon className={`w-4 h-4 ${isPassed ? 'text-green-400' : isCurrent ? 'text-purple-400' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isPassed ? 'text-green-400' : isCurrent ? 'text-purple-400' : 'text-gray-500'}`}>
                      {check.label}
                    </p>
                    {isPassed && <p className="text-xs text-gray-400">{check.value}</p>}
                    {isCurrent && <p className="text-xs text-gray-500">{check.question}</p>}
                  </div>
                  {isPassed && <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />}
                </motion.div>
              );
            })}
          </div>

          {!gateOpen ? (
            <motion.button
              onClick={handleCheck}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            >
              {currentCheck === 0 ? 'Begin Verification' : `Verify: ${checks[currentCheck].label}`}
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <p className="text-lg font-bold text-green-400">GATE OPENED — ACCESS GRANTED</p>
              <p className="text-sm text-gray-400">
                Every request was verified: identity, location, device, and resource.
                This is Zero Trust — no implicit trust, ever.
              </p>
              <button onClick={reset} className="text-sm text-azure-400 hover:underline">
                Reset →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
