import { Server } from "socket.io";
import User from "./models/user.model.js";
import Captain from "./models/captain.model.js";

let io = null;

function initialiseSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("=== NEW SOCKET CONNECTION ===");
    console.log("Socket ID:", socket.id);
    
    socket.on("join", async (data) => {
      const { userId, role } = data;
      console.log("=== JOIN EVENT RECEIVED ===");
      console.log("User ID:", userId);
      console.log("Role:", role);
      console.log("Socket ID:", socket.id);

      try {
        if (role === "user") {
          const user = await User.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );
          console.log("User updated:", user ? `${user._id} - ${user.fullName?.firstName}` : "NOT FOUND");
          if (user) {
            socket.join(`user_${userId}`);
            console.log(`User joined room: user_${userId}`);
          }
        } else if (role === "captain") {
          const captain = await Captain.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );
          console.log("Captain updated:", captain ? `${captain._id} - ${captain.fullName?.firstName}` : "NOT FOUND");
          if (captain) {
            socket.join(`captain_${userId}`);
            console.log(`Captain joined room: captain_${userId}`);
          }
        }
        console.log("=== JOIN EVENT COMPLETE ===");
      } catch (err) {
        console.error("Error updating socketId:", err);
      }
    });

    socket.on("message", (data) => {
      io.emit("message", data);
    });

    socket.on("update-location-captain", async ({ userId, role, location }) => {
      console.log("=== LOCATION UPDATE RECEIVED ===");
      console.log("Captain ID:", userId);
      console.log("Location:", location);
      
      if (!location || !location.latitude || !location.longitude) {
        console.error("Invalid location data");
        return;
      }

      if (role === "captain") {
        const updatedCaptain = await Captain.findByIdAndUpdate(userId, {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }, { new: true });
        
        console.log("Captain location updated:", {
          id: updatedCaptain?._id,
          location: updatedCaptain?.location,
          socketId: updatedCaptain?.socketId
        });
      }
      console.log("=== LOCATION UPDATE COMPLETE ===");
    });

    socket.on("disconnect", () => {
      console.log("=== SOCKET DISCONNECTED ===");
      console.log("Socket ID:", socket.id);
    });
  });
}

function sendMessageToSocketId(socketId, event, message) {
  console.log("=== SENDING MESSAGE TO SOCKET ===");
  console.log("Target Socket ID:", socketId);
  console.log("Event:", event);
  console.log("Message:", JSON.stringify(message, null, 2));
  
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit(event, message);
    console.log("✅ Message sent successfully");
  } else {
    console.error(`❌ Socket with ID ${socketId} not found.`);
    console.log("Available sockets:", Array.from(io.sockets.sockets.keys()));
  }
  console.log("=== MESSAGE SEND COMPLETE ===");
}

export { initialiseSocket, sendMessageToSocketId };
