import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js"; // ✅ Import admin middleware
import {
  getMyOrders,
  verifyPayment,
  getAllOrders,       // ✅ Import new functions
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

// User Routes
router.get("/my", protect, getMyOrders);
router.post("/verify", protect, verifyPayment);

// ✅ Admin Routes
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);

export default router;