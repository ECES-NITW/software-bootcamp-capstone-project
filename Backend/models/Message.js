const mongoose = require("mongoose");

// One document per message. conversationId is the reference (foreign key).
const messageSchema = new mongoose.Schema(
    {
        // Client-generated id (crypto.randomUUID) for idempotency.
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
        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Index the foreign key (+ createdAt) so fetching a thread in order is one
// indexed operation instead of a full collection scan.
messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
