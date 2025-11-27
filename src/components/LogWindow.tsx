import React, { useEffect, useRef } from 'react';
import { useSimulator } from '../services/SimulatorContext';
import './LogWindow.css';

const LogWindow: React.FC = () => {
  const { state } = useSimulator();
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new log entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.logs]);
  
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };
  
  const getLogTypeClass = (type: string): string => {
    switch (type) {
      case 'election':
        return 'log-election';
      case 'failure':
        return 'log-failure';
      case 'recovery':
        return 'log-recovery';
      case 'leader':
        return 'log-leader';
      default:
        return 'log-info';
    }
  };
  
  return (
    <div className="log-window">
      <div className="log-header">
        <h3>System Event Log</h3>
        <span className="log-count" aria-label={`${state.logs.length} log entries`}>{state.logs.length} entries</span>
      </div>
      <div 
        className="log-container" 
        ref={logContainerRef}
        role="log"
        aria-live="polite"
        aria-label="System event log"
      >
        {state.logs.length === 0 ? (
          <div className="log-empty">No events logged yet</div>
        ) : (
          state.logs.map(log => (
            <div key={log.id} className={`log-entry ${getLogTypeClass(log.type)}`}>
              <span className="log-timestamp">[{formatTimestamp(log.timestamp)}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogWindow;