import createNotification
  from "../services/notificationService.js";

const sendTestNotification = async (
  req,
  res
) => {

  try {

    const { userId } =
      req.params;

    const notification =
      await createNotification({

        userId,

        title:
          "🌧️ Heavy Rain Alert",

        message:
          "Heavy rainfall is expected in your area. Please take necessary precautions.",

        type:
          "rain",

        severity:
          "HIGH",

        location:
          "Pune",
      });

    res.status(200).json({
      success: true,
      message:
        "Real-time notification sent",
      notification,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

export default sendTestNotification;