import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef();
    const particleCount = 2000;

    // Generate random particle positions
    const positions = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return positions;
    }, []);

    // Animate particles
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.05;
            ref.current.rotation.y = state.clock.elapsedTime * 0.075;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#FE9A00"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

function PulsingRings() {
    const ring1 = useRef();
    const ring2 = useRef();
    const ring3 = useRef();

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (ring1.current) {
            ring1.current.scale.x = ring1.current.scale.y = 1 + Math.sin(time * 0.5) * 0.1;
            ring1.current.rotation.z = time * 0.2;
        }

        if (ring2.current) {
            ring2.current.scale.x = ring2.current.scale.y = 1 + Math.sin(time * 0.7 + 1) * 0.15;
            ring2.current.rotation.z = -time * 0.15;
        }

        if (ring3.current) {
            ring3.current.scale.x = ring3.current.scale.y = 1 + Math.sin(time * 0.3 + 2) * 0.12;
            ring3.current.rotation.z = time * 0.1;
        }
    });

    return (
        <group>
            <mesh ref={ring1} position={[0, 0, -10]}>
                <ringGeometry args={[3, 3.1, 64]} />
                <meshBasicMaterial color="#FE9A00" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring2} position={[0, 0, -15]}>
                <ringGeometry args={[5, 5.15, 64]} />
                <meshBasicMaterial color="#FE9A00" transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring3} position={[0, 0, -20]}>
                <ringGeometry args={[7, 7.2, 64]} />
                <meshBasicMaterial color="#FE9A00" transparent opacity={0.08} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

const PRCanvas = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <ParticleField />
                <PulsingRings />
            </Canvas>
        </div>
    );
};

export default PRCanvas;
