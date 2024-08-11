// Import the express module
const express = require("express");

// Import the morgan module
const morgan = require("morgan");

// Create an instance of express
const app = express();

// Define a port to run the server on
const PORT = process.env.PORT || 3000;

// Use Morgan to log all requests
app.use(morgan("common"));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define a route to get the top 10 movies
app.get("/movies", (req, res) => {
    // Define an array of top 10 movies
    const topMovies = [
        {
            title: "The Shawshank Redemption",
            year: 1994,
            director: "Frank Darabont",
        },
        {
            title: "The Godfather",
            year: 1972,
            director: "Francis Ford Coppola",
        },
        { title: "The Dark Knight", year: 2008, director: "Christopher Nolan" },
        { title: "Pulp Fiction", year: 1994, director: "Quentin Tarantino" },
        { title: "Schindler's List", year: 1993, director: "Steven Spielberg" },
        {
            title: "The Lord of the Rings: The Return of the King",
            year: 2003,
            director: "Peter Jackson",
        },
        { title: "Forrest Gump", year: 1994, director: "Robert Zemeckis" },
        { title: "Inception", year: 2010, director: "Christopher Nolan" },
        { title: "Fight Club", year: 1999, director: "David Fincher" },
        {
            title: "The Matrix",
            year: 1999,
            director: "Lana Wachowski, Lilly Wachowski",
        },
    ];

    // Send the array as a JSON response
    res.json(topMovies);
});

// Define a route to handle the root URL
app.get("/", (req, res) => {
    res.send("Welcome to My Movie API!");
});

// Additional Routes

// Return data about a single movie by title to the user
app.get("/movies/:title", (req, res) => {
    const title = req.params.title;
    res.send(
        `Successful GET request returning data about the movie titled: ${title}`
    );
});

// Return data about a genre by name/title
app.get("/genres/:name", (req, res) => {
    const genreName = req.params.name;
    res.send(
        `Successful GET request returning data about the genre: ${genreName}`
    );
});

// Return data about a director by name
app.get("/directors/:name", (req, res) => {
    const directorName = req.params.name;
    res.send(
        `Successful GET request returning data about the director: ${directorName}`
    );
});

// Allow new users to register
app.post("/users", (req, res) => {
    res.send("POST request to register a new user");
});

// Allow users to update their user info (username)
app.put("/users/:username", (req, res) => {
    const username = req.params.username;
    res.send(
        `Successful PUT request to update user info for username: ${username}`
    );
});

// Allow users to add a movie to their list of favorites
app.post("/users/:username/movies/:movieID", (req, res) => {
    const { username, movieID } = req.params;
    res.send(
        `Successful POST request to add movie with ID ${movieID} to ${username}'s list of favorites`
    );
});

// Allow users to remove a movie from their list of favorites
app.delete("/users/:username/movies/:movieID", (req, res) => {
    const { username, movieID } = req.params;
    res.send(
        `Successful DELETE request to remove movie with ID ${movieID} from ${username}'s list of favorites`
    );
});

// Allow existing users to deregister
app.delete("/users/:username", (req, res) => {
    const username = req.params.username;
    res.send(
        `Successful DELETE request to deregister user with username: ${username}`
    );
});

// Error-handling middleware function
app.use((err, req, res, next) => {
    // Log the error details to the terminal
    console.error(err.stack);

    // Send a generic error response
    res.status(500).send("Something went wrong! Please try again later.");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
