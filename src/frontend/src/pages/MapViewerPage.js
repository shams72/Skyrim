import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { locations } from '../data/locations';
import { connections } from '../data/connections';
import { useMapViewer } from '../contexts/MapViewerContext';
import { useAuth } from '../contexts/AuthContext';
import GraphViewer from '../components/GraphViewer';
import CanvasContainer from '../3d_viewer/CanvasContainer';
import { mapsApi } from '../api/mapsApi';

// finds location by name in pins array
const getLocationByName = (pins, name) => pins.find((pin) => pin.name === name);

// main map viewer component
const MapViewerPage = () => {
    const {
        selectedPins,
        setSelectedPins,
        path,
        showConnections,
        transformWrapperRef,
        currentMap,
        setCurrentMap,
    } = useMapViewer();
    const { user } = useAuth();

    const [pins, setPins] = useState([]);
    const [mapData, setMapData] = useState(null);
    const [error, setError] = useState(null);
    const yOffSet = 0.7;

    // handles pin selection
    const handlePinClick = (pinId) => {
        setSelectedPins((prev) => {
            if (prev.includes(pinId)) return prev.filter((id) => id !== pinId);
            if (prev.length < 2) return [...prev, pinId];
            return [pinId];
        });
    };

    // loads map data based on current map selection
    useEffect(() => {
        const loadMap = async () => {
            setError(null);

            try {
                if (currentMap === 'skyrim3d') {
                    setPins(locations);
                    return;
                }

                if (currentMap === 'skyrim') {
                    setPins(locations);
                    return;
                }

                const mapNumber = parseInt(currentMap);
                if (isNaN(mapNumber)) {
                    setError('Invalid map selection');
                    return;
                }

                if (mapNumber > 100) {
                    setMapData({
                        cities: [],
                        mapsizeX: 10000,
                        mapsizeY: 10000,
                    });
                    return;
                }

                const mapName = `map_${currentMap}`;
                const response = await mapsApi.getMapDataByName(mapName);

                if (
                    !response ||
                    !Array.isArray(response) ||
                    !response[0]?.cities
                ) {
                    setError('Map data not available');
                    return;
                }

                const data = response[0];
                setMapData(data);
                setPins(data.cities);
            } catch (error) {
                console.error('Error loading map:', error);
                setError('Error loading map data');
            }
        };

        loadMap();
    }, [currentMap]);

    if (currentMap === 'skyrim3d') {
        return (
            <div className="w-full h-full">
                <CanvasContainer />
            </div>
        );
    }

    if (currentMap === 'skyrim') {
        return (
            <div className="flex overflow-hidden justify-center items-center w-full h-full bg-gray-900">
                <TransformWrapper
                    ref={transformWrapperRef}
                    limitToBounds={false}
                    defaultScale={1}
                    maxScale={5}
                    minScale={0.5}
                >
                    <TransformComponent>
                        <div className="relative w-full h-full">
                            <img
                                src={`${process.env.PUBLIC_URL}/skyrim_map.jpg`}
                                alt="Skyrim Map"
                                className="block max-w-full max-h-full select-none"
                            />
                            {showConnections && (
                                <ConnectionsRenderer
                                    connections={connections}
                                    pins={pins}
                                    yOffSet={yOffSet}
                                />
                            )}
                            <PathRenderer
                                paths={path}
                                pins={pins}
                                yOffSet={yOffSet}
                            />
                            <PinRenderer
                                pins={pins}
                                paths={path}
                                selectedPins={selectedPins}
                                onPinClick={handlePinClick}
                            />
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center w-full h-full bg-gray-900">
                <div className="p-6 text-center bg-white rounded-lg shadow-lg">
                    <h2 className="mb-4 text-xl font-bold text-red-600">
                        Error
                    </h2>
                    <p className="mb-4 text-gray-700">{error}</p>
                    <button
                        onClick={() => setCurrentMap('skyrim')}
                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Return to Skyrim Map
                    </button>
                </div>
            </div>
        );
    }

    if (mapData && !isNaN(parseInt(currentMap))) {
        return (
            <div className="relative w-full h-full bg-white">
                {parseInt(currentMap) > 100 ? (
                    <div className="flex absolute inset-0 justify-center items-center">
                        <div className="text-2xl text-center text-gray-900">
                            This map is too large to visualize. You can still
                            use the pathfinding feature below.
                        </div>
                    </div>
                ) : (
                    <GraphViewer currentMap={currentMap} />
                )}
            </div>
        );
    }

    return (
        <div className="flex overflow-hidden justify-center items-center w-full h-full bg-gray-900">
            <TransformWrapper
                ref={transformWrapperRef}
                limitToBounds={false}
                defaultScale={1}
                maxScale={5}
                minScale={0.5}
            >
                <TransformComponent>
                    <div className="relative w-full h-full">
                        <img
                            src={`${process.env.PUBLIC_URL}/skyrim_map.jpg`}
                            alt="Skyrim Map"
                            className="block max-w-full max-h-full select-none"
                        />
                        {showConnections && (
                            <ConnectionsRenderer
                                connections={connections}
                                pins={pins}
                                yOffSet={yOffSet}
                            />
                        )}
                        <PathRenderer
                            paths={path}
                            pins={pins}
                            yOffSet={yOffSet}
                        />
                        <PinRenderer
                            pins={pins}
                            paths={path}
                            selectedPins={selectedPins}
                            onPinClick={handlePinClick}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

// renders connections between map locations
const ConnectionsRenderer = ({ connections, pins, yOffSet }) => (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {connections.map(({ parent, child }, index) => {
            const parentLocation = getLocationByName(pins, parent);
            const childLocation = getLocationByName(pins, child);
            if (!parentLocation || !childLocation) return null;

            return (
                <line
                    key={index}
                    x1={`${parentLocation.x}%`}
                    y1={`${parentLocation.y - yOffSet}%`}
                    x2={`${childLocation.x}%`}
                    y2={`${childLocation.y - yOffSet}%`}
                    stroke="black"
                    strokeWidth="2"
                />
            );
        })}
    </svg>
);

// renders path lines on the map
const PathRenderer = ({ paths, pins, yOffSet }) => (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {paths.optimal.map(({ parent, child }, index) => {
            const parentLocation = getLocationByName(pins, parent);
            const childLocation = getLocationByName(pins, child);
            if (!parentLocation || !childLocation) return null;

            return (
                <React.Fragment key={`optimal-${index}`}>
                    <line
                        x1={`${parentLocation.x}%`}
                        y1={`${parentLocation.y - yOffSet}%`}
                        x2={`${childLocation.x}%`}
                        y2={`${childLocation.y - yOffSet}%`}
                        stroke="darkgreen"
                        strokeWidth="6"
                    />
                    <line
                        x1={`${parentLocation.x}%`}
                        y1={`${parentLocation.y - yOffSet}%`}
                        x2={`${childLocation.x}%`}
                        y2={`${childLocation.y - yOffSet}%`}
                        stroke="lightgreen"
                        strokeWidth="4"
                    />
                </React.Fragment>
            );
        })}
        {paths.alternative.map(({ parent, child }, index) => {
            const parentLocation = getLocationByName(pins, parent);
            const childLocation = getLocationByName(pins, child);
            if (!parentLocation || !childLocation) return null;

            return (
                <React.Fragment key={`alternative-${index}`}>
                    <line
                        x1={`${parentLocation.x}%`}
                        y1={`${parentLocation.y - yOffSet}%`}
                        x2={`${childLocation.x}%`}
                        y2={`${childLocation.y - yOffSet}%`}
                        stroke="goldenrod"
                        strokeWidth="4"
                        strokeDasharray="8,8"
                    />
                </React.Fragment>
            );
        })}
    </svg>
);

// renders location pins on the map
const PinRenderer = ({ pins, paths, selectedPins, onPinClick }) => (
    <>
        {pins.map((pin) => {
            const isInOptimalPath = paths.optimal.some(
                ({ parent, child }) => parent === pin.name || child === pin.name
            );
            const isInAlternativePath = paths.alternative.some(
                ({ parent, child }) => parent === pin.name || child === pin.name
            );
            const isSelected = selectedPins.includes(pin.id);

            return (
                <div
                    key={pin.id}
                    id={`pin-${pin.id}`}
                    className="flex absolute flex-col items-center"
                    style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                    }}
                    onClick={() => onPinClick(pin.id)}
                >
                    <div
                        className={`w-4 h-4 rounded-full ${
                            isSelected || isInOptimalPath
                                ? 'bg-green-500'
                                : isInAlternativePath
                                  ? 'bg-yellow-400'
                                  : 'bg-red-500'
                        }`}
                    />
                    <span className="px-1 mt-1 text-xs text-white bg-black bg-opacity-55">
                        {pin.name}
                    </span>
                </div>
            );
        })}
    </>
);

export default MapViewerPage;
