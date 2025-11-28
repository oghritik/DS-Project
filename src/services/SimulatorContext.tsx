import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Process, Message, LogEntry, SimulatorState } from '../types';
import { ElectionOrchestrator } from './ElectionOrchestrator';
import { BullyAlgorithm } from './BullyAlgorithm';

interface SimulatorContextType {
  state: SimulatorState;
  toggleProcess: (processId: number) => void;
  startElection: (initiatorId?: number) => void;
  startAutoElection: (detectorId: number) => void;
  resetSystem: () => void;
  addLog: (message: string, type: LogEntry['type']) => void;
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  updateLeader: (leaderId: number) => void;
  setElectionInProgress: (inProgress: boolean) => void;
  configureNodes: (nodeIds: number[]) => void;
  toggleSimulation: () => void;
  isSimulationRunning: boolean;
}

type SimulatorAction =
  | { type: 'TOGGLE_PROCESS'; processId: number }
  | { type: 'START_ELECTION'; initiatorId?: number }
  | { type: 'START_AUTO_ELECTION'; detectorId: number }
  | { type: 'RESET_SYSTEM' }
  | { type: 'ADD_LOG'; message: string; logType: LogEntry['type'] }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'REMOVE_MESSAGE'; messageId: string }
  | { type: 'UPDATE_LEADER'; leaderId: number }
  | { type: 'SET_ELECTION_IN_PROGRESS'; inProgress: boolean; initiatorId?: number }
  | { type: 'CONFIGURE_NODES'; nodeIds: number[] }
  | { type: 'TOGGLE_SIMULATION' }
  | { type: 'UPDATE_HEARTBEAT' };

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

// Calculate circular positions for processes
const calculatePositions = (numProcesses: number, centerX: number, centerY: number, radius: number): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < numProcesses; i++) {
    const angle = (i * 2 * Math.PI) / numProcesses - Math.PI / 2; // Start from top
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  return positions;
};

// Initialize processes with given IDs
const initializeProcesses = (nodeIds: number[] = [1, 2, 3, 4, 5]): Process[] => {
  const sortedIds = [...nodeIds].sort((a, b) => a - b);
  const positions = calculatePositions(sortedIds.length, 400, 300, 200); // Increased radius from 150 to 200 for more spacing
  const highestId = Math.max(...sortedIds);
  
  return sortedIds.map((id, i) => ({
    id,
    label: `P${id}`,
    isActive: true,
    isLeader: id === highestId, // Highest ID is initial leader
    position: positions[i]
  }));
};

const initialState: SimulatorState = {
  processes: initializeProcesses(),
  messages: [],
  logs: [],
  currentLeader: 5, // P5 is initial leader
  isElectionInProgress: false,
  isSimulationRunning: false,
  lastHeartbeat: Date.now(),
  electionInitiator: null,
  isAutoElection: false
};

