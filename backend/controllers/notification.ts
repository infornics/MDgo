import { Request, Response } from "express";
import Notification from "../database/models/Notification";

/**
 * @desc    Get all notifications for a user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const { unreadOnly } = req.query;

    const query: any = { user: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate("document", "title")
      .populate({
        path: "accessRequest",
        populate: {
          path: "requester",
          select: "name email profilePicture",
        },
      })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 notifications

    res.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to modify this notification",
      });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user._id.toString();

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req: any, res: Response) => {
  try {
    const userId = req.user._id.toString();

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.json({ count });
  } catch (error: any) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: error.message });
  }
};
