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
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.isRead) {
      return res.status(400).json({
        message: "Notification is already marked as read",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
