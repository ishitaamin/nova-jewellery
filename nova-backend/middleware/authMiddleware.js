import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🛡️ Protect Normal User Routes
export const protect = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      throw new Error("No token provided");
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ INDUSTRY STANDARD: Block admin tokens from being used on normal user routes!
    if (decoded.role === "admin") {
      const err = new Error("Admin tokens cannot be used for customer actions.");
      err.statusCode = 403;
      throw err;
    }

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) throw new Error("User no longer exists");

    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

// 🛡️ Protect Admin Routes
export const admin = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      throw new Error("No token provided");
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ INDUSTRY STANDARD: Block normal user tokens from even touching the admin logic
    if (decoded.role !== "admin") {
      const err = new Error("Access denied. Admin token required.");
      err.statusCode = 403;
      throw err;
    }

    // We still fetch the user to ensure they weren't deleted from the DB
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isAdmin) {
       const err = new Error("Not authorized as an admin");
       err.statusCode = 403;
       throw err;
    }

    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};