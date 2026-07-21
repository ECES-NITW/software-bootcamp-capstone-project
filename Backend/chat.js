function openChat(io) {
    io.on("connection", (socket) => {
        console.log("A user connected!");
        console.log(socket.id);

        socket.on("join_room",(convo_id) => {
            socket.join(convo_id)
        })

        socket.on("message", (data) => {
            console.log(data);

            

            io.to(data.conversationId).emit("response", {
                id:data.msgId,
                message:data.message,
                sender:socket.sender
            });

        });

        socket.on("disconnect", () => {
            console.log("Disconnected", socket.id);
        });
    });
}

module.exports = openChat;