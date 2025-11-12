import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, default: "" },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // Auto delete after 24h
});

export default mongoose.model("Notification", notificationSchema);
