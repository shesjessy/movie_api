const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema(
    {
        Title: { type: String, required: true },
        Description: { type: String, required: true },
        Genre: {
            Name: { type: String, required: true },
            Description: { type: String, required: true },
        },
        Director: {
            Name: { type: String, required: true },
            Bio: String,
        },
        Actors: [String],
        ImagePath: String,
        Featured: { type: Boolean, default: false },
    },
    { timestamps: true }
); // Adds createdAt and updatedAt fields

let userSchema = mongoose.Schema(
    {
        Username: { type: String, required: true, unique: true, minLength: 5 },
        Password: { type: String, required: true, minLength: 8 },
        Email: {
            type: String,
            required: true,
            unique: true,
            match: /.+\@.+\..+/, // Basic email format validation
        },
        Birthday: Date,
        FavoriteMovies: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
        ],
    },
    { timestamps: true }
);

// Hash the user's password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("Password") || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.Password = await bcrypt.hash(this.Password, salt);
    }
    next();
});

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
