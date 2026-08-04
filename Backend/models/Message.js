const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        msgId: {
            type: String,
            required: true,
            unique: true,
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "offer"],
            default: "text",
        },
        message: {
            type: String,
            required: function () {
                return this.type !== "offer";
            },
        },
        offerAmount: {
            type: Number,
            min: [0, "Offer cannot be negative"],
        },
        offerStatus: {
            type: String,
            enum: ["none", "accepted", "declined"],
            default: "none",
        },
    },
    { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
