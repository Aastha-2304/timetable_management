import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ============================
   REGISTER USER
============================ */
export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 🧩 1. Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🧩 2. Restrict Admin registration to .edu.in domains
    if (role === "admin" && !email.endsWith(".edu.in")) {
      return res
        .status(403)
        .json({ message: "Only official .edu.in email IDs can register as Admin" });
    }

    // 🧩 3. Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧩 4. Create new user document
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "student", // default to student if no role
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ============================
   LOGIN USER
============================ */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🧩 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🧩 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🧩 3. Generate JWT (include role and email)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    // 🧩 4. Send response to client
    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ============================
   VERIFY TOKEN (optional middleware)
============================ */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
