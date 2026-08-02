const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllMyOrders,
  acceptOrder,
  getReceivedOrders,
  rejectOrder,
  cancelOrder,
  completeOrder,
  getOrderById,
  updatePaymentStatus,
  getOrdersByStatus,
  returnRentalToSeller,
  requestRentalExtension,
  approveRentalExtension,
  rejectRentalExtension,
  getOrderStatistics,
} = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, createOrder);
router
  .patch("/accept/:orderId", authMiddleware, acceptOrder)
  .patch("/reject/:orderId", authMiddleware, rejectOrder)
  .patch("/cancel/:orderId", authMiddleware, cancelOrder)
  .patch("/complete/:orderId", authMiddleware, completeOrder)
  .patch("/payment/:orderId", authMiddleware, updatePaymentStatus)
  .patch("/return/:orderId", authMiddleware, returnRentalToSeller)
  .patch("/requestExtension/:orderId", authMiddleware, requestRentalExtension)
  .patch("/approveExtension/:orderId", authMiddleware, approveRentalExtension)
  .patch("/rejectExtension/:orderId", authMiddleware, rejectRentalExtension);
router
  .get("/myorders", authMiddleware, getAllMyOrders)
  .get("/receivedorders", authMiddleware, getReceivedOrders)
  .get("/status/:status", authMiddleware, getOrdersByStatus)
  .get("/statistics", authMiddleware, getOrderStatistics);
router.get("/:orderId", authMiddleware, getOrderById);

module.exports = router;
