import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Sphere } from '@react-three/drei';
import { DUPLO_STUD } from '../../utils/constants';
import Track from '../tracks/Track';

const radius = DUPLO_STUD * 10;

const Scene = () => {
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
        
      {/* Helper to know 0.0.0 pos */}
      <Sphere args={[4, 32, 32]}>
        <meshStandardMaterial color="hotpink" />
      </Sphere>
    </Canvas>
  );
};

export default Scene;