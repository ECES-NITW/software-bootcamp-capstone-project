const jwt = require("jsonwebtoken");
const Conversation = require("./models/Conversation");
const {
    addMessage: sendMessage,
    updateOfferStatus,
} = require("./controllers/chatController");

// True if userId is the buyer or seller on the conversation.
const isParticipant = (conversation, userId) =>
    conversation &&
    (String(conversation.buyerId) === userId ||
        String(conversation.sellerId) === userId);

function openChat(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication required"));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        // Join a conversation room only if the user is a participant.
        socket.on("join_room", async (convo_id) => {
            try {
                const conversation = await Conversation.findById(convo_id);
                if (isParticipant(conversation, socket.userId)) {
                    socket.join(convo_id);
                }
            } catch (err) {
                console.error("join_room failed", err);
            }
        });

        socket.on("leave_room", (convo_id) => {
            socket.leave(convo_id);
        });

        socket.on("message", async (data) => {
            try {
                const conversation = await Conversation.findById(
                    data.conversationId,
                );
                if (!isParticipant(conversation, socket.userId)) {
                    throw new Error("Not a participant");
                }

                await sendMessage({ ...data, sender: socket.userId });

                socket.to(data.conversationId).emit("response", {
                    id: data.msgId,
                    msgId: data.msgId,
                    conversationId: data.conversationId,
                    message: data.message,
                    sender: socket.userId,
                    type: data.type === "offer" ? "offer" : "text",
                    offerAmount: data.offerAmount,
                    offerStatus: data.type === "offer" ? "none" : undefined,
                });
            } catch (err) {
                console.error("Failed to persist message", err);
                socket.emit("response", {
                    id: data.msgId,
                    msgId: data.msgId,
                    conversationId: data.conversationId,
                    message: data.message,
                    sender: socket.userId,
                    status: "error",
                });
            }
        });

        socket.on("offer_update", async (data) => {
            try {
                const conversation = await Conversation.findById(
                    data.conversationId,
                );
                if (!isParticipant(conversation, socket.userId)) {
                    throw new Error("Not a participant");
                }

                const message = await updateOfferStatus({
                    msgId: data.msgId,
                    status: data.status,
                    userId: socket.userId,
                });

                io.to(data.conversationId).emit("offerUpdate", {
                    msgId: data.msgId,
                    conversationId: data.conversationId,
                    offerStatus: message.offerStatus,
                    offerAmount: message.offerAmount,
                });
            } catch (err) {
                console.error("Failed to update offer", err);
                socket.emit("offerUpdate", {
                    msgId: data.msgId,
                    conversationId: data.conversationId,
                    status: "error",
                    error: err.message,
                });
            }
        });

        socket.on("disconnect", () => {});
    });
}

module.exports = openChat;
