import React from 'react';
import { Text, Billboard } from '@react-three/drei';
import FloatingIcon from './FloatingIcon';

// floating marker for map locations
const LocationMarker = ({ position, name, image, onClick, isSelected }) => {
    return (
        <group
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
        >
            <FloatingIcon
                position={[0, 0, 0]}
                image={image}
                scale={isSelected ? 1.2 : 1}
            />
            <Billboard>
                <Text
                    position={[0, -1, 0]}
                    fontSize={0.5}
                    color={isSelected ? '#00ff00' : 'white'}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="black"
                >
                    {name}
                </Text>
            </Billboard>
        </group>
    );
};

export default LocationMarker;
