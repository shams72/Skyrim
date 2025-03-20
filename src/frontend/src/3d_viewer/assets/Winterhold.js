import React from 'react';
import { useGLTF } from '@react-three/drei';

const Winterhold = () => {
    const gltf = useGLTF('/assets/winterhold.glb');
    return <primitive object={gltf.scene} scale={1.5} />;
};

export default Winterhold;

useGLTF.preload('/assets/winterhold.glb');
