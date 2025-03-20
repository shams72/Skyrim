const { MapModel, ConnectionChunkModel } = require('../models/mapModel');
const client = require('../services/grpcClient');
const { addRoutesToUser } = require('./userController');
const logger = require('../../loggerSetup');
const { trace } = require('@opentelemetry/api');
const { format } = require('winston');

const tracer = trace.getTracer('routing-service');

const getMapDataByName = async (req, res) => {
    const { mapname } = req.params;

    tracer.startActiveSpan('getMapData', async (span) => {
        try {
            logger.info('Received request to get map data', {
                action: 'getMapDataRequest',
                mapname: mapname,
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            const mapData = await MapModel.find({ mapname: mapname });

            logger.info('Successfully retrieved map data', {
                action: 'mapDataRetrieved',
                mapname: mapname,
                mapDataCount: mapData.length,
                timestamp: new Date().toISOString(),
            });

            res.status(200).json(mapData);
        } catch (error) {
            span.recordException(error);
            res.status(500).json({
                message: 'Error retrieving map data',
                error,
            });
        } finally {
            span.end();
        }
    });
};

const getAllMapNames = async (req, res) => {
    tracer.startActiveSpan('getMapData', async (span) => {
        try {
            logger.info('Received request to get map data', {
                action: 'getMapDataRequest',
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            const mapNames = await MapModel.find({}, { mapname: 1, _id: 0 });

            logger.info('Successfully retrieved All map Names', {
                action: 'mapDataRetrieved',
                mapname: mapNames,
                timestamp: new Date().toISOString(),
            });

            res.status(200).json({ mapnames: mapNames });
        } catch (error) {
            span.recordException(error);
            res.status(500).json({
                message: 'Error retrieving map data',
                error,
            });
        } finally {
            span.end();
        }
    });
};

const getRoutesFromMap = async (req, res) => {
    tracer.startActiveSpan('getRoutesFromMap', async (span) => {
        const { start, end, username, mapname } = req.query;

        span.addEvent('Received request for route calculation', {
            username: username,
            mapname: mapname,
            start: start,
            end: end,
        });
        logger.info('Received request to get routes from map', {
            action: 'getRoutesFromMapRequest',
            start: start,
            end: end,
            username: username,
            method: req.method,
            route: req.originalUrl,
            timestamp: new Date().toISOString(),
        });

        // Validate input
        if (
            typeof start !== 'string' ||
            typeof end !== 'string' ||
            !start.trim() ||
            !end.trim() ||
            !isNaN(start) ||
            !isNaN(end)
        ) {
            span.addEvent('Invalid input for start or end locations', {
                start,
                end,
            });
            logger.warn('Invalid input for start or end locations', {
                action: 'inputValidationFailed',
                start: start,
                end: end,
                message: 'Names of Cities cannot be Numbers/Empty',
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            return res.status(400).json({
                message: 'Names of Cities cannot be Numbers/Empty',
            });
        }

        if (!username || typeof username !== 'string' || !username.trim()) {
            span.addEvent('Invalid username');
            return res.status(400).json({
                message: 'Username is required and must be a valid string.',
            });
        }

        try {
            span.addEvent('Fetching map data', { mapname });
            logger.info('Fetching map data', {
                action: 'fetchMapData',
                mapname: mapname,
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            const mapData = await MapModel.find({ mapname: mapname });
            console.log(mapData);

            if (!mapData.length) {
                span.addEvent('Map data not found');
                logger.warn('Map data not found', {
                    action: 'mapDataNotFound',
                    mapname: mapname,
                    method: req.method,
                    route: req.originalUrl,
                    timestamp: new Date().toISOString(),
                });
                return res.status(404).json({
                    message: 'Map data not found.',
                });
            }

            logger.info('Formatting connections from map data', {
                action: 'formatConnections',
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            // Format connections for RPC request
            const formatConnections = (connections) =>
                connections.map((connection) => ({
                    from: connection.parent,
                    to: connection.child,
                    dist: connection.dist,
                }));

            const formattedConnections = formatConnections(
                mapData[0]?.connections || []
            );

            const rpcRequest = {
                start_endpoint: start,
                end_endpoint: end,
                connections: { connections: formattedConnections },
            };

            logger.info('Calling GetOptimalPath RPC', {
                action: 'callGetOptimalPathRPC',
                rpcRequest: rpcRequest,
                method: req.method,
                route: req.originalUrl,
                timestamp: (callTime = new Date()),
            });
            span.addEvent('Calling GetOptimalPath RPC');

            // Call GetOptimalPath RPC
            client.GetOptimalPath(rpcRequest, async (error, response) => {
                if (error) {
                    span.recordException(error);
                    return res.status(500).json({ error: error.message });
                }

                const { path_opt, path_alt } = response;
                const endTime = new Date();
                const duration = endTime - callTime;

                console.log(callTime);
                console.log(endTime);

                if (path_opt?.length) {
                    try {
                        // Prepare fake req and res objects for addRoutesToUser
                        logger.info('Paths successfully retrieved from RPC', {
                            action: 'pathsRetrieved',
                            optimalPathLength: path_opt.length,
                            alternativePathLength: path_alt
                                ? path_alt.length
                                : 0,
                            method: req.method,
                            route: req.originalUrl,
                            timestamp: new Date(),
                        });

                        logger.info('User Request Log', {
                            name: username,
                            action: 'pathsRetrieved',
                            start: start,
                            end: end,
                            requestBegin: callTime,
                            duration: duration,
                        });
                        span.addEvent('Paths successfully retrieved from RPC', {
                            optimalPathLength: path_opt.length,
                            alternativePathLength: path_alt
                                ? path_alt.length
                                : 0,
                        });

                        const addRouteReq = {
                            body: {
                                name: username,
                                optimalPath: path_opt,
                                alternativePath: path_alt || [],
                                mapname: mapname,
                            },
                        };

                        let savedRouteId;

                        // Simulate res object for addRoutesToUser
                        const addRouteRes = {
                            status: (code) => ({
                                json: (data) => {
                                    if (data?.data?.routeHistory) {
                                        savedRouteId =
                                            data.data.routeHistory[
                                                data.data.routeHistory.length -
                                                    1
                                            ];
                                    }
                                },
                            }),
                        };

                        logger.info('Saving route to user history', {
                            action: 'saveRouteToUserHistory',
                            username: username,
                            method: req.method,
                            route: req.originalUrl,
                            timestamp: new Date().toISOString(),
                        });
                        // Call addRoutesToUser to save the route
                        await addRoutesToUser(addRouteReq, addRouteRes);

                        logger.info(
                            'Route saved and response sent successfully',
                            {
                                action: 'routeSavedAndResponseSent',
                                routeId: savedRouteId,
                                method: req.method,
                                route: req.originalUrl,
                                timestamp: new Date().toISOString(),
                            }
                        );
                        span.setAttribute('routeId', savedRouteId);

                        // Return the final response with route ID
                        return res.status(200).json({
                            message: 'Routes retrieved successfully',
                            optimalPath: path_opt,
                            alternativePath: path_alt || [],
                            routeId: savedRouteId,
                        });
                    } catch (saveError) {
                        span.recordException(saveError);
                        return res.status(500).json({
                            message:
                                'Routes retrieved, but error saving to user history.',
                            error: saveError.message,
                        });
                    }
                } else {
                    span.addEvent('City/Cities not found in map');
                    return res.status(404).json({
                        message:
                            'The requested City/Cities were not found in the map.',
                    });
                }
            });
            span.addEvent('Route calculation request completed.');
        } catch (error) {
            span.recordException(error);
            res.status(500).json({
                message: 'Error retrieving map data',
                error,
            });
        } finally {
            span.end();
        }
    });
};

const getRoutesFromMapStream = async (req, res) => {
    tracer.startActiveSpan('getRoutesFromMapStream', async (span) => {
        const { start, end, username, mapname } = req.query;
        const callTime = new Date();

        span.addEvent('Received request for route calculation', {
            username: username,
            mapname: mapname,
            start: start,
            end: end,
        });
        logger.info('Received request to get routes from map via stream', {
            action: 'getRoutesFromMapStreamRequest',
            start: start,
            end: end,
            username: username,
            method: req.method,
            route: req.originalUrl,
            timestamp: new Date().toISOString(),
        });

        // Validate input
        if (
            typeof start !== 'string' ||
            typeof end !== 'string' ||
            !start.trim() ||
            !end.trim() ||
            !isNaN(start) ||
            !isNaN(end)
        ) {
            span.addEvent('Invalid input for start or end locations', {
                start,
                end,
            });
            logger.warn('Invalid input for start or end locations', {
                action: 'inputValidationFailed',
                start: start,
                end: end,
                message: 'Names of Cities cannot be Numbers/Empty',
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            return res.status(400).json({
                message: 'Names of Cities cannot be Numbers/Empty',
            });
        }

        if (!username || typeof username !== 'string' || !username.trim()) {
            span.addEvent('Invalid username');
            return res.status(400).json({
                message: 'Username is required and must be a valid string.',
            });
        }

        try {
            span.addEvent('Fetching map data chunks');
            logger.info('Fetching map data chunks', {
                action: 'fetchMapChunks',
                mapname: mapname,
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            // Retrieve chunked connections from the database
            const chunkConnections = await ConnectionChunkModel.find({
                mapname,
            });

            if (!chunkConnections.length) {
                span.addEvent('Map data chunks not found');
                logger.warn('Map data chunks not found', {
                    action: 'mapDataChunksNotFound',
                    mapname: mapname,
                    method: req.method,
                    route: req.originalUrl,
                    timestamp: new Date().toISOString(),
                });
                return res.status(404).json({
                    message: 'Map data chunks not found.',
                });
            }

            logger.info('Initiating streaming RPC request', {
                action: 'startStreamingRPC',
                start: start,
                end: end,
                totalChunks: chunkConnections.length,
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            const stream = client.GetOptimalPathStream(
                async (error, response) => {
                    if (error) {
                        logger.error('Error during streaming RPC', {
                            action: 'streamError',
                            error: error.message,
                            method: req.method,
                            route: req.originalUrl,
                            timestamp: new Date().toISOString(),
                        });
                        span.recordException(error);
                        span.end();
                        return res.status(500).json({
                            message: 'Error during streaming RPC',
                            error: error.message,
                        });
                    }

                    let optimalPath = null;
                    let alternativePath = null;

                    logger.info('Received streamed response', {
                        action: 'streamedResponseReceived',
                        response: response,
                        method: req.method,
                        route: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });

                    // Extract paths from the streamed response
                    if (response.path_opt) {
                        optimalPath = response.path_opt;
                    }
                    if (response.path_alt) {
                        alternativePath = response.path_alt;
                    }

                    logger.info('Streaming RPC completed successfully', {
                        action: 'streamComplete',
                        optimalPathLength: optimalPath ? optimalPath.length : 0,
                        alternativePathLength: alternativePath
                            ? alternativePath.length
                            : 0,
                        method: req.method,
                        route: req.originalUrl,
                        timestamp: new Date().toISOString(),
                    });

                    span.addEvent('Streaming RPC completed successfully', {
                        optimalPathLength: optimalPath ? optimalPath.length : 0,
                        alternativePathLength: alternativePath
                            ? alternativePath.length
                            : 0,
                    });

                    try {
                        // Save route to user history
                        const addRouteReq = {
                            body: {
                                name: username,
                                optimalPath: optimalPath || [],
                                alternativePath: alternativePath || [],
                                mapname: mapname,
                            },
                        };

                        let savedRouteId;

                        // Simulate res object for addRoutesToUser
                        const addRouteRes = {
                            status: (code) => ({
                                json: (data) => {
                                    if (data?.data?.routeHistory) {
                                        savedRouteId =
                                            data.data.routeHistory[
                                                data.data.routeHistory.length -
                                                    1
                                            ];
                                    }
                                },
                            }),
                        };

                        logger.info('Saving streamed route to user history', {
                            action: 'saveStreamedRouteToUserHistory',
                            username: username,
                            mapname: mapname,
                            method: req.method,
                            route: req.originalUrl,
                            timestamp: new Date().toISOString(),
                        });

                        // Call addRoutesToUser to save the route
                        await addRoutesToUser(addRouteReq, addRouteRes);

                        const endTime = new Date();
                        const duration = endTime - callTime;

                        logger.info('User Stream Request Log', {
                            name: username,
                            action: 'pathsRetrieved',
                            start: start,
                            end: end,
                            requestBegin: callTime,
                            duration: duration,
                            mapname: mapname,
                        });

                        return res.status(200).json({
                            message: 'Routes calculated successfully',
                            optimalPath: optimalPath || [],
                            alternativePath: alternativePath || [],
                            routeId: savedRouteId,
                        });
                    } catch (saveError) {
                        span.recordException(saveError);
                        logger.error(
                            'Error saving streamed route to user history',
                            {
                                action: 'saveStreamedRouteError',
                                error: saveError.message,
                                username: username,
                                mapname: mapname,
                                timestamp: new Date().toISOString(),
                            }
                        );

                        return res.status(500).json({
                            message:
                                'Routes calculated, but error saving to user history.',
                            error: saveError.message,
                            optimalPath: optimalPath || [],
                            alternativePath: alternativePath || [],
                        });
                    }
                }
            );

            // Format connections for RPC request
            const formatConnections = (connections) =>
                connections.map((connection) => ({
                    from: connection.parent,
                    to: connection.child,
                    dist: connection.dist,
                }));

            // Send each chunk as a `StreamRequest` message
            for (let i = 0; i < chunkConnections.length; i++) {
                const streamRequest = {
                    start_endpoint: start,
                    end_endpoint: end,
                    chunk: {
                        mapname: mapname,
                        chunkid: chunkConnections[i].chunkIndex,
                        connections: formatConnections(
                            chunkConnections[i].connections
                        ),
                    },
                };

                logger.info('Sending stream chunk', {
                    action: 'sendStreamChunk',
                    chunkId: chunkConnections[i].chunkIndex,
                    connectionCount: chunkConnections[i].connections.length,
                    method: req.method,
                    route: req.originalUrl,
                    timestamp: new Date().toISOString(),
                });

                stream.write(streamRequest);
            }
            stream.end(); // End the stream
            span.addEvent('Route calculation request completed.');
        } catch (error) {
            span.recordException(error);
            logger.error('Unexpected error in getRoutesFromMapStream', {
                action: 'unexpectedError',
                error: error.message,
                method: req.method,
                route: req.originalUrl,
                timestamp: new Date().toISOString(),
            });

            return res.status(500).json({
                message: 'Unexpected error in getRoutesFromMapStream',
                error: error.message,
            });
        } finally {
            span.end();
        }
    });
};

const getHealthStatus = (req, res) => {
    res.status(200).json({ status: 'healthy' });
};

module.exports = {
    getRoutesFromMapStream,
    getMapDataByName,
    getRoutesFromMap,
    getHealthStatus,
    getAllMapNames,
};
