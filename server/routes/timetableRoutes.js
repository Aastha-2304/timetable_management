import express from "express";
import {
  createTimetable,
  getAllTimetables,
  getTimetableByDept,
  getTimetableByTeacher,
  updateTimetable,
  deleteTimetable,
  notifyUsers,
  findConflicts,
} from "../controllers/timetableController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// ✅ Protect all routes (requires authentication)
router.use(verifyToken);

// ✅ Create a new timetable (admin only)
router.post("/", createTimetable);

// ✅ Get all timetables
router.get("/", getAllTimetables);

// ✅ Get timetables by department
router.get("/department", getTimetableByDept);

// ✅ Get timetables by teacher
router.get("/teacher/:teacherId", getTimetableByTeacher);

// ✅ Update a timetable entry
router.put("/:id", updateTimetable);

// ✅ Delete a timetable entry
router.delete("/:id", deleteTimetable);

// ✅ Notify all users (admin only)
router.post("/notify", notifyUsers);

router.get("/conflicts", findConflicts);


export default router;
