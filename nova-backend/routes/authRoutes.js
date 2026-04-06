import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect, admin } from "../middleware/authMiddleware.js";

import {
  registerUser,
  loginUser,
  verifyOTP,
  forgotPassword,
  adminLoginUser,
  resetPassword,
  getUsers
} from "../controllers/authController.js";

const router = express.Router();

// REGISTER
router.post(
  "/register",
  body("name").notEmpty().withMessage("Name required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6+ chars"),
  validate, // ✅ ADD THIS
  registerUser
);

router.post(
  "/verify-otp",
  body("email").isEmail(),
  body("otp").isLength({ min: 4, max: 6 }),
  validate,
  verifyOTP
);

// LOGIN
router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
  validate, // ✅ ADD THIS
  loginUser
);

// ... existing routes ...
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);



// ADMIN LOGIN
router.post(
  "/admin-login",
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
  validate, 
  adminLoginUser
);

router.get("/orders", protect, admin, getOrders);
router.get("/users", protect, admin, getUsers);

export default router;