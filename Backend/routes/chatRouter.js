const express = require("express");
const router = express.Router();
const { getProductConversation } = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/conversation/:productId", authMiddleware, getProductConversation);

module.exports = router;
