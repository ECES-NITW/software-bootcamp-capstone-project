const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderType: {
      type: String,
      enum: ["buy", "rent", "exchange"],
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    rentalStartDate: {
      type: Date,
    },
    rentalEndDate: {
      type: Date,
    },
    extensionRequestedDate: {
      type: Date,
    },

    extensionStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    swapProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);
