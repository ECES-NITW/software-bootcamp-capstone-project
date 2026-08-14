const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const buyer = req.user.id;
    const {
      productId,
      orderType,
      rentalStartDate,
      rentalEndDate,
      swapProduct,
    } = req.body;

    if (!["buy", "rent", "exchange"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Order type must be one of buy, rent or exchange.",
      });
    }

    const requiredListingType = orderType === "buy" ? "sell" : orderType;

    const product = await Product.findById(productId);
    console.log("PRODUCT STATUS:", product.status);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (String(product.seller) === String(buyer)) {
      return res.status(400).json({
        success: false,
        message: "It's your own product mann!!",
      });
    }
    if (product.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "Product is unavailable now",
      });
    }

    if (!product.types.includes(requiredListingType)) {
      return res.status(400).json({
        success: false,
        message: `This listing is not available for ${requiredListingType}. It is listed for: ${product.types.join(", ")}.`,
      });
    }

    const amountByOrderType = {
      buy: product.price,
      rent: product.rentPrice,
      exchange: 0,
    };

    const order = new Order({
      buyer,
      seller: product.seller,
      product: product._id,
      orderType,
      totalAmount: amountByOrderType[orderType] ?? 0,

      rentalStartDate: orderType === "rent" ? rentalStartDate : undefined,
      rentalEndDate: orderType === "rent" ? rentalEndDate : undefined,

      swapProduct: orderType === "exchange" ? swapProduct : undefined,
    });

    await order.save();
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllMyOrders = async (req, res) => {
  try {
    const buyer = req.user.id;
    const orders = await Order.find({ buyer })
      .populate("product")
      .populate("seller", "userName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    console.log("Order ID:", orderId);
    console.log("Order:", order);
    console.log(req.params);
    console.log(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invalid Order",
      });
    }

    if (String(order.seller) !== String(seller)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to accept this order",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order has already been processed",
      });
    }

    order.status = "accepted";
    await order.save();

    await Product.findByIdAndUpdate(order.product, {
      status: "Reserved",
    });

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReceivedOrders = async (req, res) => {
  try {
    const seller = req.user.id;

    const orders = await Order.find({ seller })
      .populate("buyer", "userName email profilePic")
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sorry,Order not found",
      });
    }

    if (String(seller) !== String(order.seller)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to reject this order",
      });
    }

    order.status = "rejected";
    await order.save();
    await Product.findByIdAndUpdate(order.product, {
      status: "Available",
    });
    return res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const buyer = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sorry, Order not found",
      });
    }

    if (String(order.buyer) !== String(buyer)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to cancel this order",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();
    await Product.findByIdAndUpdate(order.product, {
      status: "Available",
    });
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeOrder = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sorry, Order not found",
      });
    }
    if (String(order.seller) !== String(seller)) {
      return res.status(403).json({
        success: false,
        message: "You are unauthorized to complete this order",
      });
    }

    if (order.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted orders can be completed",
      });
    }

    order.status = "completed";
    await order.save();
    const productStatus = order.orderType === "rent" ? "Available" : "Sold";

    await Product.findByIdAndUpdate(order.product, {
      status: productStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Order completed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const buyer = req.user.id;
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("buyer", "userName email profilePic")
      .populate("seller", "userName email profilePic")
      .populate("product")
      .populate("swapProduct");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (
      String(order.buyer._id) !== String(buyer) &&
      String(order.seller._id) !== String(buyer)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.seller) !== String(seller)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!["paid", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrdersByStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.params;

    const validStatus = [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const orders = await Order.find({
      status,
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("buyer", "userName email profilePic")
      .populate("seller", "userName email profilePic")
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const returnRentalToSeller = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (String(order.seller) !== String(seller)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (order.orderType !== "rent") {
      return res.status(400).json({
        success: false,
        message: "This is not a rental order",
      });
    }

    if (order.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Rental has not been accepted",
      });
    }
    if (new Date() < new Date(order.rentalEndDate)) {
      return res.status(400).json({
        success: false,
        message: "Rental period has not ended yet",
      });
    }
    order.status = "completed";
    await order.save();
    await Product.findByIdAndUpdate(order.product._id, {
      status: "Available",
    });

    return res.status(200).json({
      success: true,
      message: "Rental returned successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const requestRentalExtension = async (req, res) => {
  try {
    const buyer = req.user.id;
    const { orderId } = req.params;
    const { newRentalEndDate } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.buyer) !== String(buyer)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (order.orderType !== "rent") {
      return res.status(400).json({
        success: false,
        message: "This is not a rental order",
      });
    }

    if (order.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Rental is not active",
      });
    }

    if (!newRentalEndDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new rental end date",
      });
    }

    if (new Date(newRentalEndDate) <= new Date(order.rentalEndDate)) {
      return res.status(400).json({
        success: false,
        message: "New date must be after current rental end date",
      });
    }

    order.extensionRequestedDate = newRentalEndDate;
    order.extensionStatus = "pending";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Extension request sent successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveRentalExtension = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.seller) !== String(seller)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (order.extensionStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending extension request",
      });
    }

    order.rentalEndDate = order.extensionRequestedDate;
    order.extensionRequestedDate = undefined;
    order.extensionStatus = "approved";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Extension approved successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectRentalExtension = async (req, res) => {
  try {
    const seller = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.seller) !== String(seller)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (order.extensionStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending extension request",
      });
    }

    order.extensionRequestedDate = undefined;
    order.extensionStatus = "rejected";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Extension request rejected",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderStatistics = async (req, res) => {
  try {
    console.log("Statistics controller called");
    const userId = req.user.id;

    const totalOrders = await Order.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
    });

    const pendingOrders = await Order.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      status: "pending",
    });

    const acceptedOrders = await Order.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      status: "accepted",
    });

    const rejectedOrders = await Order.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      status: "rejected",
    });

    const completedOrders = await Order.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      status: "completed",
    });

    const cancelledOrders = await Order.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      status: "cancelled",
    });

    const revenue = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(userId),
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        rejectedOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: revenue.length ? revenue[0].totalRevenue : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
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
  approveRentalExtension,
  rejectRentalExtension,
  requestRentalExtension,
  getOrderStatistics,
};
