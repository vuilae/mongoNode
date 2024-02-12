const mongoose = require("mongoose");

// Define the schema for storing movie data
const movieDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your user model is named 'User'
  },
  movieData: {
    type: Object,
    required: true,
  },
  accessedAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("MovieData", movieDataSchema);
