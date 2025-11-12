import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Room 201"
  capacity: Number,
  type: { type: String, enum: ["lecture", "lab"], default: "lecture" },
});

export default mongoose.model("Room", roomSchema);
