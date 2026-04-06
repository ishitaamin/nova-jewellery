import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🛡️ Protect Normal User Routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if the token exists in the headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("Not authorized: No token provided by frontend");
      error.statusCode = 401;
      throw error;
    }

    // 2. Verify token (This is usually where deployments fail if JWT_SECRET is missing)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Prevent admin tokens from being used on normal user routes
    if (decoded.role === "admin") {
      const err = new Error("Admin tokens cannot be used for customer actions.");
      err.statusCode = 403; // 403 Forbidden is more accurate here than 401
      throw err;
    }

    // 4. Fetch the user from the database
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      const error = new Error("Not authorized: User no longer exists in database");
      error.statusCode = 401;
      throw error;
    }

    // 5. Move to the next middleware/controller
    next();

  } catch (error) {
    // 🚨 CRITICAL DEPLOYMENT LOGGING: Check your Render dashboard logs for this exact message!
    console.error("🔴 PROTECT MIDDLEWARE FAILED:", error.message);
    
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      // Temporarily send the exact error to the frontend network tab to help you debug
      errorDetail: error.message 
    });
  }
};


// 🛡️ Protect Admin Routes
export const admin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("Not authorized: No token provided by frontend");
      error.statusCode = 401;
      throw error;
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
       const err = new Error("Not authorized: User no longer exists");
       err.statusCode = 401;
       throw err;
    }

    // Ensure the user actually has admin privileges in the database
    if (!req.user.isAdmin) {
       const err = new Error("Access denied: Not authorized as an admin");
       err.statusCode = 403;
       throw err;
    }

    next();

  } catch (error) {
    // 🚨 CRITICAL DEPLOYMENT LOGGING
    console.error("🔴 ADMIN MIDDLEWARE FAILED:", error.message);
    
    res.status(401).json({
      success: false,
      message: "Not authorized, admin access failed",
      errorDetail: error.message
    });
  }
};