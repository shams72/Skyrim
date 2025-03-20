import React from 'react';
import { MenuItem, Select, Card, CardContent, CardMedia } from '@mui/material';
import { useMapViewer } from '../contexts/MapViewerContext';

// available map options
const maps = [
    {
        id: 'skyrim',
        name: 'Skyrim',
        description: 'Original Skyrim map with major cities and towns',
    },
    {
        id: 'skyrim3d',
        name: '3D Skyrim',
        description: 'Interactive 3D map of Skyrim with major cities and towns',
    },
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
    // prioritize skyrim maps, then sort by size
    if (a.id === 'skyrim') return -1;
    if (b.id === 'skyrim') return 1;
    if (a.id === 'skyrim3d') return -1;
    if (b.id === 'skyrim3d') return 1;
    return a.size - b.size;
});

// reusable map card component
const MapCard = ({ title, description, image, onClick }) => (
    <Card
        onClick={onClick}
        className="w-full transition-transform cursor-pointer hover:scale-105"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
        <CardMedia
            component="img"
            sx={{ height: 200, objectFit: 'cover' }}
            image={`${process.env.PUBLIC_URL}/${image}`}
            alt={`${title} Map`}
        />
        <CardContent sx={{ flexGrow: 1 }}>
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
    </Card>
);

function MapSelectionModal({ isOpen, onClose }) {
    const { currentMap, setCurrentMap } = useMapViewer();

    if (!isOpen) return null;

    const handleMapSelect = (mapId) => {
        setCurrentMap(mapId);
        onClose();
    };

    // get skyrim maps for featured cards
    const skyrimMaps = maps.filter((map) => map.id.includes('skyrim'));

    return (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
            <div className="relative w-[90%] max-w-4xl p-6 bg-white rounded-lg shadow-lg">
                {/* close button */}
                <button
                    onClick={onClose}
                    className="flex absolute top-2 right-2 justify-center items-center w-8 h-8 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
                    aria-label="Close"
                >
                    ✕
                </button>

                <h2 className="mb-6 text-xl font-bold text-gray-800">
                    Select Your Map
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* featured map cards */}
                    {skyrimMaps.map((map) => (
                        <MapCard
                            key={map.id}
                            title={map.name}
                            description={map.description}
                            image={`${map.id}_preview.jpg`}
                            onClick={() => handleMapSelect(map.id)}
                        />
                    ))}

                    {/* test maps dropdown */}
                    <Card className="col-span-full p-4">
                        <CardContent>
                            <h3 className="mb-4 text-lg font-bold">
                                Test Maps
                            </h3>
                            <Select
                                fullWidth
                                size="medium"
                                value={currentMap}
                                onChange={(e) =>
                                    handleMapSelect(e.target.value)
                                }
                            >
                                {maps.map((map) => (
                                    <MenuItem key={map.id} value={map.id}>
                                        {map.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default MapSelectionModal;
