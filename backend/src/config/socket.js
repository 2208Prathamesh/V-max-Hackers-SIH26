import { Server } from "socket.io";

let io = null;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // User joins their private notification room
    socket.on("joinUserRoom", (userId) => {
      if (!userId) {
        console.log("⚠️ No userId received");
        return;
      }

      const room = `user_${userId}`;

      socket.join(room);

      console.log(`👤 User joined notification room: ${room}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: ${socket.id} | Reason: ${reason}`
      );
    });
  });

  console.log("🔔 Socket.IO initialized");

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};