import { Wrench, Clock, Zap, CheckCircle } from 'lucide-react';
import type { HealthStatus } from '@/hooks/useSimulation';

interface MaintenancePanelProps {
  healthStatus: HealthStatus;
  risk: number;
  cycle: number;
}

const MaintenancePanel = ({ healthStatus, risk, cycle }: MaintenancePanelProps) => {
  const recommendations = (() => {
    if (healthStatus === 'healthy') {
      return [
        { icon: CheckCircle, text: 'No immediate action required', priority: 'low' as const },
        { icon: Clock, text: 'Next scheduled inspection at cycle 80', priority: 'low' as const },
      ];
    }
    if (healthStatus === 'warning') {
      return [
        { icon: Wrench, text: 'Schedule preventive maintenance', priority: 'medium' as const },
        { icon: Zap, text: 'Inspect HPC outlet & core speed sensors', priority: 'medium' as const },
        { icon: Clock, text: `Estimated ${Math.max(10, Math.round((1 - risk / 100) * 50))} cycles before critical`, priority: 'high' as const },
      ];
    }
    return [
      { icon: Zap, text: 'IMMEDIATE maintenance required', priority: 'critical' as const },
      { icon: Wrench, text: 'Replace degraded turbofan components', priority: 'critical' as const },
      { icon: Clock, text: 'Failure imminent — ground engine', priority: 'critical' as const },
    ];
  })();

  const priorityStyles = {
    low: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    medium: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5',
    high: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10',
    critical: 'text-neon-red border-neon-red/30 bg-neon-red/10',
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Maintenance Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${priorityStyles[rec.priority]}`}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-xs font-mono">{rec.text}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-[10px] font-mono text-muted-foreground">
        Analysis at cycle {cycle} • Isolation Forest anomaly detection
      </div>
    </div>
  );
};

export default MaintenancePanel;
