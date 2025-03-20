// main sidebar component that handles map selection, navigation controls, and user actions
import React, { useState } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useMapViewer } from '../../contexts/MapViewerContext';
import { useAuth } from '../../contexts/AuthContext';
import TutorialModal from '../../modals/TutorialModal';
import DistanceDataModal from '../../modals/DistanceDataModal';
import SidebarToggle from './SidebarToggle';
import SidebarLogo from './SidebarLogo';
import SidebarActions from './SidebarActions';
import SidebarTabs from './SidebarTabs';
import LocationsTab from './LocationsTab';
import RouteHistoryTab from './RouteHistoryTab';
import NavigationControls from './NavigationControls';
import SidebarFooter from './SidebarFooter';
import { locations } from '../../data/locations';
import { usersApi } from '../../api/usersApi';

// available map options
const maps = [
    {
        id: 'skyrim',
        name: 'Skyrim',
        description: 'Original Skyrim map with major cities and towns',
    },
    { id: 'skyrim3d', name: '3D Skyrim', size: 0 },
    { id: '5', name: '5 Nodes', size: 5 },
    { id: '10', name: '10 Nodes', size: 10 },
    { id: '20', name: '20 Nodes', size: 20 },
    { id: '25', name: '25 Nodes', size: 25 },
    { id: '50', name: '50 Nodes', size: 50 },
    { id: '100', name: '100 Nodes', size: 100 },
    { id: '1000', name: '1000 Nodes', size: 1000 },
    { id: '10000', name: '10000 Nodes', size: 10000 },
    { id: '50000', name: '50000 Nodes', size: 50000 },
].sort((a, b) => {
    if (a.id === 'skyrim3d') return -1;
    if (b.id === 'skyrim3d') return 1;
    if (a.id === 'skyrim') return -1;
    if (b.id === 'skyrim') return 1;
    return a.size - b.size;
});

// main sidebar component
const Sidebar = ({ onOpenLogin, showSnackbar }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isDistanceDataOpen, setIsDistanceDataOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('locations');

    const {
        currentMap,
        setCurrentMap,
        toggleConnections,
        selectedPins,
        path,
        startNavigation,
        stopNavigation,
        routeHistory,
        fetchRouteHistory,
        startNavigationWithPaths,
        zoomToLocation,
    } = useMapViewer();

    const { user, logout } = useAuth();

    // handle user logout
    const handleLogout = () => {
        logout();
        showSnackbar('Logout successful!', 'success');
        onOpenLogin();
    };

    // handle route deletion
    const handleDeleteRoute = async (id) => {
        await usersApi.deleteSpecificRoute(user, id);
        await fetchRouteHistory();
    };

    // handle all routes deletion
    const handleDeleteAllRoutes = async () => {
        await usersApi.deleteAllRoutes(user);
        await fetchRouteHistory();
    };

    // handle path click from history
    const handlePathClick = (route) => {
        const mapNumber = parseInt(currentMap);

        if (currentMap === 'skyrim') {
            // for skyrim map, start navigation with the paths
            const startLocation = locations.find(
                (loc) => loc.name === route.optimalPath[0]
            );
            const endLocation = locations.find(
                (loc) =>
                    loc.name === route.optimalPath[route.optimalPath.length - 1]
            );

            if (startLocation && endLocation) {
                startNavigationWithPaths(
                    startLocation.id,
                    endLocation.id,
                    route.optimalPath,
                    route.alternativePath
                );
            }
        } else if (mapNumber > 0) {
            // for numbered maps, just show the paths in the modal
            // the path visualization is handled by the GraphViewer component
            startNavigationWithPaths(
                route.optimalPath[0],
                route.optimalPath[route.optimalPath.length - 1],
                route.optimalPath,
                route.alternativePath
            );
        }
    };

    return (
        <div className="flex fixed top-0 left-0 z-50 h-screen">
            <SidebarToggle
                isCollapsed={isCollapsed}
                onClick={() => setIsCollapsed(!isCollapsed)}
            />

            <div
                className={`h-screen p-4 bg-white border-r-2 border-gray-800 transition-all duration-300 ${
                    isCollapsed ? 'w-8' : 'w-96'
                } overflow-y-auto custom-scrollbar`}
            >
                {!isCollapsed && (
                    <div className="space-y-4">
                        <SidebarLogo />

                        <div className="mb-4">
                            <Select
                                fullWidth
                                value={currentMap}
                                onChange={(e) => setCurrentMap(e.target.value)}
                                size="small"
                                className="bg-gray-50"
                            >
                                {maps.map((map) => (
                                    <MenuItem key={map.id} value={map.id}>
                                        {map.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        {currentMap !== 'skyrim3d' && (
                            <>
                                <SidebarActions
                                    onToggleConnections={toggleConnections}
                                    onOpenTutorial={() =>
                                        setIsTutorialOpen(true)
                                    }
                                    onOpenLogin={onOpenLogin}
                                    onOpenDistanceData={() =>
                                        setIsDistanceDataOpen(true)
                                    }
                                    user={user}
                                    onLogout={handleLogout}
                                    currentMap={currentMap}
                                />

                                <hr className="my-4 border-t-2 border-gray-300" />

                                <NavigationControls
                                    onStartNavigation={startNavigation}
                                    onStopNavigation={stopNavigation}
                                    currentMap={currentMap}
                                    pins={locations}
                                    showSnackbar={showSnackbar}
                                    selectedPins={selectedPins}
                                />

                                <hr className="my-4 border-t-2 border-gray-300" />

                                <SidebarTabs
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                />

                                {activeTab === 'locations' && (
                                    <LocationsTab
                                        locations={locations}
                                        zoomToLocation={zoomToLocation}
                                        currentMap={currentMap}
                                    />
                                )}

                                {activeTab === 'history' && (
                                    <RouteHistoryTab
                                        username={user}
                                        routeHistory={routeHistory}
                                        onDeleteRoute={handleDeleteRoute}
                                        onDeleteAllRoutes={
                                            handleDeleteAllRoutes
                                        }
                                        onPathClick={handlePathClick}
                                        currentMap={currentMap}
                                        fetchRouteHistory={fetchRouteHistory}
                                    />
                                )}
                            </>
                        )}

                        {currentMap === 'skyrim3d' && (
                            <div className="p-4 text-center">
                                <p className="text-gray-600">
                                    Use mouse to rotate and zoom the 3D map.
                                    Click on locations to select start and end
                                    points.
                                </p>
                            </div>
                        )}

                        <SidebarFooter />
                    </div>
                )}
            </div>

            {isTutorialOpen && (
                <TutorialModal setIsTutorialOpen={setIsTutorialOpen} />
            )}
            {isDistanceDataOpen && (
                <DistanceDataModal
                    setIsDistanceDataOpen={setIsDistanceDataOpen}
                />
            )}
        </div>
    );
};

export default Sidebar;
