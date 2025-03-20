const promClient = require('prom-client');

const httpRequestDurationSeconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

const httpRequestErrorsTotal = new promClient.Counter({
    name: 'http_request_errors_total',
    help: 'Total number of HTTP request errors',
    labelNames: ['method', 'route', 'status_code'],
});

module.exports = (req, res, next) => {
    // Ignore requests to specific paths
    const ignoredPaths = ['/favicon.ico', '/metrics'];
    if (ignoredPaths.some((path) => req.originalUrl.startsWith(path))) {
        return next();
    }

    // Start timing the request
    const end = httpRequestDurationSeconds.startTimer();

    // Hook into response finish
    res.on('finish', () => {
        // Use req.route or fallback to req.originalUrl
        const route = req.route
            ? req.route.path
            : req.originalUrl.split('?')[0];

        if (res.statusCode >= 400) {
            httpRequestErrorsTotal.inc({
                method: req.method,
                route: route,
                status_code: res.statusCode,
            });
        }
        // End timing and log the metrics
        end({
            method: req.method,
            route: route,
            status_code: res.statusCode,
        });

        httpRequestTotal.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode,
        });
    });

    next();
};
