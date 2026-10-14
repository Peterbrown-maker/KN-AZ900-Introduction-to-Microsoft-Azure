import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Server, MapPin, ArrowLeftRight, Maximize, Layers, Gauge } from 'lucide-react';

const factors = [
  { id: 'type', label: 'Resource Type', icon: Server, color: '#0078d4', desc: 'VMs bill per compute hour. Storage bills per GB/month. Functions bill per execution. Different services have different billing units.' },
  { id: 'usage', label: 'Usage', icon: Gauge, color: '#22d3ee', desc: 'Pay-as-you-go: pay for what you use, when you use it. Stop a VM → stop paying for compute. Delete a resource → stop paying entirely.' },
  { id: 'size', label: 'Size', icon: Maximize, color: '#8b5cf6', desc: 'A 2-core VM costs less than a 16-core VM. 100 GB storage costs less than 10 TB. Choose the smallest size that meets your needs.' },
  { id: 'capacity', label: 'Capacity', icon: Layers, color: '#22c55e', desc: 'Tiered pricing: the more you use, the lower the per-unit cost. Storage per GB decreases as you store more. Bulk usage unlocks discounts.' },
  { id: 'region', label: 'Region', icon: MapPin, color: '#f59e0b', desc: 'The same service can cost different amounts in different regions. Local infrastructure costs, energy prices, and taxes all affect pricing.' },
  { id: 'transfer', label: 'Data Transfer', icon: ArrowLeftRight, color: '#ef4444', desc: 'Inbound (entering Azure) is generally free. Outbound (leaving Azure to internet) is billed on a tiered basis after the first 100 GB/month.' },
];

export function PricingFactors() {
  const [selected, setSelected] = useState(0);
  const f = factors[selected];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">Pricing Factors</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Explore what drives your Azure bill. Click each factor to learn more.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {factors.map((factor, i) => {
            const Icon = factor.icon;
            return (
              <motion.button
                key={factor.id}
                onClick={() => setSelected(i)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selected === i ? 'border-2' : 'glass-light border-white/10'
                }`}
                style={selected === i ? { background: `${factor.color}15`, borderColor: `${factor.color}50` } : {}}
              >
                <Icon className="w-7 h-7 mx-auto mb-2" style={{ color: factor.color }} />
                <p className="text-xs font-semibold" style={{ color: selected === i ? factor.color : '#ccc' }}>{factor.label}</p>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl"
          style={{ background: `${f.color}10`, border: `1px solid ${f.color}20` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <f.icon className="w-5 h-5" style={{ color: f.color }} />
            <p className="font-bold" style={{ color: f.color }}>{f.label}</p>
          </div>
          <p className="text-sm text-gray-300">{f.desc}</p>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <Wallet className="w-4 h-4 text-green-400" />
          <p className="text-xs text-gray-500">Total cost = all factors combined. Use the Pricing Calculator to estimate.</p>
        </div>
      </div>
    </div>
  );
}
