import * as THREE from 'three';
import { STRAIGHT_LENGTH, CURVE_RADIUS, CURVE_ANGLE } from './utils/constants';
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

  const addTrack = (type, position, rotation = 0, snapInfo = null) => {
  const newId = generateUUID();

  setTracks((prevTracks) => {
    // 1. Link the parent to the new track
    let updatedTracks = prevTracks.map((t) => {
      if (snapInfo && t.id === snapInfo.parentId) {
        return snapInfo.isStartSnap 
          ? { ...t, prevTrackId: newId } 
          : { ...t, nextTrackId: newId };
      }
      return t;
    });

    // 2. Create the new track object with connection IDs
    const newTrack = {
      id: newId,
      type: type === 'STRAIGHT' ? 'STRAIGHT' : 'CURVED',
      isLeft: type === 'CURVE_LEFT',
      position,
      rotation,
      prevTrackId: snapInfo ? snapInfo.parentId : null,
      nextTrackId: null, 
    };

    // 3. LOOP CLOSURE CHECK (Spatial)
    const isStraight = newTrack.type === 'STRAIGHT';
    const localEnd = isStraight 
      ? new THREE.Vector3(0, 0, STRAIGHT_LENGTH)
      : new THREE.Vector3(
          (CURVE_RADIUS - Math.cos(CURVE_ANGLE) * CURVE_RADIUS) * (newTrack.isLeft ? -1 : 1),
          0,
          Math.sin(CURVE_ANGLE) * CURVE_RADIUS
        );

    const worldEnd = localEnd
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), newTrack.rotation)
      .add(new THREE.Vector3(...newTrack.position));

    updatedTracks = updatedTracks.map(t => {
      const startPos = new THREE.Vector3(...t.position);
      if (!t.prevTrackId && startPos.distanceTo(worldEnd) < 5) {
        newTrack.nextTrackId = t.id;
        return { ...t, prevTrackId: newTrack.id };
      }
      return t;
    });

    return [...updatedTracks, newTrack];
  });
};

const deleteTrack = (trackId) => {
  setTracks((prevTracks) => {
    return prevTracks
      .filter(t => t.id !== trackId)
      .map(t => {
        if (t.nextTrackId === trackId) return { ...t, nextTrackId: null };
        if (t.prevTrackId === trackId) return { ...t, prevTrackId: null };
        return t;
      });
  });
};

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Toolbar onSelectTool={setActiveTool}/>
      <Scene 
        activeTool={activeTool} 
        tracks={tracks} 
        onPlaceTrack={addTrack}
        onDeleteTrack={deleteTrack}/>
    </div>
  )
}

export default App
