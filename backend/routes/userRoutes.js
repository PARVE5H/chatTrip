import express from "express";
const router = express.Router();
import {
  registerUser,
  authUser,
  allUsers,
  updateProfile,
} from "../controllers/userControllers.js";
import protect from "../middlewares/authMiddlewares.js";

router.route("/").post(registerUser).get(protect, allUsers);

router.post("/login", authUser);

// Update user profile (name and avatar only)
router.route("/profile").put(protect, updateProfile);

export default router;
