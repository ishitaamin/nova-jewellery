

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

// All address routes require the user to be logged in
router.route("/")
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route("/:id")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;