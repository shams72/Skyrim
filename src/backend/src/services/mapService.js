const { MapModel, ConnectionChunkModel } = require('../models/mapModel');
const logger = require('../../loggerSetup');

async function fetchDataFromApi() {
    try {
        logger.info('Fetching data from API', {
            action: 'fetchDataFromApi',
            url: 'https://maps.proxy.devops-pse.users.h-da.cloud/map?name=skyrim',
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(
            'https://maps.proxy.devops-pse.users.h-da.cloud/map?name=skyrim'
        );
        const mapData = await response.json();
        try {
            logger.info('Checking for existing map entry...', {
                action: 'checkExistingMap',
                mapname: mapData.mapname,
                timestamp: new Date().toISOString(),
            });
            const existingEntry = await MapModel.findOne({
                mapname: mapData.mapname,
            });

            if (existingEntry) {
                logger.info('Existing map entry found, skipping save', {
                    action: 'skipExistingMapSave',
                    mapname: mapData.mapname,
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            const connections = [
                { parent: 'Riften', child: 'Shor’s Stone', dist: 3 },
                { parent: 'Riften', child: 'Ivarstead', dist: 9 },
                { parent: 'Shor’s Stone', child: 'Riften', dist: 3 },
                { parent: 'Shor’s Stone', child: 'Ivarstead', dist: 8 },
                { parent: 'Shor’s Stone', child: 'Windhelm', dist: 7 },
                { parent: 'Windhelm', child: 'Shor’s Stone', dist: 7 },
                { parent: 'Windhelm', child: 'Ivarstead', dist: 8 },
                { parent: 'Windhelm', child: 'Whiterun', dist: 10 },
                { parent: 'Windhelm', child: 'Winterhold', dist: 9 },
                { parent: 'Winterhold', child: 'Windhelm', dist: 9 },
                { parent: 'Winterhold', child: 'Dawnstar', dist: 14 },
                { parent: 'Dawnstar', child: 'Winterhold', dist: 14 },
                { parent: 'Dawnstar', child: 'Morthal', dist: 7 },
                { parent: 'Morthal', child: 'Dawnstar', dist: 7 },
                { parent: 'Morthal', child: 'Solitude', dist: 6 },
                { parent: 'Morthal', child: 'Rorikstead', dist: 7 },
                { parent: 'Morthal', child: 'Dragon Bridge', dist: 5 },
                { parent: 'Solitude', child: 'Morthal', dist: 6 },
                { parent: 'Solitude', child: 'Dragon Bridge', dist: 2 },
                { parent: 'Dragon Bridge', child: 'Morthal', dist: 5 },
                { parent: 'Dragon Bridge', child: 'Solitude', dist: 2 },
                { parent: 'Dragon Bridge', child: 'Karthwasten', dist: 8 },
                { parent: 'Karthwasten', child: 'Dragon Bridge', dist: 8 },
                { parent: 'Karthwasten', child: 'Rorikstead', dist: 4 },
                { parent: 'Karthwasten', child: 'Markarth', dist: 4 },
                { parent: 'Markarth', child: 'Karthwasten', dist: 4 },
                { parent: 'Markarth', child: 'Rorikstead', dist: 8 },
                { parent: 'Markarth', child: 'Falkreath', dist: 14 },
                { parent: 'Falkreath', child: 'Markarth', dist: 14 },
                { parent: 'Falkreath', child: 'Helgen', dist: 3 },
                { parent: 'Falkreath', child: 'Riverwood', dist: 5 },
                { parent: 'Falkreath', child: 'Rorikstead', dist: 10 },
                { parent: 'Rorikstead', child: 'Falkreath', dist: 10 },
                { parent: 'Rorikstead', child: 'Markarth', dist: 8 },
                { parent: 'Rorikstead', child: 'Karthwasten', dist: 4 },
                { parent: 'Rorikstead', child: 'Morthal', dist: 7 },
                { parent: 'Rorikstead', child: 'Whiterun', dist: 10 },
                { parent: 'Whiterun', child: 'Rorikstead', dist: 10 },
                { parent: 'Whiterun', child: 'Windhelm', dist: 10 },
                { parent: 'Whiterun', child: 'Riverwood', dist: 3 },
                { parent: 'Whiterun', child: 'Ivarstead', dist: 8 },
                { parent: 'Ivarstead', child: 'Whiterun', dist: 8 },
                { parent: 'Ivarstead', child: 'Riften', dist: 9 },
                { parent: 'Ivarstead', child: 'Shor’s Stone', dist: 8 },
                { parent: 'Ivarstead', child: 'Windhelm', dist: 8 },
                { parent: 'Ivarstead', child: 'Helgen', dist: 5 },
                { parent: 'Helgen', child: 'Ivarstead', dist: 5 },
                { parent: 'Helgen', child: 'Falkreath', dist: 3 },
                { parent: 'Helgen', child: 'Riverwood', dist: 3 },
                { parent: 'Riverwood', child: 'Helgen', dist: 3 },
                { parent: 'Riverwood', child: 'Falkreath', dist: 5 },
                { parent: 'Riverwood', child: 'Whiterun', dist: 3 },
            ];

            mapData.connections = connections;

            const mapEntry = new MapModel(mapData);
            //console.log(mapEntry);
            await mapEntry.save();
            logger.info('Map saved successfully', {
                action: 'saveMapData',
                mapname: mapData.mapname,
                timestamp: new Date().toISOString(),
            });

            return mapEntry;
        } catch (error) {
            logger.error('Error saving map data', {
                action: 'saveMapDataError',
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            });
            return error;
        }
    } catch (err) {
        logger.error('Error fetching data from API', {
            action: 'fetchDataFromApiError',
            cityID: 'skyrim',
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
        });
        return err;
    }
}

function calculateDistance(city1, city2) {
    return Math.sqrt(
        Math.pow(city1.positionX - city2.positionX, 2) +
            Math.pow(city1.positionY - city2.positionY, 2)
    );
}

// Convert map data to an adjacency list format
function optimizeToAdjacencyList(mapData) {
    const adjacencyList = {};
    const cityIds = {};
    const cities = [];
    const connections = [];
    const seenEdges = new Set();

    // Populate cities list and map city names to their indices
    mapData.cities.forEach((city, index) => {
        cityIds[city.name] = index;
        cities.push({
            name: city.name,
            positionX: city.positionX,
            positionY: city.positionY,
        });
    });

    // Process connections and build adjacency list
    mapData.connections.forEach((connection) => {
        const parentId = cityIds[connection.parent];
        const childId = cityIds[connection.child];
        const edgeKey = `${parentId}-${childId}`;
        const reverseEdgeKey = `${childId}-${parentId}`;

        // Skip if the edge has already been processed
        if (seenEdges.has(edgeKey) || seenEdges.has(reverseEdgeKey)) return;

        const dist = calculateDistance(cities[parentId], cities[childId]);

        // Add the connection to the connections list
        connections.push({
            parent: connection.parent,
            child: connection.child,
            dist,
        });

        // Add both directions (undirected graph) to the adjacency list
        [
            [parentId, childId],
            [childId, parentId],
        ].forEach(([from, to]) => {
            if (!adjacencyList[from]) adjacencyList[from] = [];
            adjacencyList[from].push({ to: to.toString(), weight: dist });
        });

        seenEdges.add(edgeKey);
        seenEdges.add(reverseEdgeKey);
    });

    return {
        mapname: mapData.mapname,
        mapsizeX: mapData.mapsizeX,
        mapsizeY: mapData.mapsizeY,
        cities,
        connections,
    };
}

async function fetchCustomMapsFromApi(cityID) {
    const CHUNK_SIZE = 1000;
    try {
        logger.info('Fetching data from API', {
            action: 'fetchDataFromApi',
            url: `https://maps.proxy.devops-pse.users.h-da.cloud/map?name=${cityID}`,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(
            `https://maps.proxy.devops-pse.users.h-da.cloud/map?name=${cityID}`
        );
        const mapData = await response.json();

        try {
            logger.info('Checking for existing map entry...', {
                action: 'checkExistingMap',
                mapname: mapData.mapname,
                timestamp: new Date().toISOString(),
            });

            const existingEntry = await MapModel.findOne({
                mapname: mapData.mapname,
            });

            if (existingEntry) {
                logger.info('Existing map entry found, skipping save', {
                    action: 'skipExistingMapSave',
                    mapname: mapData.mapname,
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            const optimizedMapData = optimizeToAdjacencyList(mapData);

            if (optimizedMapData.mapname === 'map_50000') {
                const chunkSize = 50000;
                const connectionChunks = [];
                for (
                    let i = 0;
                    i < optimizedMapData.connections.length;
                    i += chunkSize
                ) {
                    connectionChunks.push(
                        optimizedMapData.connections.slice(i, i + chunkSize)
                    );
                }

                // Save the map metadata and cities first
                const mapEntry = new MapModel({
                    mapname: optimizedMapData.mapname,
                    mapsizeX: optimizedMapData.mapsizeX,
                    mapsizeY: optimizedMapData.mapsizeY,
                    cities: optimizedMapData.cities,
                });
                await mapEntry.save();

                logger.info('Map metadata and cities saved successfully', {
                    action: 'saveMapMetadata',
                    mapname: optimizedMapData.mapname,
                    timestamp: new Date().toISOString(),
                });

                // Save each chunk of connections separately
                for (
                    let chunkIndex = 0;
                    chunkIndex < connectionChunks.length;
                    chunkIndex++
                ) {
                    const chunk = connectionChunks[chunkIndex];
                    const connectionChunkEntry = new ConnectionChunkModel({
                        mapname: optimizedMapData.mapname,
                        chunkIndex,
                        connections: chunk,
                    });

                    await connectionChunkEntry.save();

                    logger.info(
                        `Connection chunk ${chunkIndex + 1} saved successfully`,
                        {
                            action: 'saveConnectionChunk',
                            mapname: optimizedMapData.mapname,
                            chunkIndex,
                            timestamp: new Date().toISOString(),
                        }
                    );
                }

                logger.info(`All Mapdata Succesfully Saved`, {
                    timestamp: new Date().toISOString(),
                });

                return mapEntry;
            } else {
                const mapEntry = new MapModel(optimizedMapData);
                await mapEntry.save();
                logger.info('Map saved successfully', {
                    action: 'saveMapData',
                    mapname: mapData.mapname,
                    timestamp: new Date().toISOString(),
                });
                return mapEntry;
            }
        } catch (error) {
            logger.error('Error saving map data', {
                action: 'saveMapDataError',
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            });
            return error;
        }
    } catch (err) {
        logger.error('Error fetching data from API', {
            action: 'fetchDataFromApiError',
            error: err.message,
            cityID: cityID,
            stack: err.stack,
            timestamp: new Date().toISOString(),
        });
        return err;
    }
}

module.exports = {
    fetchDataFromApi,
    fetchCustomMapsFromApi,
};
