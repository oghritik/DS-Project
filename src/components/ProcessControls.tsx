import React from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './ProcessControls.css';

const ProcessControls: React.FC = () => {
  const { state, toggleProcess, isSimulationRunning } = useSimulator();
  
  const handleToggleProcess = (processId: number) => {
    if (state.isElectionInProgress || !isSimulationRunning) return;
    toggleProcess(processId);
  };
  
  return (
    <div className="process-controls">
      {state.processes.map(process => (
        <button
          key={process.id}
          className={`process-button ${process.isActive ? 'active' : 'inactive'}`}
          onClick={() => handleToggleProcess(process.id)}
          disabled={state.isElectionInProgress || !isSimulationRunning}
          title={`Toggle ${process.label} (${process.isActive ? 'Active' : 'Inactive'})`}
          aria-label={`Toggle process ${process.label}, currently ${process.isActive ? 'active' : 'inactive'}`}
        >
          Toggle {process.label}
        </button>
      ))}
    </div>
  );
};

export default ProcessControls;