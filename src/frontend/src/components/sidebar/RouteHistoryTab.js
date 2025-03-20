// displays sortable and filterable history of user's navigation routes
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Typography,
} from '@mui/material';
import {
    FilterList as FilterListIcon,
    ArrowDownward as ArrowDownwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    Delete as DeleteIcon,
    DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import PathModal from '../PathModal';
import NotificationSnackbar from '../NotificationSnackbar';

// route history tab with sorting and filtering
const RouteHistoryTab = ({
    username,
    routeHistory,
    onDeleteRoute,
    onDeleteAllRoutes,
    onPathClick,
    currentMap,
    fetchRouteHistory,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [isReversed, setIsReversed] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [pathModalOpen, setPathModalOpen] = useState(false);
    const [selectedPath, setSelectedPath] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // fetch route history when map changes
    useEffect(() => {
        if (username) {
            fetchRouteHistory();
        }
    }, [username, currentMap, fetchRouteHistory]);

    const handlePathClick = (route) => {
        const mapNumber = parseInt(currentMap);

        // only show path modal for numbered maps
        if (mapNumber > 0) {
            setSelectedPath({
                optimalPath: route.optimalPath,
                alternativePath: route.alternativePath,
            });
            setPathModalOpen(true);
        }

        onPathClick(route);
    };

    const handleSortChange = (newSortBy) => {
        if (newSortBy === sortBy) {
            setIsReversed((prev) => !prev);
        } else {
            setSortBy(newSortBy);
            setIsReversed(false);
        }
        setAnchorEl(null);
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const getSortIcon = (field) =>
        field === sortBy ? (
            isReversed ? (
                <ArrowUpwardIcon fontSize="small" />
            ) : (
                <ArrowDownwardIcon fontSize="small" />
            )
        ) : null;

    const handleDeleteRoute = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await onDeleteRoute(id);
                setSnackbarMessage('Route deleted successfully');
                setSnackbarOpen(true);
            } catch (error) {
                setSnackbarMessage('Failed to delete route');
                setSnackbarOpen(true);
            }
        }
    };

    const handleClearAllRoutes = async () => {
        if (window.confirm('Are you sure you want to delete all routes?')) {
            try {
                await onDeleteAllRoutes();
                setSnackbarMessage('All routes deleted successfully');
                setSnackbarOpen(true);
            } catch (error) {
                setSnackbarMessage('Failed to delete routes');
                setSnackbarOpen(true);
            }
        }
    };

    const filteredRoutes = routeHistory
        .filter(
            (route) =>
                route.optimalPath.some((path) =>
                    path.toLowerCase().includes(searchTerm.toLowerCase())
                ) || route.timestamp.includes(searchTerm)
        )
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'start':
                    comparison = a.optimalPath[0]?.localeCompare(
                        b.optimalPath[0]
                    );
                    break;
                case 'end':
                    comparison = a.optimalPath
                        .slice(-1)[0]
                        ?.localeCompare(b.optimalPath.slice(-1)[0]);
                    break;
                case 'date':
                default:
                    comparison = new Date(b.timestamp) - new Date(a.timestamp);
                    break;
            }
            return isReversed ? -comparison : comparison;
        });

    return (
        <div>
            {/* search and sort */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search routes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 mr-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <IconButton onClick={handleMenuOpen} color="primary">
                    <FilterListIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleSortChange('date')}>
                        <ListItemIcon>{getSortIcon('date')}</ListItemIcon>
                        <Typography>Date</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('start')}>
                        <ListItemIcon>{getSortIcon('start')}</ListItemIcon>
                        <Typography>Start (A-Z)</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('end')}>
                        <ListItemIcon>{getSortIcon('end')}</ListItemIcon>
                        <Typography>End (A-Z)</Typography>
                    </MenuItem>
                </Menu>
            </div>

            {/* clear all button */}
            {routeHistory.length > 0 && (
                <div className="flex justify-end mb-4">
                    <Button
                        startIcon={<DeleteSweepIcon />}
                        variant="contained"
                        color="secondary"
                        onClick={handleClearAllRoutes}
                    >
                        Delete All
                    </Button>
                </div>
            )}

            {/* route list */}
            <div className="mt-4 space-y-4">
                {filteredRoutes.map((route) => (
                    <div
                        key={route._id}
                        className="relative p-4 bg-white rounded-lg shadow transition-shadow cursor-pointer hover:shadow-md"
                        onClick={() => handlePathClick(route)}
                    >
                        <button
                            onClick={(e) => handleDeleteRoute(route._id, e)}
                            className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-600 rounded"
                        >
                            <DeleteIcon fontSize="small" />
                        </button>
                        <div>
                            <p>
                                <strong>From:</strong> {route.optimalPath[0]}
                            </p>
                            <p>
                                <strong>To:</strong>{' '}
                                {
                                    route.optimalPath[
                                        route.optimalPath.length - 1
                                    ]
                                }
                            </p>
                            <p>
                                <strong>Date:</strong>{' '}
                                {formatRelativeTime(route.timestamp)} (
                                {new Date(route.timestamp).toLocaleDateString()}
                                )
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedPath && (
                <PathModal
                    open={pathModalOpen}
                    onClose={() => {
                        setPathModalOpen(false);
                        setSelectedPath(null);
                    }}
                    optimalPath={selectedPath.optimalPath}
                    alternativePath={selectedPath.alternativePath}
                    loading={false}
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
};

RouteHistoryTab.propTypes = {
    username: PropTypes.string,
    routeHistory: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            optimalPath: PropTypes.arrayOf(PropTypes.string).isRequired,
            alternativePath: PropTypes.arrayOf(PropTypes.string),
            timestamp: PropTypes.string.isRequired,
        })
    ).isRequired,
    onDeleteRoute: PropTypes.func.isRequired,
    onDeleteAllRoutes: PropTypes.func.isRequired,
    onPathClick: PropTypes.func.isRequired,
    currentMap: PropTypes.string.isRequired,
    fetchRouteHistory: PropTypes.func.isRequired,
};

export default RouteHistoryTab;
