import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RiskHistoryChartProps {
  riskHistory: number[];
}

const RiskHistoryChart = ({ riskHistory }: RiskHistoryChartProps) => {
  const data = riskHistory.map((risk, i) => ({ cycle: i + 1, risk }));

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Risk Score Evolution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <ReferenceLine y={30} stroke="hsl(150, 80%, 50%)" strokeDasharray="4 4" strokeOpacity={0.4} />
            <ReferenceLine y={65} stroke="hsl(30, 100%, 55%)" strokeDasharray="4 4" strokeOpacity={0.4} />
            <XAxis
              dataKey="cycle"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="hsl(185, 100%, 50%)"
              strokeWidth={2}
              dot={false}
              style={{ filter: 'drop-shadow(0 0 4px hsl(185, 100%, 50%))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-3 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-neon-green inline-block" /> Healthy</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-neon-orange inline-block" /> Warning</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-neon-red inline-block" /> Critical</span>
      </div>
    </div>
  );
};

export default RiskHistoryChart;
