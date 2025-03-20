// provides action buttons for toggling graph, tutorial, and authentication
import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';

// action buttons for graph toggle, tutorial, login/logout
const SidebarActions = ({
    onToggleConnections,
    onOpenTutorial,
    onOpenLogin,
    onOpenDistanceData,
    user,
    onLogout,
    currentMap,
}) => {
    const isSkyrimMap = currentMap === 'skyrim';
    const disabledTooltip = 'Not available for this map';

    const ActionButton = ({
        onClick,
        disabled,
        tooltip,
        children,
        className,
    }) => (
        <Tooltip title={disabled ? disabledTooltip : ''} arrow>
            <span className="flex-grow">
                <button
                    className={`w-full px-2 py-1 text-sm rounded focus:outline-none ${
                        disabled
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : className
                    }`}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {children}
                </button>
            </span>
        </Tooltip>
    );

    return (
        <div className="flex flex-wrap gap-2 justify-start items-center px-10 mb-4">
            <ActionButton
                onClick={onToggleConnections}
                disabled={!isSkyrimMap}
                className="bg-slate-100 hover:bg-slate-300"
                tooltip={disabledTooltip}
            >
                Toggle Graph
            </ActionButton>

            <ActionButton
                onClick={onOpenTutorial}
                disabled={!isSkyrimMap}
                className="bg-slate-100 hover:bg-slate-300"
                tooltip={disabledTooltip}
            >
                How do I use this?
            </ActionButton>

            <ActionButton
                onClick={onOpenDistanceData}
                disabled={!isSkyrimMap}
                className="bg-slate-100 hover:bg-slate-300"
                tooltip={disabledTooltip}
            >
                View Weights
            </ActionButton>

            {user ? (
                <button
                    className="flex-grow basis-[30%] px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none"
                    onClick={onLogout}
                >
                    Logout
                </button>
            ) : (
                <button
                    className="flex-grow basis-[30%] px-2 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                    onClick={onOpenLogin}
                >
                    Login
                </button>
            )}
        </div>
    );
};

SidebarActions.propTypes = {
    onToggleConnections: PropTypes.func.isRequired,
    onOpenTutorial: PropTypes.func.isRequired,
    onOpenLogin: PropTypes.func.isRequired,
    onOpenDistanceData: PropTypes.func.isRequired,
    user: PropTypes.string,
    onLogout: PropTypes.func.isRequired,
    currentMap: PropTypes.string.isRequired,
};

export default SidebarActions;
