const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");


const weatherRoutes = require("./apiData/weatherApiData");
const nasaRoutes = require("./apiData/nasaApiData");
const movieRoutes = require("./apiData/movieApiData");
const adminRoutes = require("./components/adminPanel");
const pdfRoutes = require("./components/generatePdf");

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

app.use(
  "/download-history/:userId",
  (req, res, next) => {
    req.userId = req.params.userId;
    console.log("here again");
    next();
  },
  pdfRoutes
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
