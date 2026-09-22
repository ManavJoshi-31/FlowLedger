import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import { authenticate } from "../auth/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getNotifications);
router.patch("/:notificationId/read", authenticate, markNotificationAsRead);

export default router;
