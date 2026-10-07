import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Smartphone, ShieldCheck, X, Check } from 'lucide-react';

export function MFASim() {
  const [step, setStep] = useState<'password' | 'password-result' | 'mfa' | 'mfa-result'>('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">The Password Trap</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Try to log in with just a password.</p>

        <AnimatePresence mode="wait">
          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl glass-light border border-white/10">
                <Lock className="w-5 h-5 text-azure-400 shrink-0" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
              </div>
              <button
                onClick={() => { setPassword(''); setStep('password-result'); }}
                className="w-full py-3 rounded-xl bg-azure-500/20 text-azure-400 font-semibold border border-azure-400/30 hover:bg-azure-500/30 transition-all active:scale-95"
              >
                Login with Password Only
              </button>
            </motion.div>
          )}

          {step === 'password-result' && (
            <motion.div
              key="password-result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto"
              >
                <X className="w-8 h-8 text-red-500" />
              </motion.div>
              <p className="text-lg font-bold text-red-500">ACCESS DENIED</p>
              <p className="text-sm text-gray-400">A password alone is not enough. Stolen passwords are the #1 attack vector.</p>
              <button
                onClick={() => setStep('mfa')}
                className="text-sm text-azure-400 hover:underline mt-4"
              >
                Add a second factor →
              </button>
            </motion.div>
          )}

          {step === 'mfa' && (
            <motion.div
              key="mfa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl glass-light border border-azure-400/20">
                <Lock className="w-5 h-5 text-azure-400 shrink-0" />
                <p className="flex-1 text-white text-sm">••••••••••</p>
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl glass-light border border-purple-500/30">
                <Smartphone className="w-5 h-5 text-purple-400 shrink-0" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Authenticator code"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
              </div>
              <motion.div
                className="h-1 rounded-full bg-purple-500/20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                />
              </motion.div>
              <button
                onClick={() => { setCode(''); setStep('mfa-result'); }}
                className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30 hover:bg-purple-500/30 transition-all active:scale-95"
              >
                Verify with Authenticator
              </button>
            </motion.div>
          )}

          {step === 'mfa-result' && (
            <motion.div
              key="mfa-result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto"
              >
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-green-400"
              >
                ACCESS GRANTED
              </motion.p>
              <p className="text-sm text-gray-400">
                Two factors: something you know (password) + something you have (authenticator).
                Even if a password is stolen, the account is safe.
              </p>
              <p className="text-sm font-semibold text-purple-400 mt-2">
                MFA prevents over 99.9% of account compromise attacks.
              </p>
              <button
                onClick={() => setStep('password')}
                className="text-sm text-azure-400 hover:underline mt-4"
              >
                Try again →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
