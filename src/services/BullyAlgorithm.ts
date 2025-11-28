import type { Process, Message, MessageType } from '../types';
import { getMessageConfig } from '../config/AnimationConfig';

export class BullyAlgorithm {
  /**
   * Initiates election from a specific process
   * Sends ELECTION messages to all higher-ID active processes
   */
  startElection(processId: number, processes: Process[]): Message[] {
    const initiator = processes.find(p => p.id === processId && p.isActive);
    if (!initiator) return [];
    
    const higherProcesses = processes.filter(p => p.id > processId && p.isActive);
    
    return higherProcesses.map(target => this.createMessage('ELECTION', processId, target.id));
  }
  
  /**
   * Handles election message received by a process
   * Responds with OK and starts own election if process is active
   */
  handleElectionMessage(to: number, from: number, processes: Process[]): Message[] {
    const receiver = processes.find(p => p.id === to && p.isActive);
    if (!receiver) return [];
    
    const messages: Message[] = [];
    
    // Send OK response
    messages.push(this.createMessage('OK', to, from));
    
    // Start own election
    const electionMessages = this.startElection(to, processes);
    messages.push(...electionMessages);
    
    return messages;
  }
  
  /**
   * Handles OK message received by a process
   * This stops the process from declaring itself leader
   */
  handleOkMessage(_to: number, _from: number): void {
    // OK message handling is implicit - receiving OK means process should not become leader
    // This is handled in the election orchestration logic
  }
  
  /**
   * Announces coordinator to all active processes
   * Sends COORDINATOR messages from the leader to all other active processes
   */
  announceCoordinator(leaderId: number, processes: Process[]): Message[] {
    const leader = processes.find(p => p.id === leaderId && p.isActive);
    if (!leader) return [];
    
    const otherActiveProcesses = processes.filter(p => p.id !== leaderId && p.isActive);
    
    return otherActiveProcesses.map(target => 
      this.createMessage('COORDINATOR', leaderId, target.id)
    );
  }
  
  /**
   * Determines the highest active process ID
   * Used to determine the rightful leader
   */
  findHighestActiveProcess(processes: Process[]): number {
    const activeProcesses = processes.filter(p => p.isActive);
    if (activeProcesses.length === 0) return -1;
    
    return Math.max(...activeProcesses.map(p => p.id));
  }
  
  /**
   * Creates a message with unique ID, timestamp, and animation configuration
   */
  createMessage(type: MessageType, from: number, to: number, isHeartbeat = false): Message {
    const config = getMessageConfig(type, isHeartbeat);
    const now = Date.now();
    
    return {
      id: `msg-${now}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      from,
      to,
      progress: 0,
      timestamp: now,
      duration: config.duration,
      animationSpeed: config.animationSpeed,
      startTime: now,
      priority: config.priority
    };
  }
  
  /**
   * Determines if a process should become leader after timeout
   * Returns true if no higher processes are active
   */
  shouldBecomeLeader(processId: number, processes: Process[]): boolean {
    const higherActiveProcesses = processes.filter(p => p.id > processId && p.isActive);
    return higherActiveProcesses.length === 0;
  }
  
  /**
   * Gets all processes that should receive election messages from a given process
   */
  getElectionTargets(processId: number, processes: Process[]): Process[] {
    return processes.filter(p => p.id > processId && p.isActive);
  }
  
  /**
   * Validates if a process can participate in election
   */
  canParticipateInElection(processId: number, processes: Process[]): boolean {
    const process = processes.find(p => p.id === processId);
    return process ? process.isActive : false;
  }
  
  /**
   * Creates heartbeat messages from leader to all other active processes
   */
  createHeartbeatMessages(leaderId: number, processes: Process[]): Message[] {
    const leader = processes.find(p => p.id === leaderId && p.isActive);
    if (!leader) return [];
    
    const otherActiveProcesses = processes.filter(p => p.id !== leaderId && p.isActive);
    
    return otherActiveProcesses.map(target => {
      const message = this.createMessage('COORDINATOR', leaderId, target.id, true);
      // Add heartbeat identifier to the message ID
      message.id = `heartbeat-${message.id}`;
      return message;
    });
  }
}