import React from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './ElectionControls.css';

const ElectionControls: React.FC = () => {
  const { state, startElection, resetSystem, isSimulationRunning } = useSimulator();
  
  const handleStartElection = () => {
    if (state.isElectionInProgress || !isSimulationRunning) return;
    
    // Find the lowest active process to start election
    const activeProcesses = state.processes.filter(p => p.isActive);
    if (activeProcesses.length === 0) return;
    
    const lowestActiveProcess = Math.min(...activeProcesses.map(p => p.id));
    startElection(lowestActiveProcess);
  };
  
  const handleResetSystem = () => {
    resetSystem();
  };
  
  return (
    <div className="election-controls">
      <button
        className="control-button start-election"
        onClick={handleStartElection}
        disabled={state.isElectionInProgress || !isSimulationRunning || state.processes.filter(p => p.isActive).length === 0}
        title="Start a new leader election"
        aria-label="Start a new leader election process"
      >
        Start Election
      </button>
      
      <button
        className="control-button reset-system"
        onClick={handleResetSystem}
        title="Reset all processes to active state"
        aria-label="Reset system to initial state with all processes active"
      >
        Reset System
      </button>
    </div>
  );
};

export default ElectionControls;