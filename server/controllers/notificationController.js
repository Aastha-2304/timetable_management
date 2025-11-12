import Notification from "../models/Notification.js";

// ✅ Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, department, semester } = req.body;
    const notification = await Notification.create({
      title,
      message,
      department,
      semester,
    });
    res.status(201).json(notification);
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// ✅ Get all notifications (latest first)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ✅ Clear (delete) a single notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
