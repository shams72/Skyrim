const mongoose = require('mongoose');

// Define the connection schema
const routeSchema = new mongoose.Schema({
    username: { type: String, required: true },
    mapname: { type: String, required: true },
    optimalPath: [{ type: String, required: true }],
    alternativePath: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
});

// Create a model based on the schema
const RouteModel = mongoose.model('Routes', routeSchema);

// Export the model
module.exports = RouteModel;
