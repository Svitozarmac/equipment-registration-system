/**
 * Equipment model
 */

const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EquipmentSchema = new Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    type: { type: String, required: true},
    cost: { type: Number, required: true, min: [0, 'Cost must be positive'] },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    registeredBy: { type: String, required: true },
    date: { type: Date, default: Date.now},
    dateUpdated: { type: Date, default: Date.now}
});

// Virtual for equipment instance's URL
EquipmentSchema.virtual("url").get(function () {
    return `/equipment/${this._id}`;
});

// Virtual for formatted date
EquipmentSchema.virtual("date_formatted").get(function () {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

// Virtual for formatted dateUpdated
EquipmentSchema.virtual("dateUpdated_formatted").get(function () {
    return DateTime.fromJSDate(this.dateUpdated).toLocaleString(DateTime.DATE_MED);
});

// Virtual for formatted cost
EquipmentSchema.virtual("cost_formatted").get(function () {
    return this.cost.toFixed(2);
});

// Virtual property: formats the date as 'YYYY-MM-DD' for HTML form input
EquipmentSchema.virtual("date_formatted_form").get(function () {
    return Date.fromJSDate(this.date).toISODate();
});





// Export this model
module.exports = mongoose.model("Equipment", EquipmentSchema);
