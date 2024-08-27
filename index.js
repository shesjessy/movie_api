const express = require("express");
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/moviedb", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("Could not connect to MongoDB:", err));

// Routes

// Get all movies
app.get("/movies", async (req, res) => {
    try {
        const movies = await Movies.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single movie by ID
app.get("/movies/:id", async (req, res) => {
    try {
        const movie = await Movies.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new movie
app.post("/movies", async (req, res) => {
    const movie = new Movies(req.body);
    try {
        const newMovie = await movie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an existing movie
app.put("/movies/:id", async (req, res) => {
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
app.delete("/movies/:id", async (req, res) => {
    try {
        const deletedMovie = await Movies.findByIdAndDelete(req.params.id);
        if (!deletedMovie)
            return res.status(404).json({ message: "Movie not found" });
        res.json({ message: "Movie deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User registration
app.post("/users", async (req, res) => {
    const user = new Users(req.body);
    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a user by username
app.get("/users/:username", async (req, res) => {
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
app.post("/users/:username/movies/:movieId", async (req, res) => {
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
app.delete("/users/:username/movies/:movieId", async (req, res) => {
    try {
        const user = await Users.findOneAndUpdate(
            { Username: req.params.username },
            { $pull: { FavoriteMovies: req.params.movieId } },
            { new: true }
        ).populate("FavoriteMovies");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user
app.delete("/users/:username", async (req, res) => {
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
