import { useState, useEffect } from "react";
import axios from "axios";

export default function Timetables() {
  const [showForm, setShowForm] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");

  const [timetables, setTimetables] = useState([]);
  const [timetablesAll, setTimetablesAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ department: "All", semester: "All" });

  const [formData, setFormData] = useState({
    _id: "",
    day: "",
    startTime: "",
    startPeriod: "AM",
    endTime: "",
    endPeriod: "AM",
    room: "",
    course: "",
    teacher: "",
    department: "",
    semester: "",
  });

  const [notifyData, setNotifyData] = useState({ department: "", semester: "" });

  const [dropdownData, setDropdownData] = useState({
    rooms: [],
    courses: [],
    teachers: [],
    departments: [],
  });

  const [filteredCourses, setFilteredCourses] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
      return {};
    }
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dropdownRes, timetableRes] = await Promise.all([
          axios.get("http://localhost:5000/api/data/dropdowns"),
          axios.get("http://localhost:5000/api/timetables", getAuthHeaders()),
        ]);

        const data = dropdownRes.data || {};
        const depts = data.departments?.length ? data.departments : ["MCA"];

        setDropdownData({
          rooms: data.rooms || [],
          courses: data.courses || [],
          teachers: data.teachers || [],
          departments: depts,
        });

        setTimetables(timetableRes.data || []);
        setTimetablesAll(timetableRes.data || []);

        setFormData((prev) => ({ ...prev, department: depts[0] }));
        setNotifyData((prev) => ({ ...prev, department: depts[0] }));
        setLoading(false);
      } catch (err) {
        console.error("❌ Error loading data:", err.message);
        alert("Failed to load data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Filter timetables dynamically
  useEffect(() => {
    let filtered = [...timetablesAll];
    if (filters.department !== "All") {
      filtered = filtered.filter(
        (t) => t.department?.toUpperCase() === filters.department.toUpperCase()
      );
    }
    if (filters.semester !== "All") {
      filtered = filtered.filter((t) => String(t.semester) === String(filters.semester));
    }
    setTimetables(filtered);
  }, [filters, timetablesAll]);

  // ✅ Filter courses by department
  useEffect(() => {
    if (dropdownData.courses.length && formData.department) {
      const filtered = dropdownData.courses.filter(
        (c) => c.department?.toUpperCase() === formData.department.toUpperCase()
      );
      setFilteredCourses(filtered);
    }
  }, [formData.department, dropdownData.courses]);

  const formatTime = (time, period) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let h = parseInt(hour, 10);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  // ✅ Create or Update timetable
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      startTime: formatTime(formData.startTime, formData.startPeriod),
      endTime: formatTime(formData.endTime, formData.endPeriod),
    };

    if (!payload._id) delete payload._id;

    try {
      if (formData._id) {
        await axios.put(
          `http://localhost:5000/api/timetables/${formData._id}`,
          payload,
          getAuthHeaders()
        );
        alert("✅ Timetable updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/timetables",
          payload,
          getAuthHeaders()
        );
        alert("✅ Timetable created successfully!");
      }

      setShowForm(false);
      setFormData({
        _id: "",
        day: "",
        startTime: "",
        startPeriod: "AM",
        endTime: "",
        endPeriod: "AM",
        room: "",
        course: "",
        teacher: "",
        department: dropdownData.departments[0] || "MCA",
        semester: "",
      });

      const res = await axios.get("http://localhost:5000/api/timetables", getAuthHeaders());
      setTimetables(res.data);
      setTimetablesAll(res.data);
    } catch (err) {
      console.error("❌ Error saving timetable:", err.message);
      alert("Failed to save timetable.");
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      ...entry,
      _id: entry._id,
      startPeriod: entry.startTime < "12:00" ? "AM" : "PM",
      endPeriod: entry.endTime < "12:00" ? "AM" : "PM",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/timetables/${id}`, getAuthHeaders());
      alert("🗑️ Timetable deleted!");
      setTimetables(timetables.filter((t) => t._id !== id));
      setTimetablesAll(timetablesAll.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  // ✅ Notification form submit
  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyData.department || !notifyData.semester) {
      alert("Please select both department and semester.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/timetables/notify",
        {
          department: notifyData.department,
          semester: notifyData.semester,
          message: notifyMessage,
        },
        getAuthHeaders()
      );
      alert(`📧 Notification sent for ${notifyData.department} Semester ${notifyData.semester}`);
      setShowNotify(false);
      setNotifyMessage("");
    } catch (err) {
      console.error("❌ Error sending notification:", err.message);
      alert("Failed to send notification.");
    }
  };

  const role = localStorage.getItem("role");

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600 text-lg">
        Loading timetable data...
      </div>
    );

  return (
    <div className="p-6">
      {/* HEADER + FILTERS */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-indigo-700">All Timetables</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="rounded-full border border-gray-300 bg-white px-4 py-2  shadow-sm text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
          >
            <option value="All">All Departments</option>
            {dropdownData.departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
          >
            <option value="All">All Semesters</option>
            {[1, 2, 3, 4, 5, 6].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

          {/* Buttons */}
          {role === "admin" && (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-indigo-700 transition"
              >
                + Add Timetable
              </button>
              <button
                onClick={() => setShowNotify(true)}
                className="rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-green-700 transition"
              >
                Send Notification
              </button>
            </>
          )}
        </div>
      </div>

      {/* TIMETABLE TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2">Day</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Teacher</th>
              <th className="px-4 py-2">Room</th>
              <th className="px-4 py-2">Dept</th>
              <th className="px-4 py-2">Sem</th>
              {role === "admin" && <th className="px-4 py-2 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {timetables.length > 0 ? (
              timetables.map((tt) => (
                <tr key={tt._id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{tt.day}</td>
                  <td className="px-4 py-2">
                    {tt.startTime} - {tt.endTime}
                  </td>
                  <td className="px-4 py-2">{tt.course?.name || "—"}</td>
                  <td className="px-4 py-2">{tt.teacher?.email?.split("@")[0] || "—"}</td>
                  <td className="px-4 py-2">{tt.room?.name || "—"}</td>
                  <td className="px-4 py-2">{tt.department}</td>
                  <td className="px-4 py-2">{tt.semester}</td>
                  {role === "admin" && (
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleEdit(tt)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tt._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500 italic">
                  No timetable entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🟣 ADD/EDIT FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4 text-indigo-600 text-center">
              {formData._id ? "Edit Timetable Entry" : "Create Timetable Entry"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                name="day"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Day</option>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-sm mb-1 text-gray-600">Start Time</label>
                  <div className="flex gap-1">
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                      className="w-full border rounded p-2"
                    />
                    <select
                      name="startPeriod"
                      value={formData.startPeriod}
                      onChange={(e) =>
                        setFormData({ ...formData, startPeriod: e.target.value })
                      }
                      className="border rounded p-1"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div className="w-1/2">
                  <label className="block text-sm mb-1 text-gray-600">End Time</label>
                  <div className="flex gap-1">
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="w-full border rounded p-2"
                    />
                    <select
                      name="endPeriod"
                      value={formData.endPeriod}
                      onChange={(e) =>
                        setFormData({ ...formData, endPeriod: e.target.value })
                      }
                      className="border rounded p-1"
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room */}
              <select
                name="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select Room</option>
                {dropdownData.rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name}
                  </option>
                ))}
              </select>

              {/* Department */}
              <select
                name="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="w-full border rounded p-2"
              >
                {dropdownData.departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>

              {/* Course */}
              <select
                name="course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select Course</option>
                {filteredCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>

              {/* Teacher */}
              <select
                name="teacher"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select Teacher</option>
                {dropdownData.teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.email}
                  </option>
                ))}
              </select>

              {/* Semester */}
              <input
                type="number"
                name="semester"
                placeholder="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
                className="w-full border rounded p-2"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {formData._id ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Notification Form */}
      {showNotify && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold text-indigo-600 mb-3 text-center">
              Send Timetable Update Notification
            </h2>
            <form onSubmit={handleNotifySubmit} className="space-y-4">
              <select
                value={notifyData.department}
                onChange={(e) =>
                  setNotifyData({ ...notifyData, department: e.target.value })
                }
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select Department</option>
                {dropdownData.departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={notifyData.semester}
                onChange={(e) =>
                  setNotifyData({ ...notifyData, semester: e.target.value })
                }
                placeholder="Semester"
                required
                className="w-full border rounded p-2"
              />

              <textarea
                rows="3"
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Optional message (e.g., Updated lecture timings)"
                className="w-full border rounded p-2"
              ></textarea>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotify(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
