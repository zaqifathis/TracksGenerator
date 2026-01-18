import React, { useMemo } from 'react';
import { Line, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { STRAIGHT_LENGTH, CURVE_RADIUS, CURVE_ANGLE } from '../constants/constants';

import {TrackStraight} from './models/TrackStraight';
import { TrackCurved } from './models/TrackCurved';
import { TrackCross60 } from './models/TrackCross60';
import { TrackCurvedLeft } from './models/TrackCurvedLeft';
import { TrackYSwitch } from './models/TrackYSwitch';
import { TrackCross90 } from './models/TrackCross90';
import { interactionColor } from '../constants/theme';
import { trackColors } from '../constants/theme';

const Track = ({ 
  position= [0, 0, 0],
  rotation=0,
  type = 'STRAIGHT', 
  isLeft = false, 
  isGhost = false, 
  isOccupied = false, 
  isSnapped = false,
  isSelected = false, 
  onPointerOver,
  onPointerOut,
  onClick 
}) => {  

  // TRACKS LINE/CURVE
  const paths = useMemo(() => {
    // --- STRAIGHT ---
    if (type === 'STRAIGHT') {
      return [[
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, STRAIGHT_LENGTH),
      ]];
    }

    // --- CURVED ---
    if (type === 'CURVED') {
      const pts = [];
      const segments = 32;
      const direction = isLeft ? -1 : 1;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * CURVE_ANGLE;
        const x = (CURVE_RADIUS - Math.cos(angle) * CURVE_RADIUS) * direction;
        const z = Math.sin(angle) * CURVE_RADIUS;
        pts.push(new THREE.Vector3(x, 0, z));
      }
      return [pts];
    }

    // --- Y-TRACK (Switch) ---
    if (type === 'Y_TRACK') {
      const leftPath = [];
      const rightPath = [];
      const segments = 32;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * CURVE_ANGLE;
        const z = Math.sin(angle) * CURVE_RADIUS;
        const xLeft = (CURVE_RADIUS - Math.cos(angle) * CURVE_RADIUS) * -1;
        const xRight = (CURVE_RADIUS - Math.cos(angle) * CURVE_RADIUS) * 1;
        leftPath.push(new THREE.Vector3(xLeft, 0, z));
        rightPath.push(new THREE.Vector3(xRight, 0, z));
      }
      return [leftPath, rightPath];
    }

    // --- X-TRACK (Crossing) ---
    if (type === 'X_TRACK') {
      const half = STRAIGHT_LENGTH / 2;
      const angle = Math.PI / 3; // 60 degrees
      const pathA = [
        new THREE.Vector3(0, 0, -half),
        new THREE.Vector3(0, 0, half),
      ];
      const pathB = [
        new THREE.Vector3(-Math.sin(angle) * half, 0, -Math.cos(angle) * half),
        new THREE.Vector3(Math.sin(angle) * half, 0, Math.cos(angle) * half),
      ];
      return [pathA, pathB];
    }

    // --- CROSS_90 (Pivot at Origin) ---
    if (type === 'CROSS_90') {
      const half = STRAIGHT_LENGTH / 2;
      return [
        [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, STRAIGHT_LENGTH)],
        [new THREE.Vector3(-half, 0, half), new THREE.Vector3(half, 0, half)],
      ];
    }

    return [];
  }, [type, isLeft]);

  let trackColor;
  if (isSelected) {
    trackColor = interactionColor.selected;
  } else if (isGhost) {
    if (isOccupied) trackColor = interactionColor.occupied;
    else if (isSnapped) trackColor = interactionColor.snap;
    else trackColor = interactionColor.default;
  } else {
      if (type === "STRAIGHT") trackColor = trackColors.straight;
      if (type === "CURVED") trackColor = trackColors.curved
      if (type === "Y_TRACK") trackColor = trackColors.y_track
      if (type === "X_TRACK") trackColor = trackColors.x_track
  }

  return (
    <group 
      position={position}          
      rotation={[0, rotation, 0]}
      onPointerOver={onPointerOver} 
      onPointerOut={onPointerOut} 
      onClick={onClick}
    >
      {type === 'STRAIGHT' && (
        <TrackStraight 
          isGhost={isGhost}
          isOccupied={isOccupied}
          isSnapped={isSnapped}
          isSelected={isSelected}
        />
      )}
      {type === 'CURVED' && (
        isLeft ? (<TrackCurvedLeft isGhost={isGhost} isOccupied={isOccupied} isSnapped={isSnapped} isSelected={isSelected}/>) : 
        (<TrackCurved 
          isGhost={isGhost} 
          isOccupied={isOccupied} 
          isSnapped={isSnapped}
          isSelected={isSelected}
          />)
      )}
      {type === 'X_TRACK' && (
        <TrackCross60 
          isGhost={isGhost}
          isOccupied={isOccupied}
          isSnapped={isSnapped}
          isSelected={isSelected}
        />
      )}
      {type === 'Y_TRACK' && (
        <TrackYSwitch 
          isGhost={isGhost}
          isOccupied={isOccupied}
          isSnapped={isSnapped}
          isSelected={isSelected}
        />
      )}
      {type === 'CROSS_90' && (
        <TrackCross90 
          isGhost={isGhost}
          isOccupied={isOccupied}
          isSnapped={isSnapped}
          isSelected={isSelected}
        />
      )}
      {paths.map((pts, index) => {
        return (
          <Line 
            key={index}
            points={pts}
            visible={false} // turn true for check
            color={trackColor} 
            lineWidth={isSelected ? 6 : (isGhost ? 5 : 3)} 
            transparent={isGhost} 
            opacity={isGhost ? 0.5 : 1}
          />
        );
      })}
    </group>
    
  );
};

export default Track;