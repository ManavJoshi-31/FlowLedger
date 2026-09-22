import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({
      userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
