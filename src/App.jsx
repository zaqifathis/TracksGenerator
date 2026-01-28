
import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { generateUUID } from 'three/src/math/MathUtils.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

import Scene from './components/Scene';
import Toolbar from './components/UI/Toolbar';
import TrackCounter from './components/UI/TrackCounter';
import ViewToggle from './components/UI/ViewToggle';
import HelpMenu from './components/UI/HelpMenu';
import { getPortsTrack } from './constants/trackPaths';
import { useTrackStorage } from './utils/useTrackStorage';

if (!THREE.BufferGeometry.prototype.computeBoundsTree) {
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
}

function App() {
  const [activeTool, setActiveTool] = useState(null);
  const { tracks, setTracks, saveTracks, loadTracks } = useTrackStorage();  
  const [viewMode, setViewMode] = useState('2D');

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && setActiveTool(null);
    window.addEventListener('keydown', handleKeyDown);    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetTracks = () => setTracks([]);

  const updateTrackGeometry = (trackId, geometry) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, geometry } : t
    ));
  };

  // --- NEW ADD TRACK LOGIC ---
  const addTrack = (type, position, rotation = 0, snapInfo = null, isLeftOverride = false, geometry) => {
    const newId = generateUUID();

    setTracks((prevTracks) => {
      // Update the parent track to show it's now connected to this new track
      let updatedTracks = prevTracks.map((t) => {
        if (snapInfo && t.id === snapInfo.parentId) {
          return {
            ...t, connections: {...(t.connections || {}), [snapInfo.id]: newId }
          };
        }
        return t;
      });

      // Get all possible ports for the NEW track type
      // Initialize the connections object with null for every port
      const allAvailablePorts = getPortsTrack(type, isLeftOverride);
      const initialConnections = {};
      allAvailablePorts.forEach(port => {
        initialConnections[port.id] = null;
      });

      // Identify which port on the NEW track is connecting back to the parent
      if (snapInfo) {
        let primaryPortId = 'start'; // Default
        if (type === 'Y_TRACK') {
          const yPorts = ['start', 'end_left', 'end_right'];
          primaryPortId = yPorts[snapInfo.ghostPortIndex % 3];
        } else if (type === 'X_TRACK') {
          const xPorts = ['a_start', 'b_start'];
          primaryPortId = xPorts[snapInfo.ghostPortIndex % 2];
        }
        initialConnections[primaryPortId] = snapInfo.parentId;
      }

      const newTrack = {
        id: newId,
        type,
        isLeft:isLeftOverride,
        position,
        rotation,
        geometry,
        connections: initialConnections
      };

      return [...updatedTracks, newTrack];
    });
  };

  // --- UPDATED DELETE LOGIC ---
  const deleteTrack = (trackId) => {
    setTracks((prevTracks) => {
      return prevTracks
        .filter(t => t.id !== trackId)
        .map(t => {
          if (!t.connections) return t;
          
          const newConnections = { ...t.connections };
          Object.keys(newConnections).forEach(port => {
            if (newConnections[port] === trackId) {
              newConnections[port] = null;
            }
          });
          
          return { ...t, connections: newConnections };
        });
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
      <TrackCounter tracks={tracks} />
      <Toolbar 
        activeTool={activeTool}
        onSelectTool={setActiveTool} 
        onSave={saveTracks} 
        onLoad={loadTracks}
        onReset={resetTracks} 
      />
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      <HelpMenu />
      <Scene 
        viewMode={viewMode}
        activeTool={activeTool} 
        tracks={tracks} 
        onPlaceTrack={addTrack}
        onDeleteTrack={deleteTrack}
        onUpdateTrackGeometry={updateTrackGeometry}
      />
    </div>
  );
}

export default App;
