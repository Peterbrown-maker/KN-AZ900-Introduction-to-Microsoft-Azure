import { motion } from 'framer-motion';
import { User, Globe, Network, Split, Cpu, Database, Brain, ListOrdered, Activity, Shield } from 'lucide-react';
import { useState } from 'react';

const layers = [
  { id: 'user', label: 'USER', icon: User, color: '#0078d4', desc: 'A user opens the app on their phone.' },
  { id: 'internet', label: 'INTERNET', icon: Globe, color: '#22d3ee', desc: 'The request travels over the internet to Azure.' },
  { id: 'cdn', label: 'CDN / EDGE', icon: Globe, color: '#22d3ee', desc: 'Azure CDN caches videos at edge locations worldwide for instant playback.' },
  { id: 'network', label: 'AZURE NETWORK', icon: Network, color: '#0078d4', desc: 'The request enters Azure\'s virtual network. Firewalls filter traffic.' },
  { id: 'lb', label: 'LOAD BALANCER', icon: Split, color: '#0078d4', desc: 'Distributes incoming requests across multiple compute instances.' },
  { id: 'compute', label: 'COMPUTE', icon: Cpu, color: '#0078d4', desc: 'App Service or AKS runs the application logic. This is where decisions happen.' },
  { id: 'database', label: 'DATABASE', icon: Database, color: '#0078d4', desc: 'Cosmos DB and Azure SQL store user profiles, metadata, and social graphs.' },
  { id: 'storage', label: 'STORAGE', icon: Database, color: '#22c55e', desc: 'Video files are stored in Blob Storage with GZRS replication for durability.' },
  { id: 'ai', label: 'AI / RECOMMENDATION', icon: Brain, color: '#f59e0b', desc: 'Azure ML powers the recommendation engine. This is the brain of the platform.' },
  { id: 'queues', label: 'QUEUES / EVENTS', icon: ListOrdered, color: '#f59e0b', desc: 'Queue Storage + Functions handle video processing asynchronously.' },
  { id: 'monitoring', label: 'MONITORING', icon: Activity, color: '#0078d4', desc: 'Azure Monitor and Application Insights track health and performance.' },
  { id: 'security', label: 'SECURITY', icon: Shield, color: '#ef4444', desc: 'Entra ID, RBAC, Conditional Access, Key Vault, and encryption wrap around everything.' },
];

export function ArchitectureStory() {
  const [revealed, setRevealed] = useState<number>(0);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">The Full Architecture Story</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Imagine building a TikTok-like platform. Travel through the entire stack.</p>

        <div className="space-y-2">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            const isRevealed = i <= revealed;
            return (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isRevealed ? { opacity: 1, x: 0 } : { opacity: 0.2, x: 0 }}
                transition={{ delay: isRevealed && i === revealed ? 0 : 0 }}
                className="flex items-center gap-3"
              >
                {i > 0 && <div className="w-px h-4 ml-5" style={{ background: isRevealed ? `${layer.color}40` : '#333' }} />}
                <motion.button
                  onClick={() => setRevealed(i)}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isRevealed && i === revealed ? 'border-2' : isRevealed ? '' : 'border-white/5 opacity-50'
                  }`}
                  style={
                    isRevealed && i === revealed
                      ? { background: `${layer.color}15`, borderColor: `${layer.color}50` }
                      : isRevealed
                      ? { background: `${layer.color}08`, borderColor: `${layer.color}20` }
                      : {}
                  }
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${layer.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: layer.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: isRevealed ? layer.color : '#666' }}>{layer.label}</p>
                    {isRevealed && i === revealed && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-gray-400 mt-1"
                      >
                        {layer.desc}
                      </motion.p>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          {revealed < layers.length - 1 ? (
            <button onClick={() => setRevealed(revealed + 1)} className="btn-primary text-sm">
              Next Layer →
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-2"
            >
              <p className="text-lg font-bold text-green-400">Architecture Complete!</p>
              <p className="text-sm text-gray-400 italic">
                Compute decides. Storage remembers. Network moves. CDN delivers closer.
              </p>
              <button onClick={() => setRevealed(0)} className="text-sm text-azure-400 hover:underline">
                Replay from start →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
