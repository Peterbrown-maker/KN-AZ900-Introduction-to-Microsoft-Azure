import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Server, Power, Activity } from 'lucide-react';

interface VMState {
  id: number;
  active: boolean;
  load: number;
}

export function LoadBalancerSim() {
  const [vms, setVms] = useState<VMState[]>([
    { id: 1, active: true, load: 33 },
    { id: 2, active: true, load: 33 },
    { id: 3, active: true, load: 34 },
  ]);
  const [packets, setPackets] = useState<{ id: number; target: number; progress: number }[]>([]);
  const [simulating, setSimulating] = useState(true);
  const packetId = useRef(0);
  const tickRef = useRef(0);

  const activeVms = vms.filter((v) => v.active);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      tickRef.current++;
      if (activeVms.length > 0) {
        const target = activeVms[Math.floor(Math.random() * activeVms.length)].id;
        const id = packetId.current++;
        setPackets((prev) => [...prev, { id, target, progress: 0 }]);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [simulating, activeVms.length]);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 5 }))
          .filter((p) => p.progress < 100)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [simulating]);

  useEffect(() => {
    setVms((prev) =>
      prev.map((vm) => ({
        ...vm,
        load: vm.active ? Math.max(15, 80 / activeVms.length + (Math.random() - 0.5) * 10) : 0,
      }))
    );
  }, [activeVms.length]);

  const toggleVm = (id: number) => {
    if (vms.filter((v) => v.active).length <= 1 && vms.find((v) => v.id === id)?.active) return;
    setVms((prev) => prev.map((vm) => (vm.id === id ? { ...vm, active: !vm.active } : vm)));
  };

  const vmX = [120, 280, 440];
  const lbX = 280;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Load Balancer Simulator</h3>
          <p className="text-sm text-gray-400">Traffic is distributed across VMs. Take one offline and watch traffic reroute.</p>
        </div>

        <div className="relative h-[360px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 560 360">
            {/* Lines from LB to VMs */}
            {vms.map((vm) => (
              <line
                key={`line-${vm.id}`}
                x1={lbX}
                y1={170}
                x2={vmX[vm.id - 1]}
                y2={280}
                stroke={vm.active ? '#22d3ee' : '#333'}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={vm.active ? 0.4 : 0.15}
              >
                {vm.active && (
                  <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.5s" repeatCount="indefinite" />
                )}
              </line>
            ))}
            {/* Line from users to LB */}
            <line x1={lbX} y1={50} x2={lbX} y2={170} stroke="#0078d4" strokeWidth="2" opacity="0.4" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.4s" repeatCount="indefinite" />
            </line>

            {/* Animated packets */}
            {packets.map((p) => {
              const startY = 50;
              const lbY = 170;
              const endX = vmX[p.target - 1];
              const endY = 280;
              const t = p.progress / 100;
              const x = t < 0.5 ? lbX : lbX + (endX - lbX) * ((t - 0.5) * 2);
              const y = t < 0.5 ? startY + (lbY - startY) * (t * 2) : lbY + (endY - lbY) * ((t - 0.5) * 2);
              return (
                <motion.circle
                  key={p.id}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#22d3ee"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                />
              );
            })}
          </svg>

          {/* Users */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-8 h-8 rounded-lg bg-azure-500/20 border border-azure-400/30 flex items-center justify-center"
              >
                <Users className="w-4 h-4 text-azure-400" />
              </motion.div>
            ))}
          </div>

          {/* Load Balancer */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-[120px]"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="px-5 py-3 rounded-xl glass border border-cyan-glow/30">
              <p className="text-xs font-bold text-cyan-glow text-center">LOAD BALANCER</p>
            </div>
          </motion.div>

          {/* VMs */}
          {vms.map((vm) => (
            <div
              key={vm.id}
              className="absolute bottom-0"
              style={{ left: `calc(50% + ${vmX[vm.id - 1] - 280}px)` }}
            >
              <button
                onClick={() => toggleVm(vm.id)}
                disabled={vm.active && activeVms.length <= 1}
                className="flex flex-col items-center gap-2 group"
              >
                <motion.div
                  animate={vm.active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`relative w-16 h-16 rounded-xl border flex items-center justify-center transition-all ${
                    vm.active
                      ? 'bg-azure-500/15 border-azure-400/40'
                      : 'bg-red-500/10 border-red-500/30 opacity-40'
                  }`}
                >
                  <Server
                    className={`w-7 h-7 ${vm.active ? 'text-azure-400' : 'text-red-500'}`}
                  />
                  {!vm.active && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Power className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </motion.div>
                <p className={`text-xs font-semibold ${vm.active ? 'text-gray-300' : 'text-gray-600'}`}>
                  VM{vm.id}
                </p>
                {vm.active && (
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400">{Math.round(vm.load)}%</span>
                  </div>
                )}
                {!vm.active && (
                  <span className="text-[10px] text-red-500">OFFLINE</span>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            {vms.map((vm) => (
              <button
                key={`btn-${vm.id}`}
                onClick={() => toggleVm(vm.id)}
                disabled={vm.active && activeVms.length <= 1}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-30"
                style={{
                  background: vm.active ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                  color: vm.active ? '#ef4444' : '#22c55e',
                  border: `1px solid ${vm.active ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                }}
              >
                {vm.active ? `Take VM${vm.id} Offline` : `Restore VM${vm.id}`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSimulating((s) => !s)}
            className="text-xs px-4 py-1.5 rounded-lg font-medium glass-light text-gray-300 hover:bg-white/10 transition-all"
          >
            {simulating ? 'Pause' : 'Resume'}
          </button>
        </div>

        {activeVms.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-azure-500/10 border border-azure-400/20 text-sm text-center text-gray-300"
          >
            Traffic automatically redistributed to {activeVms.length} active VM{activeVms.length > 1 ? 's' : ''}.
            This is why load balancers matter — no single point of failure.
          </motion.div>
        )}
      </div>
    </div>
  );
}
