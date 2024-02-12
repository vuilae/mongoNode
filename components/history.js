const express = require("express");
const router = express.Router();
const WeatherData = require("../models/WeatherData");
const NasaData = require("../models/Nasa");
const MovieData = require("../models/Movie");
const User = require("../models/User");

router.get("/", async (req, res) => {
  const userId = req.userId; // Assuming userId is available in the request

  try {
    const user = await User.findById(userId);
    const username = user.username;
    // Fetch all history records (weather, NASA, movie) for the specified user ID from the database
    const weatherHistory = await WeatherData.find({ user: userId });
    const nasaHistory = await NasaData.find({ user: userId });
    const movieHistory = await MovieData.find({ user: userId });

    // Render the history view and pass history data and other variables
    res.render("history", {
      username: username,
      userId: userId,
      weatherData: weatherHistory,
      nasaData: nasaHistory,
      movieData: movieHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching history data");
  }
});

module.exports = router;
