const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

// Static method to hash passwords
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

// Instance method to validate passwords
userSchema.methods.validatePassword = function (password) {
    console.log(`Comparing: ${password} with stored hash: ${this.Password}`);
    return bcrypt.compareSync(password, this.Password);
};

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("Password") || this.isNew) {
        this.Password = await this.constructor.hashPassword(this.Password);
    }
    next();
});

let User = mongoose.model("User", userSchema);

module.exports.User = User;
