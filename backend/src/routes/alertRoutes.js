const express = require("express");

const {
  getAlerts,
  getAlert,
  getActiveAlerts,
  markAlertRead,
} = require("../controllers/alertController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All alert routes require authentication
router.use(authMiddleware);

router.get("/", getAlerts);

router.get("/active", getActiveAlerts);

router.get("/:id", getAlert);

router.patch("/:id/read", markAlertRead);

module.exports = router;