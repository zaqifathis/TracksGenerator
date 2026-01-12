import * as THREE from 'three';
import { STRAIGHT_LENGTH,CURVE_ANGLE, CURVE_RADIUS } from '../utils/constants';
import { Plane } from '@react-three/drei';
import { useState } from 'react';
import Track from './Track';

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

export default InteractionHandler;