import { motion } from 'framer-motion';
import type { HealthStatus as HealthStatusType } from '@/hooks/useSimulation';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface HealthStatusProps {
  status: HealthStatusType;
  cycle: number;
  maxCycles: number;
  engineId: number;
}

const statusConfig = {
  healthy: {
    label: 'HEALTHY',
    icon: Shield,
    colorClass: 'neon-text-green',
    bgClass: 'bg-neon-green/10',
    borderClass: 'border-neon-green/30',
  },
  warning: {
    label: 'WARNING',
    icon: AlertTriangle,
    colorClass: 'text-neon-orange',
    bgClass: 'bg-neon-orange/10',
    borderClass: 'border-neon-orange/30',
  },
  critical: {
    label: 'CRITICAL',
    icon: AlertOctagon,
    colorClass: 'text-neon-red',
    bgClass: 'bg-neon-red/10',
    borderClass: 'border-neon-red/30',
  },
};

const HealthStatusCard = ({ status, cycle, maxCycles, engineId }: HealthStatusProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const progress = (cycle / maxCycles) * 100;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Engine Status
      </h3>
      
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          className={`p-2.5 rounded-lg ${config.bgClass} border ${config.borderClass}`}
          animate={{ scale: status === 'critical' ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: status === 'critical' ? Infinity : 0, duration: 1 }}
        >
          <Icon className={`w-5 h-5 ${config.colorClass}`} />
        </motion.div>
        <div>
          <span className={`text-lg font-bold font-mono ${config.colorClass}`}>
            {config.label}
          </span>
          <p className="text-xs text-muted-foreground font-mono">Engine #{engineId}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Lifecycle Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-orange)), hsl(var(--neon-red)))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Cycle {cycle}</span>
          <span>of {maxCycles}</span>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusCard;
