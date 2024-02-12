const express = require("express");
const router = express.Router()
const NasaData = require("../models/Nasa");
const axios = require("axios");

router.get("/", (req, res) => {
  const userId = req.userId;
  console.log(userId);
  res.render("nasa", {
    userId: userId,
    date: null,
    nasaData: null,
  });
});

router.post("/", async (req, res) => {
  const selectedDate = req.body.selectedDate;
  const userId = req.userId;
  const parts = selectedDate.split("/");
  const formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`;

  try {
    const apiKey = "1Pxo0Pvd4Jbtoq2eLp6mYLVXNfD2uJknX8RwjHcU";
    const apiUrl = `https://api.nasa.gov/planetary/apod?date=${formattedDate}&api_key=${apiKey}`;

    const response = await axios.get(apiUrl);
    const apodData = response.data;

    const newNasaData = new NasaData({
      user: userId,
      // Assuming you want to save the current date
      nasaData: {
        date: formattedDate,
        title: apodData.title,
        explanation: apodData.explanation,
        url: apodData.url,
        hdurl: apodData.hdurl,
        mediaType: apodData.media_type,
      },
    });

    await newNasaData.save();

    const displayNasaData = await NasaData.findOne({
      user: userId,
      "nasaData.date": formattedDate,
    });

    if (!displayNasaData) {
      res.status(404).send("NASA data not found for this user.");
      return;
    }

    // Render the NASA data using the nasa.ejs template
    res.render("nasa", {
      userId,
      accessedAt: displayNasaData.accessedAt,
      nasaData: displayNasaData.nasaData,
    });
  } catch (error) {
    console.error("Error fetching APOD data:", error);
    res.status(500).send("Error fetching APOD data");
  }
});

module.exports = router;
