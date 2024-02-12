const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const fs = require("fs");
const PDFDocument = require("pdfkit");


const weatherRoutes = require("./apiData/weatherApiData");
const nasaRoutes = require("./apiData/nasaApiData");
const movieRoutes = require("./apiData/movieApiData");
const adminRoutes = require("./components/adminPanel");

const WeatherData = require("./models/WeatherData");
const User = require("./models/User");
const MovieData = require("./models/Movie");
const NasaData = require("./models/Nasa");
const historyRoutes = require("./components/history");

const PORT = 3000;
MONGODB_CONNECTION_STRING =
  "mongodb+srv://vuilae:Aa102030@cluster0.jpwdrod.mongodb.net/?retryWrites=true&w=majority";
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.use(
  session({ secret: "your-secret-key", resave: true, saveUninitialized: true })
);
app.use(express.static(path.join(__dirname, "pdf")));
mongoose.connect(MONGODB_CONNECTION_STRING);

mongoose.connection.on("connected", () =>
  console.log("Connection with MongoDB is established")
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

//Home Route
app.get("/", (req, res) => {
  res.render("auth");
});

app.use(
  "/weather/:userId",
  (req, res, next) => {
    req.userId = req.params.userId;
    next();
  },
  weatherRoutes
);

app.use(
  "/nasa/:userId",
  (req, res, next) => {
    req.userId = req.params.userId;
    next();
  },
  nasaRoutes
);

app.use(
  "/movie/:userId",
  (req, res, next) => {
    req.userId = req.params.userId;
    next();
  },
  movieRoutes
);

app.use(
  "/history/:userId",
  (req, res, next) => {
    req.userId = req.params.userId;
    next();
  },
  historyRoutes
);

app.use(
  "/admin/:userId",
  (req, res, next) => {
    req.userId = req.params.userId;
    console.log("here again");
    next();
  },
  adminRoutes
);

//Select Register or Login
app.post("/redirect", (req, res) => {
  const loginMethod = req.body.loginMethod;
  if (loginMethod === "register") {
    res.redirect("/register");
  } else if (loginMethod === "login") {
    res.redirect("/login");
  } else {
    res.send("Invalid selection");
  }
});

app.get("/download-history", async (req, res) => {
  const { userId } = req.query;

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
  const pdfPath = path.join(__dirname, "pdf", `${username}_history.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

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

  // Send the combined PDF file as a download attachment
  res.sendFile(pdfPath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error sending file");
    } else {
      // Delete the temporary PDF file after sending
      fs.unlinkSync(pdfPath);
    }
  });
});

// Login Route
app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Authenticate user (validate credentials)
  const user = await User.findOne({ username, password });
  if (!user) {
    return res.render("login", {
      errorMessage: "User is not found, try another password or username",
    });
  }

  // Check if user is an admin
  if (user.isAdmin) {
    req.session.isAdmin = true;
    req.session.userId = user._id;
    res.redirect(`/admin/${user._id}`); // Redirect to admin panel
  } else {
    req.session.userId = user._id;
    console.log("redirecting to: ", `/weather/${user._id}`);
    res.redirect(`/weather/${user._id}`); // Redirect to user weather page
  }
});

//Registration
app.get("/register", (req, res) => {
  res.render("register", { errorMessage: null });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", {
        errorMessage: "Username already exists",
      });
    }
    // Create a new user in the database
    const newUser = new User({ username: username, password: password });

    await newUser.save();

    // Store user ID in session
    req.session.userId = newUser._id;
    res.redirect(`/weather/${newUser._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
