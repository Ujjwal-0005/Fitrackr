import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating particle field
const ParticleField = () => {
  const points = useRef();
  const particleCount = 2000;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FE9A00"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Animated gradient sphere
const GradientSphere = ({ position, scale, speed }) => {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 2;
      mesh.current.rotation.x += 0.001;
      mesh.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#FE9A00"
        emissive="#FE9A00"
        emissiveIntensity={0.2}
        transparent
        opacity={0.08}
        wireframe
      />
    </mesh>
  );
};

// Animated wave plane
const WavePlane = () => {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime;
      const positions = mesh.current.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5;
      }

      mesh.current.geometry.attributes.position.needsUpdate = true;
      mesh.current.rotation.z = time * 0.05;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshStandardMaterial
        color="#FE9A00"
        emissive="#FE9A00"
        emissiveIntensity={0.1}
        transparent
        opacity={0.05}
        wireframe
      />
    </mesh>
  );
};

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#FE9A00" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#FFA500" />

        <ParticleField />
        <WavePlane />
        <GradientSphere position={[5, 2, -5]} scale={2} speed={0.3} />
        <GradientSphere position={[-6, -3, -8]} scale={3} speed={0.2} />
        <GradientSphere position={[3, -2, -10]} scale={1.5} speed={0.4} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
