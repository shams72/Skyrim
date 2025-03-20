const winston = require('winston');

const logger = winston.createLogger({
    level: 'info', // Set the default log level
    format: winston.format.combine(
        winston.format.timestamp(), // Add timestamps to logs
        winston.format.json() // Output logs as JSON
    ),
    transports: [
        new winston.transports.Console(), // Log to the console (stdout)
        new winston.transports.File({ filename: 'logs/app.json' }), // Log to a file
    ],
});

module.exports = logger;
