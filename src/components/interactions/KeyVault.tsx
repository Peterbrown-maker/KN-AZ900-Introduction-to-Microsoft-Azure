import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, FileText, Unlock, ShieldX, ShieldCheck } from 'lucide-react';

interface Secret {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  stored: boolean;
}

const initialSecrets: Secret[] = [
  { id: 'key', label: 'Encryption Key', icon: Key, stored: false },
  { id: 'conn', label: 'Connection String', icon: FileText, stored: false },
  { id: 'pass', label: 'Database Password', icon: Lock, stored: false },
];

export function KeyVault() {
  const [secrets, setSecrets] = useState(initialSecrets);
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState(false);

  const storeSecret = (id: string) => {
    setSecrets((prev) => prev.map((s) => (s.id === id ? { ...s, stored: true } : s)));
  };

  const allStored = secrets.every((s) => s.stored);

  const attemptAccess = () => {
    setUnauthorizedAttempt(true);
    setTimeout(() => setUnauthorizedAttempt(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Azure Key Vault</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Store your secrets in the vault. Then try to access them without authorization.</p>

        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* Secrets */}
          <div className="flex-1 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Secrets</p>
            {secrets.map((secret) => {
              const Icon = secret.icon;
              return (
                <div key={secret.id}>
                  {!secret.stored ? (
                    <motion.button
                      onClick={() => storeSecret(secret.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl glass-light border border-white/10 hover:border-purple-500/30 transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-gray-300 flex-1 text-left">{secret.label}</span>
                      <span className="text-xs text-purple-400">Store →</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0.5, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-purple-400 flex-1">{secret.label}</span>
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vault */}
          <div className="flex flex-col items-center justify-center gap-4 md:w-48">
            <motion.div
              className={`w-28 h-36 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                unauthorizedAttempt
                  ? 'border-red-500/50 bg-red-500/10'
                  : allStored
                  ? 'border-green-500/40 bg-green-500/5'
                  : 'border-purple-500/30 bg-purple-500/5'
              }`}
              animate={unauthorizedAttempt ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={unauthorizedAttempt ? { rotate: [0, -10, 10, -10, 0] } : {}}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: unauthorizedAttempt ? 'rgba(239,68,68,0.2)' : allStored ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                }}
              >
                {unauthorizedAttempt ? <ShieldX className="w-6 h-6 text-red-500" /> : <Lock className="w-6 h-6 text-purple-400" />}
              </motion.div>
              <p className="text-xs font-bold text-gray-400">KEY VAULT</p>
              <p className="text-[10px] text-gray-600">{secrets.filter((s) => s.stored).length} secrets stored</p>
            </motion.div>
          </div>
        </div>

        {allStored && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <button
              onClick={attemptAccess}
              className="w-full py-3 rounded-xl bg-red-500/15 text-red-400 font-semibold border border-red-500/25 hover:bg-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              Attempt Unauthorized Access
            </button>
            <AnimatePresence>
              {unauthorizedAttempt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
                >
                  <p className="text-sm font-bold text-red-400">ACCESS DENIED</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Key Vault requires proper authentication and authorization (RBAC). No credentials, no access.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {allStored && !unauthorizedAttempt && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Secrets are stored securely. Only authorized applications can retrieve them at runtime.
          </p>
        )}
      </div>
    </div>
  );
}
