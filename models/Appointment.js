const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  phone: String,
  name: String,
  doctor: String,
  date: String,
  time: String,
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
