import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';

function Model({ gesture, ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-character/model.gltf');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions[gesture]) {
      actions[gesture].reset().play();
    } else {
      // Play a default animation if the gesture is not found
      actions['idle']?.reset().play();
    }
  }, [gesture, actions]);

  return <primitive ref={group} object={scene} {...props} />;
}

export default function ASLAvatar({ gesture }) {
  return (
    <Canvas style={{ background: '#171717' }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Model gesture={gesture} />
      <OrbitControls />
    </Canvas>
  );
}
