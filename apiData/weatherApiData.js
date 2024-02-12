const express = require("express");
const router = express.Router();
const WeatherData = require("../models/WeatherData");
const axios = require("axios");

router.get("/", (req, res) => {
  const userId = req.userId;
  try {
    res.render("weather", {
      userId: userId,
      weatherData: null,
      accessedAt: null,
    }); // Pass userId as an object
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching weather data");
  }
});

router.post("/", async (req, res) => {
  const city = req.body.city;
  const lat = req.body.lat;
  const lon = req.body.lng;
const userId = req.userId;


  try {
    let apiUrl;

    if (city) {
      // Case 1: City is specified in the request
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=6dd090f4e8b95ec52fce0e141d021b67&units=metric`;
    } else {
      // Case 2: Coordinates are specified in the request
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=6dd090f4e8b95ec52fce0e141d021b67&units=metric`;
    }

    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    // Save weather data to MongoDB with user ID
    const newWeatherData = new WeatherData({
      user: userId,
      weatherData: {
        city: weatherData.name,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        weatherIcon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description,
        coordinates: {
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon,
        },
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        countryCode: weatherData.sys.id,
        rainVolume: weatherData.rain ? weatherData.rain["1h"] : "N/A",
        timeZone: weatherData.timezone,
        country: weatherData.sys.country,
      },
    });

    await newWeatherData.save();

    const displayWeatherData = await WeatherData.findOne({
      user: userId,
      "weatherData.city": weatherData.name,
    });
    console.log(displayWeatherData);

    if (!displayWeatherData) {
      res.status(404).send("Weather data not found for this user.");
      return;
    }
    res.render("weather", {
      userId: userId,
      accessedAt: displayWeatherData.accessedAt,
      weatherData: displayWeatherData.weatherData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching weather data");
  }
});

module.exports = router;
