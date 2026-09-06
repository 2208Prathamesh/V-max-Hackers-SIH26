import express from "express";
import Alert from "../models/Alert.js";
import Notification from "../models/Notification.js";
import { getIO } from "../config/socket.js";

const router = express.Router();

router.post("/test-alert", async (req, res) => {
  try {
    const {
      userId,
      location,
      title,
      message,
      severity,
      type,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // 1. Create alert in MongoDB
    const alert = await Alert.create({
      title: title || "Test Weather Alert",
      description:
        message || "Test weather alert generated.",
      type: type || "rain",
      severity: severity || "high",

      location: location || "Pune",

      latitude: 18.5204,
      longitude: 73.8567,

      startTime: new Date(),

      endTime: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),

      source: "WeatherGPT Test",
      sourceType: "test",

      externalId: `TEST-${Date.now()}`,

      isOfficial: false,

      affectedAreas: [
        location || "Pune"
      ],

      status: "active",
    });

    console.log(
      "🚨 Test alert created:",
      alert.title
    );

    // 2. Create notification in MongoDB
    const notification =
      await Notification.create({
        userId,

        type: "weather_alert",

        title:
          title || "Test Weather Alert",

        message:
          message ||
          "Test weather alert generated.",

        relatedAlertId: alert._id,

        isRead: false,
      });

    console.log(
      "💾 Notification saved to MongoDB"
    );

    // 3. Send real-time notification
    const room = `user_${userId}`;

    getIO()
      .to(room)
      .emit(
        "weatherNotification",
        notification
      );

    console.log(
      "📡 Real-time notification sent to:",
      room
    );

    res.status(201).json({
      success: true,
      message:
        "Test weather alert created successfully",

      alert,

      notification,
    });

  } catch (error) {
    console.error(
      "❌ Test alert error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;