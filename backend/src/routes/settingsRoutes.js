const express = require("express");

const {
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getSettings);

router.put("/", updateSettings);

router.patch("/password", changePassword);

module.exports = router;