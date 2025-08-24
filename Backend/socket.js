import { Server } from "socket.io";
import User from "./models/user.model.js";
import Captain from "./models/captain.model.js";
import mongoose from "mongoose";

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
        // ✅ Validate userId format
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          console.error("❌ Invalid userId format:", userId);
          socket.emit("error", { message: "Invalid user ID format" });
          return;
        }

        if (role === "user") {
          const user = await User.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );

          if (!user) {
            console.error("❌ User not found:", userId);
            socket.emit("error", { message: "User not found" });
            return;
          }

          console.log(
            "✅ User updated:",
            `${user._id} - ${user.fullName?.firstName}`
          );
          socket.join(`user_${userId}`);
          console.log(`✅ User joined room: user_${userId}`);

          // ✅ Confirm join success
          socket.emit("joined", { role: "user", userId });
        } else if (role === "captain") {
          const captain = await Captain.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true }
          );

          if (!captain) {
            console.error("❌ Captain not found:", userId);
            socket.emit("error", { message: "Captain not found" });
            return;
          }

          console.log(
            "✅ Captain updated:",
            `${captain._id} - ${captain.fullName?.firstName}`
          );
          socket.join(`captain_${userId}`);
          console.log(`✅ Captain joined room: captain_${userId}`);

          // ✅ Confirm join success
          socket.emit("joined", { role: "captain", userId });
        } else {
          console.error("❌ Invalid role:", role);
          socket.emit("error", {
            message: "Invalid role. Must be 'user' or 'captain'",
          });
          return;
        }

        console.log("=== JOIN EVENT COMPLETE ===");
      } catch (err) {
        console.error("❌ Error in join event:", err);
        socket.emit("error", { message: "Failed to join. Please try again." });
      }
    });

    socket.on("message", (data) => {
      io.emit("message", data);
    });

    socket.on("update-location-captain", async ({ userId, role, location }) => {
      console.log("=== LOCATION UPDATE RECEIVED ===");
      console.log("Captain ID:", userId);
      console.log("Location:", location);

      try {
        // ✅ Validate inputs
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          console.error("❌ Invalid captain ID:", userId);
          return;
        }

        if (!location || !location.latitude || !location.longitude) {
          console.error("❌ Invalid location data:", location);
          return;
        }

        if (role === "captain") {
          const updatedCaptain = await Captain.findByIdAndUpdate(
            userId,
            {
              location: {
                latitude: parseFloat(location.latitude),
                longitude: parseFloat(location.longitude),
              },
            },
            { new: true }
          );

          if (!updatedCaptain) {
            console.error("❌ Captain not found for location update:", userId);
            return;
          }

          console.log("✅ Captain location updated:", {
            id: updatedCaptain._id,
            location: updatedCaptain.location,
            socketId: updatedCaptain.socketId,
          });
        }
      } catch (err) {
        console.error("❌ Error updating captain location:", err);
      }

      console.log("=== LOCATION UPDATE COMPLETE ===");
    });

    // ✅ Clean up socketId on disconnect
    socket.on("disconnect", async () => {
      console.log("=== SOCKET DISCONNECTED ===");
      console.log("Socket ID:", socket.id);

      try {
        // Clear socketId from both users and captains
        await Promise.all([
          User.updateOne({ socketId: socket.id }, { $unset: { socketId: 1 } }),
          Captain.updateOne(
            { socketId: socket.id },
            { $unset: { socketId: 1 } }
          ),
        ]);

        console.log("✅ SocketId cleared from database");
      } catch (err) {
        console.error("❌ Error clearing socketId:", err);
      }
    });
  });
}

function sendRideUpdateToUser(ride) {
  const { userId, _id: rideId } = ride;
  const newDistance = calculateNewDistance(ride);
  const newDuration = calculateNewDuration(ride);

  io.to(`user_${userId}`).emit("ride-update", {
    rideId,
    distance: newDistance,
    duration: newDuration,
  });
}

function sendMessageToSocketId(socketId, event, message) {
  console.log("=== SENDING MESSAGE TO SOCKET ===");
  console.log("Target Socket ID:", socketId);
  console.log("Event:", event);
  console.log(
    "Message preview:",
    JSON.stringify(message, null, 2).substring(0, 200) + "..."
  );

  if (!io) {
    console.error("❌ Socket.io not initialized");
    return false;
  }

  if (!socketId) {
    console.error("❌ No socketId provided");
    return false;
  }

  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit(event, message);
    console.log("✅ Message sent successfully to socket:", socketId);
    return true;
  } else {
    console.error(`❌ Socket with ID ${socketId} not found.`);
    console.log("📊 Total connected sockets:", io.sockets.sockets.size);
    console.log(
      "📋 Available socket IDs:",
      Array.from(io.sockets.sockets.keys()).slice(0, 5),
      "..."
    );
    return false;
  }
}

// ✅ Add helper function to check socket status
function getSocketStatus() {
  if (!io) return { connected: false, totalSockets: 0 };

  return {
    connected: true,
    totalSockets: io.sockets.sockets.size,
    socketIds: Array.from(io.sockets.sockets.keys()),
  };
}

export {
  initialiseSocket,
  sendMessageToSocketId,
  sendRideUpdateToUser,
  getSocketStatus,
};
