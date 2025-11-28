# Bully Algorithm Simulator
Interactive **web-based visualization tool** for the Bully Leader Election Algorithm in distributed systems.  
This simulator shows failure detection, heartbeats, elections, OK signals, and automatic leader recovery — all in real time.

<div align="center">
  <img 
    src="Screenshot 2025-11-28 at 6.30.22 PM.png" 
    alt="Bully Algorithm Simulator Banner" 
    width="900"
    style="border-radius: 10px;"
  />
</div>

## Features

- **Real-time Simulation**: Heartbeat monitoring every 2 seconds, elections with 4-second timeout
- **Interactive Controls**: Start/stop simulation, toggle process failures, configure nodes, click-to-elect
- **Visual Messages**: See ELECTION (gold), OK (orange), COORDINATOR (blue), and HEARTBEAT (green) messages
- **Automatic Re-Elections**: Leader failures trigger automatic elections with full visual animation
- **Failure Detection**: Both manual toggle and heartbeat timeout detection
- **Custom Configuration**: Set 2-10 nodes with custom IDs

## 📦 Dependencies

The project uses the following:

- **Node.js 18+**
- **React 19**
- **TypeScript**
- **Vite**
- **HTML5 Canvas API**
- **CSS (no frameworks required)**

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## How to Use

1. **Start Simulation**: Click play button to begin
2. **Configure Nodes**: Set number of nodes (2-10) and custom IDs
3. **Simulate Failures**: Toggle processes on/off to see automatic re-elections
4. **Start Elections**: Click on any active (green) node to initiate an election from that process
5. **Watch Auto Re-Elections**: See automatic elections when leader fails
6. **Watch Messages**: See different colored messages flow between nodes

## Understanding the Visualization

### Process Nodes
- **Green**: Active processes
- **Red**: Failed processes  
- **Blue outline + ★**: Current leader

### Messages
- **Gold (ELECTION)**: Lower ID → Higher ID processes
- **Orange (OK)**: Higher ID → Lower ID responses (dashed lines)
- **Blue (COORDINATOR)**: New leader announces to all
- **Green (HEARTBEAT)**: Leader sends 💚 every 2 seconds

### Interactive Election
- **Click any active node**: Starts election from that specific process
- **Visual feedback**: Clicked nodes glow gold, election status shows initiator
- **Smart prevention**: Cannot start election from failed nodes or during ongoing elections

### Automatic Re-Election
- **Leader Failure Detection**: System detects when leader fails (toggle off or heartbeat timeout)
- **Auto-Initiation**: Lowest active process automatically starts election
- **Visual Indicators**: 🚨 Orange banner for auto elections, red glow for failed leader
- **Complete Animation**: Full ELECTION → OK → COORDINATOR message flow

### Timing
- Heartbeat: Every 2 seconds
- Election timeout: 4 seconds

## Algorithm

Standard Bully Algorithm with heartbeat monitoring:

1. Any process can initiate election → sends ELECTION to higher IDs
2. Higher ID receives ELECTION → sends OK + starts own election  
3. Process continues until highest active process wins
4. **Key principle: Highest-numbered active process always becomes leader**
5. New leader sends COORDINATOR to all other processes
6. Leader sends heartbeat every 2s → failure triggers new election

## Project Structure

```
src/
├── components/          # UI components
├── services/           # Algorithm logic
├── types/             # TypeScript definitions  
└── styles/           # CSS styles
```

## Educational Use

Perfect for distributed systems courses:
- Visualize Bully Algorithm message flow
- Demonstrate failure detection and recovery
- Show timing effects and process priorities
- Interactive learning with hands-on experiments

## License

This project is licensed under the MIT License - see the LICENSE file for details.

