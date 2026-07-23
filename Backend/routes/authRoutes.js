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
router.get("/me", authMiddleware, (req, res) => {
    return res.status(201).json({ user: req.user });
});

module.exports = router;
