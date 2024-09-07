const express = require("express");
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

const cors = require("cors");
app.use(cors());

const { check, validationResult } = require("express-validator");

// Middleware to parse JSON bodies
app.use(express.json());

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

// Protecting all endpoints except for registration and login
const authenticate = passport.authenticate("jwt", { session: false });

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/moviedb", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("Could not connect to MongoDB:", err));

// ROUTES

// 1. Return a list of ALL movies to the user
app.get("/movies", authenticate, async (req, res) => {
    try {
        const movies = await Movies.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Return data about a single movie by title
app.get("/movies/title/:title", authenticate, async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.title });
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.json({
            title: movie.Title,
            description: movie.Description,
            genre: movie.Genre,
            director: movie.Director,
            imageUrl: movie.ImageUrl,
            featured: movie.Featured,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Return data about a genre (description) by name
app.get("/genres/:name", authenticate, async (req, res) => {
    try {
        const genre = await Movies.findOne({ "Genre.Name": req.params.name });
        if (!genre) return res.status(404).json({ message: "Genre not found" });
        res.json({ description: genre.Genre.Description });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Return data about a director (bio, birth year, death year) by name
app.get("/directors/:name", authenticate, async (req, res) => {
    try {
        const director = await Movies.findOne({
            "Director.Name": req.params.name,
        });
        if (!director)
            return res.status(404).json({ message: "Director not found" });
        res.json({
            name: director.Director.Name,
            bio: director.Director.Bio,
            birthYear: director.Director.BirthYear,
            deathYear: director.Director.DeathYear,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. User registration (no authentication required)
// with validation
app.post(
    "/users",
    [
        check(
            "Username",
            "Username is required and must be at least 5 characters long"
        ).isLength({ min: 5 }),
        check(
            "Username",
            "Username contains non-alphanumeric characters - not allowed"
        ).isAlphanumeric(),
        check("Password", "Password is required").not().isEmpty(),
        check("Email", "Email is not valid").isEmail(),
        check("Birthday", "Birthday must be a valid date")
            .optional()
            .isISO8601(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
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
                        .then((user) => res.status(201).json(user))
                        .catch((error) =>
                            res.status(500).send("Error: " + error)
                        );
                }
            })
            .catch((error) => res.status(500).send("Error: " + error));
    }
);

// 6. Update user info (username, password, email, date of birth) by user ID
//with validation
app.put(
    "/users/:id",
    authenticate,
    [
        check("Username", "Username must be at least 5 characters long")
            .optional()
            .isLength({ min: 5 }),
        check(
            "Username",
            "Username contains non-alphanumeric characters - not allowed"
        )
            .optional()
            .isAlphanumeric(),
        check("Password", "Password is required").optional().not().isEmpty(),
        check("Email", "Email is not valid").optional().isEmail(),
        check("Birthday", "Birthday must be a valid date")
            .optional()
            .isISO8601(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const hashedPassword = req.body.Password
            ? Users.hashPassword(req.body.Password)
            : undefined;

        const updateFields = {
            Username: req.body.Username,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
        };

        if (hashedPassword) {
            updateFields.Password = hashedPassword;
        }

        try {
            const updatedUser = await Users.findByIdAndUpdate(
                req.params.id,
                { $set: updateFields },
                { new: true }
            );

            if (!updatedUser)
                return res.status(404).json({ message: "User not found" });

            res.json(updatedUser);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

// 7. Add a movie to a user's favorites
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

// 8. Remove a movie from a user's favorites
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

// 9. Deregister (delete) a user
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

// Server startup
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
    console.log("Listening on Port " + port);
});
