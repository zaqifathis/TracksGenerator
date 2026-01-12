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
    snapInfo: null
  });
  const SNAP_THRESHOLD = 50;

  const getSnapPoints = (track) => {
    const points = [];
    
    // --- Start Point Snap (Green Side) ---
    points.push({
      pos: new THREE.Vector3(...track.position),
      // To connect to a START, the new track must be rotated 180 deg (Math.PI) 
      rot: (track.rotation || 0) + Math.PI,
      isOccupied: track.prevTrackId !== null,
      parentId: track.id,
      isStartSnap: true
    });

    // --- End Point Snap (Red Side) ---
    const isStraight = track.type === 'STRAIGHT';
    const localEnd = isStraight 
      ? new THREE.Vector3(0, 0, STRAIGHT_LENGTH)
      : new THREE.Vector3(
          (CURVE_RADIUS - Math.cos(CURVE_ANGLE) * CURVE_RADIUS) * (track.isLeft ? -1 : 1),
          0,
          Math.sin(CURVE_ANGLE) * CURVE_RADIUS
        );

    const worldEnd = localEnd
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), track.rotation || 0)
      .add(new THREE.Vector3(...track.position));

    const angleChange = isStraight ? 0 : (track.isLeft ? -CURVE_ANGLE : CURVE_ANGLE);

    points.push({
      pos: worldEnd,
      rot: (track.rotation || 0) + angleChange,
      isOccupied: track.nextTrackId !== null,
      parentId: track.id,
      isStartSnap: false
    });

    return points;
  };

  const handlePointerMove = (e) => {
    if (!activeTool) return;
    let bestTarget = null;
    let minDistance = SNAP_THRESHOLD;
    tracks.forEach(track => {
      const snapPoints = getSnapPoints(track);

      snapPoints.forEach(point => {
        const dist = e.point.distanceTo(point.pos);
        if (dist < minDistance) {
          if (!point.isOccupied || !bestTarget || bestTarget.isOccupied) {
            bestTarget = point;
            minDistance = dist;
          }
        }
      });
    });

    if (bestTarget) {
      setGhostState({
        pos: [bestTarget.pos.x, 0, bestTarget.pos.z],
        rot: bestTarget.rot,
        isOccupied: bestTarget.isOccupied,
        isSnapped: true,
        snapInfo: bestTarget
      });
    } else {
      setGhostState({ pos: [e.point.x, 0, e.point.z], rot: 0, isOccupied: false, isSnapped: false, snapInfo: null });
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
            onPlaceTrack(activeTool, ghostState.pos, ghostState.rot, ghostState.snapInfo);
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

const Scene = ({ activeTool, tracks, onPlaceTrack, onDeleteTrack }) => {
  const [hoveredId, setHoveredId] = useState(null);

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
      
      {tracks.map(track => (
        <group key={track.id} position={track.position} rotation={[0, track.rotation || 0, 0]}>
          <Track 
            type={track.type} 
            isLeft={track.isLeft} 
            isSelected={hoveredId === track.id}
            onPointerOver={(e) => {
              e.stopPropagation();
              if (!activeTool) setHoveredId(track.id);
            }}
            onPointerOut={() => setHoveredId(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (!activeTool) onDeleteTrack(track.id);
            }}
          />
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