import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Plane } from '@react-three/drei';
import { DUPLO_STUD, STRAIGHT_LENGTH,CURVE_ANGLE, CURVE_RADIUS } from '../../utils/constants';
import Track from '../tracks/Track';
import { useState } from 'react';

const InteractionHandler = ({ activeTool, tracks = [], onPlaceTrack }) => {
  const [ghostState, setGhostState] = useState({ 
    pos: [0, 0, 0], 
    rot: 0, 
    isOccupied: false, 
    isSnapped: false,
    parentId: null
  });
  const SNAP_THRESHOLD = 50;

  const getTrackEndInfo = (track) => {
    const isStraight = track.type === 'STRAIGHT';
    const angle = isStraight ? 0 : (track.isLeft ? -CURVE_ANGLE : CURVE_ANGLE);
    
    let localEnd = isStraight ? 
      new THREE.Vector3(0, 0, STRAIGHT_LENGTH): new THREE.Vector3(
          (CURVE_RADIUS - Math.cos(CURVE_ANGLE) * CURVE_RADIUS) * (track.isLeft ? -1 : 1),
          0,
          Math.sin(CURVE_ANGLE) * CURVE_RADIUS
        );

    // Apply rotation and position to find world end
    const worldEnd = localEnd
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), track.rotation || 0)
      .add(new THREE.Vector3(...track.position));
    
    // const exitRotation = (track.rotation || 0) + angle;

    return { 
      pos: [worldEnd.x, worldEnd.y, worldEnd.z], 
      rot: (track.rotation || 0) + angle,
      isOccupied: track.isEndOccupied, 
      id: track.id 
    };
  };

  const handlePointerMove = (e) => {
    if (!activeTool) return;

  const currentMouse = e.point;
  let bestTarget = null;
  let minDistance = SNAP_THRESHOLD;

  for (const track of tracks) {
    const endInfo = getTrackEndInfo(track);
    const dist = currentMouse.distanceTo(new THREE.Vector3(...endInfo.pos));

    // Check if this track is a candidate
    if (dist < minDistance) {
      // Priority 1: If we find a target that is NOT occupied, it becomes the new best target
      if (!endInfo.isOccupied) {
        bestTarget = endInfo;
        minDistance = dist;
      } 
      // Priority 2: If we haven't found any unoccupied target yet, track the occupied one
      else if (bestTarget === null || bestTarget.isOccupied) {
        bestTarget = endInfo;
        // Note: We don't tighten minDistance here so an unoccupied one further away 
        // (but still under SNAP_THRESHOLD) can still win.
      }
    }
  }

  if (bestTarget) {
    setGhostState({ 
      pos: bestTarget.pos, 
      rot: bestTarget.rot, 
      isOccupied: bestTarget.isOccupied, 
      isSnapped: true,
      parentId: bestTarget.id
    });
  } else {
    setGhostState({ 
      pos: [e.point.x, 0, e.point.z], 
      rot: 0, 
      isOccupied: false, 
      isSnapped: false,
      parentId: null
    });
  }
  };

  return (
    <>
      <Plane 
        args={[10000, 10000]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        onPointerMove={handlePointerMove}
        onClick={() => {
          const isFirstTrack = tracks.length === 0;
          const canPlace = isFirstTrack || (ghostState.isSnapped && !ghostState.isOccupied);

          if (activeTool && canPlace) {
            onPlaceTrack(activeTool, ghostState.pos, ghostState.rot, ghostState.parentId);
          }
        }}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      {activeTool && (
        <group position={ghostState.pos} rotation={[0, ghostState.rot, 0]}>
          <Track 
            type={activeTool === 'STRAIGHT' ? 'STRAIGHT' : 'CURVED'} 
            isLeft={activeTool === 'CURVE_LEFT'} 
            isGhost
            isOccupied={ghostState.isOccupied}
            isSnapped={ghostState.isSnapped}
          />
        </group>
      )}
    </>
  );
};

const Scene = ({ activeTool, tracks, onPlaceTrack }) => {
  return (
    <Canvas 
        shadows
        dpr={[1, 2]} // Optimizes for high-DPI screens (Retina)
        gl={{ antialias: true }} 
        camera={{ position: [500, 500, 500], fov: 45, far: 10000 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[1000, 1000, 1000]} />
      <OrbitControls makeDefault />

      {/* Box Viewer Helper */}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
      </GizmoHelper>

      <Grid 
            infiniteGrid
            cellSize={DUPLO_STUD}           // 16mm
            sectionSize={DUPLO_STUD * 10}    // Every 10 DUPLO_STUDs (160mm)
            fadeDistance={5000}        // How far the grid "exists"
            fadeStrength={5}           // Keep this low so it doesn't "cut off" harshly
            followCamera={false}       // Important: keeps the grid fixed to world origin
            cellColor="#e5e5e5" 
            sectionColor="#c7c5c5"
            cellThickness={1}          // Thinner lines reduce Moiré patterns
            sectionThickness={1.5}
            position={[0, -0.01, 0]}   // Tiny offset to prevent flickering with tracks
        />
      
      {tracks && tracks.map(track => (
        <group key={track.id} position={track.position} rotation={[0, track.rotation || 0, 0]}>
          <Track type={track.type} isLeft={track.isLeft} />
        </group>
      ))}

      <InteractionHandler 
        activeTool={activeTool} 
        tracks={tracks} 
        onPlaceTrack={onPlaceTrack} 
      />
    </Canvas>
  );
};

export default Scene;