const mongoose = require("mongoose");

const nasaDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your user model is named 'User'
  },
  accessedAt: {
    type: Date,
    default: Date.now,
  },
  nasaData: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("NasaData", nasaDataSchema);
