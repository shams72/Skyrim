# Winston Logger Documentation

## Logger Overview

### Areas Logged:
- **Backend**
- **Nav Service**

### Logger Types Used:
- `logger.info`
- `logger.warn`
- `logger.error`

### Logger Usage:
The loggers do not follow a fixed structure. Instead, they adapt to the necessary and required information for a particular instance.

#### Log Type Descriptions:
- **`log.info`:** Used to show processing details and 200 status code.
- **`log.warn`:** Used for status codes other than 200.
- **`log.error`:** Used for logging errors.

## Example Structured Log
```javascript
logger.info({
    action: 'delete_specific_route_attempt',
    method: req.method,
    route: req.originalUrl,
    message: 'Attempting to delete a specific route',
    user: name,
    timestamp: new Date().toISOString(),
});
```

### Logger Features
The logger provides specific insights, most notably:
- **Calculation Duration:** Logs the duration of route calculations, offering an overview of performance for each calculation.

## Log Structure for Logging Calculation Duration:
The log structure used looks like this:
```javascript
logger.info('User Request Log', {
    name: username,
    action: 'pathsRetrieved',
    start: start,
    end: end,
    requestBegin: callTime,
    duration: duration,
});
```

### Example Output
```json
{
    "action": "pathsRetrieved",
    "duration": 328,
    "end": "Dragon Bridge",
    "level": "info",
    "message": "User Request Log",
    "name": "John Doe",
    "requestBegin": "2025-01-21T23:05:42.884Z",
    "start": "Whiterun",
    "timestamp": "2025-01-21T23:05:43.215Z"
}
```
