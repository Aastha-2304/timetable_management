import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/ping", (req, res) => {
  res.json({ message: "✅ Backend connected successfully!" });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/notifications", notificationRoutes);



const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ Database connection error:", err));
