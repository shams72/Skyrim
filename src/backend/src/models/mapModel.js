const mongoose = require('mongoose');

// Define the connection schema
const connectionSchema = new mongoose.Schema({
    parent: { type: String, required: true },
    child: { type: String, required: true },
    dist: { type: Number },
});

// Define the city schema
const citySchema = new mongoose.Schema({
    name: { type: String, required: true },
    positionX: { type: Number, required: true },
    positionY: { type: Number, required: true },
});

// Define the main map schema
const mapSchema = new mongoose.Schema({
    mapname: { type: String, required: true, unique: true },
    connections: [connectionSchema],
    cities: [citySchema],
    mapsizeX: { type: Number, required: true },
    mapsizeY: { type: Number, required: true },
});

// Define the chunk schema for connections
const connectionChunkSchema = new mongoose.Schema({
    mapname: { type: String, required: true },
    chunkIndex: { type: Number, required: true }, // Index of the chunk
    connections: [connectionSchema], // Array of connections for this chunk
});

// Create a model based on the schema
const MapModel = mongoose.model('maps', mapSchema);
const ConnectionChunkModel = mongoose.model(
    'connectionchunks',
    connectionChunkSchema
);

// Export the model
module.exports = { MapModel, ConnectionChunkModel };
