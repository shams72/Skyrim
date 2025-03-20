import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const Town = ({ position, name }) => {
    const { scene } = useGLTF('/assets/town.glb');

    // clone the scene for each instance
    const clonedScene = React.useMemo(() => {
        return scene.clone(true);
    }, [scene]);

    return (
        <primitive
            object={clonedScene}
            position={position}
            scale={1.5}
            name={name}
        />
    );
};

export default Town;

useGLTF.preload('/assets/town.glb');
