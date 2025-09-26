/**
 * Room model
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String },
});

// Export the model
module.exports = mongoose.model("Room", RoomSchema);

