import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  createProductReview,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected (Must be logged in to review)
router.post("/:id/reviews", protect, createProductReview);

// Admin only
// ✅ Add upload.single('image') before your controller
router.post("/", protect, admin, upload.single("image"), createProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.put("/:id", protect, admin, updateProduct);

export default router;