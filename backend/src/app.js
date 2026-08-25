const express = require("express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const locationRoutes = require("./routes/locationRoutes");
const alertRoutes = require("./routes/alertRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const {
  apiLimiter,
  authLimiter,
  chatLimiter,
} = require("./middleware/rateLimitMiddleware");

const app = express();

app.use(express.json());

// General API rate limiting
app.use("/api", apiLimiter);

// Public routes
app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use("/api/weather", weatherRoutes);
app.use("/api/alerts", alertRoutes);

// Protected routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

app.use(
  "/api/messages",
  chatLimiter,
  messageRoutes
);

app.use("/api/locations", locationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);

// Central error handler
app.use(errorMiddleware);

module.exports = app;