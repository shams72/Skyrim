const config = {
    mongodb: {
        url: process.env.MONGO_URI || 'mongodb://localhost:27017/MapDatabase',
        databaseName: 'test',
        options: {},
    },
    migrationsDir: 'migrations',
    changelogCollectionName: 'migrations_changelog',
};

module.exports = config;
