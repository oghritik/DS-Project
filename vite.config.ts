import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Multi-instance port configuration
const getPort = (): number => {
  const instanceId = process.env.INSTANCE_ID;
  const basePort = 5173;
  
  if (instanceId) {
    const instanceNum = parseInt(instanceId, 10);
    if (!isNaN(instanceNum)) {
      return basePort + instanceNum;
    }
  }
  
  // Check for PORT environment variable
  if (process.env.PORT) {
    const envPort = parseInt(process.env.PORT, 10);
    if (!isNaN(envPort)) {
      return envPort;
    }
  }
  
  return basePort;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: getPort(),
    strictPort: false, // Allow fallback to next available port
    host: true, // Allow external connections
    open: false // Don't auto-open browser for multi-instance support
  },
  define: {
    // Make instance info available to the app
    __INSTANCE_ID__: JSON.stringify(process.env.INSTANCE_ID || '0'),
    __SERVER_PORT__: JSON.stringify(getPort().toString())
  }
})
