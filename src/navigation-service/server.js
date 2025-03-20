const PROTO_PATH = __dirname + '/protos/nav.proto';
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const logger = require('./loggerSetup');
const { trace } = require('@opentelemetry/api');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;
const server = new grpc.Server();
const tracer = trace.getTracer('routing-service');

// Dijkstra's algorithm for finding the shortest path
function dijkstra(graph, start, end) {
    return tracer.startActiveSpan(
        'dijkstra',
        { attributes: { start, end } },
        (span) => {
            let distances = {},
                predecessors = {},
                unvisited = new Set();
            for (const node in graph) {
                distances[node] = node === start ? 0 : Infinity;
                unvisited.add(node);
            }

            while (unvisited.size > 0) {
                let closestNode = null;
                unvisited.forEach((node) => {
                    if (
                        !closestNode ||
                        distances[node] < distances[closestNode]
                    ) {
                        closestNode = node;
                    }
                });

                if (distances[closestNode] === Infinity) break;
                if (closestNode === end) break;

                for (const neighbor of graph[closestNode]) {
                    const alt = distances[closestNode] + neighbor.dist;
                    if (alt < distances[neighbor.to]) {
                        distances[neighbor.to] = alt;
                        predecessors[neighbor.to] = closestNode;
                    }
                }
                unvisited.delete(closestNode);
            }

            if (distances[end] === Infinity || !predecessors[end]) {
                span.end();
                return null;
            }
            let path = [],
                node = end;
            while (node) {
                path.push(node);
                node = predecessors[node];
            }
            span.end();
            return path.reverse();
        }
    );
}

// The gRPC handler for GetOptimalPath
function GetOptimalPath(call, callback) {
    tracer.startActiveSpan(
        'GetOptimalPath',
        { attributes: { method: 'gRPC' } },
        (parentSpan) => {
            const { start_endpoint, end_endpoint, connections } = call.request;
            logger.info({
                action: 'get_optimal_path_request_received',
                method: 'gRPC',
                message: 'Received GetOptimalPath request',
                request: { start_endpoint, end_endpoint },
                connectionCount: connections?.connections?.length || 0,
                timestamp: new Date().toISOString(),
            });

            // Validate input, return status code 3 if invalid
            if (
                !start_endpoint ||
                !end_endpoint ||
                !connections ||
                !connections.connections
            ) {
                logger.warn({
                    action: 'get_optimal_path_invalid_request',
                    method: 'gRPC',
                    message:
                        'Invalid request: Missing start_endpoint, end_endpoint, or connections',
                    request: { start_endpoint, end_endpoint },
                    timestamp: new Date().toISOString(),
                });
                parentSpan.setStatus({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: 'Error: Missing required fields',
                });
                parentSpan.end();
                return callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    message:
                        'Missing required fields: start_endpoint, end_endpoint, or connections',
                });
            }

            // Step 1: Build an adjacency list from the connections
            const graph = {};
            connections.connections.forEach((connection) => {
                if (!graph[connection.from]) graph[connection.from] = [];
                graph[connection.from].push({
                    to: connection.to,
                    dist: connection.dist,
                });
            });

            logger.info({
                action: 'get_optimal_path_graph_built',
                method: 'gRPC',
                message: 'Adjacency list built successfully',
                graphSize: Object.keys(graph).length,
                timestamp: new Date().toISOString(),
            });

            // Step 2: Find the shortest path
            const optimalPath = dijkstra(graph, start_endpoint, end_endpoint);
            if (!optimalPath) {
                parentSpan.setStatus({
                    code: grpc.status.NOT_FOUND,
                    message: 'No path found',
                });
                parentSpan.end();
                return callback({
                    code: grpc.status.NOT_FOUND, // status code 5
                    message: `No path found between ${start_endpoint} and ${end_endpoint}`,
                });
            }

            logger.info({
                action: 'get_optimal_path_found',
                method: 'gRPC',
                message: 'Optimal path found successfully',
                timestamp: new Date().toISOString(),
            });

            // Step 3: Find an alternative path
            if (optimalPath.length > 1) {
                const lastNode = optimalPath[optimalPath.length - 1];
                const secondLastNode = optimalPath[optimalPath.length - 2];
                graph[secondLastNode] = graph[secondLastNode].filter(
                    (neighbor) => neighbor.to !== lastNode
                );
            }
            const altPath = dijkstra(graph, start_endpoint, end_endpoint);

            if (altPath) {
                logger.info({
                    action: 'get_alternative_path_found',
                    method: 'gRPC',
                    message: 'Alternative path found successfully',
                    altPath,
                    timestamp: new Date().toISOString(),
                });
                parentSpan.end();
                return callback(null, {
                    path_opt: optimalPath,
                    path_alt: altPath || [],
                }); // status code 0
            } else {
                logger.warn({
                    action: 'get_alternative_path_not_found',
                    method: 'gRPC',
                    message: `No alternative path found between ${start_endpoint} and ${end_endpoint}`,
                    timestamp: new Date().toISOString(),
                });
                parentSpan.setStatus({
                    code: grpc.status.NOT_FOUND,
                    message: 'Error: No alt path found',
                });
                parentSpan.end();
                return callback({
                    code: grpc.status.NOT_FOUND, // status code 5
                    message: `No alt path found between ${start_endpoint} and ${end_endpoint}`,
                });
            }
        }
    );
}

