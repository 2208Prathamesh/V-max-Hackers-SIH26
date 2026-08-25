const express = require("express");

const {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setFavorite,
} = require("../controllers/locationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getLocations);

router.post("/", addLocation);

router.put("/:id", updateLocation);

router.delete("/:id", deleteLocation);

router.patch("/:id/favorite", setFavorite);

module.exports = router;