const userModel = require('../models/userModel');
const routeModel = require('../models/routeModel');
const logger = require('../../loggerSetup');

const createUser = async (req, res) => {
    try {
        const user = req.body.name;

        logger.info({
            action: 'user_creation_initiated',
            method: req.method,
            route: req.originalUrl,
            message: 'Starting user creation process',
            timestamp: new Date().toISOString(),
        });
        const existingEntry = await userModel.findOne({
            name: user,
        });

        if (existingEntry) {
            logger.warn({
                action: 'user_creation_conflict',
                method: req.method,
                route: req.originalUrl,
                message: 'User with this name already exists',
                timestamp: new Date().toISOString(),
            });

            return res.status(409).json({
                data: user,
                message: 'user with this name already exists',
            });
        }

        logger.info({
            action: 'user_creation_success',
            method: req.method,
            route: req.originalUrl,
            message: 'User saved successfully',
            timestamp: new Date().toISOString(),
        });

        const userEntry = new userModel({ name: user });
        await userEntry.save();

        return res
            .status(200)
            .json({ data: user, message: 'user saved successfuly' });
    } catch (error) {
        logger.error({
            action: 'user_creation_error',
            message: 'Error saving route',
            method: req.method,
            route: req.originalUrl,
            error: error.message,
        });

        return res.status(500).json({
            message: 'Error saving route',
            error: error.message,
        });
    }
};

