const express = require("express");
const router = express.Router();
const User = require("../models/User");
const NasaData = require("../models/Nasa");
const MovieData = require("../models/Movie");
const WeatherData = require("../models/WeatherData");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

router.get("/", async (req, res) => {
  console.log("here");
  const userId = req.userId;

  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  // Find the user information using the userId
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const username = user.username;

  // Fetch all history records (weather, NASA, movie) for the specified user ID from the database
  const weatherHistory = await WeatherData.find({ user: userId });
  const nasaHistory = await NasaData.find({ user: userId });
  const movieHistory = await MovieData.find({ user: userId });
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, "..", "pdf", `${username}_history.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(20).text(`History for User: ${username}`);


  // Add weather history data to the PDF
  doc.fontSize(16).text("Weather History:", { underline: true });
  weatherHistory.forEach((record, index) => {
    const weatherData = record.weatherData;
    doc
      .fontSize(14)
      .text(`Record ${index + 1} Weather Data:`, { underline: true });
    doc.text(`City: ${weatherData.city}`);
    doc.text(`Latitude: ${weatherData.coordinates.lat}`);
    doc.text(`Longitude: ${weatherData.coordinates.lon}`);
    doc.text(`Temperature: ${weatherData.temperature}°C`);
    doc.text(`Feels Like: ${weatherData.feelsLike}°C`);
    doc.text(`Description: ${weatherData.description}`);
    doc.text(`Humidity: ${weatherData.humidity}%`);
    doc.text(`Pressure: ${weatherData.pressure} hPa`);
    doc.text(`Wind Speed: ${weatherData.windSpeed} m/s`);
    doc.text(`Country Code: ${weatherData.countryCode}`);
    doc.text(`Rain Volume: ${weatherData.rainVolume} mm`);
    doc.text(`Time Zone: ${weatherData.timeZone}`);
    doc.text(`Country: ${weatherData.country}`);
    doc.text(`Accessed At: ${record.accessedAt}\n\n`);
    // Add weather data fields to the PDF
  });

  // Add NASA history data to the PDF
  doc.fontSize(16).text("NASA History:", { underline: true });
  nasaHistory.forEach((record, index) => {
    const nasaData = record.nasaData;

    doc
      .fontSize(16)
      .text(`Record ${index + 1}`, { underline: true })
      .moveDown();
    doc.text(`Title: ${nasaData.title}`);
    doc.text(`Date: ${nasaData.date}`);
    doc.text(`Explanation: ${nasaData.explanation}`).moveDown();
  });

  // Add movie history data to the PDF
  doc.fontSize(16).text("Movie History:", { underline: true });
  movieHistory.forEach((record, index) => {
    const movieData = record.movieData;

    // Add movie data fields to the PDF
    doc
      .fontSize(16)
      .text(`Record ${index + 1}: ${movieData.title}`, { underline: true })
      .moveDown();
    doc.text(`Rated: ${movieData.rated}`);
    doc.text(`Released: ${movieData.released}`);
    doc.text(`Runtime: ${movieData.runtime}`);
    doc.text(`Genre: ${movieData.genre}`);
    doc.text(`Director: ${movieData.director}`);
    doc.text(`Writer: ${movieData.writer}`);
    doc.text(`Actors: ${movieData.actors}`);
    doc.text(`Plot: ${movieData.plot}`);
    doc.text(`Language: ${movieData.language}`);
    doc.text(`Country: ${movieData.country}`);
    doc.text(`Awards: ${movieData.awards}`);

    // Add ratings list
    doc.text("Ratings:");
    doc
      .list(
        movieData.ratings.map((rating) => `${rating.Source}: ${rating.Value}`)
      )
      .moveDown();

    // Add remaining movie data fields
    doc.text(`Metascore: ${movieData.metascore}`);
    doc.text(`IMDB Rating: ${movieData.imdbRating}`);
    doc.text(`IMDB Votes: ${movieData.imdbVotes}`);
    doc.text(`IMDB ID: ${movieData.imdbID}`);
    doc.text(`Type: ${movieData.type}`);
    doc.text(`DVD: ${movieData.dvd}`);
    doc.text(`Box Office: ${movieData.boxOffice}`);
  });

  doc.end();
  doc.on("end", () => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${username}_history.pdf`
    );

    // Pipe the generated PDF to the response
    fs.createReadStream(pdfPath).pipe(res);
  });
});

module.exports = router;