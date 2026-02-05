import * as THREE from 'three';
import { getTrackPaths, getPortsTrack } from '../constants/trackPaths';

export const useTrackStorage = (tracks, setTracks) => {
  const serialize = ({ id, type, isLeft, connections }) => ({id, type, isLeft, connections}); 
  
  // --- SAVE LOGIC ---
  const saveTracks = () => {
    let remaining = [...tracks];
    const islands = [];

    while (remaining.length > 0) {
      const island = [];
      const root = remaining.shift(); 

      // Save Root with absolute position and rotation
      island.push({
        ...serialize(root),
        position: root.position,
        rotation: root.rotation
      });

      // Find all connected neighbors
      const stack = [root];
      while (stack.length > 0) {
        const current = stack.pop();
        const neighborIds = Object.values(current.connections || {}).filter(id => id !== null);

        neighborIds.forEach(id => {
          const index = remaining.findIndex(t => t.id === id);
          if (index !== -1) {
            const neighbor = remaining.splice(index, 1)[0];
            island.push(serialize(neighbor)); // No coords for children
            stack.push(neighbor);
          }
        });
      }
      islands.push(island);
    }

    const dataStr = JSON.stringify(islands, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rail-layout.json';
    link.click();
    URL.revokeObjectURL(url);

  };

  // --- LOAD LOGIC ---
  const loadTracks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const islands = JSON.parse(e.target.result);
        let allRehydrated = [];

        islands.forEach(island => {
          const islandMap = new Map(island.map(t => [t.id, t]));
          const root = island[0];
          root.paths = getTrackPaths(root.type, root.isLeft);
          allRehydrated.push(root);

          const queue = [root];
          const processed = new Set([root.id]);

          while (queue.length > 0) {
            const parent = queue.shift();
            const parentPorts = getPortsTrack(parent.type, parent.isLeft);

            parentPorts.forEach(pPort => {
              const childId = parent.connections?.[pPort.id];
              if (!childId || processed.has(childId)) return;

              const child = islandMap.get(childId);
              if (!child) return;

              const childPorts = getPortsTrack(child.type, child.isLeft);
              const cPort = childPorts.find(cp => child.connections[cp.id] === parent.id);

              if (cPort) {
                // Procedural Math to snap the child to the parent port
                const parentWorldRot = parent.rotation;
                const parentPortWorldRot = pPort.rot + parentWorldRot;
                const finalRotation = parentPortWorldRot - (cPort.rot + Math.PI);
                
                const parentPortWorldPos = pPort.pos.clone()
                  .applyAxisAngle(new THREE.Vector3(0, 1, 0), parentWorldRot)
                  .add(new THREE.Vector3(...parent.position));

                const childOffset = cPort.pos.clone()
                  .applyAxisAngle(new THREE.Vector3(0, 1, 0), finalRotation);
                
                const finalPosition = parentPortWorldPos.sub(childOffset);

                child.position = [finalPosition.x, 0, finalPosition.z];
                child.rotation = finalRotation;
                child.paths = getTrackPaths(child.type, child.isLeft);

                allRehydrated.push(child);
                processed.add(child.id);
                queue.push(child);
              }
            });
          }
        });
        setTracks(allRehydrated);
      } catch (err) {
        console.error("Load failed", err);
      }
    };
    reader.readAsText(file);
  };

  return { saveTracks, loadTracks };
};