const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      Required: true,
      trim: true,
    },
    email: {
      type: String,
      Required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      Required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
