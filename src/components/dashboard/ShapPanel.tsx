import { useMemo } from 'react';

interface ShapPanelProps {
  shapValues: { feature: string; value: number }[];
}

const ShapPanel = ({ shapValues }: ShapPanelProps) => {
  const topFeatures = useMemo(() => shapValues.slice(0, 8), [shapValues]);

  if (topFeatures.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
          SHAP Explainability
        </h3>
        <p className="text-xs text-muted-foreground font-mono">Awaiting data...</p>
      </div>
    );
  }

  const maxAbsVal = Math.max(...topFeatures.map((f) => Math.abs(f.value)), 0.01);

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
        SHAP Explainability
      </h3>
      <p className="text-[10px] text-muted-foreground font-mono mb-4">
        Why is the risk increasing?
      </p>

      <div className="space-y-2.5">
        {topFeatures.map(({ feature, value }) => {
          const width = (Math.abs(value) / maxAbsVal) * 100;
          const isPositive = value > 0;
          return (
            <div key={feature} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-32 truncate text-right shrink-0">
                {feature}
              </span>
              <div className="flex-1 h-4 relative">
                <div
                  className="absolute h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${Math.max(width, 2)}%`,
                    backgroundColor: isPositive ? 'hsl(var(--neon-red))' : 'hsl(var(--neon-cyan))',
                    opacity: 0.7 + (width / 100) * 0.3,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono w-12 text-right" style={{
                color: isPositive ? 'hsl(var(--neon-red))' : 'hsl(var(--neon-cyan))'
              }}>
                {value > 0 ? '+' : ''}{value.toFixed(3)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neon-cyan" /> Reduces risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neon-red" /> Increases risk
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShapPanel;
