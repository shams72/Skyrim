import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import GLBViewer from './GLBViewer.js';
import LocationMarker from './LocationMarker';
import ConnectionLines from './ConnectionLines';
import { connections } from '../data/connections.js';

// city imports
import Whiterun from './assets/Whiterun.js';
import Markarth from './assets/Markarth.js';
import Riften from './assets/Riften.js';
import Solitude from './assets/Solitude.js';
import Winterhold from './assets/Winterhold.js';
import Windhelm from './assets/Windhelm.js';
import Village from './assets/Village.js';
import Town from './assets/Town.js';

// location data
const villages = [
    { name: 'Karthwasten', position: [-16.91, 1.1, -2.75] },
    { name: 'Dragon Bridge', position: [-13.253, 0.44, -8] },
    { name: 'Rorikstead', position: [-11.26, 1.25, 1.02] },
    { name: 'Ivarstead', position: [7.53, 2.8, 9.38] },
    { name: "Shor's Stone", position: [17.47, 2.5, 9.21] },
];

const towns = [
    { name: 'Morthal', position: [-6, 0.25, -5.79] },
    { name: 'Falkreath', position: [-4.94, 1.35, 12.26] },
    { name: 'Helgen', position: [0.8, 2.5, 11.677] },
    { name: 'Riverwood', position: [1.4, 1.75, 7.4] },
    { name: 'Dawnstar', position: [2.23, 0.3, -10.37] },
];

// city positions in 3d space
const cityPositions = {
    Whiterun: [1.5216, 2.5, 2.4921],
    Markarth: [-21.36, 2.5, 1.47],
    Riften: [18.68, 4.5, 13.83],
    Solitude: [-8.28, 2.5, -10.59],
    Winterhold: [12.0, 2.5, -11.27],
    Windhelm: [14.4, 2.0, -2.15],
};

