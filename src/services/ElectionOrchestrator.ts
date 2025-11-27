import { BullyAlgorithm } from './BullyAlgorithm';
import type { Process, Message } from '../types';

export class ElectionOrchestrator {
  private bullyAlgorithm: BullyAlgorithm;
  private pendingElections: Map<number, { timeout: number; waitingForOk: boolean }>;
  
  constructor() {
    this.bullyAlgorithm = new BullyAlgorithm();
    this.pendingElections = new Map();
  }
  
  /**
   * Initiates an election from a specific process
   */
  initiateElection(
    processId: number, 
    processes: Process[], 
    onMessage: (message: Message) => void,
    onLog: (message: string, type: string) => void,
    onElectionComplete: (leaderId: number) => void
  ): void {
    // Clear any existing election for this process
    this.clearElection(processId);
    
    // Start election and get messages to send
    const messages = this.bullyAlgorithm.startElection(processId, processes);
    
    if (messages.length === 0) {
      // No higher processes, this process becomes leader immediately
      onElectionComplete(processId);
      return;
    }
    
    // Send all election messages with slight delays for better visualization
    messages.forEach((message, index) => {
      setTimeout(() => {
        onMessage(message);
        onLog(`Process P${message.from} sent ELECTION to Process P${message.to}`, 'election');
      }, index * 200); // 200ms delay between messages
    });
    
    // Set timeout for OK responses
    const timeout = setTimeout(() => {
      this.handleElectionTimeout(processId, processes, onLog, onElectionComplete);
    }, 4000); // 4 second timeout
    
    this.pendingElections.set(processId, { timeout, waitingForOk: true });
  }
  
  /**
   * Handles when an election message is received
   */
  handleElectionMessage(
    message: Message,
    processes: Process[],
    onMessage: (message: Message) => void,
    onLog: (message: string, type: string) => void,
    onElectionComplete: (leaderId: number) => void
  ): void {
    const responses = this.bullyAlgorithm.handleElectionMessage(message.to, message.from, processes);
    
    responses.forEach((response, index) => {
      setTimeout(() => {
        if (response.type === 'OK') {
          onMessage(response);
          onLog(`Process P${response.from} sent OK to Process P${response.to}`, 'election');
        } else if (response.type === 'ELECTION') {
          onMessage(response);
          onLog(`Process P${response.from} sent ELECTION to Process P${response.to}`, 'election');
        }
      }, index * 150); // Slight delay for better visualization
    });
    
    // If this process sent OK, it should start its own election
    const okMessage = responses.find(r => r.type === 'OK');
    if (okMessage) {
      // Start election for the process that sent OK
      setTimeout(() => {
        this.initiateElection(message.to, processes, onMessage, onLog, onElectionComplete);
      }, 100);
    }
  }
  
  /**
   * Handles when an OK message is received
   */
  handleOkMessage(message: Message, onLog: (message: string, type: string) => void): void {
    // Cancel the election for the process that received OK
    const election = this.pendingElections.get(message.to);
    if (election) {
      clearTimeout(election.timeout);
      this.pendingElections.delete(message.to);
      onLog(`Process P${message.to} received OK from Process P${message.from}`, 'election');
    }
  }
  
  /**
   * Handles when a coordinator message is received
   */
  handleCoordinatorMessage(
    message: Message, 
    onLog: (message: string, type: string) => void,
    onElectionComplete: (leaderId: number) => void
  ): void {
    onLog(`Process P${message.to} acknowledged P${message.from} as leader`, 'leader');
    onElectionComplete(message.from);
  }
  
  /**
   * Handles election timeout (no OK received)
   */
  private handleElectionTimeout(
    processId: number,
    _processes: Process[],
    onLog: (message: string, type: string) => void,
    onElectionComplete: (leaderId: number) => void
  ): void {
    this.pendingElections.delete(processId);
    
    // This process becomes leader and announces to all
    onLog(`Process P${processId} declares itself as leader`, 'leader');
    onElectionComplete(processId);
    
    // Note: In a real implementation, coordinator messages would be sent
    // For this simulation, we'll just complete the election
  }
  
  /**
   * Clears an election for a specific process
   */
  private clearElection(processId: number): void {
    const election = this.pendingElections.get(processId);
    if (election) {
      clearTimeout(election.timeout);
      this.pendingElections.delete(processId);
    }
  }
  
  /**
   * Clears all pending elections
   */
  clearAllElections(): void {
    this.pendingElections.forEach(election => {
      clearTimeout(election.timeout);
    });
    this.pendingElections.clear();
  }
}