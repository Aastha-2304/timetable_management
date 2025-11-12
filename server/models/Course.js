import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },       // "Database Management Systems"
  code: { type: String, required: true, unique: true }, // "CS301"
  department: { type: String, required: true }, // "CSE"
  semester: { type: Number, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("Course", courseSchema);
