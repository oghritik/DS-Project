import React from 'react';
import SimulationControls from './SimulationControls';
import NodeConfiguration from './NodeConfiguration';
import ProcessControls from './ProcessControls';
import ElectionControls from './ElectionControls';
import SystemInfo from './SystemInfo';
import './ControlPanel.css';

const ControlPanel: React.FC = () => {
  return (
    <div className="control-panel">
      <div className="control-section">
        <h3 className="section-header">Simulation Control</h3>
        <SimulationControls />
      </div>
      
      <div className="control-section">
        <h3 className="section-header">System Information</h3>
        <SystemInfo />
      </div>
      
      <div className="control-section">
        <h3 className="section-header">Node Configuration</h3>
        <NodeConfiguration />
      </div>
      
      <div className="control-section">
        <h3 className="section-header">Process Controls</h3>
        <ProcessControls />
      </div>
      
      <div className="control-section">
        <h3 className="section-header">Election Controls</h3>
        <ElectionControls />
      </div>
    </div>
  );
};

export default ControlPanel;