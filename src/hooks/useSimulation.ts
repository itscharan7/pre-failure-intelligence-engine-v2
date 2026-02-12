import { useState, useEffect, useCallback, useRef } from 'react';

// Simulated NASA C-MAPSS FD001 sensor names
const SENSOR_NAMES = [
  'T2 (Fan inlet temp)',
  'T24 (LPC outlet temp)',
  'T30 (HPC outlet temp)',
  'T50 (LPT outlet temp)',
  'P2 (Fan inlet pressure)',
  'P15 (Bypass-duct pressure)',
  'P30 (HPC outlet pressure)',
  'Nf (Fan speed)',
  'Nc (Core speed)',
  'Ps30 (HPC outlet static pressure)',
  'phi (Fuel-air ratio)',
  'NRf (Corrected fan speed)',
  'NRc (Corrected core speed)',
  'BPR (Bypass ratio)',
  'farB (Burner fuel-air ratio)',
  'htBleed (Bleed enthalpy)',
  'Nf_dmd (Demanded fan speed)',
  'W31 (HPT coolant bleed)',
  'W32 (LPT coolant bleed)',
];

// Feature names for SHAP
const FEATURE_NAMES = [
  'T30_rolling_mean', 'T30_rolling_std', 'T30_diff',
  'Nc_rolling_mean', 'Nc_rolling_std', 'Nc_diff',
  'P30_rolling_mean', 'P30_rolling_std', 'P30_diff',
  'T50_rolling_mean', 'T50_rolling_std', 'T50_diff',
  'phi_rolling_mean', 'phi_rolling_std', 'phi_diff',
  'NRc_rolling_mean', 'NRc_rolling_std', 'NRc_diff',
];

const MAX_CYCLES = 192;

function generateSensorData(cycle: number, totalCycles: number): number[] {
  const progress = cycle / totalCycles;
  const degradation = Math.pow(progress, 2.2);
  
  return SENSOR_NAMES.map((_, i) => {
    const base = 500 + i * 30;
    const noise = (Math.random() - 0.5) * 8;
    const drift = degradation * (15 + i * 2) * (i % 3 === 0 ? -1 : 1);
    return Math.round((base + noise + drift) * 100) / 100;
  });
}

function computeRiskScore(cycle: number, totalCycles: number): number {
  const progress = cycle / totalCycles;
  const base = Math.pow(progress, 2.5) * 85;
  const noise = (Math.random() - 0.5) * 4;
  const spike = progress > 0.8 ? (progress - 0.8) * 75 : 0;
  return Math.min(100, Math.max(0, base + noise + spike));
}

function computeShapValues(cycle: number, totalCycles: number): { feature: string; value: number }[] {
  const progress = cycle / totalCycles;
  return FEATURE_NAMES.map((name) => {
    const isKey = name.includes('T30') || name.includes('Nc') || name.includes('P30');
    const base = isKey ? progress * 0.6 : progress * 0.2;
    const noise = (Math.random() - 0.5) * 0.15;
    const val = Math.max(-0.3, Math.min(1, base + noise));
    return { feature: name, value: Math.round(val * 1000) / 1000 };
  }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface SimulationState {
  cycle: number;
  maxCycles: number;
  riskScore: number;
  riskHistory: number[];
  sensorData: { name: string; value: number }[];
  sensorHistory: { cycle: number; [key: string]: number }[];
  shapValues: { feature: string; value: number }[];
  healthStatus: HealthStatus;
  isRunning: boolean;
  isComplete: boolean;
  engineId: number;
}

export function useSimulation(speed: number = 800) {
  const [state, setState] = useState<SimulationState>({
    cycle: 0,
    maxCycles: MAX_CYCLES,
    riskScore: 0,
    riskHistory: [],
    sensorData: [],
    sensorHistory: [],
    shapValues: [],
    healthStatus: 'healthy',
    isRunning: false,
    isComplete: false,
    engineId: 1,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.cycle >= prev.maxCycles) {
        return { ...prev, isRunning: false, isComplete: true };
      }

      const newCycle = prev.cycle + 1;
      const risk = computeRiskScore(newCycle, prev.maxCycles);
      const sensors = generateSensorData(newCycle, prev.maxCycles);
      const shap = computeShapValues(newCycle, prev.maxCycles);

      const sensorData = SENSOR_NAMES.map((name, i) => ({ name, value: sensors[i] }));
      const sensorHistoryEntry: { cycle: number; [key: string]: number } = { cycle: newCycle };
      SENSOR_NAMES.slice(0, 6).forEach((name, i) => {
        sensorHistoryEntry[name] = sensors[i];
      });

      const healthStatus: HealthStatus = risk < 30 ? 'healthy' : risk < 65 ? 'warning' : 'critical';

      return {
        ...prev,
        cycle: newCycle,
        riskScore: risk,
        riskHistory: [...prev.riskHistory, risk],
        sensorData,
        sensorHistory: [...prev.sensorHistory, sensorHistoryEntry].slice(-60),
        shapValues: shap,
        healthStatus,
        isComplete: newCycle >= prev.maxCycles,
        isRunning: newCycle < prev.maxCycles,
      };
    });
  }, []);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const restart = useCallback(() => {
    const newEngineId = Math.floor(Math.random() * 100) + 1;
    setState({
      cycle: 0,
      maxCycles: MAX_CYCLES,
      riskScore: 0,
      riskHistory: [],
      sensorData: [],
      sensorHistory: [],
      shapValues: [],
      healthStatus: 'healthy',
      isRunning: true,
      isComplete: false,
      engineId: newEngineId,
    });
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, speed, tick]);

  return { ...state, start, pause, restart };
}
