const express = require("express");
const router = express.Router();
const  MovieData= require("../models/Movie");
const axios = require("axios");

router.get("/", (req, res) => {
  const userId = req.userId;
  res.render("movie", {
    userId: userId,
    movieTitle: null,
    movieData: null,
  });
});

router.post("/", async (req, res) => {
  const userId = req.userId;
  let movieTitle = req.body.movieTitle;
  console.log(movieTitle);

  try {
    // Fetch movie data from OMDB API
    const apiKey = "d0807667";
    const omdbApiUrl = `http://www.omdbapi.com/?t=${movieTitle}&apikey=${apiKey}`;
    const omdbApiResponse = await axios.get(omdbApiUrl);

    const movieData = omdbApiResponse.data;

    // Save movie data to MongoDB with user ID
    const newMovieData = new MovieData({
      user: userId,
      movieData: {
        title: movieData.Title,
        rated: movieData.Rated,
        released: movieData.Released,
        runtime: movieData.Runtime,
        genre: movieData.Genre,
        director: movieData.Director,
        writer: movieData.Writer,
        actors: movieData.Actors,
        plot: movieData.Plot,
        language: movieData.Language,
        country: movieData.Country,
        awards: movieData.Awards,
        poster: movieData.Poster,
        ratings: movieData.Ratings,
        metascore: movieData.Metascore,
        imdbRating: movieData.imdbRating,
        imdbVotes: movieData.imdbVotes,
        imdbID: movieData.imdbID,
        type: movieData.Type,
        dvd: movieData.DVD,
        boxOffice: movieData.BoxOffice,
        production: movieData.Production,
        website: movieData.Website,
      },
    });

    // Save the movie data to the database
    await newMovieData.save();

    const displayMovieData = await MovieData.findOne({
      user: userId,
      "movieData.title": movieData.Title, // Предполагается, что movieTitle является уникальным идентификатором фильма
    });

    if (!displayMovieData) {
      res.status(404).send("Movie data not found for this user.");
      return;
    }

    res.render("movie", {
      userId,
      accessedAt: displayMovieData.accessedAt,
      movieData: displayMovieData.movieData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;
