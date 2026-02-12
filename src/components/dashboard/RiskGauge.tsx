import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface RiskGaugeProps {
  risk: number;
}

const RiskGauge = ({ risk }: RiskGaugeProps) => {
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (risk / 100) * circumference * 0.75;
  
  const color = useMemo(() => {
    if (risk < 30) return 'hsl(var(--neon-green))';
    if (risk < 65) return 'hsl(var(--neon-orange))';
    return 'hsl(var(--neon-red))';
  }, [risk]);

  const glowClass = useMemo(() => {
    if (risk < 30) return 'neon-glow-green';
    if (risk < 65) return '';
    return '';
  }, [risk]);

  return (
    <div className={`glass-card rounded-xl p-6 flex flex-col items-center ${glowClass}`}>
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Failure Risk
      </h3>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          <motion.circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold font-mono"
            style={{ color }}
            key={Math.round(risk)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(risk)}
          </motion.span>
          <span className="text-xs text-muted-foreground font-mono mt-1">% RISK</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
