export interface AnimationConfig {
  electionMessageDuration: number;    // Duration in milliseconds for ELECTION messages
  okMessageDuration: number;          // Duration in milliseconds for OK messages  
  coordinatorMessageDuration: number; // Duration in milliseconds for COORDINATOR messages
  heartbeatMessageDuration: number;   // Duration in milliseconds for HEARTBEAT messages
  animationSpeed: number;             // Progress increment per frame (0.001 to 0.02)
}

export interface EnhancedMessage {
  id: string;
  type: 'ELECTION' | 'OK' | 'COORDINATOR';
  from: number;
  to: number;
  progress: number;
  timestamp: number;
  duration: number;           // Total visibility duration in milliseconds
  animationSpeed: number;     // Speed multiplier for this message
  startTime: number;          // Animation start timestamp
  priority: number;           // Display priority for overlaps (higher = more important)
}

export interface InstanceConfig {
  port: number;
  instanceId: string;
  title: string;
  isMultiInstance: boolean;
}

export interface ServerConfig {
  basePort: number;
  maxInstances: number;
  portRange: number[];
  instanceId: string;
}

// Default animation configuration
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  electionMessageDuration: 3000,    // 3 seconds for ELECTION messages (gold)
  okMessageDuration: 2500,          // 2.5 seconds for OK messages (orange)
  coordinatorMessageDuration: 2000, // 2 seconds for COORDINATOR messages (blue)
  heartbeatMessageDuration: 1000,   // 1 second for HEARTBEAT messages (green)
  animationSpeed: 0.005             // Much slower than original 0.02 for better visibility
};

// Message priority levels for overlap management
export const MESSAGE_PRIORITIES = {
  ELECTION: 3,      // Highest priority - most important to see
  OK: 2,           // Medium priority
  COORDINATOR: 2,   // Medium priority
  HEARTBEAT: 1     // Lowest priority - can be less visible
} as const;

// Helper function to get message configuration
export function getMessageConfig(messageType: 'ELECTION' | 'OK' | 'COORDINATOR', isHeartbeat = false): {
  duration: number;
  animationSpeed: number;
  priority: number;
} {
  const config = DEFAULT_ANIMATION_CONFIG;
  
  if (isHeartbeat) {
    return {
      duration: config.heartbeatMessageDuration,
      animationSpeed: config.animationSpeed * 2, // Heartbeats can be slightly faster
      priority: MESSAGE_PRIORITIES.HEARTBEAT
    };
  }
  
  switch (messageType) {
    case 'ELECTION':
      return {
        duration: config.electionMessageDuration,
        animationSpeed: config.animationSpeed,
        priority: MESSAGE_PRIORITIES.ELECTION
      };
    case 'OK':
      return {
        duration: config.okMessageDuration,
        animationSpeed: config.animationSpeed,
        priority: MESSAGE_PRIORITIES.OK
      };
    case 'COORDINATOR':
      return {
        duration: config.coordinatorMessageDuration,
        animationSpeed: config.animationSpeed,
        priority: MESSAGE_PRIORITIES.COORDINATOR
      };
    default:
      return {
        duration: config.coordinatorMessageDuration,
        animationSpeed: config.animationSpeed,
        priority: MESSAGE_PRIORITIES.COORDINATOR
      };
  }
}

// Helper function to calculate animation progress based on elapsed time
export function calculateAnimationProgress(
  startTime: number, 
  duration: number, 
  animationSpeed: number
): number {
  const elapsed = Date.now() - startTime;
  const progressByTime = elapsed / duration;
  
  // Use the slower of time-based or speed-based progress
  // This ensures messages are visible for the full duration
  return Math.min(progressByTime, 1.0);
}