const jwt = require("jsonwebtoken");
const Conversation = require("./models/Conversation");
const { addMessage: sendMessage } = require("./controllers/chatController");

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
                    conversationId: data.conversationId,
                    message: data.message,
                    sender: socket.userId,
                });
            } catch (err) {
                console.error("Failed to persist message", err);
                // Notify only the sender that their message failed.
                socket.emit("response", {
                    id: data.msgId,
                    conversationId: data.conversationId,
                    message: data.message,
                    sender: socket.userId,
                    status: "error",
                });
            }
        });

        socket.on("disconnect", () => {});
    });
}

module.exports = openChat;
