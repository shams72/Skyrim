import React from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';

const FloatingIcon = ({ position, image }) => {
    const { camera } = useThree();
    const texture = useLoader(TextureLoader, image);

    return (
        <sprite position={position}>
            <spriteMaterial attach="material" map={texture} />
        </sprite>
    );
};

export default FloatingIcon;
