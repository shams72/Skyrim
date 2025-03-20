module.exports = {
    async up(db, client) {
        // Step 1: Ensure the "mapname" field exists.
        // This updates documents that do not already have "mapname", adding it as an empty string.
        await db
            .collection('routes')
            .updateMany(
                { mapname: { $exists: false } },
                { $set: { mapname: '' } }
            );

        // Step 2: Update all documents to set the "mapname" field to "Skyrim".
        await db
            .collection('routes')
            .updateMany({}, { $set: { mapname: 'Skyrim' } });
    },

    async down(db, client) {
        // In the down migration, we remove the "mapname" field from all documents.
        await db
            .collection('routes')
            .updateMany({}, { $unset: { mapname: '' } });
    },
};
