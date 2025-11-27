
import { SimulatorProvider } from './services/SimulatorContext';
import TitleBar from './components/TitleBar';
import CanvasArea from './components/CanvasArea';
import ControlPanel from './components/ControlPanel';
import LogWindow from './components/LogWindow';
import './App.css';

function App() {
  return (
    <SimulatorProvider>
      <div className="app">
        <TitleBar />
        <div className="main-content">
          <CanvasArea />
          <ControlPanel />
        </div>
        <LogWindow />
      </div>
    </SimulatorProvider>
  );
}

export default App;
