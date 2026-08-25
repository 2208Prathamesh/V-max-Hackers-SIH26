const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const weatherService = require("./weatherService");

/**
 * Generate WeatherGPT response
 */
const generateResponse = async ({
  conversationId,
  userId,
  message,
}) => {
  const text = message.toLowerCase();

  let response = {
    content: "",
    messageType: "text",
    metadata: {},
  };

  /*
   * Basic intent detection.
   * Later this can be replaced by an AI/LLM.
   */
  const isWeatherQuestion =
    text.includes("weather") ||
    text.includes("temperature") ||
    text.includes("rain") ||
    text.includes("forecast");

  if (isWeatherQuestion) {
    const location = extractLocation(text);

    if (location) {
      const weather =
        await weatherService.getCurrentWeather({
          city: location,
        });

      response = {
        content: `The current temperature in ${
          weather.location
        } is ${weather.temperature}°C with ${
          weather.description
        }.`,
        messageType: "weather",
        metadata: weather,
      };
    } else {
      response.content =
        "Please tell me the city you want the weather for.";
    }
  } else {
    response.content =
      "I can help you with weather forecasts, alerts, temperature, rainfall, wind and climate information.";
  }

  return response;
};

/**
 * Basic location extraction
 *
 * Temporary implementation.
 * Replace with AI/NLP later.
 */
const extractLocation = (text) => {
  const locations = [
    "pune",
    "mumbai",
    "delhi",
    "bangalore",
    "hyderabad",
    "chennai",
    "kolkata",
    "nagpur",
    "nashik",
  ];

  return (
    locations.find((location) =>
      text.includes(location)
    ) || null
  );
};

module.exports = {
  generateResponse,
};