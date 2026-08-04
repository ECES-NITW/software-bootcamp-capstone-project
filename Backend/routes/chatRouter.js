const express = require("express");
const router = express.Router();
const { getProductConversation, getMessages, getConversations, getAgreedPrice } = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/conversation/:productId", authMiddleware, getProductConversation);
router.get("/messages", authMiddleware, getMessages);
router.get("/conversations", authMiddleware, getConversations)
router.get("/agreed-price/:productId", authMiddleware, getAgreedPrice);

module.exports = router;
