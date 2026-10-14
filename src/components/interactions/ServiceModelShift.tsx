import { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Settings, Code2, Package, Database } from 'lucide-react';

type Model = 'IaaS' | 'PaaS' | 'SaaS';

const layers = [
  { id: 'app', label: 'Applications', icon: Code2 },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'runtime', label: 'Runtime', icon: Settings },
  { id: 'os', label: 'OS', icon: Server },
  { id: 'virt', label: 'Virtualization', icon: Package },
  { id: 'servers', label: 'Servers', icon: Server },
  { id: 'network', label: 'Networking', icon: Server },
];

const managedBy: Record<Model, Record<string, 'you' | 'provider'>> = {
  IaaS: { app: 'you', data: 'you', runtime: 'you', os: 'you', virt: 'provider', servers: 'provider', network: 'provider' },
  PaaS: { app: 'you', data: 'you', runtime: 'provider', os: 'provider', virt: 'provider', servers: 'provider', network: 'provider' },
  SaaS: { app: 'provider', data: 'provider', runtime: 'provider', os: 'provider', virt: 'provider', servers: 'provider', network: 'provider' },
};

export function ServiceModelShift() {
  const [model, setModel] = useState<Model>('IaaS');
  const youCount = layers.filter((l) => managedBy[model][l.id] === 'you').length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">IaaS → PaaS → SaaS</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Watch the responsibility shift. You manage less as you move from IaaS to SaaS.</p>

        <div className="flex justify-center gap-3 mb-8">
          {(['IaaS', 'PaaS', 'SaaS'] as Model[]).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                model === m ? 'bg-azure-500/25 text-azure-300 border border-azure-400/40' : 'glass-light text-gray-400 border border-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {layers.map((layer, i) => {
            const who = managedBy[model][layer.id];
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.id}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex items-center gap-3"
              >
                <div className="w-24 text-right">
                  <span className="text-xs text-gray-500">{layer.label}</span>
                </div>
                <div className="flex-1 relative h-10 rounded-lg overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 flex items-center px-4 gap-2 ${
                      who === 'you' ? 'bg-azure-500/15 border border-azure-400/25' : 'bg-purple-500/10 border border-purple-500/20'
                    } rounded-lg`}
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Icon className={`w-4 h-4 ${who === 'you' ? 'text-azure-400' : 'text-purple-400'}`} />
                    <span className={`text-sm font-semibold ${who === 'you' ? 'text-azure-400' : 'text-purple-400'}`}>
                      {who === 'you' ? 'You manage' : 'Provider manages'}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          key={model}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl text-center"
          style={{ background: model === 'IaaS' ? 'rgba(0,120,212,0.1)' : model === 'PaaS' ? 'rgba(34,211,238,0.1)' : 'rgba(34,197,94,0.1)' }}
        >
          <p className="text-sm text-gray-300">
            {model === 'IaaS' && `You manage ${youCount} layers. Maximum control, maximum responsibility.`}
            {model === 'PaaS' && `You manage only ${youCount} layers. Focus on your app, not infrastructure.`}
            {model === 'SaaS' && `You manage ${youCount} layers. Just use the software — everything else is handled.`}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
