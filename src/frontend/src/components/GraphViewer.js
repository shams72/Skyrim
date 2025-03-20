import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { mapsApi } from '../api/mapsApi';
import { useAuth } from '../contexts/AuthContext';
import PathModal from './PathModal';
import NotificationSnackbar from './NotificationSnackbar';

// register fcose layout algorithm
cytoscape.use(fcose);

// cytoscape style configuration
const cytoscapeStyles = [
    {
        selector: 'node',
        style: {
            'background-color': '#666',
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '8px',
            width: 20,
            height: 20,
        },
    },
    {
        selector: 'edge',
        style: {
            width: 2,
            'line-color': 'data(color)',
            'curve-style': 'bezier',
            opacity: 0.9,
        },
    },
    {
        selector: 'edge.highlighted',
        style: {
            'line-color': '#ff0000',
            width: 5,
            opacity: 1,
            'z-index': 999,
        },
    },
];

// fcose layout configuration for graph visualization
const layoutConfig = {
    name: 'fcose',
    quality: 'proof',
    animate: false,
    randomize: true,
    fit: true,
    padding: 50,
    nodeDimensionsIncludeLabels: true,
    uniformNodeDimensions: true,
    packComponents: true,
    gravitationalConstant: 50,
    springCoeff: 0.0008,
    springLength: 100,
    repulsionStrength: 400,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
    tile: true,
    tilingPaddingVertical: 10,
    tilingPaddingHorizontal: 10,
    numIter: 2500,
    initialEnergyOnIncremental: 0.3,
    coolingFactor: 0.95,
    minTemp: 1.0,
};

// visualizes graph data using cytoscape
function GraphViewer({ currentMap }) {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const { user } = useAuth();
    const [mapData, setMapData] = useState(null);
    const [error, setError] = useState(null);
    const [pathModalOpen, setPathModalOpen] = useState(false);
    const [pathResults, setPathResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [shouldVisualize, setShouldVisualize] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // highlights path on the graph
    const highlightPath = (path) => {
        if (!cyRef.current) return;

        cyRef.current.elements().removeClass('highlighted');

        for (let i = 0; i < path.length - 1; i++) {
            const edge = cyRef.current.edges().filter((edge) => {
                const source = edge.source().id();
                const target = edge.target().id();
                return (
                    (source === path[i] && target === path[i + 1]) ||
                    (source === path[i + 1] && target === path[i])
                );
            });
            edge.addClass('highlighted');
        }
    };

    // handles pathfinding between cities
    const handlePathFind = async (startCity, endCity) => {
        try {
            setLoading(true);
            const mapNumber = parseInt(currentMap);
            const mapName =
                currentMap === 'skyrim' ? 'Skyrim' : `map_${currentMap}`;

            const response =
                mapNumber === 50000
                    ? await mapsApi.getRoutesFromMapStream(
                          startCity,
                          endCity,
                          user,
                          mapName
                      )
                    : await mapsApi.getRoutesFromMap(
                          startCity,
                          endCity,
                          user,
                          mapName
                      );

            if (cyRef.current && shouldVisualize) {
                highlightPath(response.optimalPath);
            }

            setSnackbarMessage(
                `Path found! Optimal: ${response.optimalPath.length - 1} steps, Alternative: ${response.alternativePath.length - 1} steps`
            );
            setSnackbarOpen(true);

            return response;
        } catch (error) {
            console.error('Error in pathfinding:', error);
            setError('Failed to find path between cities');
        } finally {
            setLoading(false);
        }
    };

    // starts navigation between selected cities
    const handleStartNavigation = async (startCity, endCity) => {
        try {
            setLoading(true);
            setPathModalOpen(true);
            const result = await handlePathFind(startCity, endCity);
            if (result?.optimalPath) {
                setPathResults(result);
            }
        } finally {
            setLoading(false);
        }
    };

    // stops navigation and clears paths
    const handleStopNavigation = () => {
        if (cyRef.current) {
            cyRef.current.elements().removeClass('highlighted');
        }
        setPathResults(null);
        setPathModalOpen(false);
    };

    // fetches and processes map data
    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const mapNumber = parseInt(currentMap);
                if (mapNumber && mapNumber > 100) {
                    setError(
                        'Graph visualization is disabled for maps larger than 100 nodes to maintain performance.'
                    );
                    setMapData(null);
                    setShouldVisualize(false);
                    return;
                }
                setShouldVisualize(true);

                const mapName =
                    currentMap === 'skyrim' ? 'Skyrim' : `map_${currentMap}`;
                const response = await mapsApi.getMapDataByName(mapName);

                if (response?.length > 0) {
                    setMapData(response[0]);
                    setError(null);
                } else {
                    setError('Map data not available');
                    setMapData(null);
                }
            } catch (err) {
                console.error('Error fetching map data:', err);
                setError('Failed to load map data');
                setMapData(null);
            }
        };

        fetchMapData();
    }, [currentMap]);

    // initializes cytoscape graph
    useEffect(() => {
        if (!mapData || !containerRef.current) return;

        // generate unique colors for edges
        const generateColor = (index) => {
            const hue = (index * 137.508) % 360;
            return `hsl(${hue}, 65%, 35%)`;
        };

        // remove duplicate connections and self-loops
        const uniqueConnections = mapData.connections.reduce((acc, conn) => {
            if (conn.parent === conn.child) return acc;
            const key = [conn.parent, conn.child].sort().join('-');
            if (!acc.has(key)) acc.set(key, conn);
            return acc;
        }, new Map());

        const elements = {
            nodes: mapData.cities.map((city) => ({
                data: { id: city.name, label: city.name },
                position: { x: city.positionX, y: city.positionY },
            })),
            edges: Array.from(uniqueConnections.values()).map(
                (conn, index) => ({
                    data: {
                        id: `e${index}`,
                        source: conn.parent,
                        target: conn.child,
                        color: generateColor(index),
                    },
                })
            ),
        };

        cyRef.current = cytoscape({
            container: containerRef.current,
            elements,
            style: cytoscapeStyles,
            layout: layoutConfig,
            wheelSensitivity: 0.2,
        });

        cyRef.current.on('tap', 'node', (evt) => {
            const node = evt.target;
            cyRef.current.zoom({ level: 2, position: node.position() });
        });

        return () => {
            if (cyRef.current) cyRef.current.destroy();
        };
    }, [mapData]);

    if (error) {
        return (
            <div className="flex justify-center items-center p-4 w-full h-full bg-white">
                <p className="text-sm text-center text-gray-600">{error}</p>
            </div>
        );
    }

    if (!mapData) {
        return (
            <div className="flex justify-center items-center w-full h-full bg-white">
                <p>Loading map data...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-white">
            {shouldVisualize ? (
                <div ref={containerRef} className="absolute inset-0" />
            ) : null}
            {pathResults && (
                <PathModal
                    open={pathModalOpen}
                    onClose={() => setPathModalOpen(false)}
                    optimalPath={pathResults.optimalPath}
                    alternativePath={pathResults.alternativePath}
                    loading={loading}
                    currentMap={currentMap}
                />
            )}
            <NotificationSnackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity="success"
            />
        </div>
    );
}

export default GraphViewer;
