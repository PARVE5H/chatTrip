import connectDB from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { errorHandler, notFound } from "./middlewares/errorMiddlewares.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import { Server } from "socket.io";
import path from "path";
import { setSocketInstance } from "./controllers/chatControllers.js";

// Load environment variables FIRST
dotenv.config();

// Then connect to database
connectDB();

// Initialize Express app
const app = express();

// Security middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// my routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/otp", otpRoutes);

// --------------------------Deployment ------------------------------------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  
  // Handle React routing, return all requests to React app
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is Running");
  });
}

// --------------------------Deployment ------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server Started on PORT ${PORT}`));

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Track which users are in which chat rooms
const userActiveChatRooms = new Map();

// Inject socket instance into chat controllers
setSocketInstance(io);

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id;
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // Track that this user is now in this chat room
    userActiveChatRooms.set(socket.userId, room);
    console.log(`User ${socket.userId} joined room: ${room}`);
  });

  socket.on("leave chat", (room) => {
    socket.leave(room);
    // Remove user from active chat room tracking
    if (userActiveChatRooms.get(socket.userId) === room) {
      userActiveChatRooms.delete(socket.userId);
    }
    console.log(`User ${socket.userId} left room: ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) {
      return console.log("Chat.users not defined");
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      // Check if the user is currently in this chat room
      const userActiveRoom = userActiveChatRooms.get(user._id);

      // Only send notification if user is NOT currently in this chat room
      if (userActiveRoom !== chat._id) {
        socket.in(user._id).emit("message received", newMessageReceived);
      } else {
        // If user is in the chat room, send the message directly to the room
        socket.in(chat._id).emit("message received", newMessageReceived);
      }
    });
  });

  // Group operation events
  socket.on("group created", (groupData) => {
    if (!groupData.users) return;

    groupData.users.forEach((user) => {
      if (user._id !== socket.userId) {
        socket.in(user._id).emit("group created", groupData);
      }
    });
  });

  socket.on("member added", (data) => {
    const { chat, addedUser } = data;
    if (!chat.users) return;

    // Notify all group members about the new member
    chat.users.forEach((user) => {
      socket.in(user._id).emit("member added", data);
    });
  });

  socket.on("member removed", (data) => {
    const { chat, removedUser } = data;
    if (!chat.users) return;

    // Notify all group members about the removed member
    chat.users.forEach((user) => {
      socket.in(user._id).emit("member removed", data);
    });

    // Also notify the removed user
    socket.in(removedUser._id).emit("member removed", data);
  });

  socket.on("group deleted", (data) => {
    const { chat, deletedBy } = data;
    if (!chat.users) return;

    // Notify all group members about group deletion
    chat.users.forEach((user) => {
      if (user._id !== deletedBy._id) {
        socket.in(user._id).emit("group deleted", data);
      }
    });
  });

  socket.on("group renamed", (data) => {
    const { chat, renamedBy } = data;
    if (!chat.users) return;

    // Notify all group members about group rename
    chat.users.forEach((user) => {
      if (user._id !== renamedBy._id) {
        socket.in(user._id).emit("group renamed", data);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    // Clean up user's active chat room tracking
    if (socket.userId) {
      userActiveChatRooms.delete(socket.userId);
    }
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