// verifies if user exists (by name) and returns a success message
const login = async (req, res) => {
    try {
        const user = req.body.name;

        logger.info({
            action: 'user_login_attempt',
            method: req.method,
            route: req.originalUrl,
            message: 'Login attempt started',
            timestamp: new Date().toISOString(),
        });

        // check if user exists in db
        const existingUser = await userModel.findOne({ name: user });

        if (!existingUser) {
            logger.warn({
                action: 'user_login_failure',
                method: req.method,
                route: req.originalUrl,
                message: 'User not found',
                timestamp: new Date().toISOString(),
            });

            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        logger.info({
            action: 'user_login_success',
            method: req.method,
            route: req.originalUrl,
            message: 'User login successful',
            timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
            message: 'User exists, login successful',
            success: true,
            data: existingUser.name,
        });
    } catch (error) {
        logger.error({
            action: 'user_login_error',
            method: req.method,
            route: req.originalUrl,
            message: 'Error verifying user login',
            error: error.message,
            timestamp: new Date().toISOString(),
        });

        return res.status(500).json({
            message: 'Error verifying user login',
            success: false,
            error: error.message,
        });
    }
};

// Add route and associate with a user
const addRoutesToUser = async (req, res) => {
    const { name, optimalPath, alternativePath, mapname } = req.body;

    try {
        // Create new route document
        const newRoute = new routeModel({
            username: name,
            mapname: mapname,
            optimalPath,
            alternativePath,
        });

        // Save the route
        const savedRoute = await newRoute.save();

        // Find user and update their route history
        const user = await userModel.findOne({ name });
        if (!user) {
            // Create new user if doesn't exist
            const newUser = new userModel({
                name,
                routeHistory: [savedRoute._id],
            });
            await newUser.save();
        } else {
            // Add route to existing user's history
            user.routeHistory.push(savedRoute._id);
            await user.save();
        }

        res.status(200).json({
            message: 'Route added successfully',
            data: {
                routeHistory: user ? user.routeHistory : [savedRoute._id],
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding route',
            error: error.message,
        });
    }
};

const deleteSpecificRoute = async (req, res) => {
    try {
        const { name, routeId } = req.body;

        logger.info({
            action: 'delete_specific_route_attempt',
            method: req.method,
            route: req.originalUrl,
            message: 'Attempting to delete a specific route',
            user: name,
            timestamp: new Date().toISOString(),
        });

        if (!routeId) {
            logger.warn({
                action: 'delete_specific_route_failure',
                method: req.method,
                route: req.originalUrl,
                message: 'Route ID is missing from the request',
                user: name,
                timestamp: new Date().toISOString(),
            });

            return res.status(400).json({
                message: 'Route ID is required to delete a specific route.',
            });
        }

        const user = await userModel.findOne({ name });

        if (!user) {
            logger.warn({
                action: 'delete_specific_route_user_not_found',
                method: req.method,
                route: req.originalUrl,
                message: 'User not found',
                user: name,
                timestamp: new Date().toISOString(),
            });
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        const routeIndex = user.routeHistory.findIndex(
            (route) => route.toString() === routeId
        );

        if (routeIndex === -1) {
            logger.warn({
                action: 'delete_specific_route_not_found_in_history',
                method: req.method,
                route: req.originalUrl,
                message: "Route not found in user's history",
                user: name,
                timestamp: new Date().toISOString(),
            });
            return res.status(404).json({
                message: "Route not found in user's history.",
            });
        }

        user.routeHistory.splice(routeIndex, 1);
        await user.save();
        logger.info({
            action: 'delete_specific_route_success',
            method: req.method,
            route: req.originalUrl,
            message: 'Route deleted successfully',
            user: name,
            remainingRoutes: user.routeHistory,
            timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
            message: 'Route deleted successfully.',
            data: user.routeHistory,
        });
    } catch (error) {
        logger.error({
            action: 'delete_specific_route_error',
            method: req.method,
            route: req.originalUrl,
            message: 'Error deleting the route',
            error: error.message,
            user: req.body.name,
            routeId: req.body.routeId,
            timestamp: new Date().toISOString(),
        });

        return res.status(500).json({
            message: 'Error deleting the route.',
            error: error.message,
        });
    }
};

const deleteAllRoutes = async (req, res) => {
    try {
        const { name } = req.body;
        logger.info({
            action: 'delete_all_routes_attempt',
            method: req.method,
            route: req.originalUrl,
            message: 'Attempting to delete all routes for user',
            user: name,
            timestamp: new Date().toISOString(),
        });

        const user = await userModel.findOne({ name });

        if (!user) {
            logger.error({
                action: 'delete_all_routes_user_not_found',
                method: req.method,
                route: req.originalUrl,
                message: 'User not found',
                user: name,
                timestamp: new Date().toISOString(),
            });
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        user.routeHistory = [];
        await user.save();

        logger.info({
            action: 'delete_all_routes_success',
            method: req.method,
            route: req.originalUrl,
            message: 'All routes deleted successfully',
            user: name,
            timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
            message: 'All routes deleted successfully.',
        });
    } catch (error) {
        logger.error({
            action: 'delete_all_route_error',
            method: req.method,
            route: req.originalUrl,
            message: 'Error deleting all routes',
            error: error.message,
            user: req.body.name,
            routeId: req.body.routeId,
            timestamp: new Date().toISOString(),
        });
        return res.status(500).json({
            message: 'Error deleting all routes.',
            error: error.message,
        });
    }
};

const searchRoutes = async (req, res) => {
    try {
        const { name, search, mapname } = req.query;
        logger.info({
            action: 'search_routes_attempt',
            method: req.method,
            route: req.originalUrl,
            message: 'Attempting to search routes for user',
            user: name,
            searchTerm: search || null,
            timestamp: new Date().toISOString(),
        });

        const user = await userModel.findOne({ name }).populate('routeHistory');

        if (!user) {
            logger.warn({
                action: 'search_routes_user_not_found',
                method: req.method,
                route: req.originalUrl,
                message: 'User not found',
                user: name,
                timestamp: new Date().toISOString(),
            });

            return res.status(404).json({
                message: 'User not found.',
            });
        }

        const selectedMapHistory = [];
        for (const history of user.routeHistory) {
            if (history.mapname === mapname) {
                selectedMapHistory.push(history);
            }
        }

        let routes = selectedMapHistory;

        if (search) {
            routes = routes.filter((route) =>
                route.optimalPath.some((location) =>
                    location.toLowerCase().includes(search.toLowerCase())
                )
            );
            logger.info({
                action: 'search_routes_filter_applied',
                method: req.method,
                route: req.originalUrl,
                message: 'Search filter applied to routes',
                user: name,
                searchTerm: search,
                matchingRoutesCount: routes.length,
                timestamp: new Date().toISOString(),
            });
        }

        logger.info({
            action: 'search_routes_success',
            method: req.method,
            route: req.originalUrl,
            message: 'Route search was succesfull',
            user: name,
            timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
            data: routes,
            message:
                routes.length > 0
                    ? 'Routes retrieved successfully.'
                    : 'No matching routes found.',
        });
    } catch (error) {
        logger.error({
            action: 'search_routes_error',
            method: req.method,
            route: req.originalUrl,
            message: 'Error searching routes',
            error: error.message,
            user: req.query.name,
            timestamp: new Date().toISOString(),
        });

        return res.status(500).json({
            message: 'Error searching routes.',
            error: error.message,
        });
    }
};

const sortRoutes = async (req, res) => {
    try {
        const { name, sortBy, mapname } = req.query;
        logger.info({
            action: 'sort_routes_attempt',
            method: req.method,
            route: req.originalUrl,
            message: 'Attempting to sort routes for user',
            user: name,
            sortBy: sortBy || 'none',
            timestamp: new Date().toISOString(),
        });

        const user = await userModel.findOne({ name }).populate('routeHistory');
        // istanbul ignore next
        if (!user) {
            logger.warn({
                action: 'sort_routes_user_not_found',
                method: req.method,
                route: req.originalUrl,
                message: 'User not found',
                user: name,
                timestamp: new Date().toISOString(),
            });
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        const selectedMapHistory = [];
        for (const history of user.routeHistory) {
            if (history.mapname === mapname) {
                selectedMapHistory.push(history);
            }
        }

        let routes = selectedMapHistory;

        if (sortBy) {
            routes.sort((a, b) => {
                // istanbul ignore next
                if (sortBy === 'date') {
                    return new Date(a.date) - new Date(b.date);
                } else if (sortBy === 'start') {
                    return a.optimalPath[0]?.localeCompare(
                        b.optimalPath[0] || ''
                    );
                    // istanbul ignore next
                } else if (sortBy === 'destination') {
                    return a.optimalPath[
                        a.optimalPath.length - 1
                    ]?.localeCompare(
                        b.optimalPath[b.optimalPath.length - 1] || ''
                    );
                } else {
                    throw new Error('Invalid sort field.');
                }
            });
        }
        logger.info({
            action: 'sort_routes_success',
            method: req.method,
            route: req.originalUrl,
            message: 'Routes sorted successfully',
            user: name,
            sortedRoutesCount: routes.length,
            timestamp: new Date().toISOString(),
        });
        // istanbul ignore next
        return res.status(200).json({
            data: routes,
            message: 'Routes sorted successfully.',
        });
    } catch (error) {
        logger.error({
            action: 'sort_routes_error',
            method: req.method,
            route: req.originalUrl,
            message: 'Error sorting routes',
            user: req.query.name,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });
        return res.status(500).json({
            message: 'Error sorting routes.',
            error: error.message,
        });
    }
};

const handleNavServiceReply = async (req, res) => {
    //start timer
    const startTime = process.hrtime();

    try {
        const { name, start_endpoint, end_endpoint, path } = req.body;

        logger.info({
            action: 'handle_nav_service_reply_attempt',
            method: req.method,
            route: req.originalUrl,
            message: 'Attempting to process navigation service reply',
            user: name,
            startEndpoint: start_endpoint,
            endEndpoint: end_endpoint,
            timestamp: new Date().toISOString(),
        });

        // istanbul ignore next
        // Validate input
        if (
            !name ||
            !start_endpoint ||
            !end_endpoint ||
            !path ||
            !path.length
        ) {
            logger.warn({
                action: 'handle_nav_service_reply_invalid_input',
                method: req.method,
                route: req.originalUrl,
                message: 'Invalid input provided',
                user: name,
                startEndpoint: start_endpoint,
                endEndpoint: end_endpoint,
                path: path,
                timestamp: new Date().toISOString(),
            });
            return res.status(400).json({
                message:
                    'Invalid input. Name, start_endpoint, end_endpoint, and path are required.',
            });
        }

        // Find the user
        const user = await userModel.findOne({ name });
        if (!user) {
            logger.warn({
                action: 'handle_nav_service_reply_user_not_found',
                method: req.method,
                route: req.originalUrl,
                message: 'User not found',
                user: name,
                timestamp: new Date().toISOString(),
            });

            return res.status(404).json({
                message: 'User not found.',
            });
        }

        // Save the route to the database
        const newRoute = await routeModel.create({
            optimalPath: path, // Save the optimal path
            alternativePath: [], // Empty for now, can be extended later
            date: new Date(), // Save the timestamp
        });
        logger.info({
            action: 'handle_nav_service_reply_route_created',
            method: req.method,
            route: req.originalUrl,
            message: 'New route created successfully',
            user: name,
            routeId: newRoute._id,
            timestamp: new Date().toISOString(),
        });

        // Add the route ID to the user's route history
        user.routeHistory.push(newRoute._id);
        await user.save();

        //Stop timer right before we respond
        const diff = process.hrtime(startTime);
        const durationMs = diff[0] * 1000 + diff[1] / 1e6;

        logger.info({
            action: 'handle_nav_service_reply_user_updated',
            method: req.method,
            route: req.originalUrl,
            message: 'User route history updated successfully',
            user: name,
            updatedRouteHistoryCount: user.routeHistory.length,
            timestamp: new Date().toISOString(),
        });

        // Respond with the updated user's route history and the saved route
        return res.status(200).json({
            message: 'Route saved and forwarded successfully.',
            user: {
                name: user.name,
                routeHistory: user.routeHistory,
            },
            savedRoute: newRoute,
        });
        // istanbul ignore next
    } catch (error) {
        logger.error({
            action: 'handle_nav_service_reply_error',
            method: req.method,
            route: req.originalUrl,
            message: 'Error handling navigation service reply',
            error: error.message,
            stack: error.stack,
            user: req.body.name,
            timestamp: new Date().toISOString(),
        });

        return res.status(500).json({
            message: 'Error handling navigation service reply.',
            error: error.message,
        });
    }
};

module.exports = {
    login,
    addRoutesToUser,
    createUser,
    deleteSpecificRoute,
    deleteAllRoutes,
    searchRoutes,
    sortRoutes,
    handleNavServiceReply,
};
