import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "./env.js";

let io = null;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          env.FRONTEND_URL,
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174"
        ].filter(Boolean);

        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com') ||
          origin.endsWith('.railway.app')
        ) {
          return callback(null, true);
        }

        // In development, allow localhost origins
        if (
          env.IS_DEVELOPMENT &&
          (origin.includes("localhost") || origin.includes("127.0.0.1"))
        ) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
    },
  });

  // Private notification sockets must be authenticated before connecting.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

      if (!token) return next(new Error("Authentication required"));
      socket.user = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return next(new Error("Invalid authentication token"));
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // User joins their private notification room
    socket.on("joinUserRoom", () => {
      const userId = socket.user?.userId;
      if (!userId) return;
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

export default {
  initializeSocket,
  getIO,
};