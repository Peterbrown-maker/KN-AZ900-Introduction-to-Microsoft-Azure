import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Zap } from 'lucide-react';

interface ZoneState {
  id: number;
  active: boolean;
}

export function AvailabilityZoneSim() {
  const [zones, setZones] = useState<ZoneState[]>([
    { id: 1, active: true },
    { id: 2, active: true },
    { id: 3, active: true },
  ]);
  const [packets, setPackets] = useState<{ id: number; target: number; progress: number }[]>([]);
  const [simulating, setSimulating] = useState(true);
  const packetId = useRef(0);

  const activeZones = zones.filter((z) => z.active);

  useEffect(() => {
    if (!simulating || activeZones.length === 0) return;
    const interval = setInterval(() => {
      const target = activeZones[Math.floor(Math.random() * activeZones.length)].id;
      setPackets((prev) => [...prev, { id: packetId.current++, target, progress: 0 }]);
    }, 700);
    return () => clearInterval(interval);
  }, [simulating, activeZones.length]);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setPackets((prev) =>
        prev.map((p) => ({ ...p, progress: p.progress + 4 })).filter((p) => p.progress < 100)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [simulating]);

  const simulateFailure = () => {
    setZones((prev) => {
      const firstActive = prev.find((z) => z.active);
      if (!firstActive) return prev.map((z) => ({ ...z, active: true }));
      return prev.map((z) => (z.id === firstActive.id ? { ...z, active: false } : z));
    });
  };

  const restoreAll = () => setZones((prev) => prev.map((z) => ({ ...z, active: true })));

  const zoneX = [80, 280, 480];
  const sourceX = 280;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Availability Zones</h3>
          <p className="text-sm text-gray-400">Each zone is a separate physical location. Simulate a failure and watch traffic reroute.</p>
        </div>

        <div className="relative h-[320px]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 560 320">
            {/* Lines from source to zones */}
            {zones.map((zone) => (
              <line
                key={`line-${zone.id}`}
                x1={sourceX}
                y1={60}
                x2={zoneX[zone.id - 1]}
                y2={200}
                stroke={zone.active ? '#22d3ee' : '#333'}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={zone.active ? 0.4 : 0.1}
              >
                {zone.active && (
                  <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.6s" repeatCount="indefinite" />
                )}
              </line>
            ))}

            {packets.map((p) => {
              const endX = zoneX[p.target - 1];
              const t = p.progress / 100;
              const x = sourceX + (endX - sourceX) * t;
              const y = 60 + (200 - 60) * t;
              return <circle key={p.id} cx={x} cy={y} r="3" fill="#22d3ee" opacity={1 - t * 0.5} />;
            })}
          </svg>

          {/* Traffic source */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <div className="px-4 py-2 rounded-lg glass-light">
              <p className="text-xs font-bold text-azure-400">USER TRAFFIC</p>
            </div>
          </div>

          {/* Zones */}
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              className="absolute"
              style={{ left: `calc(50% + ${zoneX[zone.id - 1] - 280}px)`, top: '180px' }}
              animate={zone.active ? {} : { opacity: 0.4 }}
            >
              <div
                className={`relative w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-500 ${
                  zone.active
                    ? 'bg-azure-500/10 border-azure-400/30'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                {zone.active ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-lg bg-azure-500/20 flex items-center justify-center"
                  >
                    <Zap className="w-5 h-5 text-azure-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center"
                  >
                    <Power className="w-5 h-5 text-red-500" />
                  </motion.div>
                )}
                <p className={`text-xs font-bold ${zone.active ? 'text-azure-400' : 'text-red-500'}`}>
                  ZONE {zone.id}
                </p>
                <p className={`text-[10px] ${zone.active ? 'text-green-400' : 'text-red-500'}`}>
                  {zone.active ? 'ACTIVE' : 'OFFLINE'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {zones.some((z) => !z.active) ? (
            <button onClick={restoreAll} className="btn-primary text-sm">
              Restore All Zones
            </button>
          ) : (
            <button
              onClick={simulateFailure}
              className="px-6 py-3 rounded-xl font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all active:scale-95"
            >
              Simulate Zone Failure
            </button>
          )}
        </div>

        <AnimatePresence>
          {zones.some((z) => !z.active) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
            >
              <p className="text-sm text-gray-300">
                Zone {zones.find((z) => !z.active)?.id} is down, but traffic continues flowing to the remaining {activeZones.length} zone(s).
              </p>
              <p className="text-sm font-semibold text-green-400 mt-1">This is why redundancy matters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
