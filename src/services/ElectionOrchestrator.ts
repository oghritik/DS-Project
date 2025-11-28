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
    // Clear any existing elections
    this.clearAllElections();
    
    onLog(`Process P${processId} initiating election`, 'election');
    
    // In the Bully Algorithm, we simulate the complete election process
    // The highest active process should always become the leader
    this.simulateCompleteElection(processId, processes, onMessage, onLog, onElectionComplete);
  }
  
  /**
   * Simulates the complete Bully Algorithm election process
   */
  private simulateCompleteElection(
    initiatorId: number,
    processes: Process[],
    onMessage: (message: Message) => void,
    onLog: (message: string, type: string) => void,
    onElectionComplete: (leaderId: number) => void
  ): void {
    // Find the highest active process - this will be the eventual leader
    const actualLeader = this.bullyAlgorithm.findHighestActiveProcess(processes);
    
    if (actualLeader === -1) {
      onLog('No active processes found', 'election');
      return;
    }
    
    // Step 1: Initiator sends ELECTION messages to higher processes
    const initialMessages = this.bullyAlgorithm.startElection(initiatorId, processes);
    let messageDelay = 0;
    
    if (initialMessages.length === 0) {
      // No higher processes, initiator becomes leader immediately
      onLog(`Process P${initiatorId} becomes leader (no higher processes)`, 'leader');
      onElectionComplete(initiatorId);
      return;
    }
    
    // Send initial election messages with optimized timing
    initialMessages.forEach((message, index) => {
      setTimeout(() => {
        onMessage(message);
        onLog(`Process P${message.from} sent ELECTION to Process P${message.to}`, 'election');
      }, messageDelay + index * 100); // Reduced from 200ms to 100ms
    });
    messageDelay += initialMessages.length * 100 + 400; // Reduced wait time
    
    // Step 2: Higher processes send OK messages back
    const okMessages: Message[] = [];
    initialMessages.forEach(electionMsg => {
      const targetProcess = processes.find(p => p.id === electionMsg.to && p.isActive);
      if (targetProcess) {
        okMessages.push(this.bullyAlgorithm.createMessage('OK', electionMsg.to, electionMsg.from));
      }
    });
    
    okMessages.forEach((okMsg, index) => {
      setTimeout(() => {
        onMessage(okMsg);
        onLog(`Process P${okMsg.from} sent OK to Process P${okMsg.to}`, 'election');
      }, messageDelay + index * 80); // Reduced from 150ms to 80ms
    });
    messageDelay += okMessages.length * 80 + 300; // Reduced wait time
    
    // Step 3: Simulate cascading elections from higher processes
    this.simulateCascadingElections(initiatorId, actualLeader, processes, onMessage, onLog, messageDelay);
    
    // Step 4: Highest process becomes leader and sends coordinator messages
    const finalDelay = messageDelay + 400; // Reduced from 1000ms to 400ms
    setTimeout(() => {
      onLog(`Process P${actualLeader} wins election and becomes leader`, 'leader');
      
      const coordinatorMessages = this.bullyAlgorithm.announceCoordinator(actualLeader, processes);
      coordinatorMessages.forEach((coordMsg, index) => {
        setTimeout(() => {
          onMessage(coordMsg);
          onLog(`Process P${coordMsg.from} sent COORDINATOR to Process P${coordMsg.to}`, 'leader');
        }, index * 100); // Reduced from 150ms to 100ms
      });
      
      // Complete the election
      setTimeout(() => {
        onElectionComplete(actualLeader);
      }, coordinatorMessages.length * 100 + 300); // Reduced wait time
    }, finalDelay);
  }
  
  /**
   * Simulates cascading elections from higher processes (simplified for better visualization)
   */
  private simulateCascadingElections(
    originalInitiator: number,
    finalLeader: number,
    processes: Process[],
    onMessage: (message: Message) => void,
    onLog: (message: string, type: string) => void,
    startDelay: number
  ): void {
    // Simplified cascading: only show one level of cascading to avoid visual overload
    const nextHigherProcess = processes
      .filter(p => p.id > originalInitiator && p.id < finalLeader && p.isActive)
      .sort((a, b) => a.id - b.id)[0]; // Get the next higher process
    
    if (nextHigherProcess) {
      let currentDelay = startDelay;
      
      // This higher process starts its own election
      const electionMessages = this.bullyAlgorithm.startElection(nextHigherProcess.id, processes);
      
      electionMessages.forEach((msg, index) => {
        setTimeout(() => {
          onMessage(msg);
          onLog(`Process P${msg.from} sent ELECTION to Process P${msg.to}`, 'election');
        }, currentDelay + index * 60);
      });
      
      // Simulate OK responses
      const okResponses = electionMessages
        .filter(msg => processes.find(p => p.id === msg.to && p.isActive))
        .map(msg => this.bullyAlgorithm.createMessage('OK', msg.to, msg.from));
      
      okResponses.forEach((okMsg, index) => {
        setTimeout(() => {
          onMessage(okMsg);
          onLog(`Process P${okMsg.from} sent OK to Process P${okMsg.to}`, 'election');
        }, currentDelay + electionMessages.length * 60 + 150 + index * 50);
      });
    }
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
    processes: Process[],
    onLog: (message: string, type: string) => void,
    onElectionComplete: (leaderId: number) => void
  ): void {
    this.pendingElections.delete(processId);
    
    // Check if this process should become leader according to Bully Algorithm
    if (this.bullyAlgorithm.shouldBecomeLeader(processId, processes)) {
      // This process becomes leader and announces to all
      onLog(`Process P${processId} declares itself as leader (no OK received)`, 'leader');
      
      // Send coordinator messages to all other active processes
      const coordinatorMessages = this.bullyAlgorithm.announceCoordinator(processId, processes);
      
      coordinatorMessages.forEach((message, index) => {
        setTimeout(() => {
          onLog(`Process P${processId} sent COORDINATOR to Process P${message.to}`, 'leader');
        }, index * 150);
      });
      
      // Complete the election after coordinator messages are sent
      setTimeout(() => {
        onElectionComplete(processId);
      }, coordinatorMessages.length * 150 + 500);
    } else {
      // This should not happen in a correct Bully Algorithm implementation
      // But if it does, find the actual highest process and make it leader
      const actualLeader = this.bullyAlgorithm.findHighestActiveProcess(processes);
      if (actualLeader !== -1) {
        onLog(`Process P${processId} timeout, but P${actualLeader} should be leader`, 'election');
        onElectionComplete(actualLeader);
      }
    }
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