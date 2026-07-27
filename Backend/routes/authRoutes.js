const express = require("express");
const router = express.Router();
// const upload = require("../middlewares/uploadMiddleware");
const {
  register,
  login,
  handleGetProfile,
  handleGetContactInfo,
  handleUpdateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
router.post("/register", register).post("/login", login);

// Authenticated: the logged-in user's own profile (read + update).
router.get("/me", authMiddleware, handleGetProfile);
router.put(
  "/profile",
  authMiddleware,
  //   upload.single("profilePic"),
  handleUpdateProfile,
);

router.get("/profile/:userId", handleGetContactInfo);

module.exports = router;
