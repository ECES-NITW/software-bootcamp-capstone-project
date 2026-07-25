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
        // Derived from the product server-side (not client-supplied). Not
        // required yet because the product -> seller lookup lands with the Item
        // model in step 6; until then conversations are created without it.
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
