import React from 'react';
import { useGLTF } from '@react-three/drei';

const Markarth = () => {
    const gltf = useGLTF('/assets/markath.glb');
    return <primitive object={gltf.scene} scale={1.5} />;
};

export default Markarth;

useGLTF.preload('/assets/markath.glb');
