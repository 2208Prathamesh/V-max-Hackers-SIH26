const express = require("express");

const {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
} = require("../controllers/weatherController");

const router = express.Router();

router.get("/current", getCurrentWeather);

router.get("/forecast", getForecast);

router.get("/hourly", getHourlyForecast);

module.exports = router;