const CanvasContainer = () => {
    const [showIcons, setShowIcons] = useState(true);
    const [showLines, setShowLines] = useState(true);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [navigationPath, setNavigationPath] = useState([]);

    // handle location selection
    const handleLocationClick = (locationName) => {
        if (selectedLocations.includes(locationName)) {
            setSelectedLocations(
                selectedLocations.filter((name) => name !== locationName)
            );
        } else if (selectedLocations.length < 2) {
            setSelectedLocations([...selectedLocations, locationName]);
        }
    };

    // find shortest path between selected locations
    const findPath = () => {
        if (selectedLocations.length !== 2) return;

        const [start, end] = selectedLocations;
        console.log('finding path from:', start, 'to:', end);

        const getConnections = (location) => {
            return connections
                .filter(
                    (conn) =>
                        conn.parent === location || conn.child === location
                )
                .map((conn) => ({
                    from: conn.parent,
                    to: conn.child,
                    dist: conn.dist,
                }));
        };

        const findShortestPath = (start, end) => {
            const distances = {};
            const previous = {};
            const unvisited = new Set();

            connections.forEach((conn) => {
                unvisited.add(conn.parent);
                unvisited.add(conn.child);
                distances[conn.parent] = Infinity;
                distances[conn.child] = Infinity;
            });
            distances[start] = 0;

            while (unvisited.size > 0) {
                let current = Array.from(unvisited).reduce((closest, node) =>
                    distances[node] < distances[closest] ? node : closest
                );

                if (current === end) break;
                unvisited.delete(current);

                const currentConnections = getConnections(current);
                for (let conn of currentConnections) {
                    const neighbor =
                        conn.from === current ? conn.to : conn.from;
                    if (!unvisited.has(neighbor)) continue;

                    const newDist = distances[current] + conn.dist;
                    if (newDist < distances[neighbor]) {
                        distances[neighbor] = newDist;
                        previous[neighbor] = current;
                    }
                }
            }

            const path = [];
            let current = end;
            while (current && current !== start) {
                const prev = previous[current];
                if (!prev) break;
                path.unshift({ parent: prev, child: current });
                current = prev;
            }

            return path;
        };

        const path = findShortestPath(start, end);
        console.log('found path:', path);
        setNavigationPath(path);
    };

    // render city marker component
    const renderCityMarker = (name, position) => (
        <LocationMarker
            key={`marker-${name}`}
            position={position}
            name={name}
            image={`./shields/${name.toLowerCase()}shield.png`}
            onClick={() => handleLocationClick(name)}
            isSelected={selectedLocations.includes(name)}
        />
    );

    // render settlement marker component
    const renderSettlementMarker = (settlement, type) => (
        <LocationMarker
            key={`marker-${settlement.name}`}
            position={[
                settlement.position[0],
                settlement.position[1] + 1.5,
                settlement.position[2],
            ]}
            name={settlement.name}
            image="./shields/villageshield.png"
            onClick={() => handleLocationClick(settlement.name)}
            isSelected={selectedLocations.includes(settlement.name)}
        />
    );

    return (
        <div className="relative w-full h-full">
            <div className="flex absolute top-4 right-4 z-10 gap-2">
                <button
                    onClick={() => setShowIcons(!showIcons)}
                    className="px-4 py-2 text-white bg-gray-800 rounded-md transition-colors duration-200 hover:bg-gray-700"
                >
                    {showIcons ? 'Hide Icons' : 'Show Icons'}
                </button>
                <button
                    onClick={() => setShowLines(!showLines)}
                    className="px-4 py-2 text-white bg-gray-800 rounded-md transition-colors duration-200 hover:bg-gray-700"
                >
                    {showLines ? 'Hide Lines' : 'Show Lines'}
                </button>
                <button
                    onClick={findPath}
                    disabled={selectedLocations.length !== 2}
                    className={`px-4 py-2 text-white rounded-md transition-colors duration-200 
            ${
                selectedLocations.length === 2
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-500 cursor-not-allowed'
            }`}
                >
                    Navigate
                </button>
            </div>

            {selectedLocations.length > 0 && (
                <div className="absolute right-4 top-16 z-10 p-2 text-white bg-gray-800 rounded-md">
                    {selectedLocations.map((loc, index) => (
                        <div key={loc}>
                            {index === 0 ? 'From: ' : 'To: '}
                            {loc}
                        </div>
                    ))}
                </div>
            )}

            <Canvas
                camera={{ position: [0, 10, 0], fov: 50 }}
                className="w-full h-full"
            >
                <color attach="background" args={['#87CEEB']} />
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[10, 10, 10]}
                    intensity={2.5}
                    castShadow
                />

                <GLBViewer />

                {/* cities */}
                <Whiterun />
                <Markarth />
                <Riften />
                <Solitude />
                <Winterhold />
                <Windhelm />

                {/* connections */}
                {showLines && (
                    <ConnectionLines
                        villages={villages}
                        towns={towns}
                        selectedPath={navigationPath}
                    />
                )}

                {/* settlements */}
                {towns.map(
                    (town) =>
                        town.position && (
                            <Town
                                key={town.name}
                                position={town.position}
                                name={town.name}
                            />
                        )
                )}
                {villages.map(
                    (village) =>
                        village.position && (
                            <Village
                                key={village.name}
                                position={village.position}
                                name={village.name}
                            />
                        )
                )}

                {/* markers */}
                {showIcons && (
                    <>
                        {Object.entries(cityPositions).map(([name, position]) =>
                            renderCityMarker(name, position)
                        )}
                        {villages.map(
                            (village) =>
                                village.position &&
                                renderSettlementMarker(village, 'village')
                        )}
                        {towns.map(
                            (town) =>
                                town.position &&
                                renderSettlementMarker(town, 'town')
                        )}
                    </>
                )}

                <MapControls
                    maxPolarAngle={Math.PI / 3}
                    minPolarAngle={0}
                    enablePan={true}
                    enableRotate={true}
                    enableZoom={true}
                    panSpeed={1}
                    rotateSpeed={1}
                    target={[0, 0, 0]}
                />
            </Canvas>
        </div>
    );
};

export default CanvasContainer;
