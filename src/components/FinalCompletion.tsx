import { motion } from 'framer-motion';
import { Trophy, MapPin } from 'lucide-react';
import { chapters } from '@/data/chapters';

interface FinalCompletionProps {
  completedChapters: number[];
  assessmentScore?: number;
  assessmentTotal?: number;
  onRestart: () => void;
  onRetakeAssessment: () => void;
}

export function FinalCompletion({
  completedChapters,
  assessmentScore,
  assessmentTotal,
  onRestart,
  onRetakeAssessment,
}: FinalCompletionProps) {
  const allComplete = completedChapters.length >= chapters.length;
  const pct = assessmentScore && assessmentTotal ? Math.round((assessmentScore / assessmentTotal) * 100) : null;

  const conceptMap = [
    { label: 'CLOUD', color: '#0078d4', children: ['IaaS', 'PaaS', 'SaaS', 'Public / Private / Hybrid'] },
    { label: 'NETWORK', color: '#22d3ee', children: ['VNet', 'Subnet', 'Load Balancer', 'VPN / ExpressRoute', 'DNS', 'CDN'] },
    { label: 'STORAGE', color: '#22c55e', children: ['Blob', 'Files', 'Queue', 'Table', 'LRS / ZRS / GRS / GZRS'] },
    { label: 'IDENTITY', color: '#8b5cf6', children: ['Entra ID', 'AuthN / AuthZ', 'SSO', 'MFA', 'B2B / B2C'] },
    { label: 'SECURITY', color: '#ef4444', children: ['Conditional Access', 'RBAC', 'Zero Trust', 'Defense in Depth', 'Key Vault'] },
    { label: 'GOVERNANCE', color: '#f59e0b', children: ['Azure Policy', 'Resource Locks', 'Management Groups'] },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-center max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1.2, delay: 0.5 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-8"
          style={{ boxShadow: '0 0 60px rgba(34,197,94,0.4)' }}
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4 text-glow"
        >
          YOU'VE BUILT THE AZURE MAP.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="space-y-2 mb-12"
        >
          <p className="text-lg md:text-xl text-gray-400 italic">
            You didn't memorize Azure.
          </p>
          <p className="text-lg md:text-xl text-gray-400 italic">
            You built a mental model of how Azure works.
          </p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-2xl md:text-4xl font-bold text-green-400 mb-12 text-glow"
        >
          AZ-900 FUNDAMENTALS COMPLETE
        </motion.h2>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="glass rounded-xl p-5">
            <p className="text-3xl font-bold text-white">{completedChapters.length}</p>
            <p className="text-xs text-gray-500 mt-1">Chapters Completed</p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-3xl font-bold text-white">15</p>
            <p className="text-xs text-gray-500 mt-1">Topics Covered</p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-3xl font-bold text-white">{pct ? `${pct}%` : '—'}</p>
            <p className="text-xs text-gray-500 mt-1">Assessment Score</p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-3xl font-bold text-white">{assessmentScore ?? '—'}/{assessmentTotal ?? 10}</p>
            <p className="text-xs text-gray-500 mt-1">Questions Correct</p>
          </div>
        </motion.div>

        {/* Azure Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-6 text-left flex items-center gap-2">
            <MapPin className="w-3 h-3" /> YOUR AZURE MENTAL MODEL
          </p>
          <div className="text-center">
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3.2 }}
              className="text-2xl font-bold text-azure-400 mb-4 text-glow-azure"
            >
              AZURE
            </motion.p>
            <div className="flex justify-center gap-px mb-4">
              <div className="w-px h-6 bg-azure-400/30" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {conceptMap.map((node, i) => (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.3 + i * 0.1 }}
                  className="text-left"
                >
                  <p className="font-bold text-sm mb-2" style={{ color: node.color }}>
                    {node.label}
                  </p>
                  <ul className="space-y-1 ml-3">
                    {node.children.map((child) => (
                      <li key={child} className="text-xs text-gray-400 flex items-start gap-1.5">
                        <span style={{ color: node.color }}>└</span>
                        {child}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Memory line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          className="glass-light rounded-xl p-6 mb-8"
        >
          <p className="text-sm text-gray-400 italic text-center space-y-1">
            <span className="block text-azure-400 font-semibold">Compute decides. Storage remembers.</span>
            <span className="block text-azure-400 font-semibold">Network moves. CDN delivers closer.</span>
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={onRetakeAssessment} className="btn-primary">
            Retake Final Assessment
          </button>
          <button onClick={onRestart} className="btn-ghost">
            Restart Journey
          </button>
        </motion.div>

        {!allComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="text-xs text-gray-600 mt-6"
          >
            You have completed {completedChapters.length} of {chapters.length} chapters. Visit the sidebar to explore remaining chapters.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
