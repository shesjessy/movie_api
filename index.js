const express = require("express");
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

const cors = require("cors");
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

// Protecting all endpoints except for registration and login
const authenticate = passport.authenticate("jwt", { session: false });

// Protecting the /movies endpoint with JWT
app.get("/movies", authenticate, async (req, res) => {
    try {
        const movies = await Movies.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/moviedb", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("Could not connect to MongoDB:", err));

// Routes

// Get a single movie by ID
app.get("/movies/:id", authenticate, async (req, res) => {
    try {
        const movie = await Movies.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new movie
app.post("/movies", authenticate, async (req, res) => {
    const movie = new Movies(req.body);
    try {
        const newMovie = await movie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an existing movie
app.put("/movies/:id", authenticate, async (req, res) => {
    try {
        const updatedMovie = await Movies.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedMovie)
            return res.status(404).json({ message: "Movie not found" });
        res.json(updatedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a movie
app.delete("/movies/:id", authenticate, async (req, res) => {
    try {
        const deletedMovie = await Movies.findByIdAndDelete(req.params.id);
        if (!deletedMovie)
            return res.status(404).json({ message: "Movie not found" });
        res.json({ message: "Movie deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User registration (no authentication)
app.post("/users", async (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
        .then((user) => {
            if (user) {
                //If the user is found, send a response that it already exists
                return res
                    .status(400)
                    .send(req.body.Username + " already exists");
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                })
                    .then((user) => {
                        res.status(201).json(user);
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send("Error: " + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
        });
});

// Get a user by username
app.get("/users/:username", authenticate, async (req, res) => {
    try {
        const user = await Users.findOne({
            Username: req.params.username,
        }).populate("FavoriteMovies");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a movie to user's favorites
app.post("/users/:username/movies/:movieId", authenticate, async (req, res) => {
    try {
        const user = await Users.findOneAndUpdate(
            { Username: req.params.username },
            { $addToSet: { FavoriteMovies: req.params.movieId } },
            { new: true }
        ).populate("FavoriteMovies");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove a movie from user's favorites
app.delete(
    "/users/:username/movies/:movieId",
    authenticate,
    async (req, res) => {
        try {
            const user = await Users.findOneAndUpdate(
                { Username: req.params.username },
                { $pull: { FavoriteMovies: req.params.movieId } },
                { new: true }
            ).populate("FavoriteMovies");
            if (!user)
                return res.status(404).json({ message: "User not found" });
            res.json(user);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

// Delete a user
app.delete("/users/:username", authenticate, async (req, res) => {
    try {
        const user = await Users.findOneAndDelete({
            Username: req.params.username,
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
