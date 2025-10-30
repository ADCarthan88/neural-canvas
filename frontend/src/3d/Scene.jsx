import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import NeuralCanvas from './NeuralCanvas';

export default function Scene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <OrbitControls enablePan={false} />
                    <NeuralCanvas />
                </Suspense>
            </Canvas>
    );
}