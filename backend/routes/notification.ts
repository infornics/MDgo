import { Router } from "express";
import { protect } from "../utils/auth";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification";

const notificationRoutes = Router();

notificationRoutes.get("/", protect, getNotifications);
notificationRoutes.get("/unread-count", protect, getUnreadCount);
notificationRoutes.patch("/:id/read", protect, markAsRead);
notificationRoutes.patch("/read-all", protect, markAllAsRead);

export default notificationRoutes;
