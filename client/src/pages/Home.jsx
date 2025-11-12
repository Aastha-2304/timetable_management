import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">
        Welcome to Timetable Management System
      </h1>
      <p className="text-gray-600 mb-8">
        Manage classes, rooms, and schedules efficiently.
      </p>

      {/* Show only for Admins */}
      {role === "admin" && (
        <button
          onClick={() => navigate("/timetables")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Add New Timetable
        </button>
      )}
    </div>
  );
}
