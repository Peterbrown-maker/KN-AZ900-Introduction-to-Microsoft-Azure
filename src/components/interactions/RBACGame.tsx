import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Code, Eye, AlertTriangle, Check } from 'lucide-react';

interface Role {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

interface Permission {
  id: string;
  label: string;
  correctRole: string;
}

const roles: Role[] = [
  { id: 'admin', label: 'Admin', icon: Crown, color: '#ef4444' },
  { id: 'developer', label: 'Developer', icon: Code, color: '#0078d4' },
  { id: 'viewer', label: 'Viewer', icon: Eye, color: '#22d3ee' },
];

const permissions: Permission[] = [
  { id: 'delete', label: 'Delete Resource', correctRole: 'admin' },
  { id: 'deploy', label: 'Deploy App', correctRole: 'developer' },
  { id: 'view', label: 'View Resource', correctRole: 'viewer' },
  { id: 'manage-access', label: 'Manage Access', correctRole: 'admin' },
  { id: 'restart', label: 'Restart Service', correctRole: 'developer' },
  { id: 'read-logs', label: 'Read Logs', correctRole: 'viewer' },
];

export function RBACGame() {
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [draggedPerm, setDraggedPerm] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ permId: string; correct: boolean } | null>(null);

  const unassigned = permissions.filter((p) => !assignments[p.id]);

  const handleDrop = (roleId: string) => {
    if (!draggedPerm) return;
    const perm = permissions.find((p) => p.id === draggedPerm);
    if (!perm) return;
    const correct = perm.correctRole === roleId;
    setFeedback({ permId: draggedPerm, correct });
    if (correct) {
      setAssignments((prev) => ({ ...prev, [draggedPerm]: roleId }));
    }
    setTimeout(() => setFeedback(null), 1500);
    setDraggedPerm(null);
  };

  const allAssigned = permissions.every((p) => assignments[p.id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white text-center mb-2">RBAC Game</h3>
        <p className="text-sm text-gray-400 text-center mb-6">Drag each permission to the correct role. Wrong assignments will be rejected.</p>

        {/* Roles */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const assignedPerms = permissions.filter((p) => assignments[p.id] === role.id);
            return (
              <div
                key={role.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(role.id)}
                className={`rounded-xl border-2 border-dashed p-4 min-h-[140px] transition-all ${
                  feedback?.permId && feedback.correct
                    ? 'border-green-500/40'
                    : feedback && !feedback.correct && draggedPerm
                    ? 'border-red-500/40'
                    : 'border-white/15'
                }`}
                style={{ background: `${role.color}08` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${role.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: role.color } as React.CSSProperties} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: role.color }}>{role.label}</p>
                </div>
                <div className="space-y-2">
                  {assignedPerms.map((perm) => (
                    <motion.div
                      key={perm.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{ background: `${role.color}15`, color: role.color }}
                    >
                      <Check className="w-3 h-3" />
                      {perm.label}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unassigned permissions */}
        {!allAssigned && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Permissions to assign:</p>
            <div className="flex flex-wrap gap-3">
              {unassigned.map((perm) => (
                <motion.div
                  key={perm.id}
                  draggable
                  onDragStart={() => setDraggedPerm(perm.id)}
                  onDragEnd={() => setDraggedPerm(null)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                  className={`px-4 py-2.5 rounded-xl glass-light border cursor-grab text-sm font-medium text-gray-200 transition-all ${
                    draggedPerm === perm.id ? 'opacity-50' : ''
                  } ${feedback?.permId === perm.id && !feedback.correct ? 'animate-pulse border-red-500/40' : 'border-white/10'}`}
                >
                  {perm.label}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {feedback && !feedback.correct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-400">Wrong assignment! This permission does not belong to that role.</p>
          </motion.div>
        )}

        {allAssigned && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
          >
            <p className="text-lg font-bold text-green-400">All permissions assigned correctly!</p>
            <p className="text-sm text-gray-400 mt-1">This is Role-Based Access Control — permissions follow roles, not individuals.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
