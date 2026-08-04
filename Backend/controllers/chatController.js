const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Product = require("../models/Product");

const getProductConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const product = await Product.findById(productId).select("seller");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const sellerId = product.seller;

    if (String(sellerId) === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation on your own product",
      });
    }

    let conversation = await Conversation.findOne({
      productId,
      buyerId: userId,
    });
    if (!conversation) {
      conversation = await Conversation.create({
        productId,
        buyerId: userId,
        sellerId,
      });
    }

    return res.status(200).json({
      conversationId: conversation._id,
      lastMessage: conversation.lastMessage,
      buyerId: conversation.buyerId,
      sellerId: conversation.sellerId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    // Only a participant (buyer or seller) may read the thread.
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    const uid = req.user.id;
    if (
      String(conversation.buyerId) !== uid &&
      String(conversation.sellerId) !== uid
    ) {
      return res.status(403).json({
        success: false,
        message: "Not a participant of this conversation",
      });
    }

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addMessage = async (messageData) => {
  const conversationId = messageData.conversationId;
  const type = messageData.type === "offer" ? "offer" : "text";

  if (type === "offer") {
    const amount = Number(messageData.offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid offer amount");
    }

    await Message.create({
      msgId: messageData.msgId,
      conversationId,
      sender: messageData.sender,
      type,
      message: messageData.message || "",
      offerAmount: amount,
      offerStatus: "none",
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: `Offered ₹${amount}`,
    });
    return;
  }

  const message = messageData.message;
  await Message.create({
    msgId: messageData.msgId,
    conversationId,
    sender: messageData.sender,
    type,
    message,
  });
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message,
  });
};

const updateOfferStatus = async ({ msgId, status, userId }) => {
  if (!["accepted", "declined"].includes(status)) {
    throw new Error("Invalid offer status");
  }

  const message = await Message.findOne({ msgId });
  if (!message || message.type !== "offer") {
    throw new Error("Offer not found");
  }
  if (String(message.sender) === String(userId)) {
    throw new Error("You cannot respond to your own offer");
  }
  if (message.offerStatus !== "none") {
    throw new Error("Offer has already been resolved");
  }

  message.offerStatus = status;
  await message.save();

  const conversationUpdate = {
    lastMessage:
      status === "accepted"
        ? `Offer of ₹${message.offerAmount} accepted`
        : `Offer of ₹${message.offerAmount} declined`,
  };
  // The agreed price only changes when an offer is accepted
  if (status === "accepted") {
    conversationUpdate.currentOffer = message.offerAmount;
  }
  await Conversation.findByIdAndUpdate(
    message.conversationId,
    conversationUpdate,
  );

  return message;
};

const getAgreedPrice = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const conversation = await Conversation.findOne({
      productId,
      $or: [{ buyerId: userId }, { sellerId: userId }],
      currentOffer: { $ne: null },
    })
      .sort({ updatedAt: -1 })
      .select("currentOffer");

    return res.status(200).json({
      success: true,
      agreedPrice: conversation?.currentOffer ?? null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await Conversation.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate("buyerId", "userName profilePic")
      .populate("sellerId", "userName profilePic")
      .populate("productId")
      .sort({ updatedAt: -1 })
      .lean();

    const conversations = chats
      .filter((chat) => chat.buyerId && chat.sellerId && chat.productId)
      .map((chat) => ({
        ...chat,

        buyer: chat.buyerId,
        seller: chat.sellerId,
        product: chat.productId,

        buyerId: chat.buyerId._id,
        sellerId: chat.sellerId._id,
        productId: chat.productId._id,

        role: chat.buyerId._id.equals(userId) ? "buyer" : "seller",
      }));
    return res.status(200).json({
      success: true,
      conversations,
      conversation_count: conversations.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getProductConversation,
  getMessages,
  addMessage,
  updateOfferStatus,
  getAgreedPrice,
  getConversations,
};
