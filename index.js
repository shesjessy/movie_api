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
