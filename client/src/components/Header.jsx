import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    setUserEmail(username);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    setUserEmail(null);
    navigate("/auth");
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-10 h-[60px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* --- Left: Logo --- */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-50 h-50 object-contain" />
          <span className="font-mono text-lg text-blue-950">
            Timetable Manager
          </span>
        </Link>

        {/* --- Middle: Navigation Links --- */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {["/", "/timetables", "/rooms", "/conflicts", "/notifications"].map(
            (path, i) => {
              const labels = ["Home", "Timetables", "Rooms", "Conflicts", "Notifications"];
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `hover:text-indigo-600 transition ${
                      isActive ? "text-indigo-600 font-semibold" : ""
                    }`
                  }
                >
                  {labels[i]}
                </NavLink>
              );
            }
          )}
        </nav>

        {/* --- Right: Login or User --- */}
        <div className="relative">
          {userEmail ? (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-50 transition"
              >
                <span className="text-sm font-medium text-gray-700">
                  {userEmail}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg origin-top transition-all"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
