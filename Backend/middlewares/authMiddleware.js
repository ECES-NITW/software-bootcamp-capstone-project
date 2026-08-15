const jwt = require("jsonwebtoken");
const User = require("../models/User");

const AUTH_401_MESSAGE = "Session expired, please log in again";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: AUTH_401_MESSAGE,
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: AUTH_401_MESSAGE,
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: AUTH_401_MESSAGE,
    });
  }
};

module.exports = authMiddleware;
