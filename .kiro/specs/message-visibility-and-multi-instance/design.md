# Design Document

## Overview

This design addresses two key improvements to the Bully Algorithm Simulator:
1. Enhanced message visibility through slower, more observable animations
2. Multi-instance support for running multiple simulator instances simultaneously

## Architecture

### Message Animation System
- **Current State**: Messages animate at 0.02 progress per frame (~50 frames = 1 second at 60fps)
- **Proposed State**: Configurable animation speeds based on message type and importance
- **Animation Controller**: Centralized system to manage message timing and visibility

### Multi-Instance Support
- **Port Management**: Dynamic port allocation system
- **Instance Isolation**: Each instance maintains independent state
- **Development Workflow**: Enhanced npm scripts for multi-instance deployment

## Components and Interfaces

### 1. Animation Configuration System

```typescript
interface AnimationConfig {
  electionMessageDuration: number;    // 3000ms for ELECTION messages
  okMessageDuration: number;          // 2500ms for OK messages  
  coordinatorMessageDuration: number; // 2000ms for COORDINATOR messages
  heartbeatMessageDuration: number;   // 1000ms for HEARTBEAT messages
  animationSpeed: number;             // Progress increment per frame
}
```

### 2. Message Enhancement
- **Progress Calculation**: Dynamic progress based on message type
- **Visibility Timing**: Message-specific duration controls
- **Overlap Management**: Staggered timing to prevent visual conflicts

### 3. Multi-Instance Server Configuration

```typescript
interface ServerConfig {
  basePort: number;
  maxInstances: number;
  portRange: number[];
  instanceId: string;
}
```

## Data Models

### Enhanced Message Model
```typescript
interface EnhancedMessage extends Message {
  duration: number;           // Total visibility duration
  animationSpeed: number;     // Speed multiplier
  startTime: number;          // Animation start timestamp
  priority: number;           // Display priority for overlaps
}
```

### Instance Configuration
```typescript
interface InstanceConfig {
  port: number;
  instanceId: string;
  title: string;
  isMultiInstance: boolean;
}
```

## Error Handling

### Animation System
- **Frame Rate Adaptation**: Adjust animation speed based on actual frame rate
- **Message Cleanup**: Automatic removal of completed messages
- **Performance Monitoring**: Track animation performance and adjust if needed

### Multi-Instance Support
- **Port Conflict Resolution**: Automatic port selection when conflicts occur
- **Instance Health Checks**: Monitor instance availability
- **Graceful Degradation**: Fall back to single instance if multi-instance fails

## Testing Strategy

### Animation Testing
- **Visual Regression Tests**: Ensure message visibility meets duration requirements
- **Performance Tests**: Verify smooth animation at different frame rates
- **Timing Tests**: Validate message duration accuracy

### Multi-Instance Testing
- **Port Allocation Tests**: Verify unique port assignment
- **Concurrent Instance Tests**: Test multiple instances running simultaneously
- **State Isolation Tests**: Ensure independent state management

## Implementation Approach

### Phase 1: Message Animation Enhancement
1. Create configurable animation system
2. Implement message-specific timing
3. Add animation controls and debugging

### Phase 2: Multi-Instance Support  
1. Enhance Vite configuration for dynamic ports
2. Create instance management scripts
3. Add port display in UI
4. Test concurrent instance functionality

### Configuration Files
- **vite.config.ts**: Enhanced with port management
- **package.json**: New scripts for multi-instance support
- **AnimationConfig.ts**: Centralized animation settings