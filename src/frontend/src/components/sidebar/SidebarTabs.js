import React from 'react';
import PropTypes from 'prop-types';

// toggles between locations and history tabs
const SidebarTabs = ({ activeTab, setActiveTab }) => (
    <div className="flex mb-4 border-b border-gray-800">
        <button
            className={`flex-1 p-2 text-center ${
                activeTab === 'locations'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('locations')}
        >
            Locations
        </button>
        <button
            className={`flex-1 p-2 text-center ${
                activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('history')}
        >
            Route History
        </button>
    </div>
);

SidebarTabs.propTypes = {
    activeTab: PropTypes.oneOf(['locations', 'history']).isRequired,
    setActiveTab: PropTypes.func.isRequired,
};

export default SidebarTabs;
