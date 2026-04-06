import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🛡️ Protect Normal User Routes
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new Error("No token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "user") {
      throw new Error("Only users allowed");
    }

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) throw new Error("User not found");

    next();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};


// 🛡️ Protect Admin Routes
export const admin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new Error("No token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      throw new Error("Only admin allowed");
    }

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isAdmin) {
      throw new Error("Not admin");
    }

    next();
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};