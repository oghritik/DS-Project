import React from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './SimulationControls.css';

const SimulationControls: React.FC = () => {
  const { isSimulationRunning, toggleSimulation } = useSimulator();
  
  return (
    <div className="simulation-controls">
      <button
        className={`simulation-button ${isSimulationRunning ? 'stop' : 'play'}`}
        onClick={toggleSimulation}
        aria-label={isSimulationRunning ? 'Stop simulation' : 'Start simulation'}
      >
        {isSimulationRunning ? (
          <>
            <span className="button-icon">⏸</span>
            Stop Simulation
          </>
        ) : (
          <>
            <span className="button-icon">▶</span>
            Start Simulation
          </>
        )}
      </button>
      
      <div className="simulation-info">
        <div className="info-row">
          <span className="info-label">Heartbeat Interval:</span>
          <span className="info-value">2 seconds</span>
        </div>
        <div className="info-row">
          <span className="info-label">Election Timeout:</span>
          <span className="info-value">4 seconds</span>
        </div>
        <div className="info-row">
          <span className="info-label">Status:</span>
          <span className={`info-value status ${isSimulationRunning ? 'running' : 'stopped'}`}>
            {isSimulationRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;