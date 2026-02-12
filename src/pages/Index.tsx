import { useSimulation } from '@/hooks/useSimulation';
import RiskGauge from '@/components/dashboard/RiskGauge';
import SensorChart from '@/components/dashboard/SensorChart';
import HealthStatusCard from '@/components/dashboard/HealthStatusCard';
import ShapPanel from '@/components/dashboard/ShapPanel';
import MaintenancePanel from '@/components/dashboard/MaintenancePanel';
import RiskHistoryChart from '@/components/dashboard/RiskHistoryChart';
import SimulationControls from '@/components/dashboard/SimulationControls';
import { Activity, Brain, Cpu } from 'lucide-react';

const SENSOR_DISPLAY_KEYS = [
  'T2 (Fan inlet temp)',
  'T24 (LPC outlet temp)',
  'T30 (HPC outlet temp)',
  'T50 (LPT outlet temp)',
  'P2 (Fan inlet pressure)',
  'P15 (Bypass-duct pressure)',
];

const Index = () => {
  const sim = useSimulation(600);

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 neon-glow-cyan">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-mono tracking-tight text-foreground">
                PFIS
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Pre-Failure Intelligence System
              </p>
            </div>
          </div>

          <SimulationControls
            isRunning={sim.isRunning}
            isComplete={sim.isComplete}
            onStart={sim.start}
            onPause={sim.pause}
            onRestart={sim.restart}
          />

          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Isolation Forest
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> NASA C-MAPSS FD001
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {sim.cycle === 0 && !sim.isRunning ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 neon-glow-cyan mb-6">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-mono text-foreground mb-2">
              Predictive Maintenance Simulation
            </h2>
            <p className="text-sm text-muted-foreground font-mono max-w-lg mb-6">
              Unsupervised anomaly detection using Isolation Forest trained on healthy engine cycles.
              Watch failure risk evolve with SHAP-based explainability.
            </p>
            <button
              onClick={sim.start}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm uppercase tracking-wider
                bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all neon-glow-cyan"
            >
              <Activity className="w-4 h-4" />
              Launch Simulation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-5">
            {/* Row 1: Status + Gauge + Risk History */}
            <div className="col-span-3">
              <HealthStatusCard
                status={sim.healthStatus}
                cycle={sim.cycle}
                maxCycles={sim.maxCycles}
                engineId={sim.engineId}
              />
            </div>
            <div className="col-span-3">
              <RiskGauge risk={sim.riskScore} />
            </div>
            <div className="col-span-6">
              <RiskHistoryChart riskHistory={sim.riskHistory} />
            </div>

            {/* Row 2: Sensor Charts */}
            <div className="col-span-8">
              <SensorChart data={sim.sensorHistory} sensorKeys={SENSOR_DISPLAY_KEYS} />
            </div>
            <div className="col-span-4">
              <MaintenancePanel
                healthStatus={sim.healthStatus}
                risk={sim.riskScore}
                cycle={sim.cycle}
              />
            </div>

            {/* Row 3: SHAP */}
            <div className="col-span-12">
              <ShapPanel shapValues={sim.shapValues} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Explainable AI for Predictive Maintenance • Unsupervised Learning</span>
          <span>Model: Isolation Forest + SHAP • Dataset: NASA C-MAPSS FD001</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
