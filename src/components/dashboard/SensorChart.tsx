import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorChartProps {
  data: { cycle: number; [key: string]: number }[];
  sensorKeys: string[];
}

const COLORS = [
  'hsl(185, 100%, 50%)',
  'hsl(270, 80%, 60%)',
  'hsl(150, 80%, 50%)',
  'hsl(30, 100%, 55%)',
  'hsl(340, 80%, 55%)',
  'hsl(60, 80%, 50%)',
];

const SensorChart = ({ data, sensorKeys }: SensorChartProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Live Sensor Readings
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(222, 20%, 25%, 0.5)" />
            <XAxis
              dataKey="cycle"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              label={{ value: 'Cycle', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 40%, 10%)',
                border: '1px solid hsl(222, 20%, 25%)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: 11,
              }}
            />
            {sensorKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                name={key.split(' ')[0]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {sensorKeys.map((key, i) => (
          <span key={key} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {key.split('(')[0].trim()}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SensorChart;
