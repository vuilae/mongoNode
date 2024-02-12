// models/WeatherData.js
const mongoose = require("mongoose");

const weatherDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  weatherData: {
    type: Object,
    required: true,
  },
  accessedAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("WeatherData", weatherDataSchema);
