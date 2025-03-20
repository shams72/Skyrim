const express = require('express');
const cors = require('cors');
const metricsMiddleware = require('./services/metricsMiddleware');
const connectToDatabase = require('./services/db');
const mapRoutes = require('./routes/mapRoutes');
const userRoutes = require('./routes/userRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const {
    fetchDataFromApi,
    fetchCustomMapsFromApi,
} = require('./services/mapService');

const app = express();

// middleware
app.use(metricsMiddleware);
app.use(cors()); // need this for the frontend to be able to access the backend

mapIDs = [
    'germany',
    '10',
    '100',
    '1000',
    '10000',
    '20',
    '25',
    '5',
    '50',
    '50000',
];
// inits database connection and fetches the skyrim ap data from API (map service api)

connectToDatabase();
fetchDataFromApi();

mapIDs.forEach((mapID) => {
    fetchCustomMapsFromApi(mapID);
});

app.use(express.json());

app.use('/api/maps', mapRoutes);
app.use('/api/users', userRoutes);
app.use('/', mapRoutes);
app.use('/metrics', metricsRoutes);

module.exports = app;
