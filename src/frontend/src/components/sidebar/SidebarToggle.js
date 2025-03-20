import React from 'react';
import PropTypes from 'prop-types';

// toggles sidebar visibility
const SidebarToggle = ({ isCollapsed, onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-4 right-[-12px] w-8 h-8 bg-gray-700 rounded-full text-white flex items-center justify-center hover:bg-gray-600"
        aria-label={isCollapsed ? 'expand sidebar' : 'collapse sidebar'}
    >
        {isCollapsed ? '>' : '<'}
    </button>
);

SidebarToggle.propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default SidebarToggle;
