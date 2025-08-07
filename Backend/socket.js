import { Server } from "socket.io";
import User from "./models/user.model.js";
import Captain from "./models/captain.model.js";

let io = null;

function initialiseSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", async (data) => {
      const { userId, role } = data;

      try {
        if (role === "user") {
          console.log("Attempting to update user with ID:", userId);
          const user = await User.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );
          console.log("User after update:", user);
          if (user) {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined room`);
          } else {
            console.log(`User not found for id: ${userId}`);
          }
        } else if (role === "captain") {
          const captain = await Captain.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );
          console.log("Captain after update:", captain);
          if (captain) {
            socket.join(`captain_${userId}`);
            console.log(`Captain ${userId} joined room`);
          } else {
            console.log(`Captain not found for id: ${userId}`);
          }
        }
      } catch (err) {
        console.error("Error updating socketId:", err);
        console.error("Error details:", err.message);
      }
    });

    socket.on("message", (data) => {
      console.log("Message received:", data);
      // Broadcast the message to all connected clients
      io.emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

function sendMessageToSocketId(socketId, event, message) {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit(event, message);
  } else {
    console.error(`Socket with ID ${socketId} not found.`);
  }
}

export { initialiseSocket, sendMessageToSocketId };
