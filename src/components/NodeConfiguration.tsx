import React, { useState } from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './NodeConfiguration.css';

const NodeConfiguration: React.FC = () => {
  const { state, configureNodes, isSimulationRunning } = useSimulator();
  const [nodeCount, setNodeCount] = useState(state.processes.length);
  const [nodeIds, setNodeIds] = useState(state.processes.map(p => p.id).join(', '));
  
  const handleApplyConfiguration = () => {
    // Parse node IDs from comma-separated string
    const ids = nodeIds
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id) && id > 0)
      .sort((a, b) => a - b);
    
    // Remove duplicates
    const uniqueIds = [...new Set(ids)];
    
    if (uniqueIds.length === 0) {
      alert('Please enter valid node IDs (positive numbers)');
      return;
    }
    
    configureNodes(uniqueIds);
    setNodeCount(uniqueIds.length);
    setNodeIds(uniqueIds.join(', '));
  };
  
  const handleNodeCountChange = (count: number) => {
    setNodeCount(count);
    // Generate sequential IDs starting from 1
    const ids = Array.from({ length: count }, (_, i) => i + 1);
    setNodeIds(ids.join(', '));
  };
  
  const handleReset = () => {
    setNodeCount(5);
    setNodeIds('1, 2, 3, 4, 5');
  };
  
  return (
    <div className="node-configuration">
      <div className="config-row">
        <label className="config-label">Number of Nodes:</label>
        <input
          type="number"
          min="2"
          max="10"
          value={nodeCount}
          onChange={(e) => handleNodeCountChange(parseInt(e.target.value) || 2)}
          className="config-input"
        />
      </div>
      
      <div className="config-row">
        <label className="config-label">Node IDs (comma-separated):</label>
        <input
          type="text"
          value={nodeIds}
          onChange={(e) => setNodeIds(e.target.value)}
          placeholder="1, 2, 3, 4, 5"
          className="config-input"
        />
      </div>
      
      <div className="config-buttons">
        <button
          onClick={handleApplyConfiguration}
          className="config-button apply"
          disabled={state.isElectionInProgress || isSimulationRunning}
        >
          Apply Configuration
        </button>
        <button
          onClick={handleReset}
          className="config-button reset"
          disabled={state.isElectionInProgress || isSimulationRunning}
        >
          Reset to Default
        </button>
      </div>
      
      <div className="config-info">
        <small>Current: {state.processes.length} nodes with IDs [{state.processes.map(p => p.id).join(', ')}]</small>
      </div>
    </div>
  );
};

export default NodeConfiguration;