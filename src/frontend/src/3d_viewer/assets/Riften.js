import React from 'react';
import { useGLTF } from '@react-three/drei';

const Riften = () => {
    const gltf = useGLTF('/assets/riften.glb');
    return <primitive object={gltf.scene} scale={1.5} />;
};

export default Riften;

useGLTF.preload('/assets/riften.glb');
