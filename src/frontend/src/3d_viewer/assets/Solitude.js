import React from 'react';
import { useGLTF } from '@react-three/drei';

const Solitude = () => {
    const gltf = useGLTF('/assets/solitude.glb');
    return <primitive object={gltf.scene} scale={1.5} />;
};

export default Solitude;

useGLTF.preload('/assets/solitude.glb');
