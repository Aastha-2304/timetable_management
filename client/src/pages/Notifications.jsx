import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // ✅ Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", getAuthHeaders());
        setNotifications(res.data || []);
      } catch (err) {
        console.error("❌ Error loading notifications:", err);
        alert("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // ✅ Clear notification (Admin only)
  const handleClear = async (id) => {
    if (!window.confirm("Clear this notification?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, getAuthHeaders());
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("❌ Error clearing notification:", err);
      alert("Failed to clear notification");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600 text-lg">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Note */}
      <p className="text-sm italic text-gray-500 mb-4">
        Notifications disappear automatically after 24 hours.
      </p>

      <h1 className="text-2xl font-bold text-indigo-700 mb-6">Recent Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 italic">No recent notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-indigo-600">{n.title}</h2>
                  <p className="text-gray-700 mt-1">{n.message}</p>

                  <div className="text-sm text-gray-500 mt-2">
                    <span>📚 {n.department}</span> &nbsp;|&nbsp;
                    <span>🎓 Semester {n.semester}</span> &nbsp;|&nbsp;
                    <span>🕒 {new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {role === "admin" && (
                  <button
                    onClick={() => handleClear(n._id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    ✖ Clear
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
