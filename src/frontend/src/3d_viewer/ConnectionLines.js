import React from 'react';
import { Line } from '@react-three/drei';
import { connections } from '../data/connections';

// render connection lines between locations
const ConnectionLines = ({ villages, towns, selectedPath }) => {
    // create location map
    const locationMap = new Map();

    // add cities
    const cityPositions = {
        Whiterun: [1.5216, 2.5, 2.4921],
        Markarth: [-21.36, 2.5, 1.47],
        Riften: [18.68, 4.5, 13.83],
        Solitude: [-8.28, 2.5, -10.59],
        Winterhold: [12.0, 2.5, -11.27],
        Windhelm: [14.4, 2.0, -2.15],
    };

    // populate map with all locations
    Object.entries(cityPositions).forEach(([name, pos]) =>
        locationMap.set(name, pos)
    );

    // add settlements with elevated positions
    [...towns, ...villages].forEach(({ name, position }) => {
        if (position) {
            locationMap.set(name, [
                position[0],
                position[1] + 1.5,
                position[2],
            ]);
        }
    });

    return (
        <>
            {connections.map((connection, index) => {
                const startPos = locationMap.get(connection.parent);
                const endPos = locationMap.get(connection.child);

                if (!startPos || !endPos) return null;

                const isHighlighted = selectedPath.some(
                    (path) =>
                        (path.parent === connection.parent &&
                            path.child === connection.child) ||
                        (path.parent === connection.child &&
                            path.child === connection.parent)
                );

                return (
                    <Line
                        key={`${connection.parent}-${connection.child}-${index}`}
                        points={[startPos, endPos]}
                        color={isHighlighted ? '#00ff00' : 'white'}
                        lineWidth={isHighlighted ? 2 : 1}
                        opacity={isHighlighted ? 0.8 : 0.5}
                        transparent
                    />
                );
            })}
        </>
    );
};

export default ConnectionLines;
