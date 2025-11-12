import { useEffect, useState } from "react";
import axios from "axios";

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/timetables/conflicts", getAuthHeaders());
        setConflicts(res.data || []);
      } catch (err) {
        console.error("❌ Error loading conflicts:", err);
        alert("Failed to load conflict data.");
      } finally {
        setLoading(false);
      }
    };
    fetchConflicts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600 text-lg">
        Detecting timetable conflicts...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6">Schedule Conflicts</h1>

      {conflicts.length === 0 ? (
        <p className="text-gray-500 italic">✅ No conflicts detected. All schedules are clear.</p>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-md border ${
                conflict.type === "Room Conflict"
                  ? "border-red-300 bg-red-50"
                  : "border-yellow-300 bg-yellow-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  ⚠️ {conflict.type}
                </h2>
                <span className="text-sm text-gray-500">{conflict.day}</span>
              </div>
              <div className="mt-2 text-gray-700">
                <p>
                  <strong>Room:</strong> {conflict.room}
                </p>
                <p>
                  <strong>Teacher:</strong> {conflict.teacher}
                </p>
                <p>
                  <strong>Courses:</strong> {conflict.course1} &nbsp;↔&nbsp; {conflict.course2}
                </p>
                <p>
                  <strong>Time Overlap:</strong> {conflict.startTime1} - {conflict.endTime1} &nbsp; / &nbsp;
                  {conflict.startTime2} - {conflict.endTime2}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
