require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); // Required for socket.io
const { Server } = require('socket.io'); // Import socket.io
const connectDB = require('./src/config/db');
const Message = require('./src/models/Message'); // Import Message model

const app = express();
const server = http.createServer(app); // Create HTTP server


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust according to frontend
        credentials: true,
    }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.set("view engine", "ejs");

// Routes
const loginRoutes = require('./src/routes/login-routes');
const homeRoutes = require('./src/routes/home-routes');
const storyRoutes = require('./src/routes/story-routes');
const messagesRoutes = require('./src/routes/messages-routes');

// Handle socket.io connections
io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // User joins a chat room
    socket.on("joinChat", ({ userId, otherId }) => {
        const chatRoom = [userId, otherId].sort().join("_"); // Unique room ID
        socket.join(chatRoom);
        console.log(`User ${userId} joined chat with ${otherId}`);
    });

    // Handle sending messages
    socket.on("sendMessage", async ({ sender, receiver, message }) => {
        try {
            // Save message to MongoDB
            const newMessage = new Message({ senderId: sender, receiverId: receiver, message });
            await newMessage.save();

            // Emit message to both users in the chat
            const chatRoom = [sender, receiver].sort().join("_");
            io.to(chatRoom).emit("receiveMessage", { sender, message });
        } catch (error) {
            console.error("Message saving error:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Apply routes
app.use('/', loginRoutes);
app.use('/home', homeRoutes);
app.use('/', storyRoutes);
app.use('/', messagesRoutes);

// Start server
server.listen(process.env.PORT, async () => {
    await connectDB(); // Connect to MongoDB
    console.log(`Application is running on port ${process.env.PORT}`);
});
