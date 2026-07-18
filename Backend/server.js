const http = require("http");
const { Server } = require("socket.io");
const openChat = require("./chat")

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/Database");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Campus Marketplace Backend is Running!!");
});
const PORT = process.env.PORT || 5000;

//http wrapper for the app , used for socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

openChat(io)

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
