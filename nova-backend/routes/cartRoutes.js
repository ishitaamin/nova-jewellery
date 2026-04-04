import express from "express";
const router = express.Router();

import { protect } from "../middleware/authMiddleware.js";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";

router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);
router.put("/", protect, updateCartItem);
router.get("/", protect, getCart);

export default router;