const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
    register,
    login,
    handleGetProfile,
    handleUpdateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
router.post("/register", register).post("/login", login);
router.get("/profile", authMiddleware, handleGetProfile);
router.put(
    "/profile",
    authMiddleware,
    upload.single("profilePic"),
    handleUpdateProfile,
);

module.exports = router;
