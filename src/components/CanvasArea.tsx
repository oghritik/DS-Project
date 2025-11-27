import React, { useRef, useEffect, useState } from 'react';
import { useSimulator } from '../services/SimulatorContext';
import type { Process, Message } from '../types';
import { calculateAnimationProgress } from '../config/AnimationConfig';
import './CanvasArea.css';

const CanvasArea: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, removeMessage, addLog, isSimulationRunning } = useSimulator();
  const [hoveredProcess, setHoveredProcess] = useState<number | null>(null);
  const [heartbeatPulse, setHeartbeatPulse] = useState(0);

  
  // Calculate process positions based on canvas size
  const calculatePositions = (width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.25;
    
    return state.processes.map((process, index) => {
      const angle = (index * 2 * Math.PI) / state.processes.length - Math.PI / 2;
      return {
        ...process,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      };
    });
  };
  
  const drawProcess = (ctx: CanvasRenderingContext2D, process: Process, isHovered: boolean) => {
    const { x, y } = process.position;
    const radius = 35; // Slightly larger for better visibility
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    // Apply colors based on state
    if (process.isActive) {
      ctx.fillStyle = isHovered ? '#3d8b40' : '#4CAF50'; // Green, darker when hovered
    } else {
      ctx.fillStyle = isHovered ? '#d32f2f' : '#FF5252'; // Red, darker when hovered
    }
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = process.isActive ? '#4CAF50' : '#FF5252';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw leader outline if this process is the leader
    if (process.isLeader) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 8, 0, 2 * Math.PI);
      ctx.strokeStyle = '#4C9AFF';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Add leader crown/star indicator
      ctx.fillStyle = '#4C9AFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x, y - radius - 15);
    }
    
    // Draw process ID (larger and more prominent)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(process.id.toString(), x, y - 2);
    
    // Draw process label below the ID
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`P${process.id}`, x, y + 12);
    
    // Draw status indicator
    const statusText = process.isActive ? 'ACTIVE' : 'FAILED';
    ctx.fillStyle = process.isActive ? '#4CAF50' : '#FF5252';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(statusText, x, y + radius + 15);
  };
  
  const drawMessage = (ctx: CanvasRenderingContext2D, message: Message, processes: Process[]) => {
    const fromProcess = processes.find(p => p.id === message.from);
    const toProcess = processes.find(p => p.id === message.to);
    
    if (!fromProcess || !toProcess) return;
    
    const startX = fromProcess.position.x;
    const startY = fromProcess.position.y;
    const endX = toProcess.position.x;
    const endY = toProcess.position.y;
    
    // Calculate current position based on progress
    const currentX = startX + (endX - startX) * message.progress;
    const currentY = startY + (endY - startY) * message.progress;
    
    // Check if this is a heartbeat message (COORDINATOR from leader)
    const isHeartbeat = message.type === 'COORDINATOR' && message.id.includes('heartbeat');
    
    // Set line color and style based on message type with enhanced visibility
    let color: string;
    let lineWidth = 3;
    let isDashed = false;
    let isPulsing = false;
    let glowEffect = false;
    
    switch (message.type) {
      case 'ELECTION':
        color = '#FFD700'; // Gold - from lower to higher ID
        lineWidth = 5; // Thicker for better visibility
        glowEffect = true; // Add glow for election messages
        break;
      case 'OK':
        color = '#FF8C00'; // Orange - from higher to lower ID
        lineWidth = 4; // Slightly thicker
        isDashed = true;
        glowEffect = true; // Add glow for OK messages
        break;
      case 'COORDINATOR':
        if (isHeartbeat) {
          color = '#00E676'; // Bright green for heartbeat
          lineWidth = 2;
          isPulsing = true;
        } else {
          color = '#4C9AFF'; // Blue - from leader to all
          lineWidth = 5; // Thicker for better visibility
          glowEffect = true; // Add glow for coordinator messages
        }
        break;
      default:
        color = '#FFFFFF';
    }
    
    // Draw the full path as a faint line first
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3; // Slightly more visible path
    ctx.lineWidth = 1;
    if (isDashed) {
      ctx.setLineDash([5, 5]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    
    // Apply pulsing effect for heartbeat messages
    if (isPulsing) {
      const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = pulseIntensity;
      lineWidth = lineWidth + Math.sin(Date.now() * 0.01) * 1;
    }
    
    // Add glow effect for important messages
    if (glowEffect && !isHeartbeat) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Draw animated line from start to current position
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (isDashed) {
      ctx.setLineDash([8, 4]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Draw arrowhead at current position
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = isHeartbeat ? 8 : 12; // Smaller arrows for heartbeat
    const arrowAngle = Math.PI / 5;
    
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(
      currentX - arrowLength * Math.cos(angle - arrowAngle),
      currentY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(
      currentX - arrowLength * Math.cos(angle + arrowAngle),
      currentY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw message type label
    const midX = startX + (endX - startX) * 0.5;
    const midY = startY + (endY - startY) * 0.5;
    
    ctx.fillStyle = color;
    ctx.font = '10px Inter, sans-serif'; // Smaller font for heartbeat
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add background for text
    const text = isHeartbeat ? '♥' : message.type; // Heart symbol for heartbeat
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width + 6;
    const textHeight = isHeartbeat ? 12 : 16;
    
    if (!isHeartbeat) { // Don't show background for heartbeat symbol
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(midX - textWidth/2, midY - textHeight/2, textWidth, textHeight);
    }
    
    ctx.fillStyle = color;
    if (isHeartbeat) {
      ctx.font = '14px Inter, sans-serif'; // Larger heart symbol
    }
    ctx.fillText(text, midX, midY);
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const processes = calculatePositions(canvas.width, canvas.height);
    let hoveredId: number | null = null;
    
    for (const process of processes) {
      const distance = Math.sqrt(
        Math.pow(mouseX - process.position.x, 2) + 
        Math.pow(mouseY - process.position.y, 2)
      );
      
      if (distance <= 35) { // Process radius
        hoveredId = process.id;
        break;
      }
    }
    
    setHoveredProcess(hoveredId);
    canvas.style.cursor = hoveredId ? 'pointer' : 'default';
  };
  
  const handleMessageComplete = (message: Message) => {
    const isHeartbeat = message.type === 'COORDINATOR' && message.id.includes('heartbeat');
    
    switch (message.type) {
      case 'ELECTION':
        // Higher process received election message, should send OK and start own election
        const targetProcess = state.processes.find(p => p.id === message.to && p.isActive);
        if (targetProcess) {
          addLog(`Process P${message.to} received ELECTION from Process P${message.from}`, 'election');
          // In a real implementation, this would trigger the election orchestrator
        }
        break;
      case 'OK':
        addLog(`Process P${message.to} received OK from Process P${message.from}`, 'election');
        break;
      case 'COORDINATOR':
        if (isHeartbeat) {
          // Don't log every heartbeat to avoid spam, but could add a counter
          // addLog(`Process P${message.to} received heartbeat from Leader P${message.from}`, 'info');
        } else {
          addLog(`Process P${message.to} acknowledged P${message.from} as leader`, 'leader');
        }
        break;
    }
  };
  
  const drawSimulationStatus = (ctx: CanvasRenderingContext2D, _width: number, _height: number) => {
    // Draw simulation status in top-left corner
    const statusText = isSimulationRunning ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED';
    const statusColor = isSimulationRunning ? '#4CAF50' : '#FF5252';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 180, 30);
    
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(statusText, 20, 25);
    
    // Draw heartbeat indicator
    if (isSimulationRunning) {
      const pulseSize = 6 + (heartbeatPulse * 4);
      ctx.beginPath();
      ctx.arc(170, 25, pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(76, 175, 80, ${0.5 + heartbeatPulse * 0.5})`;
      ctx.fill();
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredProcess(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };
  
  // Heartbeat pulse effect
  useEffect(() => {
    const lastHeartbeat = state.lastHeartbeat;
    const now = Date.now();
    const timeSinceHeartbeat = now - lastHeartbeat;
    
    if (timeSinceHeartbeat < 500 && isSimulationRunning) { // Show pulse for 500ms after heartbeat
      setHeartbeatPulse(1 - (timeSinceHeartbeat / 500));
    } else {
      setHeartbeatPulse(0);
    }
  }, [state.lastHeartbeat, isSimulationRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate current positions
      const processes = calculatePositions(canvas.width, canvas.height);
      
      // Update message progress and handle completed messages
      const completedMessages: Message[] = [];
      const currentTime = Date.now();
      
      state.messages.forEach(message => {
        // Use enhanced animation progress calculation if available
        if (message.startTime && message.duration) {
          const timeElapsed = currentTime - message.startTime;
          const timeProgress = timeElapsed / message.duration;
          
          // Message is complete when time duration is reached
          if (timeProgress >= 1.0) {
            message.progress = 1.0;
            completedMessages.push(message);
            removeMessage(message.id);
          } else {
            // Update progress based on time and animation speed
            const speedProgress = message.progress + (message.animationSpeed || 0.005);
            message.progress = Math.min(timeProgress, speedProgress);
          }
        } else {
          // Fallback to original animation system for messages without timing
          if (message.progress >= 1.0) {
            completedMessages.push(message);
            removeMessage(message.id);
          }
        }
      });
      
      // Handle completed messages
      completedMessages.forEach(message => {
        handleMessageComplete(message);
      });
      
      // Draw heartbeat pulse background if simulation is running
      if (isSimulationRunning && heartbeatPulse > 0) {
        ctx.fillStyle = `rgba(76, 154, 255, ${heartbeatPulse * 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw all processes
      processes.forEach(process => {
        drawProcess(ctx, process, hoveredProcess === process.id);
      });
      
      // Draw all messages (progress is now updated above)
      state.messages.forEach(message => {
        drawMessage(ctx, message, processes);
      });
      
      // Draw simulation status indicator
      drawSimulationStatus(ctx, canvas.width, canvas.height);
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [state.processes, state.messages, hoveredProcess, removeMessage, addLog, isSimulationRunning, heartbeatPulse]);
  
  return (
    <div className="canvas-area">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label="Distributed system visualization showing process nodes and message animations"
      />
    </div>
  );
};

export default CanvasArea;