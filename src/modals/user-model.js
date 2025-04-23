const mongoose = require("mongoose");
const crypto = require("crypto")
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true, // Ensures that the username is unique
    // required: true, // Make sure username is always provided, but will be auto-generated if missing
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  avatar: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  refreshToken: {
    type: String,
  },
});

userSchema.pre("save", function (next) {
  if (!this.username || this.username.trim() === "") {
    this.username = "User_" + crypto.randomBytes(3).toString("hex"); // Random unique string as username
  }
  next();
});

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

module.exports = User;
