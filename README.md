# Bully Algorithm Simulator

Interactive web-based tool for visualizing the Bully Algorithm in distributed systems.

## Features

- **Real-time Simulation**: Heartbeat monitoring every 2 seconds, elections with 4-second timeout
- **Interactive Controls**: Start/stop simulation, toggle process failures, configure nodes
- **Visual Messages**: See ELECTION (gold), OK (orange), COORDINATOR (blue), and HEARTBEAT (green) messages
- **Automatic Elections**: Leader failures trigger automatic elections
- **Custom Configuration**: Set 2-10 nodes with custom IDs

## Tech Stack

React 19 + TypeScript + HTML5 Canvas + Vite

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## How to Use

1. **Start Simulation**: Click play button to begin
2. **Configure Nodes**: Set number of nodes (2-10) and custom IDs
3. **Simulate Failures**: Toggle processes on/off to see elections
4. **Watch Messages**: See different colored messages flow between nodes

## Understanding the Visualization

### Process Nodes
- **Green**: Active processes
- **Red**: Failed processes  
- **Blue outline + ★**: Current leader

### Messages
- **Gold (ELECTION)**: Lower ID → Higher ID processes
- **Orange (OK)**: Higher ID → Lower ID responses (dashed lines)
- **Blue (COORDINATOR)**: New leader announces to all
- **Green (HEARTBEAT)**: Leader sends ♥ every 2 seconds

### Timing
- Heartbeat: Every 2 seconds
- Election timeout: 4 seconds

## Algorithm

Standard Bully Algorithm with heartbeat monitoring:

1. Process detects leader failure → sends ELECTION to higher IDs
2. Higher ID receives ELECTION → sends OK + starts own election  
3. No OK received in 4s → declares itself leader + sends COORDINATOR
4. Leader sends heartbeat every 2s → failure triggers new election

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

