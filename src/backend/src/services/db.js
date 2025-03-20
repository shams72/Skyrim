const mongoose = require('mongoose');
const logger = require('../../loggerSetup');

const mongoUri = process.env.MONGO_URI;

async function connectToDatabase() {
    try {
        logger.info('Attempting to connect to the database...', {
            timestamp: new Date().toISOString(),
        });

        await mongoose.connect(mongoUri);

        logger.info('Connected to the database...', {
            timestamp: new Date().toISOString(),
        });

        return true;
    } catch (err) {
        logger.error('An error occurred', {
            errorMessage: err.message,
        });
        return false;
    }
}

module.exports = connectToDatabase;
