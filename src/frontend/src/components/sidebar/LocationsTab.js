// displays searchable list of cities and towns with zoom functionality
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// list of locations grouped by type
const LocationList = ({ label, locations, onClick }) => (
    <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-600">{label}</h3>
        <ul className="space-y-1">
            {locations.map((location) => (
                <li
                    key={location.id}
                    className="flex items-center p-2 text-sm bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                    onClick={() => onClick(location.id)}
                >
                    {location.name}
                </li>
            ))}
        </ul>
    </div>
);

LocationList.propTypes = {
    label: PropTypes.string.isRequired,
    locations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    onClick: PropTypes.func.isRequired,
};

// locations tab with search functionality
const LocationsTab = ({ locations, zoomToLocation, currentMap }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const isNumberedMap = !isNaN(parseInt(currentMap));

    if (isNumberedMap) {
        return (
            <div className="p-4 text-center text-gray-500">
                Location search is disabled for numbered maps. Please use the
                controls at the bottom of the screen.
            </div>
        );
    }

    const filteredLocations = locations.filter((location) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const cities = filteredLocations.filter(
        (location) => location.type === 'city'
    );
    const towns = filteredLocations.filter(
        (location) => location.type === 'town'
    );

    return (
        <>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 w-full text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <h2 className="mb-2 text-lg font-semibold">Locations</h2>
            <LocationList
                label="Cities"
                locations={cities}
                onClick={zoomToLocation}
            />
            <LocationList
                label="Towns"
                locations={towns}
                onClick={zoomToLocation}
            />
        </>
    );
};

LocationsTab.propTypes = {
    locations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.oneOf(['city', 'town']).isRequired,
        })
    ).isRequired,
    zoomToLocation: PropTypes.func.isRequired,
    currentMap: PropTypes.string.isRequired,
};

export default LocationsTab;
