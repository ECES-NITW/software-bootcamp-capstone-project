const { addMessage: sendMessage } = require("./controllers/chatController");

function openChat(io) {
    io.on("connection", (socket) => {
        console.log("A user connected!");
        console.log(socket.id);

        socket.on("join_room",(convo_id) => {
            socket.join(convo_id)
        })

        socket.on("message", async (data) => {
            console.log(data);
            try{
                //Saving the message to database
                await sendMessage(data)

                // Broadcast to the OTHER participants only - the sender already
                // has the message optimistically in its cache, so echoing it back
                // would create a duplicate (the client does no deduping).
                // NOTE: sender is taken from the payload for now; step 8 will
                // derive it from the authenticated socket instead of trusting the client.
                socket.to(data.conversationId).emit("response", {
                    id:data.msgId,
                    message:data.message,
                    sender:data.sender
                });
            }catch(err){
                console.error("Failed to persist message", err);
                // Notify only the sender that their message failed, not the room.
                socket.emit("response", {
                    id:data.msgId,
                    message:data.message,
                    sender:data.sender,
                    status:"error"
                });
            }

        });

        socket.on("disconnect", () => {
            console.log("Disconnected", socket.id);
        });
    });
}

module.exports = openChat;