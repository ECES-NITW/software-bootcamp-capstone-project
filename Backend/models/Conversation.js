const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lastMessage: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
