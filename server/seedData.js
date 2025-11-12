import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Course from "./models/Course.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("🌱 Connected to MongoDB for seeding...");

    await User.deleteMany({});
    await Room.deleteMany({});
    await Course.deleteMany({});

    // 🧑‍🏫 Dummy Teachers (faculty)
    const teachers = await User.insertMany([
      { email: "asharma@college.edu.in", password: "hashed123", role: "faculty" },
      { email: "rgupta@college.edu.in", password: "hashed123", role: "faculty" },
    ]);

    // 🏫 Dummy Rooms
    const rooms = await Room.insertMany([
      { name: "Room 101", capacity: 40, type: "lecture" },
      { name: "Lab A1", capacity: 25, type: "lab" },
    ]);

    // 📘 Dummy Courses
    const courses = await Course.insertMany([
      { name: "Data Structures", code: "CS201", department: "CSE", semester: 3, teacher: teachers[0]._id },
      { name: "Database Systems", code: "CS301", department: "CSE", semester: 5, teacher: teachers[1]._id },
    ]);

    console.log("✅ Dummy data inserted successfully!");
    process.exit(0);
  })
  .catch((err) => console.error("❌ Error seeding data:", err));
