// handles start/stop navigation and location selection with autocomplete
import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PathModal from '../PathModal';

// navigation controls for map pathfinding
const NavigationControls = ({
    onStartNavigation,
    onStopNavigation,
    currentMap,
    pins = [],
    showSnackbar,
    selectedPins = [],
}) => {
    const [startPin, setStartPin] = useState('');
    const [destinationPin, setDestinationPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [pathResults, setPathResults] = useState(null);
    const [pathModalOpen, setPathModalOpen] = useState(false);
    const [error, setError] = useState(null);

    // determine if we're using a numbered map
    const isNumberedMap = !isNaN(parseInt(currentMap));

    // smart suggestion generator for numbered maps
    const getNumberedMapSuggestions = useCallback(
        (inputValue) => {
            if (!inputValue || !isNumberedMap) return [];
            const mapSize = parseInt(currentMap);

            // If they're typing the "City_" prefix
            if (inputValue.toLowerCase().startsWith('c')) {
                if (inputValue.length <= 5) {
                    // Show first few cities if they're still typing "City_"
                    return Array.from({ length: 10 }, (_, i) => `City_${i}`);
                }
                // If they've typed a number after "City_"
                const numStr = inputValue.split('_')[1];
                if (numStr) {
                    const num = parseInt(numStr);
                    if (!isNaN(num)) {
                        // Generate suggestions around the typed number
                        const suggestions = [];
                        for (
                            let i = Math.max(0, num - 5);
                            i < Math.min(mapSize, num + 5);
                            i++
                        ) {
                            suggestions.push(`City_${i}`);
                        }
                        return suggestions;
                    }
                }
            }

            // If they're typing just a number
            const num = parseInt(inputValue);
            if (!isNaN(num)) {
                const suggestions = [];
                for (
                    let i = Math.max(0, num - 5);
                    i < Math.min(mapSize, num + 5);
                    i++
                ) {
                    suggestions.push(`City_${i}`);
                }
                return suggestions;
            }

            return [];
        },
        [currentMap, isNumberedMap]
    );

    // filter options based on input
    const filterOptions = (options, { inputValue }) => {
        if (isNumberedMap) {
            return getNumberedMapSuggestions(inputValue);
        }

        // For Skyrim map, use normal filtering
        return options.filter((option) =>
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    // generate city options based on map type
    const cityOptions = React.useMemo(() => {
        if (isNumberedMap) {
            // For numbered maps, we'll generate suggestions dynamically
            // Just return a small initial set
            return Array.from({ length: 10 }, (_, i) => `City_${i}`);
        }
        return pins.map((pin) => pin.name);
    }, [currentMap, pins, isNumberedMap]);

    // update fields when pins are selected on map
    useEffect(() => {
        if (currentMap === 'skyrim' && selectedPins.length > 0) {
            const selectedLocations = selectedPins
                .map((pinId) => pins.find((pin) => pin.id === pinId)?.name)
                .filter(Boolean);

            if (selectedLocations[0]) setStartPin(selectedLocations[0]);
            if (selectedLocations[1]) setDestinationPin(selectedLocations[1]);
        }
    }, [selectedPins, pins, currentMap]);

    // handle navigation start
    const handleStartClick = async () => {
        if (!startPin || !destinationPin) return;

        setLoading(true);
        setError(null);
        setPathModalOpen(false);
        setPathResults(null);

        try {
            if (isNumberedMap) {
                if (parseInt(currentMap) >= 1000) {
                    showSnackbar(
                        `Finding path in ${currentMap}-node map. This might take a while...`,
                        'info'
                    );
                }

                const result = await onStartNavigation(
                    startPin,
                    destinationPin
                );
                if (result?.optimalPath) {
                    setPathResults(result);
                    setPathModalOpen(true);
                }
            } else {
                const startPinId = pins.find(
                    (pin) => pin.name === startPin
                )?.id;
                const destinationPinId = pins.find(
                    (pin) => pin.name === destinationPin
                )?.id;

                if (!startPinId || !destinationPinId) {
                    throw new Error('Invalid start or destination location');
                }

                await onStartNavigation(startPinId, destinationPinId, pins);
            }
        } catch (err) {
            setError(err.message);
            setPathModalOpen(false);
            setPathResults(null);

            // Check if it's a 500 error (no alternative path)
            if (err.response?.status === 500) {
                showSnackbar(
                    'No alternative path found between these locations',
                    'warning'
                );
            } else {
                showSnackbar(
                    err.message || 'An error occurred while finding the path',
                    'error'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // reset state when map changes
    useEffect(() => {
        setStartPin('');
        setDestinationPin('');
        setPathResults(null);
        setPathModalOpen(false);
        setError(null);
    }, [currentMap]);

    return (
        <div className="flex flex-col p-4 mt-4 rounded">
            {/* location inputs */}
            <div className="flex">
                <div className="flex flex-col items-center mr-4">
                    <span className="w-4 h-4 rounded-full border-2 border-gray-600" />
                    <div className="flex-grow my-2 w-px border-l-2 border-gray-500 border-dotted" />
                    <LocationOnIcon className="text-red-500" />
                </div>
                <div className="flex flex-col flex-grow space-y-4">
                    <Autocomplete
                        options={cityOptions}
                        value={startPin}
                        onChange={(_, newValue) => setStartPin(newValue || '')}
                        filterOptions={filterOptions}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Enter Start Location"
                                variant="outlined"
                                size="small"
                                fullWidth
                                error={!!error}
                            />
                        )}
                    />
                    <Autocomplete
                        options={cityOptions}
                        value={destinationPin}
                        onChange={(_, newValue) =>
                            setDestinationPin(newValue || '')
                        }
                        filterOptions={filterOptions}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Enter Destination"
                                variant="outlined"
                                size="small"
                                fullWidth
                                error={!!error}
                            />
                        )}
                    />
                </div>
            </div>

            {/* action buttons */}
            <div className="flex justify-between mt-4 space-x-2">
                <button
                    onClick={handleStartClick}
                    disabled={!startPin || !destinationPin || loading}
                    className={`
                        flex-grow basis-[45%] px-2 py-1 text-sm text-white rounded
                        flex justify-center items-center
                        ${
                            startPin && destinationPin && !loading
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {loading ? (
                        <>
                            <CircularProgress
                                size={16}
                                color="inherit"
                                className="mr-2"
                            />
                            Finding Path...
                        </>
                    ) : (
                        'Start'
                    )}
                </button>
                <button
                    onClick={onStopNavigation}
                    disabled={loading}
                    className="
                        flex-grow basis-[45%] px-2 py-1 text-sm text-white rounded
                        bg-red-500 hover:bg-red-600
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                    "
                >
                    Stop
                </button>
            </div>

            {/* path results modal for numbered maps */}
            {isNumberedMap && (
                <PathModal
                    open={pathModalOpen}
                    onClose={() => {
                        setPathModalOpen(false);
                        setPathResults(null);
                    }}
                    optimalPath={pathResults?.optimalPath || []}
                    alternativePath={pathResults?.alternativePath || []}
                    loading={loading}
                    currentMap={currentMap}
                />
            )}
        </div>
    );
};

export default NavigationControls;
