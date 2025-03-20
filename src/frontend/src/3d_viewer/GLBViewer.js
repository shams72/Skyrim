import React from 'react';
import { useGLTF } from '@react-three/drei';

// load and display 3d model
const GLBViewer = () => {
    const gltf = useGLTF('/assets/skyrim.glb');

    // handle map click events
    const handlePointerDown = (event) => {
        const { point } = event;
        console.log('Clicked location:', point);
    };

    return (
        <primitive
            object={gltf.scene}
            scale={1.5}
            onPointerDown={handlePointerDown}
        />
    );
};

export default GLBViewer;

// preload the model for optimized loading
useGLTF.preload('/assets/skyrim.glb');