const simulatorReducer = (state: SimulatorState, action: SimulatorAction): SimulatorState => {
  switch (action.type) {
    case 'TOGGLE_PROCESS': {
      const toggledProcess = state.processes.find(p => p.id === action.processId);
      const wasLeader = toggledProcess?.isLeader;
      
      const updatedProcesses = state.processes.map(process => {
        if (process.id === action.processId) {
          return { ...process, isActive: !process.isActive, isLeader: false };
        }
        return process;
      });
      
      // If the leader was toggled off, clear current leader (election will be triggered separately)
      let newCurrentLeader = state.currentLeader;
      if (wasLeader && toggledProcess && toggledProcess.isActive) {
        // Leader failed
        newCurrentLeader = null;
        // Clear all leader flags
        updatedProcesses.forEach(p => p.isLeader = false);
      }
      
      return {
        ...state,
        processes: updatedProcesses,
        currentLeader: newCurrentLeader
      };
    }
    
    case 'START_ELECTION': {
      return {
        ...state,
        isElectionInProgress: true,
        electionInitiator: action.initiatorId || null,
        isAutoElection: false
      };
    }
    
    case 'START_AUTO_ELECTION': {
      return {
        ...state,
        isElectionInProgress: true,
        electionInitiator: action.detectorId,
        isAutoElection: true
      };
    }
    
    case 'RESET_SYSTEM': {
      const resetProcesses = initializeProcesses();
      return {
        ...initialState,
        processes: resetProcesses
      };
    }
    
    case 'ADD_LOG': {
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        message: action.message,
        type: action.logType
      };
      
      return {
        ...state,
        logs: [...state.logs, newLog].slice(-100) // Keep last 100 entries
      };
    }
    
    case 'ADD_MESSAGE': {
      return {
        ...state,
        messages: [...state.messages, action.message]
      };
    }
    
    case 'REMOVE_MESSAGE': {
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.messageId)
      };
    }
    
    case 'UPDATE_LEADER': {
      const updatedProcesses = state.processes.map(process => ({
        ...process,
        isLeader: process.id === action.leaderId
      }));
      
      return {
        ...state,
        processes: updatedProcesses,
        currentLeader: action.leaderId
      };
    }
    
    case 'SET_ELECTION_IN_PROGRESS': {
      return {
        ...state,
        isElectionInProgress: action.inProgress,
        electionInitiator: action.inProgress ? (action.initiatorId || state.electionInitiator) : null,
        isAutoElection: action.inProgress ? state.isAutoElection : false
      };
    }
    
    case 'CONFIGURE_NODES': {
      const newProcesses = initializeProcesses(action.nodeIds);
      const newLeader = Math.max(...action.nodeIds);
      
      return {
        ...state,
        processes: newProcesses,
        currentLeader: newLeader,
        messages: [], // Clear any existing messages
        isElectionInProgress: false
      };
    }
    
    case 'TOGGLE_SIMULATION': {
      return {
        ...state,
        isSimulationRunning: !state.isSimulationRunning,
        lastHeartbeat: Date.now()
      };
    }
    
    case 'UPDATE_HEARTBEAT': {
      return {
        ...state,
        lastHeartbeat: Date.now()
      };
    }
    
    default:
      return state;
  }
};

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(simulatorReducer, initialState);
  const orchestratorRef = useRef(new ElectionOrchestrator());
  const bullyAlgorithmRef = useRef(new BullyAlgorithm());
  const heartbeatIntervalRef = useRef<number | null>(null);
  const leaderCheckIntervalRef = useRef<number | null>(null);
  
  // Heartbeat system - check every 2 seconds
  useEffect(() => {
    if (state.isSimulationRunning) {
      heartbeatIntervalRef.current = window.setInterval(() => {
        dispatch({ type: 'UPDATE_HEARTBEAT' });
        
        // Send heartbeat messages from leader to all other active processes
        const currentLeader = state.processes.find(p => p.id === state.currentLeader);
        if (currentLeader && currentLeader.isActive) {
          const otherActiveProcesses = state.processes.filter(p => p.id !== state.currentLeader && p.isActive);
          
          // Create heartbeat messages using BullyAlgorithm with proper animation config
          const heartbeatMessages = bullyAlgorithmRef.current.createHeartbeatMessages(currentLeader.id, state.processes);
          
          // Stagger heartbeat messages slightly for better visualization
          heartbeatMessages.forEach((heartbeatMessage, index) => {
            setTimeout(() => {
              dispatch({ type: 'ADD_MESSAGE', message: heartbeatMessage });
            }, index * 100);
          });
          
          if (otherActiveProcesses.length > 0) {
            dispatch({ 
              type: 'ADD_LOG', 
              message: `Leader P${currentLeader.id} sending heartbeat to ${otherActiveProcesses.length} processes`, 
              logType: 'info' 
            });
          }
        } else {
          // Leader failed, start automatic election from lowest active process
          const activeProcesses = state.processes.filter(p => p.isActive);
          if (activeProcesses.length > 0 && !state.isElectionInProgress) {
            const detectorProcess = Math.min(...activeProcesses.map(p => p.id));
            dispatch({ 
              type: 'ADD_LOG', 
              message: `Heartbeat timeout! Process P${detectorProcess} detected leader failure and initiating election`, 
              logType: 'election' 
            });
            startAutoElection(detectorProcess);
          }
        }
      }, 2000); // 2 second heartbeat interval
      
      dispatch({ 
        type: 'ADD_LOG', 
        message: 'Simulation started - heartbeat monitoring active', 
        logType: 'info' 
      });
    } else {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (leaderCheckIntervalRef.current) {
        clearInterval(leaderCheckIntervalRef.current);
        leaderCheckIntervalRef.current = null;
      }
      
      if (state.isSimulationRunning === false) {
        dispatch({ 
          type: 'ADD_LOG', 
          message: 'Simulation paused - heartbeat monitoring stopped', 
          logType: 'info' 
        });
      }
    }
    
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (leaderCheckIntervalRef.current) {
        clearInterval(leaderCheckIntervalRef.current);
      }
    };
  }, [state.isSimulationRunning, state.currentLeader, state.processes, state.isElectionInProgress]);
  
  const toggleProcess = (processId: number) => {
    const process = state.processes.find(p => p.id === processId);
    if (!process) return;
    
    const wasLeader = process.isLeader;
    const wasActive = process.isActive;
    
    dispatch({ type: 'TOGGLE_PROCESS', processId });
    
    const action = wasActive ? 'failed' : 'recovered';
    dispatch({ 
      type: 'ADD_LOG', 
      message: `Process ${process.label} ${action}`, 
      logType: wasActive ? 'failure' : 'recovery' 
    });
    
    // If the leader failed and simulation is running, trigger automatic re-election
    if (wasLeader && wasActive && state.isSimulationRunning && !state.isElectionInProgress) {
      setTimeout(() => {
        // Get current active processes (excluding the failed one)
        const currentActiveProcesses = state.processes.filter(p => p.isActive && p.id !== processId);
        if (currentActiveProcesses.length > 0) {
          // Find a process to detect the failure and start election (lowest active process)
          const detectorProcess = Math.min(...currentActiveProcesses.map(p => p.id));
          startAutoElection(detectorProcess);
        }
      }, 1500); // Small delay to show the leader failure first
    }
  };
  
  const startElection = (initiatorId?: number) => {
    if (state.isElectionInProgress) return;
    
    const activeProcesses = state.processes.filter(p => p.isActive);
    if (activeProcesses.length === 0) return;
    
    const initiator = initiatorId 
      ? state.processes.find(p => p.id === initiatorId && p.isActive)
      : activeProcesses[0]; // Default to lowest active process
    
    if (!initiator) return;
    
    dispatch({ type: 'START_ELECTION', initiatorId: initiator.id });
    dispatch({ 
      type: 'ADD_LOG', 
      message: `Manual election started by Process ${initiator.label}`, 
      logType: 'election' 
    });
    
    // Use orchestrator to handle the election
    orchestratorRef.current.initiateElection(
      initiator.id,
      state.processes,
      (message) => dispatch({ type: 'ADD_MESSAGE', message }),
      (logMessage, logType) => dispatch({ type: 'ADD_LOG', message: logMessage, logType: logType as LogEntry['type'] }),
      (leaderId) => {
        // Send coordinator messages when election completes
        const coordinatorMessages = bullyAlgorithmRef.current.announceCoordinator(leaderId, state.processes);
        
        coordinatorMessages.forEach((message, index) => {
          setTimeout(() => {
            dispatch({ type: 'ADD_MESSAGE', message });
          }, index * 100);
        });
        
        dispatch({ type: 'UPDATE_LEADER', leaderId });
        dispatch({ type: 'SET_ELECTION_IN_PROGRESS', inProgress: false });
      }
    );
  };
  
  const startAutoElection = (detectorId: number) => {
    if (state.isElectionInProgress) return;
    
    const detector = state.processes.find(p => p.id === detectorId && p.isActive);
    if (!detector) return;
    
    dispatch({ type: 'START_AUTO_ELECTION', detectorId });
    dispatch({ 
      type: 'ADD_LOG', 
      message: `🚨 Automatic re-election initiated by Process ${detector.label}`, 
      logType: 'election' 
    });
    
    // Use orchestrator to handle the automatic election
    orchestratorRef.current.initiateElection(
      detector.id,
      state.processes,
      (message) => dispatch({ type: 'ADD_MESSAGE', message }),
      (logMessage, logType) => dispatch({ type: 'ADD_LOG', message: logMessage, logType: logType as LogEntry['type'] }),
      (leaderId) => {
        // Send coordinator messages when election completes
        const coordinatorMessages = bullyAlgorithmRef.current.announceCoordinator(leaderId, state.processes);
        
        coordinatorMessages.forEach((message, index) => {
          setTimeout(() => {
            dispatch({ type: 'ADD_MESSAGE', message });
          }, index * 100);
        });
        
        dispatch({ type: 'UPDATE_LEADER', leaderId });
        dispatch({ type: 'SET_ELECTION_IN_PROGRESS', inProgress: false });
        dispatch({ 
          type: 'ADD_LOG', 
          message: `✅ Automatic re-election complete! Process P${leaderId} is the new leader`, 
          logType: 'leader' 
        });
      }
    );
  };
  
  const resetSystem = () => {
    orchestratorRef.current.clearAllElections();
    dispatch({ type: 'RESET_SYSTEM' });
    dispatch({ 
      type: 'ADD_LOG', 
      message: 'System reset - all processes restored', 
      logType: 'info' 
    });
  };
  
  const addLog = (message: string, type: LogEntry['type']) => {
    dispatch({ type: 'ADD_LOG', message, logType: type });
  };
  
  const addMessage = (message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', message });
  };
  
  const removeMessage = (messageId: string) => {
    dispatch({ type: 'REMOVE_MESSAGE', messageId });
  };
  
  const updateLeader = (leaderId: number) => {
    dispatch({ type: 'UPDATE_LEADER', leaderId });
    const leader = state.processes.find(p => p.id === leaderId);
    if (leader) {
      dispatch({ 
        type: 'ADD_LOG', 
        message: `Process ${leader.label} elected as leader`, 
        logType: 'leader' 
      });
    }
  };
  
  const setElectionInProgress = (inProgress: boolean, initiatorId?: number) => {
    dispatch({ type: 'SET_ELECTION_IN_PROGRESS', inProgress, initiatorId });
  };
  
  const configureNodes = (nodeIds: number[]) => {
    if (state.isElectionInProgress) return;
    
    orchestratorRef.current.clearAllElections();
    dispatch({ type: 'CONFIGURE_NODES', nodeIds });
    dispatch({ 
      type: 'ADD_LOG', 
      message: `System reconfigured with nodes: [${nodeIds.join(', ')}]`, 
      logType: 'info' 
    });
  };
  
  const toggleSimulation = () => {
    dispatch({ type: 'TOGGLE_SIMULATION' });
  };
  
  const contextValue: SimulatorContextType = {
    state,
    toggleProcess,
    startElection,
    startAutoElection,
    resetSystem,
    addLog,
    addMessage,
    removeMessage,
    updateLeader,
    setElectionInProgress,
    configureNodes,
    toggleSimulation,
    isSimulationRunning: state.isSimulationRunning
  };
  
  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = (): SimulatorContextType => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};