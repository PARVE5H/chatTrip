import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} from "../controllers/chatControllers.js";
import protect from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/renamegroup").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

export default router;
