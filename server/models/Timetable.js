import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true }, // "Monday"
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "10:00"
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
});

export default mongoose.model("Timetable", timetableSchema);
