import { useEffect, useState } from "react";
import axios from "axios";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/data/dropdowns");
        setRooms(res.data.rooms || []);
      } catch (err) {
        console.error("❌ Error loading rooms:", err);
        alert("Failed to load rooms data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600 text-lg">
        Loading rooms...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6">Available Rooms</h1>

      {rooms.length === 0 ? (
        <p className="text-gray-500 italic">No rooms found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white shadow-md border border-gray-200 rounded-xl p-5 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-semibold text-indigo-600 mb-2">
                {room.name}
              </h2>
              <p className="text-gray-700">
                <span className="font-medium">Capacity:</span> {room.capacity}
              </p>
              <p
                className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  room.type === "lab"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {room.type.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
