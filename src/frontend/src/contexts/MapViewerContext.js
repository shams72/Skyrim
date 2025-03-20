import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useCallback,
} from 'react';
import { usersApi } from '../api/usersApi';
import { useAuth } from '../contexts/AuthContext';
import { mapsApi } from '../api/mapsApi';

const MapViewerContext = createContext();

// provides map viewing and navigation functionality
export const MapViewerProvider = ({ children }) => {
    const [showConnections, setShowConnections] = useState(true);
    const [selectedPins, setSelectedPins] = useState([]);
    const [path, setPath] = useState({ optimal: [], alternative: [] });
    const [routeHistory, setRouteHistory] = useState([]);
    const [currentMap, setCurrentMap] = useState('skyrim');
    const transformWrapperRef = useRef(null);
    const { user } = useAuth();

    // toggles connection visibility
    const toggleConnections = () => setShowConnections((prev) => !prev);

    // zooms to a specific location on the map
    const zoomToLocation = (locationId) => {
        const wrapper = transformWrapperRef.current;
        if (wrapper) {
            const pinElement = document.getElementById(`pin-${locationId}`);
            if (pinElement) {
                wrapper.zoomToElement(pinElement);
            }
        }
    };

    // fetches user's route history for current map
    const fetchRouteHistory = useCallback(async () => {
        try {
            if (!user) return;
            const mapName =
                currentMap === 'skyrim'
                    ? 'Skyrim'
                    : currentMap === 'skyrim3d'
                      ? 'skyrim3d'
                      : `map_${currentMap}`;
            const response = await usersApi.sortRoutes(user, 'date', mapName);
            setRouteHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching route history:', error.message);
        }
    }, [user, currentMap]);

    // finds path between two cities
    const pathfinding = async (startCity, endCity, user) => {
        const mapName =
            currentMap === 'skyrim'
                ? 'Skyrim'
                : currentMap === 'skyrim3d'
                  ? 'skyrim3d'
                  : `map_${currentMap}`;

        try {
            const mapNumber = parseInt(currentMap);
            return mapNumber === 50000
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
        } catch (error) {
            console.error('Error in pathfinding:', error);
            throw error;
        }
    };

    // starts navigation between two locations
    const startNavigation = async (startId, endId, locations) => {
        const isNumberedMap = !isNaN(parseInt(currentMap));

        if (!user) {
            console.error(
                'User not authenticated. Please log in to start navigation.'
            );
            return;
        }

        try {
            if (currentMap === 'skyrim3d') {
                setSelectedPins([startId, endId]);
                return;
            }

            if (isNumberedMap) {
                const { optimalPath, alternativePath } = await pathfinding(
                    startId,
                    endId,
                    user
                );

                const formatPath = (path) =>
                    path?.slice(0, -1).map((loc, i) => ({
                        parent: loc,
                        child: path[i + 1],
                    })) || [];

                setPath({
                    optimal: formatPath(optimalPath),
                    alternative: formatPath(alternativePath),
                });
                setSelectedPins([startId, endId]);

                return { optimalPath, alternativePath };
            } else {
                const start = locations.find((loc) => loc.id === startId);
                const end = locations.find((loc) => loc.id === endId);

                if (!start || !end) return;

                const { optimalPath, alternativePath } = await pathfinding(
                    start.name,
                    end.name,
                    user
                );

                const formatPath = (path) =>
                    path?.slice(0, -1).map((loc, i) => ({
                        parent: loc,
                        child: path[i + 1],
                    })) || [];

                setPath({
                    optimal: formatPath(optimalPath),
                    alternative: formatPath(alternativePath),
                });
                setSelectedPins([startId, endId]);
            }

            await fetchRouteHistory();
        } catch (error) {
            console.error('Pathfinding error:', error);
            setPath({ optimal: [], alternative: [] });
            throw error;
        }
    };

    // starts navigation with pre-calculated paths
    const startNavigationWithPaths = (
        startId,
        endId,
        optimalPath,
        alternativePath
    ) => {
        const formatPath = (path) =>
            path?.slice(0, -1).map((loc, i) => ({
                parent: path[i],
                child: path[i + 1],
            })) || [];

        setPath({
            optimal: formatPath(optimalPath),
            alternative: formatPath(alternativePath),
        });
        setSelectedPins([startId, endId]);
    };

    // stops navigation and clears paths
    const stopNavigation = () => {
        setSelectedPins([]);
        setPath({ optimal: [], alternative: [] });
    };

    // handles map change and resets state
    const handleMapChange = (newMap) => {
        setCurrentMap(newMap);
        setPath({ optimal: [], alternative: [] });
        setSelectedPins([]);
    };

    return (
        <MapViewerContext.Provider
            value={{
                showConnections,
                toggleConnections,
                zoomToLocation,
                selectedPins,
                setSelectedPins,
                path,
                setPath,
                startNavigation,
                startNavigationWithPaths,
                stopNavigation,
                routeHistory,
                fetchRouteHistory,
                transformWrapperRef,
                currentMap,
                setCurrentMap: handleMapChange,
            }}
        >
            {children}
        </MapViewerContext.Provider>
    );
};

export const useMapViewer = () => useContext(MapViewerContext);
