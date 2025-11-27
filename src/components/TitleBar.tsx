import React from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './TitleBar.css';

const TitleBar: React.FC = () => {
  const { state } = useSimulator();
  
  const currentLeaderLabel = state.currentLeader 
    ? `P${state.currentLeader}` 
    : 'None';
  
  return (
    <div className="title-bar">
      <h1 className="title-text">Simple Leader Election Simulator (Bully Algorithm)</h1>
      <div className="leader-indicator">
        <span className="leader-label">Current Leader:</span>
        <span className="leader-value">{currentLeaderLabel}</span>
      </div>
    </div>
  );
};

export default TitleBar;