# Metrics 

## Overview
This project integrates Prometheus metrics collection into the Node.js application using custom middleware and routes. It tracks HTTP requests and provides endpoints to expose the collected metrics for monitoring purposes.

### Key Features:
- Tracks HTTP request duration, total requests, and errors using Prometheus.
- Provides a `/metrics` endpoint to expose metrics for Prometheus scraping.
- Ignores specific paths (`/favicon.ico` and `/metrics`) to optimize performance.

---

## Files

### 1. **metricsMiddleware.js**
This middleware collects detailed HTTP metrics for incoming requests. It utilizes the Prometheus `Histogram` and `Counter` to measure request duration, total requests, and errors.

#### Key Metrics:
- **`http_request_duration_seconds`**: Histogram tracking the duration of HTTP requests.
- **`http_requests_total`**: Counter tracking the total number of HTTP requests.
- **`http_request_errors_total`**: Counter tracking the total number of errors.

#### How It Works:
1. The middleware ignores requests to `/favicon.ico` and `/metrics`.
2. It measures request duration from start to finish.
3. On response finish:
   - Logs request details (method, route, status code).
   - Tracks errors for status codes 400 and above.

### 2. **metricsRoutes.js**
This file defines the route to expose collected metrics.

#### Default Metrics:
- Captures system and runtime metrics provided by Node.js using `prom-client`.

## Notes
- Ensure the Prometheus configuration matches the server and port hosting the metrics endpoint.
- You can customize ignored paths in `metricsMiddleware.js`.


