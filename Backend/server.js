const http = require("http");
const { Server } = require("socket.io");
const openChat = require("./chat");

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const chatRouter = require("./routes/chatRouter");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const connectDB = require("./config/Database");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/chat", chatRouter);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.get("/", (req, res) => {
  res.send("Campus Marketplace Backend is Running!!");
});
const PORT = process.env.PORT || 5000;

//http wrapper for the app , used for socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

openChat(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
