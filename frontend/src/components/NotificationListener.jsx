import { useEffect } from "react";
import socket from "../services/socket";

const NotificationListener = ({ userId, onNotification }) => {
  useEffect(() => {
    if (!userId) {
      console.log("⚠️ No user ID. Socket room not joined.");
      return;
    }

    console.log("🔌 Connecting notification system for:", userId);

    const joinUserRoom = () => {
      console.log("👤 Joining notification room:", userId);

      socket.emit("joinUserRoom", userId);
    };

    const handleNotification = (notification) => {
      console.log("🔔 REAL-TIME NOTIFICATION:", notification);

      if (onNotification) {
        onNotification(notification);
      }
    };

    // Join immediately if already connected
    if (socket.connected) {
      joinUserRoom();
    }

    // Join when socket connects
    socket.on("connect", joinUserRoom);

    // Listen for weather notifications
    socket.on("weatherNotification", handleNotification);

    return () => {
      socket.off("connect", joinUserRoom);
      socket.off("weatherNotification", handleNotification);
    };
  }, [userId, onNotification]);

  return null;
};

export default NotificationListener;