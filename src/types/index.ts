export interface Process {
  id: number;
  label: string; // "P1", "P2", etc.
  isActive: boolean;
  isLeader: boolean;
  position: { x: number; y: number };
}

export interface Message {
  id: string;
  type: 'ELECTION' | 'OK' | 'COORDINATOR';
  from: number;
  to: number;
  progress: number; // 0 to 1 for animation
  timestamp: number;
  duration?: number;           // Total visibility duration in milliseconds
  animationSpeed?: number;     // Speed multiplier for this message
  startTime?: number;          // Animation start timestamp
  priority?: number;           // Display priority for overlaps (higher = more important)
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'election' | 'failure' | 'recovery' | 'leader';
}

export interface SimulatorState {
  processes: Process[];
  messages: Message[];
  logs: LogEntry[];
  currentLeader: number | null;
  isElectionInProgress: boolean;
  isSimulationRunning: boolean;
  lastHeartbeat: number;
  electionInitiator: number | null;
  isAutoElection: boolean;
}

export type MessageType = 'ELECTION' | 'OK' | 'COORDINATOR';