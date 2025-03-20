import React from 'react';
import { useGLTF } from '@react-three/drei';

const Whiterun = () => {
    const gltf = useGLTF('/assets/whiterun.glb'); // Path to the Whiterun GLB file

    return <primitive object={gltf.scene} scale={1.5} />;
};

export default Whiterun;

// Preload the model for optimized loading
useGLTF.preload('/assets/whiterun.glb');
