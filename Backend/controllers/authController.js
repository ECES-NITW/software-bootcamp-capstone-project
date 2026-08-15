const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const register = async (req, res) => {
  try {
    const { userName, email, phoneNumber, password } = req.body;
    console.log(req.body);
    if (!userName || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }
    if (!email.endsWith("@student.nitw.ac.in")) {
      return res.status(400).json({
        success: false,
        message: "Only NIT Warangal email addresses are allowed.",
      });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "An account with this email already exists"
            : "An account with this phone number already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        user_id: user._id,
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password to continue",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please Register",
      });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Sorry, user not found",
      });
    }
    return res.status(200).json({
      success: true,
      user: {
        user_id: user._id,
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetContactInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "userName profilePic phoneNumber",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user: {
        user_id: user._id,
        userName: user.userName,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleUpdateProfile = async (req, res) => {
  try {
    const { userName } = req.body;
    const id = req.user.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    let imageUrl = user.profilePic;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile-image",
      });

      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }
    if (userName) {
      user.userName = userName;
      user.profilePic = imageUrl;
    }
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        user_id: user._id,
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  register,
  login,
  handleGetProfile,
  handleGetContactInfo,
  handleUpdateProfile,
};
