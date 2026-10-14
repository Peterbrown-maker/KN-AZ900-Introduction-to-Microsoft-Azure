import { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Settings, Code2, Package, Database, Layers } from 'lucide-react';

const layers = [
  { id: 'app', label: 'Applications', icon: Code2 },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'runtime', label: 'Runtime', icon: Settings },
  { id: 'os', label: 'OS', icon: Server },
  { id: 'virt', label: 'Virtualization', icon: Layers },
  { id: 'servers', label: 'Servers', icon: Server },
  { id: 'network', label: 'Networking', icon: Server },
];

type ResponsibilityMap = Record<string, 'you' | 'provider'>;

const models: Record<string, ResponsibilityMap> = {
  'On-Premises': { app: 'you', data: 'you', runtime: 'you', os: 'you', virt: 'you', servers: 'you', network: 'you' },
  'IaaS': { app: 'you', data: 'you', runtime: 'you', os: 'you', virt: 'provider', servers: 'provider', network: 'provider' },
  'PaaS': { app: 'you', data: 'you', runtime: 'provider', os: 'provider', virt: 'provider', servers: 'provider', network: 'provider' },
  'SaaS': { app: 'provider', data: 'provider', runtime: 'provider', os: 'provider', virt: 'provider', servers: 'provider', network: 'provider' },
};

type Model = keyof typeof models;

export function SharedResponsibility() {
  const [model, setModel] = useState<Model>('IaaS');

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Shared Responsibility Model</h3>
        <p className="text-sm text-gray-400 text-center mb-6">See how responsibility shifts between you and the provider across service models.</p>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {(Object.keys(models) as Model[]).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                model === m ? 'bg-azure-500/25 text-azure-300 border border-azure-400/40' : 'glass-light text-gray-400 border border-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          {layers.map((layer) => {
            const who = models[model][layer.id];
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.id}
                layout
                className="flex items-center gap-3"
              >
                <div className="w-24 text-right">
                  <span className="text-xs text-gray-500">{layer.label}</span>
                </div>
                <motion.div
                  className={`flex-1 h-9 rounded-lg flex items-center px-4 gap-2 border ${
                    who === 'you' ? 'bg-azure-500/15 border-azure-400/25' : 'bg-purple-500/10 border-purple-500/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${who === 'you' ? 'text-azure-400' : 'text-purple-400'}`} />
                  <span className={`text-sm font-semibold ${who === 'you' ? 'text-azure-400' : 'text-purple-400'}`}>
                    {who === 'you' ? 'You manage' : 'Provider manages'}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          key={model}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-azure-500/10 border border-azure-400/20 text-center"
        >
          <p className="text-sm text-gray-300">
            {model === 'On-Premises' && 'On-premises: you manage everything — hardware, software, security, the lot.'}
            {model === 'IaaS' && 'IaaS: you manage the OS and above. Provider handles hardware and virtualization.'}
            {model === 'PaaS' && 'PaaS: you manage only your app and data. Provider handles the rest.'}
            {model === 'SaaS' && 'SaaS: the provider manages everything. You just use the software.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
