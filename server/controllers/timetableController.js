import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";
import Notification from "../models/Notification.js";

dotenv.config();

// ✅ Configure Brevo API
const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();

// ✅ Create timetable entry
export const createTimetable = async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();
    res.status(201).json(timetable);
  } catch (err) {
    console.error("❌ Error creating timetable:", err);
    res.status(500).json({ message: "Failed to create timetable" });
  }
};

// ✅ Get all timetables
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("room")
      .populate("course")
      .populate("teacher");
    res.status(200).json(timetables);
  } catch (err) {
    console.error("❌ Error fetching timetables:", err);
    res.status(500).json({ message: "Failed to fetch timetables" });
  }
};

// ✅ Get timetables by department
export const getTimetableByDept = async (req, res) => {
  const { department, semester } = req.query;
  try {
    const timetables = await Timetable.find({ department, semester })
      .populate("room")
      .populate("course")
      .populate("teacher");
    res.status(200).json(timetables);
  } catch (err) {
    console.error("❌ Error fetching timetable by department:", err);
    res.status(500).json({ message: "Failed to fetch timetable" });
  }
};

// ✅ Get timetables by teacher
export const getTimetableByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const timetables = await Timetable.find({ teacher: teacherId })
      .populate("room")
      .populate("course");
    res.status(200).json(timetables);
  } catch (err) {
    console.error("❌ Error fetching timetable by teacher:", err);
    res.status(500).json({ message: "Failed to fetch teacher timetable" });
  }
};

// ✅ Update timetable
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTimetable = await Timetable.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("room")
      .populate("course")
      .populate("teacher");

    if (!updatedTimetable)
      return res.status(404).json({ message: "Timetable not found" });

    res.status(200).json(updatedTimetable);
  } catch (err) {
    console.error("❌ Error updating timetable:", err);
    res.status(500).json({ message: "Failed to update timetable" });
  }
};

// ✅ Delete timetable
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Timetable not found" });
    res.status(200).json({ message: "Timetable deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting timetable:", err);
    res.status(500).json({ message: "Failed to delete timetable" });
  }
};

// ✅ Find conflicts
export const findConflicts = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("room")
      .populate("course")
      .populate("teacher");

    const conflicts = [];

    // Helper function to check overlap
    const isOverlap = (startA, endA, startB, endB) => {
      return startA < endB && endA > startB;
    };

    // Compare every pair of timetable entries
    for (let i = 0; i < timetables.length; i++) {
      for (let j = i + 1; j < timetables.length; j++) {
        const t1 = timetables[i];
        const t2 = timetables[j];

        if (t1.day !== t2.day) continue; // different days

        // Convert to minutes for easier comparison
        const [h1s, m1s] = t1.startTime.split(":").map(Number);
        const [h1e, m1e] = t1.endTime.split(":").map(Number);
        const [h2s, m2s] = t2.startTime.split(":").map(Number);
        const [h2e, m2e] = t2.endTime.split(":").map(Number);

        const start1 = h1s * 60 + m1s;
        const end1 = h1e * 60 + m1e;
        const start2 = h2s * 60 + m2s;
        const end2 = h2e * 60 + m2e;

        // Check overlap in same room or same teacher
        const timeClash = isOverlap(start1, end1, start2, end2);
        if (timeClash && (t1.room._id.equals(t2.room._id) || t1.teacher._id.equals(t2.teacher._id))) {
          conflicts.push({
            type: t1.room._id.equals(t2.room._id) ? "Room Conflict" : "Teacher Conflict",
            day: t1.day,
            room: t1.room.name,
            teacher: t1.teacher.email,
            course1: t1.course.name,
            course2: t2.course.name,
            startTime1: t1.startTime,
            endTime1: t1.endTime,
            startTime2: t2.startTime,
            endTime2: t2.endTime,
          });
        }
      }
    }

    res.status(200).json(conflicts);
  } catch (err) {
    console.error("❌ Error finding conflicts:", err);
    res.status(500).json({ message: "Failed to detect conflicts" });
  }
};


// ✅ Notify all users
export const notifyUsers = async (req, res) => {
  try {
    const { department, semester, message } = req.body;

    if (!department || !semester) {
      return res
        .status(400)
        .json({ message: "Department and semester are required." });
    }

    const subject = `Timetable updated for ${department} Semester ${semester}`;
    const htmlContent = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
        <h2 style="color:#4f46e5;">📅 ${subject}</h2>
        <p>${message || "A timetable update has been made. Please check your portal for details."}</p>
        <p style="margin-top:10px;">You can view the latest timetable in your dashboard.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="font-size:0.9em;color:#6b7280;">This is an automated notification from the Timetable Management System.</p>
      </div>
    `;

    // ✅ Fetch all users
    const users = await User.find({}, "email");
    const emailList = users.map((u) => u.email).filter(Boolean);

    if (emailList.length === 0) {
      return res.status(404).json({ message: "No users found to notify." });
    }

    // 🧪 For testing: send only to your own address
    // const emailList = ["yourname@gmail.com"];

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: "JIMS Timetable System", email: "marco11stays@gmail.com" };
    sendSmtpEmail.to = emailList.map((email) => ({ email }));

    // ✅ Send email through Brevo
    const response = await brevo.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Brevo response:", response);

    // ✅ Create notification *after* email send
    await Notification.create({
      title: subject,
      message: message || "A timetable update has been made. Check your portal.",
      department,
      semester,
      createdAt: new Date(),
    });

    res.status(200).json({
      message: `✅ Notification sent successfully for ${department} Semester ${semester}`,
    });
  } catch (err) {
    console.error("❌ Error sending Brevo notifications:", err);
    res
      .status(500)
      .json({ message: "Failed to send Brevo email notifications." });
  }
};
