const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create/:orderId", authMiddleware, createRazorpayOrder);

router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;
