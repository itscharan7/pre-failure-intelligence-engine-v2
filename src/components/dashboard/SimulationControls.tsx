import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}

const SimulationControls = ({ isRunning, isComplete, onStart, onPause, onRestart }: SimulationControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      {!isComplete && (
        <button
          onClick={isRunning ? onPause : onStart}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider
            bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
      )}
      <button
        onClick={onRestart}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider
          bg-secondary/10 border border-secondary/30 text-secondary hover:bg-secondary/20 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        New Engine
      </button>
      {isComplete && (
        <span className="flex items-center gap-2 text-neon-red font-mono text-xs animate-pulse-neon">
          <Zap className="w-3.5 h-3.5" />
          END OF LIFE REACHED
        </span>
      )}
    </div>
  );
};

export default SimulationControls;
