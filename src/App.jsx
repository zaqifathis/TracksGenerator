import { useState, useEffect } from 'react';
import Scene from './components/canvas/Scene';
import Toolbar from './components/ui/Toolbar';
import { generateUUID } from 'three/src/math/MathUtils.js';

function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [tracks, setTracks] = useState([]);

  console.log('tracksManager: ',  tracks)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveTool(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addTrack = (type, position, rotation=0, parentId = null) => {
    const newId = generateUUID();

    setTracks((prevTracks) => {
    const updatedTracks = prevTracks.map((t) =>
      t.id === parentId ? { ...t, isEndOccupied: true } : t
    );
    return [...updatedTracks,
      {
        id: newId,
        type: type === 'STRAIGHT' ? 'STRAIGHT' : 'CURVED',
        isLeft: type === 'CURVE_LEFT',
        position,
        rotation,
        isEndOccupied: false
      },
    ];
  });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Toolbar onSelectTool={setActiveTool}/>
      <Scene 
        activeTool={activeTool} 
        tracks={tracks} 
        onPlaceTrack={addTrack}/>
    </div>
  )
}

export default App
