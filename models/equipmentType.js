/**
 * Equipment type model
 */


const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EquipmentTypeSchema = new Schema ({
    name: {
        type: String,
        required: true,
        minlength: 3, maxlength: 100,
        unique: true,
        enum: ["Monitor", "Printer", "Router", "Desktop PC"],
    } 
});

// Export this model
module.exports = mongoose.model("EquipmentType", EquipmentTypeSchema);