// backend/src/routes/metricsRoutes.js
const express = require('express');
const promClient = require('prom-client');

const router = express.Router();
// default Node.js metrics
promClient.collectDefaultMetrics();

router.get('/', async (req, res) => {
    try {
        // Expose all metrics in the default registry
        res.setHeader('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    } catch (err) {
        res.status(500).end(err.message);
    }
});

module.exports = router;
