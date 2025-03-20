import React from 'react';
import { useGLTF } from '@react-three/drei';

const Windhelm = () => {
    const gltf = useGLTF('/assets/windhelm.glb');
    return <primitive object={gltf.scene} scale={1.5} />;
};

export default Windhelm;

useGLTF.preload('/assets/windhelm.glb');
