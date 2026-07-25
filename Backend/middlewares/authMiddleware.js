const jwt = require("jsonwebtoken");

// Sent on every auth/JWT 401 so the frontend can tell a session failure (which
// should log the user out) apart from an unrelated 401. Keep this string in sync
// with the check in frontend/src/api/api.js.
const AUTH_401_MESSAGE = "Session expired, please log in again";

const authMiddleware = (req, res, next) => {
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
