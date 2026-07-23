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
                await sendMessage(data)
                io.to(data.conversationId).emit("response", {
                    id:data.msgId,
                    message:data.message,
                    sender:socket.sender
                });
            }catch{
                io.to(data.conversationId).emit("response", {
                    id:data.msgId,
                    message:data.message,
                    sender:socket.sender,
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