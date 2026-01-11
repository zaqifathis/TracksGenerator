import React, { useMemo } from 'react';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { STRAIGHT_LENGTH, CURVE_RADIUS, CURVE_ANGLE } from '../../utils/constants';

const Track = ({ type = 'STRAIGHT', isLeft = false }) => {
  // Calculate points for the track guide
  const points = useMemo(() => {
    if (type === 'STRAIGHT') {
      return [
        [0, 0, 0],
        [0, 0, STRAIGHT_LENGTH],
      ];
    }

    if (type === 'CURVED') {
      const pts = [];
      const segments = 32;
      const direction = isLeft ? -1 : 1;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * CURVE_ANGLE;
        // Math to keep pivot at Start (0,0,0)
        // x = R - R * cos(angle), z = R * sin(angle)
        const x = (CURVE_RADIUS - Math.cos(angle) * CURVE_RADIUS) * direction;
        const z = Math.sin(angle) * CURVE_RADIUS;
        pts.push(new THREE.Vector3(x, 0, z));
      }
      return pts;
    }
    return [];
  }, [type, isLeft]);

  const endPoint = points[points.length - 1];
  const trackColor = type === 'STRAIGHT' ? '#0b3c66' : '#ac269a';

  return (
    <group>
      {/* Visual Line Guide */}
      <Line points={points} color={trackColor} lineWidth={3} />

      {/* Start Connection (Green) */}
      <Sphere args={[2, 16, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#adaf4c" />
      </Sphere>

      {/* End Connection (Red) */}
      <Sphere args={[2, 16, 16]} position={endPoint}>
        <meshBasicMaterial color="#F44336" />
      </Sphere>
    </group>
  );
};

export default Track;