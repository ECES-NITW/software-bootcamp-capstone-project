const express = require("express");
const router = express.Router();

const { toggleWishlist, getWishlist } = require("../controllers/wishlistController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getWishlist);
router.post("/:id", authMiddleware, toggleWishlist);

module.exports = router;
