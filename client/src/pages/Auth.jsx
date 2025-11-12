import { useState } from "react";
import axios from "axios";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // 🧩 Extra validation — Admin must have .edu.in email
    if (!isLogin && formData.role === "admin" && !formData.email.endsWith(".edu.in")) {
      alert("Only official .edu.in email IDs can register as Admin!");
      return;
    }

    const endpoint = isLogin ? "login" : "register";
    const url = `http://localhost:5000/api/auth/${endpoint}`;

    try {
      setLoading(true);
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, role: formData.role };

      const response = await axios.post(url, payload);

      if (isLogin) {
        // ✅ Extract the username before '@'
        const username = formData.email.split("@")[0];

        // ✅ Save user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("email", formData.email);
        localStorage.setItem("username", username);
        localStorage.setItem("role", response.data.role || "student");

        alert("Login successful!");
        window.location.href = "/";
      } else {
        alert("Registration successful! Please log in now.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? "Admin Login" : "Create Your Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm Password + Role (register only) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={toggleForm}
                className="text-indigo-600 hover:underline font-medium"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button
                type="button"
                onClick={toggleForm}
                className="text-indigo-600 hover:underline font-medium"
              >
                Login here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
