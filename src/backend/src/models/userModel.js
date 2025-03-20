const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    routeHistory: [{ type: Schema.Types.ObjectId, ref: 'Routes' }],
});

// Create a model based on the schema
const userModel = mongoose.model('user', userSchema);

// Export the model
module.exports = userModel;
