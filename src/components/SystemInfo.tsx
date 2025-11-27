import React from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './SystemInfo.css';

const SystemInfo: React.FC = () => {
  const { state } = useSimulator();
  
  const activeNodeCount = state.processes.filter(p => p.isActive).length;
  const currentLeaderLabel = state.currentLeader 
    ? `P${state.currentLeader}` 
    : 'None';
  
  return (
    <div className="system-info">
      <div className="info-item">
        <label className="info-label">Current Leader:</label>
        <span className="info-value leader-value">{currentLeaderLabel}</span>
      </div>
      
      <div className="info-item">
        <label className="info-label">Active Nodes:</label>
        <span className="info-value">{activeNodeCount}</span>
      </div>
      
      <div className="info-item">
        <label className="info-label">Total Nodes:</label>
        <span className="info-value">{state.processes.length}</span>
      </div>
      
      <div className="info-item">
        <label className="info-label">Election Status:</label>
        <span className={`info-value status-value ${state.isElectionInProgress ? 'in-progress' : 'idle'}`}>
          {state.isElectionInProgress ? 'In Progress' : 'Idle'}
        </span>
      </div>
      
      <div className="info-item">
        <label className="info-label">Active Messages:</label>
        <span className="info-value">{state.messages.length}</span>
      </div>
      
      <div className="info-item">
        <label className="info-label">Last Heartbeat:</label>
        <span className="info-value">
          {new Date(state.lastHeartbeat).toLocaleTimeString()}
        </span>
      </div>
      
      {state.messages.length > 0 && (
        <div className="info-item">
          <label className="info-label">Message Types:</label>
          <div className="message-types">
            {['ELECTION', 'OK', 'COORDINATOR'].map(type => {
              const allMessages = state.messages.filter(m => m.type === type);
              const heartbeatMessages = allMessages.filter(m => m.id.includes('heartbeat'));
              const regularMessages = allMessages.filter(m => !m.id.includes('heartbeat'));
              
              if (type === 'COORDINATOR' && (heartbeatMessages.length > 0 || regularMessages.length > 0)) {
                return (
                  <div key={type} className="message-breakdown">
                    {regularMessages.length > 0 && (
                      <span className={`message-type ${type.toLowerCase()}`}>
                        COORDINATOR: {regularMessages.length}
                      </span>
                    )}
                    {heartbeatMessages.length > 0 && (
                      <span className="message-type heartbeat">
                        HEARTBEAT: {heartbeatMessages.length}
                      </span>
                    )}
                  </div>
                );
              } else if (type !== 'COORDINATOR' && allMessages.length > 0) {
                return (
                  <span key={type} className={`message-type ${type.toLowerCase()}`}>
                    {type}: {allMessages.length}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemInfo;