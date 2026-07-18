function openChat(io) {
    io.on("connection", (socket) => {
        console.log("A user connected!");
        console.log(socket.id);

        socket.on("message", (data) => {
            console.log(data);
            io.emit("response", {
                message:data,
                sender:socket.id
            });
        });

        socket.on("disconnect", () => {
            console.log("Disconnected", socket.id);
        });
    });
}

module.exports = openChat;