async function GetOptimalPathStream(call, callback) {
    tracer.startActiveSpan(
        'GetOptimalPathStream',
        { attributes: { method: 'gRPC' } },
        (parentSpan) => {
            let start_endpoint = null;
            let end_endpoint = null;
            const connections = []; // Will hold all connections across chunks
            const DIJKSTRA_TIMEOUT_MS = 5000; // Set timeout to 5 seconds

            call.on('data', (chunk) => {
                logger.info({
                    action: 'get_optimal_path_stream_chunk_received',
                    method: 'gRPC',
                    message: 'Received a chunk of connections',
                    chunk: {
                        mapname: chunk.chunk.mapname,
                        chunkid: chunk.chunk.chunkid,
                    },
                    connectionCount: chunk.chunk.connections.length,
                    timestamp: new Date().toISOString(),
                });

                if (!start_endpoint || !end_endpoint) {
                    start_endpoint = chunk.start_endpoint;
                    end_endpoint = chunk.end_endpoint;
                }

                // Concatenate connections from this chunk
                connections.push(...chunk.chunk.connections);
            });

            call.on('end', async () => {
                logger.info({
                    action: 'get_optimal_path_stream_all_chunks_received',
                    method: 'gRPC',
                    message: 'All chunks received, building adjacency list',
                    totalConnections: connections.length,
                    timestamp: new Date().toISOString(),
                });

                // Validate input, return status code 3 if invalid
                if (
                    !start_endpoint ||
                    !end_endpoint ||
                    connections.length === 0
                ) {
                    logger.warn({
                        action: 'get_optimal_path_stream_invalid_request',
                        method: 'gRPC',
                        message:
                            'Invalid request: Missing start_endpoint, end_endpoint, or connections',
                        request: { start_endpoint, end_endpoint },
                        timestamp: new Date().toISOString(),
                    });
                    parentSpan.setStatus({
                        code: grpc.status.INVALID_ARGUMENT,
                        message: 'Error: Missing required fields',
                    });
                    parentSpan.end();
                    return callback({
                        code: grpc.status.INVALID_ARGUMENT,
                        message:
                            'Missing required fields: start_endpoint, end_endpoint, or connections',
                    });
                }

                // Step 1: Build an adjacency list from the connections
                const graph = {};
                connections.forEach((connection) => {
                    if (!graph[connection.from]) graph[connection.from] = [];
                    graph[connection.from].push({
                        to: connection.to,
                        dist: connection.dist,
                    });
                });

                logger.info({
                    action: 'get_optimal_path_stream_graph_built',
                    method: 'gRPC',
                    message: 'Adjacency list built successfully',
                    graphSize: Object.keys(graph).length,
                    timestamp: new Date().toISOString(),
                });
                console.log(graph);

                // Step 2: Find the shortest path with timeout
                try {
                    const optimalPath = await Promise.race([
                        calculateWithTimeout(
                            () => dijkstra(graph, start_endpoint, end_endpoint),
                            DIJKSTRA_TIMEOUT_MS
                        ),
                        timeoutError(DIJKSTRA_TIMEOUT_MS),
                    ]);

                    if (!optimalPath) {
                        parentSpan.setStatus({
                            code: grpc.status.NOT_FOUND,
                            message: 'No path found',
                        });
                        parentSpan.end();
                        return callback({
                            code: grpc.status.NOT_FOUND,
                            message: `No path found between ${start_endpoint} and ${end_endpoint}`,
                        });
                    }

                    logger.info({
                        action: 'get_optimal_path_stream_found',
                        method: 'gRPC',
                        message: 'Optimal path found successfully',
                        timestamp: new Date().toISOString(),
                    });

                    // Step 3: Find an alternative path
                    if (optimalPath.length > 1) {
                        const lastNode = optimalPath[optimalPath.length - 1];
                        const secondLastNode =
                            optimalPath[optimalPath.length - 2];
                        graph[secondLastNode] = graph[secondLastNode].filter(
                            (neighbor) => neighbor.to !== lastNode
                        );
                    }

                    const altPath = await Promise.race([
                        calculateWithTimeout(
                            () => dijkstra(graph, start_endpoint, end_endpoint),
                            DIJKSTRA_TIMEOUT_MS
                        ),
                        timeoutError(DIJKSTRA_TIMEOUT_MS),
                    ]);

                    if (altPath) {
                        logger.info({
                            action: 'get_alternative_path_stream_found',
                            method: 'gRPC',
                            message: 'Alternative path found successfully',
                            altPath,
                            timestamp: new Date().toISOString(),
                        });
                        parentSpan.end();
                        return callback(null, {
                            path_opt: optimalPath,
                            path_alt: altPath || [],
                        });
                    } else {
                        logger.warn({
                            action: 'get_alternative_path_stream_not_found',
                            method: 'gRPC',
                            message: `No alternative path found between ${start_endpoint} and ${end_endpoint}`,
                            timestamp: new Date().toISOString(),
                        });
                        parentSpan.setStatus({
                            code: grpc.status.NOT_FOUND,
                            message: 'Error: No alt path found',
                        });
                        parentSpan.end();
                        return callback({
                            code: grpc.status.NOT_FOUND,
                            message: `No alt path found between ${start_endpoint} and ${end_endpoint}`,
                        });
                    }
                } catch (err) {
                    logger.error({
                        action: 'get_optimal_path_stream_timeout',
                        method: 'gRPC',
                        message: 'Dijkstra computation timed out',
                        error: err.message,
                        timestamp: new Date().toISOString(),
                    });
                    parentSpan.setStatus({
                        code: grpc.status.DEADLINE_EXCEEDED,
                        message: 'Dijkstra computation timed out',
                    });
                    parentSpan.end();
                    return callback({
                        code: grpc.status.DEADLINE_EXCEEDED,
                        message:
                            'Dijkstra computation took too long and was aborted',
                    });
                }
            });

            call.on('error', (err) => {
                logger.error({
                    action: 'get_optimal_path_stream_error',
                    method: 'gRPC',
                    message: 'Error occurred while streaming connection chunks',
                    error: err.message,
                    stack: err.stack,
                    timestamp: new Date().toISOString(),
                });
                parentSpan.setStatus({
                    code: grpc.status.INTERNAL,
                    message: 'Internal error while streaming connection chunks',
                });
                parentSpan.end();
                callback({
                    code: grpc.status.INTERNAL,
                    message: 'Internal error while streaming connection chunks',
                });
            });
        }
    );
}

// Helper: Wrap the Dijkstra function in a promise with a timeout
function calculateWithTimeout(func, timeout) {
    return new Promise((resolve, reject) => {
        const result = func();
        resolve(result);
    });
}

// Helper: Return a timeout error if the computation exceeds the specified duration
function timeoutError(timeout) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);
    });
}

// Register service with server
server.addService(routeguide.Routing.service, {
    GetOptimalPath,
    GetOptimalPathStream,
});

const PORT = process.env.PORT || '50051';
server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error(`Failed to bind server: ${err}`);
            return;
        }
        console.log(`gRPC server running at 0.0.0.0:${port}`);
    }
);

// Export function for testing
function startServer(test_port = 50052) {
    return new Promise((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${test_port}`,
            grpc.ServerCredentials.createInsecure(),
            (err) => {
                if (err) return reject(err);
                console.log(`gRPC server running at 0.0.0.0:${test_port}`);
                resolve(server);
            }
        );
    });
}

module.exports = { startServer, server };
