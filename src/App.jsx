import Scene from './components/canvas/Scene';
import Toolbar from './components/ui/Toolbar';

function App() {

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene />
      <Toolbar />
    </div>
  )
}

export default App
