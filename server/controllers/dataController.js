// controllers/dataController.js
import Room from "../models/Room.js";
import Course from "../models/Course.js";
import User from "../models/User.js"; // ✅ Using User model for teachers

export const getDropdownData = async (req, res) => {
  try {
    console.log("📦 Fetching dropdown data...");

    // ✅ Fetch all records safely
    const [rooms, courses, teachers] = await Promise.all([
      Room.find(),
      Course.find(),
      User.find({ role: "faculty" }),
    ]);

    // ✅ Debug logs (for confirmation)
    console.log("✅ Data fetched:", {
      rooms: rooms.length,
      courses: courses.length,
      teachers: teachers.length,
    });

    // ✅ Extract department names from courses
    const departments = [
      ...new Set(
        courses
          .map((c) => c.department?.trim().toUpperCase())
          .filter(Boolean)
      ),
    ];

    // ✅ Handle case where no data is found
    if (!rooms.length && !courses.length && !teachers.length) {
      console.warn("⚠️ No dropdown data found in the database.");
    }

    res.status(200).json({
      rooms,
      courses,
      teachers,
      departments: departments.length ? departments : ["MCA"], // fallback
    });
  } catch (err) {
    console.error("❌ Error loading dropdown data:", err.message);
    res.status(500).json({
      message: "Failed to load dropdown data",
      error: err.message,
    });
  }
};
